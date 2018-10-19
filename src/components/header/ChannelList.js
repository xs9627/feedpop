import React, { Component } from 'react';
import List from '@material-ui/core/List';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';


class ChannelList extends Component {
    render() {
        const {children, ...otherProps} = this.props;
        return (
            <List {...otherProps}>
                {this.props.children}
            </List>
        );
    }
}

export default DragDropContext(HTML5Backend)(ChannelList);