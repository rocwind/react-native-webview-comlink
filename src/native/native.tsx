import 'message-port-polyfill';
import * as React from 'react';
import { ComponentType, Component } from 'react';
import { Exposable, expose } from 'comlinkjs';
import { wrap } from 'comlinkjs/messagechanneladapter';
import hoistNonReactStatics from 'hoist-non-react-statics';
import './webview';
import { WebViewProps, WebView, WebViewMessageEvent } from './webview';
import WebViewMessageChannel from './endpoint';

interface HighOrderComponentCreator<Props> {
    (component: ComponentType<Props>): ComponentType<Props>
}

export function withComlinkExpose<Props extends WebViewProps>(rootObj: Exposable): HighOrderComponentCreator<Props> {
    return (WrappedComponent: ComponentType<Props>) => {
        class ComponentWithComlinkExpose extends Component<Props> {
            private messageChannel: WebViewMessageChannel;

            constructor(props) {
                super(props);

                // connect and expose the rootObj
                this.messageChannel = new WebViewMessageChannel();
                expose(rootObj, wrap(this.messageChannel));
            }

            setWebViewRef = (ref: WebView) => {
                this.messageChannel.setWebview(ref);
            }

            onMessage = (event: WebViewMessageEvent) => {
                this.messageChannel.onMessage(event);
            }

            render() {
                const {
                    onMessage,
                    ...props
                } = this.props;

                return <WrappedComponent
                    ref={this.setWebViewRef}
                    onMessage={this.onMessage}
                    {...props as Props}
                />;
            }
        }

        return hoistNonReactStatics(ComponentWithComlinkExpose, WrappedComponent);
    };
}
