import React, { Component } from 'react';
import { Spring } from 'react-spring/renderprops.cjs.js'
import range from 'lodash/range'
import { connect } from "react-redux"
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import RootRef from '@material-ui/core/RootRef';
import Subject from '@material-ui/icons/Subject';

import { deleteChannel, moveChannel } from "../../actions/index"
import { ChannelFixedID } from "../../constants/index"

import ChannelGestureListItem from './ChannelGestureListItem';
import { withTranslation } from 'react-i18next';

const mapStateToProps = state => {
    return {
        channels: state.channels,
        showRecentUpdate: state.showRecentUpdate,
        recentChannelIndex: state.recentChannelIndex,
        recentFeeds: state.recentFeeds,
        listItemHeight: state.fontSize + 32,
        expandView: state.expandView,
    };
}
const mapDispatchToProps = dispatch => {
    return {
        deleteChannel: id => dispatch(deleteChannel(id)),
        moveChannel: order => dispatch(moveChannel(order)),
    };
};

const styles = theme => ({
    list: {
        maxHeight: 470,
        overflowY: 'auto',
        overflowX: 'hidden',
    },
    listItem: {
        position: 'absolute',
        width: '100%'
    },
    actionPanel: {
        position: 'absolute'
    }

})

const clamp = (n, min, max) => Math.max(Math.min(n, max), min)
function reinsert(arr, from, to) {
    const _arr = arr.slice(0)
    const val = _arr[from]
    _arr.splice(from, 1)
    _arr.splice(to, 0, val)
    return _arr
}

class ChannelGestureList extends Component {
    constructor(props) {
        super(props);
        this.channelListContainer = React.createRef();

        const orderedChannels = this.setListOrder(this.props);
        this.state = {
            mouseY: 0, 
            topDeltaY: 0,
            isPressed: false,
            originalPosOfLastPressed: 0,
            channels: orderedChannels,
            order: range(orderedChannels.length)
        };
    }

    setListOrder(props) {
        const {channels, recentChannelIndex, showRecentUpdate, recentFeeds} = props;
        let orderedChannels = [...channels];
        if (showRecentUpdate) {
            orderedChannels.splice(recentChannelIndex, 0, {
                name: this.props.t('Recent Updates'), 
                id: ChannelFixedID.RECENT, 
                unreadCount: recentFeeds
                    .map(rf => rf.feed.items.filter(i => !i.isRead).length)
                    .reduce((a, b) => a + b, 0),
                icon: <Subject />,
                fixed: true
            });
        } else {
            orderedChannels = orderedChannels.filter(c => c.id !== ChannelFixedID.RECENT);
        }
        return orderedChannels;
    }

    componentDidMount() {
        window.addEventListener('touchmove', this.handleTouchMove)
        window.addEventListener('touchend', this.handleMouseUp)
        window.addEventListener('mousemove', this.handleMouseMove)
        window.addEventListener('mouseup', this.handleMouseUp)
    }

    handleTouchStart = (key, pressLocation, e) => this.handleMouseDown(key, pressLocation, e.touches[0])
    handleTouchMove = e => e.preventDefault() || this.handleMouseMove(e.touches[0])
    handleMouseUp = () => {
        if (this.state.orderUpdated) {
            setTimeout(() => {
                this.props.moveChannel(this.state.order);
            }, 500);
        }
        this.setState({ isPressed: false, topDeltaY: 0,  orderUpdated: false })
    }
    handleMouseDown = (pos, pressY, { pageY }) =>
        this.setState({ topDeltaY: pageY - pressY, mouseY: pressY, isPressed: true, originalPosOfLastPressed: pos, channelListContainerTop: this.channelListContainer.current.scrollTop })
    handleMouseMove = ({ pageY }) => {
        const { isPressed, topDeltaY, order, originalPosOfLastPressed, channelListContainerTop, channels } = this.state
        if (isPressed) {
            const mouseY = pageY - topDeltaY
            const currentRow = clamp(Math.round(mouseY / this.props.listItemHeight), 0, channels.length - 1)
            let newOrder = order
            if (currentRow !== order.indexOf(originalPosOfLastPressed)) {
                newOrder = reinsert(order, order.indexOf(originalPosOfLastPressed), currentRow)
                this.setState({orderUpdated:true});
            }
            this.setState({ mouseY: mouseY, order: newOrder })
            const topOffset = (this.getShowChannelCount() - 1) * this.props.listItemHeight;
            const listPadding = 8
            if (mouseY - channelListContainerTop > topOffset + listPadding) {
                this.channelListContainer.current.scrollTop =  mouseY - topOffset - listPadding
            } else if (mouseY - channelListContainerTop < 0 - listPadding) {
                this.channelListContainer.current.scrollTop = mouseY + listPadding
            }
        }
    }

    openDeleteChannelConfirm = channelId => {
        this.setState({deleteChannelConfirm: true, deleteChannelId: channelId});
    }
    closeDeleteChannelConfirm = () => {
        this.setState({deleteChannelConfirm: false});
    }
    handleRemoveClick = channelId => {
        this.props.deleteChannel(this.state.deleteChannelId);
        this.closeDeleteChannelConfirm();
    };

    getShowChannelCount = () => {
        return this.state.channels.length <= 10 ? this.state.channels.length : 10;
    }
    componentWillReceiveProps = newProps => {
        const orderedChannels = this.setListOrder(newProps);
        this.setState({channels: orderedChannels, order: range(orderedChannels.length)});
    }
    render() {
        const { mouseY, isPressed, originalPosOfLastPressed, order, channels } = this.state
        const { classes, t, listItemHeight } = this.props
        return (
            <RootRef rootRef={this.channelListContainer}>
                <List className={this.props.listClass} style={this.props.expandView ? {flexGrow: 1} : {height: this.getShowChannelCount() * listItemHeight + 14}} >
                    {channels.map((channel, i) => {
                        const active = originalPosOfLastPressed === i && isPressed
                        const style = active
                            ? { scale: 1, shadow: 16, y: mouseY }
                            : { scale: 1, shadow: 0, y: order.indexOf(i) * listItemHeight }
                        return (
                            <Spring immediate={name => active && name === 'y'} to={style} key={channel.id}>
                                {({ scale, shadow, y }) => (
                                    <div 
                                    className={classes.listItem}
                                    style={{
                                        boxShadow: `rgba(0, 0, 0, 0.2) 0px ${shadow}px ${2 * shadow}px 0px`,
                                        transform: `translate3d(0, ${y}px, 0) scale(${scale})`,
                                        zIndex: i === originalPosOfLastPressed ? 99 : i,
                                    }}>
                                        <ChannelGestureListItem
                                                channel = {channel}
                                                isSorting = {active}
                                                onMouseDown={this.handleMouseDown.bind(null, i, y)}
                                                onTouchStart={this.handleTouchStart.bind(null, i, y)}
                                                deleteItem={() => this.openDeleteChannelConfirm(channel.id)}
                                                editItem={() => this.handleEditClick(channel)} />
                                    </div>
                                )}
                            </Spring>
                        )
                    })}
                    <Dialog open={this.state.deleteChannelConfirm || false}>
                            <DialogTitle id="delete-channel-dialog-title">{t("Confirm")}</DialogTitle>
                            <DialogContent>
                                    <DialogContentText id="delete-channel-description">
                                    {t("Delete this channel?")}
                                    </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                    <Button onClick={this.closeDeleteChannelConfirm} color="primary">
                                    {t("Cancel")}
                                    </Button>
                                    <Button onClick={this.handleRemoveClick} color="primary" autoFocus>
                                    {t("OK")}
                                    </Button>
                            </DialogActions>
                    </Dialog>
                </List>
            </RootRef>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withTranslation()(ChannelGestureList)))
