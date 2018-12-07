import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import { Spring } from 'react-spring'
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

import { deleteChannel, moveChannel } from "../../actions/index"

import ChannelGestureListItem from './ChannelGestureListItem';
import { withNamespaces } from 'react-i18next';

const listItemHeight = 46
const mapStateToProps = state => {
    return {
        channels: state.channels
    }
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

class ChannelGestureList extends React.Component {
    state = { mouseY: 0, topDeltaY: 0, isPressed: false, originalPosOfLastPressed: 0, order: range(this.props.channels.length) }

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
                this.props.moveChannel(this.state.order)
            }, 500);
        }
        this.setState({ isPressed: false, topDeltaY: 0,  orderUpdated: false })
    }
    handleMouseDown = (pos, pressY, { pageY }) =>
        this.setState({ topDeltaY: pageY - pressY, mouseY: pressY, isPressed: true, originalPosOfLastPressed: pos, channelListContainerTop: this.channelListContainer.scrollTop })
    handleMouseMove = ({ pageY }) => {
        const { isPressed, topDeltaY, order, originalPosOfLastPressed, channelListContainerTop } = this.state
        if (isPressed) {
            const mouseY = pageY - topDeltaY
            const currentRow = clamp(Math.round(mouseY / listItemHeight), 0, this.props.channels.length - 1)
            let newOrder = order
            if (currentRow !== order.indexOf(originalPosOfLastPressed)) {
                newOrder = reinsert(order, order.indexOf(originalPosOfLastPressed), currentRow)
                this.state.orderUpdated = true;
            }
            this.setState({ mouseY: mouseY, order: newOrder })
            if (mouseY - channelListContainerTop > listItemHeight * 9) {
                this.channelListContainer.scrollTop =  mouseY - 9 * listItemHeight
            } else if (mouseY - channelListContainerTop < -10) {
                this.channelListContainer.scrollTop = mouseY + 10
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

    componentWillReceiveProps(newProps) {
        if (newProps.channels) {
            this.state.order = range(newProps.channels.length)
        }
    }

    render() {
        const { mouseY, isPressed, originalPosOfLastPressed, order } = this.state
        const { channels, classes, t } = this.props
        
        return (
            <div className={classes.list} style={{height: (channels.length <= 10 ? channels.length : 10) * listItemHeight}} ref={node => this.channelListContainer = node}>
                <List>
                    {this.props.channels.map((channel, i) => {
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
                    <Dialog open={this.state.deleteChannelConfirm}>
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
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withNamespaces()(ChannelGestureList)))
