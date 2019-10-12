import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';

import { triggerAction, closeMessageBar } from '../actions/index';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import InfoIcon from '@material-ui/icons/Info';

const mapStateToProps = state => {
    return {
        config: state.readerMessageBar || {},
    };
};

const mapDispatchToProps = dispatch => {
    return {
        triggerAction: type => dispatch(triggerAction(type)),
        closeMessageBar: () => dispatch(closeMessageBar()),
    };
};

const styles = theme => ({
    snackbar: {
        backgroundColor: theme.palette.primary.dark,
    },
    close: {
        padding: theme.spacing.unit / 2,
    },
    message: {
        display: 'flex',
        alignItems: 'center',
    },
    icon: {
        fontSize: 20,
        opacity: 0.9,
        marginRight: theme.spacing.unit,
    },
});

class readerMessageBar extends Component {
    triggerAction = type => {
        this.props.triggerAction(type);
        this.props.closeMessageBar();
    }
    render() {
        const { classes, config, t } = this.props;
        const { open, mainActionName, mainActionType, cloaseActionType, message, autoHideDuration } = config;
        const action = [];
        if (mainActionType) {
            action.push(
                <Button key="mainAction" color="inherit" size="small" onClick={ () => this.triggerAction(mainActionType) }>
                    { t(mainActionName) }
                </Button>
            );
        }
        action.push(
            <IconButton key="close" aria-label="Close" color="inherit" className={classes.close} onClick={() => this.triggerAction(cloaseActionType)}>
                <CloseIcon />
            </IconButton>
        );
        return (
            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                autoHideDuration={ autoHideDuration }
                open={ open }
                onClose={ () => this.triggerAction(cloaseActionType) }
                ClickAwayListenerProps={{ onClickAway: () => this.triggerAction(cloaseActionType) }}
            >
                <SnackbarContent
                    className={ classes.snackbar }
                    aria-describedby="client-snackbar"
                    message={
                        <span id="message-id" className={classes.message}>
                            <InfoIcon className={classes.icon} />
                            { t(message) }
                        </span>
                    }
                    action={ action }
                />
            </Snackbar>
        )
    }
}

readerMessageBar.propTypes = {
    classes: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withTranslation()(readerMessageBar)));