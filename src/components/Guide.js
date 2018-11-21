import React, { Component } from 'react';
import { withStyles, withTheme } from '@material-ui/core/styles';
import { connect } from "react-redux";
import { toggleTourOpen } from "../actions/index";
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import Tour from 'reactour';
import { withNamespaces } from 'react-i18next';

const mapStateToProps = state => {
    return {
        isTourOpen: state.isTourOpen,
        isShowActionMenu: state.isShowActionMenu,
        editOpen: state.getComponentState('channelSelector', 'editOpen'),
    };
};

const mapDispatchToProps = dispatch => {
    return {
        toggleTourOpen: isTourOpen => dispatch(toggleTourOpen(isTourOpen)),
    }
};

const styles = theme => ({
    root: {
        backgroundColor: theme.palette.background.paper,
        flex: '1 1 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    button: {
        marginLeft: theme.spacing.unit * 2,
    },
    extendedIcon: {
        marginLeft: theme.spacing.unit,
    },
});

const steps = (theme, t) => ([
    {
        selector: '.ListAction',
        content: <Typography>{t("First open the channel list")}</Typography>,
        style: {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.primary.main
        }
    },
    {
        selector: '.AddAction',
        content: <Typography>{t("And, add a feed")}</Typography>,
        style: {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.primary.main
        }
    },
])

class Guide extends Component {
    state = {
        isTourOpen: false,
    }
    render() {
        const { classes, theme, isShowActionMenu, toggleTourOpen, isTourOpen, t } = this.props;
        
        return (
            <div className={classes.root}>
                <Typography variant="body1">
                    {t("No feeds here, start to ")}
                </Typography>
                <Button variant="contained" size="small" color="primary" className={classes.button} onClick={() => toggleTourOpen(true)}>
                    {t("add one")}
                    <AddIcon className={classes.extendedIcon} />
                </Button>
                <Tour
                    steps={steps(theme, t)}
                    isOpen={isTourOpen}
                    onRequestClose={() => toggleTourOpen(false)}
                    goToStep={isShowActionMenu ? 1 : 0} 
                    showButtons={false}
                    showNavigation={false}
                    showNumber={false}
                    startAt={isShowActionMenu ? 1 : 0}
                    rounded={4}
                />
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withTheme()(withNamespaces()(Guide))));