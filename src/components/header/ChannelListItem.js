import React, { Component } from 'react';
import { findDOMNode } from 'react-dom'
import ListItem from '@material-ui/core/ListItem';
import { ItemTypes } from '../../constants';
import { DragSource, DropTarget } from 'react-dnd';
import { withGesture } from 'react-with-gesture';
import { Spring, animated } from 'react-spring';

const channelItemSource = {
    beginDrag(props) {
        return {
            id: props.id,
            index: props.index,
        };
    }
};

const channelItemTarget = {
    hover(props, monitor, component) {
        // Refer to React DnD sort example https://github.com/react-dnd/react-dnd/blob/master/packages/documentation/examples/04%20Sortable/Simple/Container.tsx
        if (!component) {
			return null
		}
		const dragIndex = monitor.getItem().index
        const hoverIndex = props.index

		// Don't replace items with themselves
		if (dragIndex === hoverIndex) {
			return
		}

		// Determine rectangle on screen
		const hoverBoundingRect = (findDOMNode(
			component,
		)).getBoundingClientRect()

		// Get vertical middle
		const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

		// Determine mouse position
		const clientOffset = monitor.getClientOffset()

		// Get pixels to the top
		const hoverClientY = (clientOffset).y - hoverBoundingRect.top

		// Only perform the move when the mouse has crossed half of the items height
		// When dragging downwards, only move when the cursor is below 50%
		// When dragging upwards, only move when the cursor is above 50%

		// Dragging downwards
		if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
			return
		}

		// Dragging upwards
		if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
			return
		}

		// Time to actually perform the action
		props.moveItem(dragIndex, hoverIndex)

		// Note: we're mutating the monitor item here!
		// Generally it's better to avoid mutations,
		// but it's good here for the sake of performance
		// to avoid expensive index searches.
		monitor.getItem().index = hoverIndex
    }
}

const dropCollecton = (connect) => ({
    connectDropTarget: connect.dropTarget(),
})

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
        const {editMode, children, connectDragPreview, connectDragSource, isDragging, connectDropTarget, xDelta, down, ...otherProps} = this.props;
        const connectChildren = this.connectChildren(children, connectDragSource);
        const opacity = isDragging ? 0 : 1;
        return connectDropTarget(connectDragPreview(
            <div style={{opacity}}>
                <Spring native to={{ x: editMode ? 50 : down ? xDelta : 0 }}>
                    {({ x }) => (
                        <animated.div style={{ transform: x.interpolate(x => `translate3d(${x}px,0,0)`) }}>
                            <div>
                                <div style={{ position: 'absolute'}}>{xDelta}</div>
                                <ListItem {...otherProps}>
                                    {connectChildren}
                                </ListItem>
                            </div>
                        </animated.div>
                    )}
                </Spring>
            </div>
        ));
    }
}

export default DragSource(ItemTypes.CHANNELITEM, channelItemSource, collect)(DropTarget(ItemTypes.CHANNELITEM, channelItemTarget, dropCollecton)((withGesture(ChannelListItem))));