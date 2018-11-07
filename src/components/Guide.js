import React, { Component } from 'react';
import { withStyles, withTheme } from '@material-ui/core/styles';
import { connect } from "react-redux";
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import Tour from 'reactour';

const mapStateToProps = state => {
    return {
        isShowActionMenu: state.isShowActionMenu,
        editOpen: state.getComponentState('channelSelector', 'editOpen'),
    };
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

const steps = theme => ([
    {
        selector: '.ListAction',
        content: <Typography>First open the feed list</Typography>,
        style: {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.primary.main
        }
    },
    {
        selector: '.AddAction',
        content: <Typography>And, add a feed</Typography>,
        style: {
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.primary.main
        }
    },
])

class Guide extends Component {
    state = {
        isTourOpen: false,
        goToStep: 0,
    }
    startTour = () => {
        this.setState({isTourOpen: true});
    }
    closeTour = () => {
        this.setState({isTourOpen: false, goToStep: 0});
    }
    componentWillReceiveProps(newProps) {
        if (this.props.isShowActionMenu === false && newProps.isShowActionMenu) {
            this.setState({goToStep: 1});
        }
        if (this.props.editOpen === false && newProps.editOpen) {
            this.closeTour();
        } 
    }
    render() {
        const { classes, theme } = this.props;
        return (
            <div className={classes.root}>
                <Typography variant="body1">
                    No feed here, start to 
                </Typography>
                <Button variant="contained" size="small" color="primary" className={classes.button} onClick={this.startTour}>
                    add one
                    <AddIcon className={classes.extendedIcon} />
                </Button>
                <Tour
                    steps={steps(theme)}
                    isOpen={this.state.isTourOpen}
                    onRequestClose={this.closeTour}
                    goToStep={this.state.goToStep} 
                    showButtons={false}
                    showNavigation={false}
                    showNumber={false}
                    startAt={0}
                    rounded={4}
                />
                    
            </div>
        );
    }
}

export default connect(mapStateToProps)(withStyles(styles)(withTheme()(Guide)));