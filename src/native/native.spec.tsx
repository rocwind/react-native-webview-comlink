import React, { Component } from 'react';
import TestRenderer from 'react-test-renderer';

import { withComlinkExpose } from '../native/native';

// TODO: replace with jest.mock
class WebView extends Component {
    public props: any;

    render() {
        return React.createElement('WebView', this.props, this.props.children);
    }

    injectJavaScript() {}
}

it('withComlinkExpose HOC renders correctly', () => {
    const ComlinkExposed = withComlinkExpose({}, 'MyName')(WebView as any);
    const tree = TestRenderer.create(<ComlinkExposed />).toJSON();
    expect(tree).toMatchSnapshot();
});
