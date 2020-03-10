import React, { useEffect, useState } from 'react';
import { useSpring, animated } from 'react-spring'
import { useDrag } from 'react-use-gesture'
import { connect } from "react-redux"
import Fab from '@material-ui/core/Fab';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DragHandle from '@material-ui/icons/DragHandle';
import RemoveIcon from '@material-ui/icons/Remove';
import EditIcon from '@material-ui/icons/Edit';
import { makeStyles } from '@material-ui/core/styles';
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

const useStyles = makeStyles(theme => ({
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
}))

const ChannelGestureListItem = props => {
    const [editMode, setEditMode] = useState(false)
    const [isDrag, setIsDrag] = useState(false)

    const getOffSet = xDelta => {
        const {actionPanelWidth} = props;
        let offset = (editMode ? actionPanelWidth : 0) + xDelta;
        offset = offset > actionPanelWidth ? actionPanelWidth : offset;
        offset = offset < 0 ? 0 : offset;
        return offset;
    }
    const changeChannel = channelId => {
        if (channelId !== props.currentChannelId) {
            props.selectChannel(channelId);
            props.setCurrentFeeds();
        }
        props.closeActionMenu();
    }
    const handleEditClick = channel => {
        props.setComponentState(state => ({ 
            editOpen: true, 
            isAdd: false,
            editChannelId: channel.id,
            editName: channel.name,
            editUrl: channel.url,
        }));
    };

    const {onMouseDown, onTouchStart, channel, actionPanelWidth } = props
    const classes = useStyles(props);

    const getEditorMode = xDelta => {
        if (Math.abs(xDelta) > clickCheckThreshold) {
            const value = xDelta > (actionPanelWidth / 2)
            setEditMode(value)
            setIsDrag(true)
            return value
        } else {
            setIsDrag(false)
            return editMode
        }
    }

    const [ { x } , set ] = useSpring(() => ({ x: 0, movement: [0, 0] }))
    
    const bind = useDrag(({ down, movement }) => set({x: down ? getOffSet(movement[0]) : (getEditorMode(movement[0]) ? actionPanelWidth : 0)}))

    useEffect(() => {
        setEditMode(props.editMode)
        set({x: props.editMode ? actionPanelWidth : 0})
    }, [props.editMode, actionPanelWidth, set])
    return (
        <div className={classes.root}>
            <ListItem className={classes.actionPanel}>
                <Typography className={classes.draggableHandle} onMouseDown={onMouseDown} onTouchStart={onTouchStart}>
                    <DragHandle fontSize="small" />
                </Typography>
                <Fab className={classes.removeButton} color="secondary" aria-label="Delete" onClick={() => props.deleteItem()}>
                    <RemoveIcon fontSize="small" />
                </Fab>
            </ListItem>
            <animated.div {...bind()} className={classes.ListItemPanel} style={{ transform: x.interpolate(x => `translate3d(${x}px,0,0)`), width: x.interpolate(x => `calc(100% - ${x}px)`) }}>
                <ListItem button
                    key={channel.id}
                    className={classes.listItem}
                    selected={!editMode && props.currentChannelId === channel.id}
                    onClick={() => {
                        return !isDrag && (!editMode ? changeChannel(channel.id) : !channel.fixed && handleEditClick(channel))}}
                >
                    <animated.div
                        style={{
                            transform: x.interpolate(x => `scale(${x / actionPanelWidth})`),
                            width: x.interpolate(x => `${x * 2 / actionPanelWidth}em`),
                            height: '2em'
                        }}
                    >
                        {!channel.fixed && <ListItemIcon className={classes.editItemIcon}>
                            <EditIcon />
                        </ListItemIcon>}
                    </animated.div>
                    <ListItemText primary={<div className={classes.channelName}>{channel.icon} <Typography noWrap variant="body1">{channel.name}</Typography></div>} />
                    {
                        channel.unreadCount > 0 ? <Badge className={classes.itemBadge} badgeContent={channel.unreadCount < 1000 ? channel.unreadCount : (
                            <Tooltip title={channel.unreadCount} enterDelay={100}>
                                <span>999+</span>
                            </Tooltip>
                        )} max={999} color="primary" /> : null
                    }
                </ListItem>
            </animated.div>
        </div> 
    )    
    
}

export default connect(mapStateToProps, mapDispatchToProps)(ChannelGestureListItem)
