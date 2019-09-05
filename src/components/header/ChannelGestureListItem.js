import React, { Component } from 'react';
import { Spring, animated } from 'react-spring/renderprops.cjs.js'
import { withGesture } from 'react-with-gesture'
import { connect } from "react-redux"
import Fab from '@material-ui/core/Fab';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DragHandle from '@material-ui/icons/DragHandle';
import RemoveIcon from '@material-ui/icons/Remove';
import EditIcon from '@material-ui/icons/Edit';
import { withStyles } from '@material-ui/core/styles';
import Badge from '@material-ui/core/Badge';
import Tooltip from '@material-ui/core/Tooltip';
import { selectChannel, closeActionMenu, setCurrentFeeds, setComponentState } from "../../actions/index"

const clickCheckThreshold = 5
const mapStateToProps = state => {
    return {
        editMode: state.channelSelectorEditMode,
        currentChannelId: state.currentChannelId,
        actionPanelWidth: 85 + (state.fontSize - 14) * 2
    }
}

const mapDispatchToProps = dispatch => {
    return {
        selectChannel: id => dispatch(selectChannel(id)),
        closeActionMenu: () => dispatch(closeActionMenu()),
        setCurrentFeeds: () => dispatch(setCurrentFeeds()),
        setComponentState: state => dispatch(setComponentState('channelSelector', state)),
    };
};

const styles = theme => ({
    root: {
        '&:active': {
            cursor: 'grabbing'
        }
    },
    ListItemPanel: {
        backgroundColor: theme.palette.background.paper,
    },
    listItem: {
        height: theme.typography.fontSize + 32,
        '&:active': {
            cursor: 'grabbing'
        }
    },
    actionPanel: {
        position: 'absolute',
        height: theme.typography.fontSize + 32,
        backgroundColor: theme.palette.background.default,
        paddingLeft: theme.spacing.unit

    },
    draggableHandle: {
        display: 'inline-flex', 
        verticalAlign: 'middle',
        cursor: 'grab',
        '& p': {
            display: 'inherit',
        },
        borderRight: `2px solid ${theme.palette.divider}`,
        padding: theme.spacing.unit,
        '&:active': {
            cursor: 'grabbing'
        }
    },
    removeButton: {
        width: 'auto',
        height: 'auto',
        minHeight: 'auto',
        marginLeft: theme.spacing.unit,

    },
    itemBadge: {
        width: 20,
        marginRight: theme.spacing.unit * 2,
    },
    editItemIcon: {
        marginRight: 0,
    },
    channelName: {
        display: 'flex',
        '& svg': {
            marginRight: theme.spacing.unit,
        }
    }
})

class ChannelGestureListItem extends Component {
    state = {
        editMode: false
    }
    getOffSet = xDelta => {
        const {actionPanelWidth} = this.props;
        let offset = (this.state.editMode ? actionPanelWidth : 0) + xDelta;
        offset = offset > actionPanelWidth ? actionPanelWidth : offset;
        offset = offset < 0 ? 0 : offset;
        return offset;
    }
    changeChannel = channelId => {
        if (channelId !== this.props.currentChannelId) {
            this.props.selectChannel(channelId);
            this.props.setCurrentFeeds();
        }
        this.props.closeActionMenu();
    }
    openDeleteChannelConfirm = channelId => {
        this.setState({deleteChannelConfirm: true, deleteChannelId: channelId});
    }
    closeDeleteChannelConfirm = () => {
        this.setState({deleteChannelConfirm: false});
    }
    handleEditClick = channel => {
        this.props.setComponentState(state => ({ 
            editOpen: true, 
            isAdd: false,
            editChannelId: channel.id,
            editName: channel.name,
            editUrl: channel.url,
        }));
    };
    componentWillReceiveProps(newProps) {
        const {actionPanelWidth} = this.props;
        if (Math.abs(newProps.xDelta) > clickCheckThreshold && this.props.down && !newProps.down && (!this.state.editMode || newProps.xInitial >= actionPanelWidth)) {
            this.setState({editMode: newProps.xDelta > actionPanelWidth / 2});
        }
        if (this.props.editMode && !newProps.editMode) {
            this.setState({editMode: false});
        } else if (!this.props.editMode && newProps.editMode) {
            this.setState({editMode: true});
        }
    }
    render() {
        const { classes, xDelta, down, onMouseDown, onTouchStart, channel, isSorting, actionPanelWidth } = this.props
        return (
            <Spring native to={{ x: !isSorting && down ? this.getOffSet(xDelta) : this.state.editMode ? actionPanelWidth : 0 }}>
                {({ x }) => (
                    <div className={classes.root}>
                        <ListItem className={classes.actionPanel}>
                            <Typography className={classes.draggableHandle} onMouseDown={onMouseDown} onTouchStart={onTouchStart}>
                                <DragHandle fontSize="small" />
                            </Typography>
                            <Fab className={classes.removeButton} color="secondary" aria-label="Delete" onClick={() => this.props.deleteItem()}>
                                <RemoveIcon fontSize="small" />
                            </Fab>
                        </ListItem>
                        <animated.div className={classes.ListItemPanel} style={{ transform: x.interpolate(x => `translate3d(${x}px,0,0)`) }}>
                            <ListItem button
                                key={channel.id}
                                className={classes.listItem}
                                selected={!this.state.editMode && this.props.currentChannelId === channel.id}
                                onClick={() => (Math.abs(xDelta) < clickCheckThreshold) && (!this.state.editMode ? this.changeChannel(channel.id) : !channel.fixed && this.handleEditClick(channel))}
                            >
                                <animated.div
                                    style={{
                                        transform: x.interpolate(x => `scale(${x / actionPanelWidth})`),
                                        width: x.interpolate(x => `${x * 2 / actionPanelWidth}em`),
                                        height: '2em'
                                    }}
                                >
                                    <ListItemIcon className={classes.editItemIcon}>
                                        {!channel.fixed && <EditIcon />}
                                    </ListItemIcon>
                                </animated.div>
                                <ListItemText primary={<div className={classes.channelName}>{channel.icon} <Typography noWrap variant="body1">{channel.name}</Typography></div>} />
                                {
                                    channel.unreadCount > 0 ? <Badge className={this.props.classes.itemBadge} badgeContent={channel.unreadCount < 1000 ? channel.unreadCount : (
                                        <Tooltip title={channel.unreadCount} enterDelay={100}>
                                            <span>999+</span>
                                        </Tooltip>
                                    )} max={999} color="primary" /> : null
                                }
                            </ListItem>
                        </animated.div>
                    </div> 
                )}
            </Spring>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withGesture(ChannelGestureListItem)))
