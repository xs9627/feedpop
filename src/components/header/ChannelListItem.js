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
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  }
}

class ChannelListItem extends Component {
    connectChildren = (children, connect) => {
        return React.Children.map(children, child => {
            if (!React.isValidElement(child)) {
                return child;
            }
            if (child.props.children) {
                child = React.cloneElement(child, {
                    children: this.connectChildren(child.props.children, connect)
                });
            }
            if (child.props["draggable-handle"]) {
                return connect(<div className={child.props["draggable-classname"]}>{child}</div>);
            } else {
                return child;
            }
        });
    }
    render() {
        const {children, connectDragPreview, connectDragSource, isDragging, ...otherProps} = this.props;
        const connectChildren = this.connectChildren(children, connectDragSource);
        console.log(connectChildren);
        return connectDragPreview(
            <div>
            <ListItem {...otherProps}>
                {connectChildren}
            </ListItem>
            </div>
        );
    }
}

export default DragSource(ItemTypes.CHANNELITEM, channelItemSource, collect)(ChannelListItem);