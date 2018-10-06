import React, { Component } from 'react';
import classNames from 'classnames';
import FeedUtil from '../../utils/FeedUtil';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Add from '@material-ui/icons/Add';
import Edit from '@material-ui/icons/Edit';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import MoreVert from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Badge from '@material-ui/core/Badge';

import { connect } from "react-redux";
import { addChannel, toggleChannelSelectorEditMode, deleteChannel, updateUnreadCount, selectChannel, closeActionMenu, updateChannelFeed, } from "../../actions/index"

const mapStateToProps = state => {
    return {
        channel: state.channels,
        editMode: state.channelSelectorEditMode,
        currentChannelId: state.currentChannelId,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        addChannel: channel => dispatch(addChannel(channel)),
        toggleEditMode: () => dispatch(toggleChannelSelectorEditMode()),
        deleteChannel: id => dispatch(deleteChannel(id)),
        updateUnreadCount: () => dispatch(updateUnreadCount()),
        selectChannel: id => dispatch(selectChannel(id)),
        closeActionMenu: () => dispatch(closeActionMenu()),
        updateChannelFeed: (id, callback) => dispatch(updateChannelFeed(id, callback)),
    };
};

const styles = theme => ({
    root: {
      backgroundColor: theme.palette.background.paper,
    },
    list: {
        maxHeight: 470,
        overflow: 'auto',
    },
    actionPanel: {
        display: 'flex',
        backgroundColor: theme.palette.background.default,
    },
    actionRight: {
        marginLeft: 'auto',
        padding: 5,
    },
    actionButton: {
        padding: 6,
        marginRight: 5,
    },
    actionButtonIconActive: {
        color: theme.palette.primary.main,
    },
    itemBadge: {
        marginRight: 12
    }
});

class ChannelSelector extends Component {
    constructor(props) {
        super(props);
        this.state = { editOpen: false };
    }
    changeChannel = channelId => {
        this.props.selectChannel(channelId);
        this.props.closeActionMenu();
    }
    renderChannels = () => {
        const { anchorEl } = this.state;
        let channels = [];
        for (let i = 0; i < this.props.channel.length; i++) {
            const channel = this.props.channel[i];
            channels.push(
            <ListItem button
                selected={!this.props.editMode && this.props.currentChannelId == channel.id}
                onClick={() => this.changeChannel(channel.id)}
            >
                <ListItemText primary={channel.name} />
                {this.props.editMode ?
                (
                    <ListItemSecondaryAction>
                        <IconButton 
                            aria-owns={anchorEl ? 'simple-menu' : null}
                            aria-haspopup="true"
                            onClick={event => this.handleItemMenulick(event, channel)}
                        >
                            <MoreVert fontSize="small" />
                        </IconButton>
                    </ListItemSecondaryAction>
                ) : (
                    channel.unreadCount > 0 ? <Badge className={this.props.classes.itemBadge} badgeContent={channel.unreadCount < 1000 ? channel.unreadCount : '...'} color="primary" /> : null
                )}
            </ListItem>
            );
        }
        return channels;
    }
    handleItemMenulick = (event, channel) => {
        this.setState({ anchorEl: event.currentTarget, currentEditChannel: channel });
    };
    handleEditChannel = () => {
        this.setState(state => ({ 
            editOpen: true, 
            isAdd: false, 
            editName: state.currentEditChannel.name,
            editUrl: state.currentEditChannel.url,
            anchorEl: null,
        }));
    };
    handleDeleteChannel = () => {
        const channelId = this.state.currentEditChannel.id;
        this.props.deleteChannel(channelId);
        this.props.updateUnreadCount();
        this.setState({ anchorEl: null });    
    };
    handleItemMenuClose = () => {
        this.setState({ anchorEl: null });
      };
    handleAddClick = () => {
        this.setState(state => ({
            isAdd: true,
            editOpen: !state.editOpen,
            editName: '',
            editUrl: '',
        }));
    }
    handleEditClose = () => {
        this.setState({ editOpen: false });
    }
    handleEditConfirmClose = () => {
        if (this.state.isAdd) {
            const channel = { name: this.state.editName, url: this.state.editUrl };
            this.props.addChannel(channel);
            this.props.updateChannelFeed(channel.id, () => {
                this.props.updateUnreadCount();
            });
        }
        this.setState({ editOpen: false });
    }
    render () {
        const { classes } = this.props;
        const { anchorEl } = this.state;
        return (
            <div className={classes.root}>
                <List component="nav" className={classes.list}>
                    {this.renderChannels()}
                    <Menu
                        id="simple-menu"
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={this.handleItemMenuClose}
                        >
                        <MenuItem onClick={this.handleEditChannel}>Edit</MenuItem>
                        <MenuItem onClick={this.handleDeleteChannel}>Delete</MenuItem>
                    </Menu>
                </List>
                <div className={classes.actionPanel}>
                    <div className={classes.actionRight}>
                        <IconButton className={classes.actionButton} onClick={this.handleAddClick}>
                            <Add fontSize="small" />
                        </IconButton>
                        <IconButton className={classes.actionButton} onClick={this.props.toggleEditMode}>
                            <Edit fontSize="small" className={classNames({ [classes.actionButtonIconActive]: this.props.editMode })} />
                        </IconButton>
                    </div>
                </div>
                <Dialog
                    open={this.state.editOpen}
                    onClose={this.handleEditClose}
                    aria-labelledby="form-dialog-title"
                    >
                    <DialogTitle id="form-dialog-title">{this.state.isAdd ? 'Add' : 'Edit'}</DialogTitle>
                    <DialogContent>
                        <TextField
                        margin="dense"
                        id="chanelName"
                        label="Name"
                        fullWidth
                        value={this.state.editName}
                        onChange={e => this.setState({ editName: e.target.value })}
                        />
                        <TextField
                        margin="dense"
                        id="channelUrl"
                        label="Url"
                        fullWidth
                        value={this.state.editUrl}
                        onChange={e => this.setState({ editUrl: e.target.value })}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleEditClose} color="primary">
                        Cancel
                        </Button>
                        <Button onClick={this.handleEditConfirmClose} color="primary">
                        {this.state.isAdd ? 'Add' : 'Update'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ChannelSelector));