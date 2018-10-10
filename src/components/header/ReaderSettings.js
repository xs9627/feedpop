import React, { Component } from 'react';
import ChromeUtil from '../../utils/ChromeUtil';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Switch from '@material-ui/core/Switch';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Typography from '@material-ui/core/Typography';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

import { connect } from "react-redux";
import { setSettins, cleanCache } from "../../actions/index"

const mapStateToProps = state => {
    return {
        config: state.settings,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        setSettins: settings => dispatch(setSettins(settings)),
        cleanCache: () => dispatch(cleanCache()),
    };
};

const styles = theme => ({
    root: {
      backgroundColor: theme.palette.background.paper,
    },
    nested: {
        paddingLeft: theme.spacing.unit * 4,
    },
});

class Settings extends Component {
    state = {};

    handleChangeTheme = event => {
        let isdarkTheme = event.target.checked;
        this.props.setSettins({ theme: isdarkTheme ? 'dark' : 'light' });
    }

    doSkr = () => {
        this.state.skr++;
        if (this.state.skr === 5) {
            this.setState({ skr: 0, openSkr: true });
        }
    }
    
    handleCleanCacheClick = () => {
        this.props.cleanCache();
    }

    handleAboutClick = () => {
        this.setState(state => ({ aboutOpen: !state.aboutOpen }));
    };

    handleSkrClose = () => {
        this.setState({ skr: 0, openSkr: false });
    }

    handleSourceClick = () => {
        ChromeUtil.openTab(this.props.config.source);
    }

    render () {
        this.state.skr = 0;
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                <List component="nav">
                    <ListItem>
                        <ListItemText primary="Dark Theme"></ListItemText>
                        <ListItemSecondaryAction>
                            <Switch
                                checked={this.props.config.theme === 'dark'}
                                onChange={this.handleChangeTheme}
                                value="checkedB"
                                color="primary"
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem button onClick={this.handleCleanCacheClick}>
                        <ListItemText primary="Clean Cache"></ListItemText>
                    </ListItem>
                    <ListItem button onClick={this.handleAboutClick}>
                        <ListItemText primary="About" />
                        <Typography>
                            {this.state.aboutOpen ? <ExpandLess /> : <ExpandMore />}
                        </Typography>
                    </ListItem>
                    <Collapse in={this.state.aboutOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <ListItem button className={classes.nested}>
                                <ListItemText primary="Source" />
                                <a href="#" onClick={this.handleSourceClick}>
                                    <Typography variant="caption">
                                        GitHub
                                    </Typography>
                                </a>
                            </ListItem>
                            <ClickAwayListener onClickAway={this.handleSkrClose}>
                                <ListItem button onClick={this.doSkr} className={classes.nested}>
                                    <ListItemText primary="Version" />
                                    <Typography variant="caption">
                                        {this.props.config.version}
                                    </Typography>
                                </ListItem>
                            </ClickAwayListener>
                        </List>
                    </Collapse>
                </List>
                <Dialog open={this.state.openSkr} onClose={this.handleSkrClose} aria-labelledby="simple-dialog-title">
                    <DialogTitle id="simple-dialog-title">(づ｡◕‿‿◕｡)づ</DialogTitle>
                    <Typography variant="caption" gutterBottom align="center">
                        你真skr小机灵鬼
                    </Typography>
                </Dialog>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Settings));