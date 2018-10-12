import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { withStyles } from '@material-ui/core/styles';

import { goBackLastRead, deleteLastRead } from '../actions/index';
import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import InfoIcon from '@material-ui/icons/Info';

const mapStateToProps = state => {
    return {
        open: state.showGoBack,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        goBackLastRead: () => dispatch(goBackLastRead()),
        deleteLastRead: () => dispatch(deleteLastRead()),
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

class GoBack extends Component {
    render() {
        const { classes } = this.props;
        return (
            <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                autoHideDuration={15000}
                open={this.props.open}
                onClose={this.props.deleteLastRead}
                ClickAwayListenerProps={
                    { onClickAway: this.props.deleteLastRead }
                }
            >
                <SnackbarContent
                    className={ classes.snackbar }
                    aria-describedby="client-snackbar"
                    message={
                        <span id="message-id" className={classes.message}>
                            <InfoIcon className={classes.icon} />
                            Continue reading?
                        </span>
                    }
                    action={[
                        <Button key="undo" color="inherit" size="small" onClick={this.props.goBackLastRead}>
                            GO
                        </Button>,
                        <IconButton
                            key="close"
                            aria-label="Close"
                            color="inherit"
                            className={classes.close}
                            onClick={this.props.deleteLastRead}
                        >
                            <CloseIcon />
                        </IconButton>,
                    ]}
                />
            
            </Snackbar>
        )
    }
}

GoBack.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(GoBack));