import 'message-port-polyfill';
import './polyfill';
import * as React from 'react';
import { ComponentType, Component } from 'react';
import { Exposable, expose } from 'comlinkjs';
import { wrap } from 'comlinkjs/messagechanneladapter';
import hoistNonReactStatics from 'hoist-non-react-statics';
import './webview';
import { WebViewProps, WebView, WebViewMessageEvent, WebViewNavigation } from './webview';
import WebViewMessageChannel from './messagechannel';

interface HighOrderComponentCreator<Props> {
    (component: ComponentType<Props>): ComponentType<Props>
}

interface Config {
    debug?: boolean;
}

export function withComlinkExpose<Props extends WebViewProps>(rootObj: Exposable, config: Config = {}): HighOrderComponentCreator<Props> {
    return (WrappedComponent: ComponentType<Props>) => {
        class ComponentWithComlinkExpose extends Component<Props> {
            private messageChannel: WebViewMessageChannel;

            constructor(props) {
                super(props);

                // connect and expose the rootObj
                this.messageChannel = new WebViewMessageChannel(config.debug);
                expose(rootObj, wrap(this.messageChannel));
            }

            setWebViewRef = (ref: WebView) => {
                this.messageChannel.setWebview(ref);
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
                    ref={this.setWebViewRef}
                    onMessage={this.onMessage}
                    onNavigationStateChange={this.onNavigationStateChange}
                    {...props as Props}
                />;
            }
        }

        return hoistNonReactStatics(ComponentWithComlinkExpose, WrappedComponent);
    };
}
