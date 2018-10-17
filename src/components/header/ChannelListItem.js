import React, { Component } from 'react';
import ListItem from '@material-ui/core/ListItem';
import { ItemTypes } from '../../constants';
import { DragSource } from 'react-dnd';

const channelItemSource = {
    beginDrag(props) {
        return {};
    }
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  }
}

class ChannelListItem extends Component {
    render() {
        const {children, connectDragSource, isDragging, ...otherProps} = this.props;
        return connectDragSource(
            <div>
            <ListItem {...otherProps}>
                {this.props.children}
            </ListItem>
            </div>
        );
    }
}

export default DragSource(ItemTypes.CHANNELITEM, channelItemSource, collect)(ChannelListItem);