import React, { ComponentType, Component, forwardRef } from 'react';
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
     * the interface is injected on load end by default, set to `true`
     * to get the interface injected on load start
     * NOTE:
     * - it only works for Android, iOS will ignore this option as
     * it's necessary to inject on load end for iOS to work
     * - if target lower browser version device where it needs polyfills,
     * it's better to inject on load end where those polyfills are already
     * loaded with web page
     */
    injectOnLoadStart?: boolean;
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
 * @param rootObj the root object exposed as JavascriptInterface
 * @param name the name for the exposed object - window[name] in web side
 * @param config
 */
export function withJavascriptInterface<Props extends WebViewProps>(
    rootObj: any,
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
            private currentURL: string;

            static displayName: string = `withJavascriptInterface(${name})(${
                WrappedComponent.displayName || WrappedComponent.name || 'Component'
            })`;
            static WrappedComponent: ComponentType<Props> = WrappedComponent;

            constructor(props) {
                super(props);

                this.currentURL = '';
                this.isCurrentURLInWhitelist = true;
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

            render() {
                return (
                    <WrappedComponent
                        {...this.props}
                        ref={this.setWebViewRef}
                        onMessage={this.onMessage}
                        onNavigationStateChange={this.onNavigationStateChange}
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
