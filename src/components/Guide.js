import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from "react-redux";
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
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
});

const steps = [
    {
      selector: '.ListAction',
      content: 'This is my first Step',
    },
    {
        selector: '.AddAction',
        content: 'This is my secound Step',
    },
]

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
        return (
            <div className={this.props.classes.root}>
                <Typography variant="button">
                    No feed here, start to <Button onClick={this.startTour}>add one</Button>.
                </Typography>
                <Tour
                    steps={steps}
                    isOpen={this.state.isTourOpen}
                    onRequestClose={this.closeTour}
                    goToStep={this.state.goToStep} 
                    showButtons={false}
                    showNavigation={false}
                    showNumber={false}
                    startAt={0}
                />
                    
            </div>
        );
    }
}

export default connect(mapStateToProps)(withStyles(styles)(Guide));