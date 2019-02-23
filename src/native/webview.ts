import { Component } from 'react';
import { NativeSyntheticEvent, ViewProps } from 'react-native';

export interface WebViewNativeEvent {
  readonly url: string;
  readonly loading: boolean;
  readonly title: string;
  readonly canGoBack: boolean;
  readonly canGoForward: boolean;
}

export interface WebViewNavigation extends WebViewNativeEvent {
  readonly navigationType:
    | 'click'
    | 'formsubmit'
    | 'backforward'
    | 'reload'
    | 'formresubmit'
    | 'other';
}

export interface WebViewMessage extends WebViewNativeEvent {
  readonly data: string;
}

export type WebViewEvent = NativeSyntheticEvent<WebViewNativeEvent>;

export type WebViewNavigationEvent = NativeSyntheticEvent<WebViewNavigation>;

export type WebViewMessageEvent = NativeSyntheticEvent<WebViewMessage>;



export interface WebViewProps extends ViewProps {
  /**
   * Function that is invoked when the `WebView` loading starts or ends.
   */
  onNavigationStateChange?: (event: WebViewNavigation) => any;

  /**
   * A function that is invoked when the webview calls `window.postMessage`.
   * Setting this property will inject a `postMessage` global into your
   * webview, but will still call pre-existing values of `postMessage`.
   *
   * `window.postMessage` accepts one argument, `data`, which will be
   * available on the event object, `event.nativeEvent.data`. `data`
   * must be a string.
   */
  onMessage?: (event: WebViewMessageEvent) => any;
}

export class WebView extends Component<WebViewProps> {
  public postMessage: (msg: string) => void;
}
