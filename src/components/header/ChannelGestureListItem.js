import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import { Spring, animated } from 'react-spring'
import { withGesture } from 'react-with-gesture'
import range from 'lodash/range'
import { connect } from "react-redux"
import Button from '@material-ui/core/Button';
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

const actionPanelWidth = 85
const mapStateToProps = state => {
    return {
        editMode: state.channelSelectorEditMode,
        currentChannelId: state.currentChannelId,
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
        height:500
    },
    list: {
        height: 500,
        maxHeight: 470,
        overflowY: 'auto',
        overflowX: 'hidden',
    },
    ListItemPanel: {
        backgroundColor: theme.palette.background.paper,
    },
    actionPanel: {
        position: 'absolute',
        height: 46,
        backgroundColor: theme.palette.background.default,
        paddingLeft: theme.spacing.unit

    },
    draggableHandle: {
        display: 'inline-flex', 
        verticalAlign: 'middle',
        cursor: 'move',
        '& p': {
            display: 'inherit',
        },
        borderRight: `2px solid ${theme.palette.divider}`,
        padding: theme.spacing.unit,
    },
    removeButton: {
        width: 20,
        height: 20,
        minHeight: 20,
        marginLeft: theme.spacing.unit,

    },
    itemBadge: {
        marginRight: theme.spacing.unit * 2,
    },
    editItemIcon: {
        marginRight: 0,
    }
})

class ChannelGestureListItem extends React.Component {
    state = {
        editMode: false
    }
    getOffSet = xDelta => {
        let offset = (this.state.editMode ? actionPanelWidth : 0) + xDelta;
        offset = offset > actionPanelWidth ? actionPanelWidth : offset;
        offset = offset < 0 ? 0 : offset;
        return offset;
    }
    changeChannel = channelId => {
        this.props.selectChannel(channelId);
        this.props.setCurrentFeeds();
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
        if (newProps.xDelta !==0 && this.props.down && !newProps.down && (!this.state.editMode || newProps.xInitial >= actionPanelWidth)) {
            this.state.editMode = newProps.xDelta > actionPanelWidth / 2;
        }
        if (this.props.editMode && !newProps.editMode) {
            this.state.editMode = false
        } else if (!this.props.editMode && newProps.editMode) {
            this.state.editMode = true
        }
    }
    render() {
        const { classes, xInitial, xDelta, down, onMouseDown, onTouchStart, channel, isSorting, editMode, currentChannelId } = this.props
        return (
            <Spring native to={{ x: !isSorting && down ? this.getOffSet(xDelta) : this.state.editMode ? actionPanelWidth : 0 }}>
                {({ x }) => (
                    <div>
                        <ListItem className={classes.actionPanel}>
                            <Typography className={classes.draggableHandle} onMouseDown={onMouseDown} onTouchStart={onTouchStart}>
                                <DragHandle fontSize="small" />
                            </Typography>
                            <Button className={classes.removeButton} variant="fab" mini color="secondary" aria-label="Delete" onClick={() => this.props.deleteItem()}>
                                <RemoveIcon fontSize="small" />
                            </Button>
                        </ListItem>
                        <animated.div className={classes.ListItemPanel} style={{ transform: x.interpolate(x => `translate3d(${x}px,0,0)`) }}>
                            <ListItem button
                                key={channel.id}
                                className={classes.listItem}
                                selected={!this.state.editMode && this.props.currentChannelId == channel.id}
                                onClick={() => (xDelta === 0) && (!this.state.editMode ? this.changeChannel(channel.id) : this.handleEditClick(channel))}
                            >
                                <animated.div
                                    style={{
                                        transform: x.interpolate(x => `scale(${x / actionPanelWidth})`),
                                        width: x.interpolate(x => `${x * 2 / actionPanelWidth}em`),
                                        height: '2em'
                                    }}
                                >
                                    <ListItemIcon className={classes.editItemIcon}>
                                        <EditIcon />
                                    </ListItemIcon>
                                </animated.div>
                                <ListItemText primary={channel.name} primaryTypographyProps={{noWrap: true}} />
                                {
                                    channel.unreadCount > 0 ? <Badge className={this.props.classes.itemBadge} badgeContent={channel.unreadCount < 1000 ? channel.unreadCount : (
                                        <Tooltip title={channel.unreadCount} enterDelay={100}>
                                            <span>...</span>
                                        </Tooltip>
                                    )} color="primary" /> : null
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
