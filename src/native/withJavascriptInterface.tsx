import React, { ComponentType, Component, forwardRef } from 'react';
import { Platform } from 'react-native';
import hoistNonReactStatics from 'hoist-non-react-statics';
import {
    WebView,
    WebViewProps,
    WebViewMessageEvent,
    WebViewNavigation,
} from 'react-native-webview';
import { InterfaceProvider, isEnabledGetter } from './InterfaceProvider';
import { Logger, createLogger } from '../common/logger';
import { WebScriptComposer } from './WebScriptComposer';
import { CoreJSInterface } from '../common/types';

// to workaround the issue that on some Android device load script on page start
// may get cleared after page starting load, we try to inject js on both load start
// and progress events, the max inject js times is defined here
// https://github.com/react-native-webview/react-native-webview/pull/1099
// https://github.com/react-native-webview/react-native-webview/issues/1609
const maxInjectJSTimes = 10;

type HigherOrderComponentCreator<Props> = (component: ComponentType<Props>) => ComponentType<Props>;

/**
 * withComlinkExpose HOC config
 */
interface Options {
    /**
     * forward ref to the wrapped component, default is `false`
     */
    forwardRef?: boolean;
    /**
     * white list urls where Comlink enabled, default is `null`
     */
    whitelistURLs?: (string | RegExp)[];
    /**
     * for control Comlink enable or disable status, default is `null`
     */
    isEnabled?: isEnabledGetter;
    /**
     * print debug log to console or not, default is `false`
     */
    log?: boolean | Logger;
}

interface RefForwardingProps {
    forwardedRef: any;
}

/**
 * wrap webview component with JavascriptInterface
 * This function is called from react native application
 * 1. This will inject all the functions declared by CoreJSInterface into Web
 * 
 * @param rootObj the root object exposed as JavascriptInterface
 * @param name the name for the exposed object - window[name] in web side
 * @param config
 */
export function withJavascriptInterface<Props extends WebViewProps>(
    rootObj: CoreJSInterface,
    name: string,
    options?: Options,
): HigherOrderComponentCreator<Props> {
    const logger: Logger = createLogger(options?.log);
    const whitelistURLs: RegExp[] | null = options?.whitelistURLs?.map((pattern) => {
        if (typeof pattern === 'string') {
            return new RegExp(pattern);
        }
        return pattern;
    });

    return (WrappedComponent: ComponentType<Props>) => {
        class ComponentWithComlinkExpose extends Component<Props & RefForwardingProps> {
            private provider: InterfaceProvider;
            private composer: WebScriptComposer;
            private isCurrentURLInWhitelist: boolean;
            private injectJSTimes: number;
            private currentURL: string;
            private webView: WebView;

            static displayName: string = `withJavascriptInterface(${name})(${
                WrappedComponent.displayName || WrappedComponent.name || 'Component'
            })`;
            static WrappedComponent: ComponentType<Props> = WrappedComponent;

            constructor(props) {
                super(props);

                this.currentURL = '';
                this.isCurrentURLInWhitelist = true;
                this.injectJSTimes = maxInjectJSTimes;
                this.onURLUpdated(props.source?.uri);
                const keys = Object.keys(rootObj);
                this.provider = new InterfaceProvider(name, rootObj, keys, this.isEnabled, logger);
                this.composer = new WebScriptComposer(name, keys, !!options?.log);
            }

            isEnabled = (): boolean => {
                if (!this.isCurrentURLInWhitelist) {
                    return false;
                }
                if (options?.isEnabled && !options.isEnabled()) {
                    return false;
                }
                return true;
            };

            setWebViewRef = (ref: WebView) => {
                this.webView = ref;
                this.provider.setWebview(ref);

                const { forwardedRef } = this.props;
                if (forwardedRef) {
                    if (typeof forwardedRef === 'function') {
                        forwardedRef(ref);
                    } else {
                        forwardedRef.current = ref;
                    }
                }
            };
           
            onMessage = (event: WebViewMessageEvent) => {
                const handled = this.provider.onMessage(event);
                if (handled) {
                    return;
                }

                // delegate to event handler
                this.props.onMessage?.(event);
            };

            onNavigationStateChange = (event: WebViewNavigation) => {
                const { url } = event;
                this.onURLUpdated(url);

                // delegate to event handler
                this.props.onNavigationStateChange?.(event);
            };

            onLoadStart = (event: Parameters<WebViewProps['onLoadStart']>[0]) => {
                const { url } = event.nativeEvent;
                this.onURLUpdated(url);
                this.injectJavascriptForAndroid();
                this.injectJSTimes = 1;

                // delegate to event handler
                this.props.onLoadStart?.(event);
            };

            onLoadProgress = (event: Parameters<WebViewProps['onLoadProgress']>[0]) => {
                if (this.injectJSTimes < maxInjectJSTimes) {
                    this.injectJavascriptForAndroid();
                    this.injectJSTimes += 1;
                }
                // delegate to event handler
                this.props.onLoadProgress?.(event);
            };

            private onURLUpdated(url: string): void {
                if (url === this.currentURL) {
                    return;
                }
                if (!url?.startsWith('http')) {
                    return;
                }

                this.currentURL = url;
                if (whitelistURLs) {
                    // check if the url in whitelist, skip js bridge urls like `react-js-navigation://xxx`
                    this.isCurrentURLInWhitelist = !!whitelistURLs.find((reg) => reg.test(url));
                    logger(`${url} is in whitelist: ${this.isCurrentURLInWhitelist}`);
                }
            }

            private injectJavascriptForAndroid(): void {
                if (Platform.OS !== 'android' || !this.isCurrentURLInWhitelist || !this.webView) {
                    return;
                }
                this.webView.injectJavaScript(this.composer.getScriptToInject());
            }

            render() {
                return (
                    <WrappedComponent
                        {...this.props}
                        ref={this.setWebViewRef}
                        onMessage={this.onMessage}
                        onNavigationStateChange={this.onNavigationStateChange}
                        onLoadStart={this.onLoadStart}
                        onLoadProgress={this.onLoadProgress}
                        injectedJavaScriptBeforeContentLoaded={this.composer.getScriptToInject(
                            this.props.injectedJavaScriptBeforeContentLoaded,
                        )}
                    />
                );
            }
        }

        if (options?.forwardRef) {
            const forwarded = forwardRef((props, ref) => {
                return <ComponentWithComlinkExpose {...(props as Props)} forwardedRef={ref} />;
            }) as any;
            forwarded.displayName = ComponentWithComlinkExpose.displayName;
            forwarded.WrappedComponent = ComponentWithComlinkExpose.WrappedComponent;

            return hoistNonReactStatics(forwarded, WrappedComponent);
        }

        return hoistNonReactStatics(ComponentWithComlinkExpose, WrappedComponent);
    };
}
