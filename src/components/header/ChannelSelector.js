import React, { Component } from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import ChannelGestureList from './ChannelGestureList'
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Add from '@material-ui/icons/Add';
import Edit from '@material-ui/icons/Edit';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';

import { connect } from "react-redux";
import { addChannel, editChannel, toggleChannelSelectorEditMode, deleteChannel, closeActionMenu, setComponentState, moveChannel, setCurrentFeeds, toggleTourOpen} from "../../actions/index"

import { withTranslation } from 'react-i18next';

const componentStateName = 'channelSelector';

const mapStateToProps = state => {
    return {
        channel: state.channels,
        editMode: state.channelSelectorEditMode,
        currentChannelId: state.currentChannelId,
        isCheckingUrl: state.getComponentState(componentStateName, 'isCheckingUrl'),
        editOpen: state.getComponentState(componentStateName, 'editOpen'),
        isAdd: state.getComponentState(componentStateName, 'isAdd'),
        editChannelId: state.getComponentState(componentStateName, 'editChannelId'),
        editName: state.getComponentState(componentStateName, 'editName'),
        editUrl: state.getComponentState(componentStateName, 'editUrl'),
        currentEditChannel: state.getComponentState(componentStateName, 'currentEditChannel'),
        isUrlInvalid: state.getComponentState(componentStateName, 'isUrlInvalid'),
        urlErrorMessage: state.getComponentState(componentStateName, 'urlErrorMessage'),
        isTourOpen: state.tourOption.isTourOpen,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        addChannel: url => dispatch(addChannel(url)),
        editChannel: channel => dispatch(editChannel(channel)),
        toggleEditMode: () => dispatch(toggleChannelSelectorEditMode()),
        deleteChannel: id => dispatch(deleteChannel(id)),
        closeActionMenu: () => dispatch(closeActionMenu()),
        setComponentState: state => dispatch(setComponentState(componentStateName, state)),
        moveChannel: (from, to) => dispatch(moveChannel(from, to)),
        setCurrentFeeds: () => dispatch(setCurrentFeeds()),
        toggleTourOpen: option => dispatch(toggleTourOpen(option)),
    };
};

const styles = theme => ({
    root: {
      backgroundColor: theme.palette.background.paper,
    },
    list: {
        maxHeight: 470,
        overflowY: 'auto',
        overflowX: 'hidden',
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
    removeButtonContaniner: {
        right: 'auto',
        left: '4px',
    },
    removeButton: {
        width: 20,
        height: 20,
        minHeight: 20,
        marginLeft: theme.spacing.unit,

    },
    channelItemEditMode: {
        paddingLeft: theme.spacing.unit * 10,
        paddingRight: theme.spacing.unit * 2,
    },
    channelItemActionPanel: {
        right: 'auto',
        left: theme.spacing.unit,
    },
    buttonWrapper: {
        margin: theme.spacing.unit,
        position: 'relative',
    },
    buttonProgress: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
});

class ChannelSelector extends Component {
    state = {};

    handleAddClick = () => {
        this.props.setComponentState(state => ({
            isAdd: true,
            editOpen: true,
            editName: '',
            editUrl: '',
        }));
        this.props.toggleTourOpen({isTourOpen: false});
    }
    handleEditClose = () => {
        this.props.setComponentState({ editOpen: false, isCheckingUrl: false, isUrlInvalid: false, });
    }
    handleEditConfirmClose = () => {
        const withHttp = url => !/^https?:\/\//i.test(url) ? `http://${url}` : url; 

        if (this.props.isAdd) {
            this.props.addChannel(withHttp(this.props.editUrl));
        } else {
            this.props.editChannel({
                id: this.props.editChannelId, 
                name: this.props.editName,
                url: withHttp(this.props.editUrl),
            });
        }
    }
    componentDidMount = () => {
        this.props.isTourOpen && this.props.toggleTourOpen({tourStep: 1});
    }
    render () {
        const { classes, isCheckingUrl, isAdd, isUrlInvalid, t } = this.props;
        return (
            <div className={classes.root}>
                <ChannelGestureList />
                <div className={classes.actionPanel}>
                    <div className={classes.actionRight}>
                        <IconButton className={classes.actionButton} onClick={this.handleAddClick}>
                            <Add fontSize="small" className="AddAction" />
                        </IconButton>
                        <IconButton className={classes.actionButton} onClick={this.props.toggleEditMode}>
                            <Edit fontSize="small" className={classNames({ [classes.actionButtonIconActive]: this.props.editMode })} />
                        </IconButton>
                    </div>
                </div>
                <Dialog
                    open={this.props.editOpen}
                    onClose={this.handleEditClose}
                    aria-labelledby="form-dialog-title"
                    >
                    <DialogTitle id="form-dialog-title">{this.props.isAdd ? t('Add') : t('Edit')}</DialogTitle>
                    <DialogContent>
                        { !isAdd && <TextField
                        autoFocus={ !isAdd }
                        margin="dense"
                        id="chanelName"
                        label={t("ChannelName")}
                        fullWidth
                        value={this.props.editName}
                        onChange={e => this.props.setComponentState({ editName: e.target.value })}
                        /> }
                        <TextField
                        autoFocus={ isAdd }
                        error={ isUrlInvalid }
                        helperText={ isUrlInvalid && 'Url Invalid' }
                        margin="dense"
                        id="channelUrl"
                        label={t("ChannelUrl")}
                        fullWidth
                        value={this.props.editUrl}
                        onChange={e => this.props.setComponentState({ editUrl: e.target.value, isUrlInvalid: false })}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleEditClose} color="primary">
                            {t("Cancel")}
                        </Button>
                        <div className={classes.buttonWrapper}>
                            <Button disabled={ isCheckingUrl } onClick={this.handleEditConfirmClose} color="primary">
                                {t('OK')}
                            </Button>
                            { isCheckingUrl && <CircularProgress size={24} className={classes.buttonProgress} /> }
                        </div>
                    </DialogActions>
                </Dialog>
                
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withTranslation()(ChannelSelector)));