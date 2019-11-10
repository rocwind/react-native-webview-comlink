import React from 'react';
import TestRenderer from 'react-test-renderer';

import { withComlinkExpose } from '../../lib/native';

// TODO: replace with jest.mock
class WebView extends React.Component {
    render() {
        return React.createElement('WebView', this.props, this.props.children);
    }
}


it('withComlinkExpose HOC renders correctly', () => {
    const ComlinkExposed = withComlinkExpose({})(WebView);
    const tree = TestRenderer.create(<ComlinkExposed />).toJSON();
    expect(tree).toMatchSnapshot();
});
