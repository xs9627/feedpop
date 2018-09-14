import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Add from '@material-ui/icons/Add';
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

const styles = theme => ({
    root: {
      backgroundColor: theme.palette.background.paper,
    },
    list: {
        maxHeight: 490,
        overflow: 'auto',
    },
    actionPanel: {
        display: 'flex',
        backgroundColor: theme.palette.background.default,
    },
    actionRight: {
        marginLeft: 'auto',
    },
    actionButton: {
        margin: 5,
        width: 24,
        height: 24,
    },
    actionButtonIcon: {
        transform: 'scale(0.6)',
        color: theme.palette.primary.main,
    },
});

class ChannelSelector extends Component {
    constructor(props) {
        super(props);
        this.state = {value: this.props.selectedId, editOpen: false};
    }
    componentDidMount = () => {
    }
    componentWillUnmount = () => {
        this.setState({ editOpen: false });
    }
    changeChannel = channelId => {
        this.props.onChange(channelId);
        this.setState({'value': channelId});
    }
    renderChannels = () => {
        const { anchorEl } = this.state;
        let channels = [];
        for (let i = 0; i < this.props.channel.length; i++) {
            const channel = this.props.channel[i];
            channels.push(
            <ListItem button
                selected={this.state.value == channel.id}
                onClick={() => this.changeChannel(channel.id)}
            >
                <ListItemText primary={channel.name} />
                <ListItemSecondaryAction>
                    <IconButton 
                        aria-owns={anchorEl ? 'simple-menu' : null}
                        aria-haspopup="true"
                        onClick={event => this.handleItemMenulick(event, channel)}
                    >
                        <MoreVert />
                    </IconButton>
                </ListItemSecondaryAction>
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
        this.props.deleteChannel(this.state.currentEditChannel.id);
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
            this.props.addChannel(this.state.editName, this.state.editUrl);
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
                            <Add className={classes.actionButtonIcon} />
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

export default withStyles(styles)(ChannelSelector);