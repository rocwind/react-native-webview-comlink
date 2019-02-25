import 'message-port-polyfill';
import './polyfill';
import * as React from 'react';
import { ComponentType, Component, forwardRef, Ref } from 'react';
import { Exposable, expose } from 'comlinkjs';
import { wrap } from 'comlinkjs/messagechanneladapter';
import hoistNonReactStatics from 'hoist-non-react-statics';
import './webview';
import { WebViewProps, WebView, WebViewMessageEvent, WebViewNavigation } from './webview';
import WebViewMessageChannel from './messagechannel';

interface HigherOrderComponentCreator<Props> {
    (component: ComponentType<Props>): ComponentType<Props>
}

interface Config {
    forwardRef?: boolean;
    debug?: boolean;
}

interface RefForwardingProps {
    forwardedRef: any;
}

export function withComlinkExpose<Props extends WebViewProps>(rootObj: Exposable, config: Config = {}): HigherOrderComponentCreator<Props> {
    return (WrappedComponent: ComponentType<Props>) => {
        class ComponentWithComlinkExpose extends Component<Props & RefForwardingProps> {
            private messageChannel: WebViewMessageChannel;

            static displayName: string = `withwithComlinkExpose(${WrappedComponent.displayName || WrappedComponent.name})`;
            static WrappedComponent: ComponentType<Props> = WrappedComponent;

            constructor(props) {
                super(props);

                // connect and expose the rootObj
                this.messageChannel = new WebViewMessageChannel(config.debug);
                expose(rootObj, wrap(this.messageChannel));
            }

            setWebViewRef = (ref: WebView) => {
                this.messageChannel.setWebview(ref);
                const { forwardedRef } = this.props;
                if (forwardedRef) {
                    if (typeof forwardedRef === 'function') {
                        forwardedRef(ref);
                    } else {
                        forwardedRef.current = ref;
                    }
                }
            }

            onMessage = (event: WebViewMessageEvent) => {
                this.messageChannel.onMessage(event);
                // delegate to wrapped component
                const { onMessage } = this.props;
                if (onMessage) {
                    onMessage(event);
                }
            }

            onNavigationStateChange = (event: WebViewNavigation) => {
                const { onNavigationStateChange } = this.props;
                if (onNavigationStateChange) {
                    onNavigationStateChange(event);
                }
            }

            render() {
                const {
                    onMessage,
                    onNavigationStateChange,
                    ...props
                } = this.props;

                return <WrappedComponent
                    {...props as Props}
                    ref={this.setWebViewRef}
                    onMessage={this.onMessage}
                    onNavigationStateChange={this.onNavigationStateChange}
                />;
            }
        }

        if (config.forwardRef) {
            const forwarded = forwardRef((props, ref) => {
                return <ComponentWithComlinkExpose {...props as Props} forwardedRef={ref} />;
            }) as any;
            forwarded.displayName = ComponentWithComlinkExpose.displayName;
            forwarded.WrappedComponent = ComponentWithComlinkExpose.WrappedComponent;

            return hoistNonReactStatics(forwarded, WrappedComponent);
        }

        return hoistNonReactStatics(ComponentWithComlinkExpose, WrappedComponent);
    };
}
