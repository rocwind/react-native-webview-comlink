import 'message-port-polyfill';
import './polyfill';
import React, { ComponentType, Component, forwardRef } from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { Exposable, expose } from 'comlinkjs';
import { wrap } from '../common/messagechanneladapter';
import {
    WebView,
    WebViewProps,
    WebViewMessageEvent,
    WebViewNavigation,
} from 'react-native-webview';
import { WebViewProgressEvent } from 'react-native-webview/lib/WebViewTypes';
import { WebViewMessageChannel, isEnabledGetter } from './messagechannel';
import { createExposableProxy } from './proxy';
import { Logger, createLogger } from './logger';
import { Injector } from './injector';

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
 * wrap webview component with Comlink support
 * @param rootObj the root object exposed via Comlink
 * @param name the name for the exposed object - window[name] in web side
 * @param config
 */
export function withComlinkExpose<Props extends WebViewProps>(
    rootObj: Exposable,
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
            private messageChannel: WebViewMessageChannel;
            private injector: Injector;
            private isCurrentURLInWhitelist: boolean;

            static displayName: string = `withwithComlinkExpose(${
                WrappedComponent.displayName || WrappedComponent.name
            })`;
            static WrappedComponent: ComponentType<Props> = WrappedComponent;

            constructor(props) {
                super(props);

                this.isCurrentURLInWhitelist = true;

                // connect and expose the rootObj
                this.messageChannel = new WebViewMessageChannel(this.isEnabled, logger);
                this.injector = new Injector(name, rootObj);
                expose(createExposableProxy(rootObj), wrap(this.messageChannel));
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
                this.messageChannel.setWebview(ref);
                this.injector.setWebview(ref);
                if (this.isCurrentURLInWhitelist) {
                    logger(`inject script on WebView ref ready`);
                    this.injector.inject();
                }

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
                this.messageChannel.onMessage(event);
                // delegate to event handler
                this.props.onMessage?.(event);
            };

            onNavigationStateChange = (event: WebViewNavigation) => {
                const { url } = event;
                if (whitelistURLs && url?.startsWith('http')) {
                    // check if the url in whitelist, skip js bridge urls like `react-js-navigation://xxx`
                    this.isCurrentURLInWhitelist = !!whitelistURLs.find((reg) => reg.test(url));
                    logger(`${url} is in whitelist: ${this.isCurrentURLInWhitelist}`);
                }

                // delegate to event handler
                this.props.onNavigationStateChange?.(event);
            };

            onLoadProgress = (event: WebViewProgressEvent) => {
                if (event.nativeEvent.progress === 1 && this.isCurrentURLInWhitelist) {
                    logger(`inject script on page load`);
                    this.injector.inject();
                }

                // delegate to event handler
                this.props.onLoadProgress?.(event);
            };

            render() {
                const { onMessage, onNavigationStateChange, onLoadProgress, ...props } = this.props;

                return (
                    <WrappedComponent
                        {...(props as Props)}
                        ref={this.setWebViewRef}
                        onMessage={this.onMessage}
                        onNavigationStateChange={this.onNavigationStateChange}
                        onLoadProgress={this.onLoadProgress}
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
