import React, { Component } from 'react';
import ChromeUtil from '../../utils/ChromeUtil';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Switch from '@material-ui/core/Switch';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Typography from '@material-ui/core/Typography';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { connect } from "react-redux";
import { setSettins, cleanCache, toggleShowRecentUpdate } from "../../actions/index"
import { withNamespaces } from 'react-i18next';

const mapStateToProps = state => {
    const { theme, fontSize, maxFeedsCount, refreshPeriod, source, version, showRecentUpdate } = state;
    return {
        config: { theme, fontSize, maxFeedsCount, refreshPeriod, source, version, showRecentUpdate },
        logs: state.logs,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        setSettins: settings => dispatch(setSettins(settings)),
        cleanCache: () => dispatch(cleanCache()),
        toggleShowRecentUpdate: showRecentUpdate => dispatch(toggleShowRecentUpdate(showRecentUpdate)),
    };
};

const styles = theme => ({
    root: {
      backgroundColor: theme.palette.background.paper,
    },
    nested: {
        paddingLeft: theme.spacing.unit * 4,
    },
    select: {
        paddingRight: theme.spacing.unit,
    }
});

class Settings extends Component {
    state = {skr: 0};

    handleChangeTheme = event => {
        let isdarkTheme = event.target.checked;
        this.props.setSettins({ theme: isdarkTheme ? 'dark' : 'light' });
    }

    handleChangeFontSize = event => {
        const fontSize = event.target.value;
        this.props.setSettins({ fontSize });
    }

    handleChangeShowRecentUpdate = event => {
        const showRecentUpdate = event.target.checked;
        this.props.toggleShowRecentUpdate(showRecentUpdate);
    }

    handleChangeMaxFeedsCount = event => {
        this.props.setSettins({ maxFeedsCount: event.target.value });
    }

    handleChangeRefreshPeriod = event => {
        const refreshPeriod = event.target.value
        this.props.setSettins({ refreshPeriod });
        ChromeUtil.recreateAlarm("refreshAll", refreshPeriod);
    }

    doSkr = () => {
        const skr = this.state.skr + 1;
        if (skr === 5) {
            this.setState({ skr: 0, openSkr: true });
            console.log(this.props.logs);
        } else {
            this.setState({skr});
        }
    }
    
    openCleanCacheConfirm = () => {
        this.setState({ cleanCacheConfirm: true });
    }

    closeCleanCacheConfirm = () => {
        this.setState({ cleanCacheConfirm: false });
    }


    handleCleanCacheClick = () => {
        this.props.cleanCache();
        this.closeCleanCacheConfirm();
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
        const { classes, t } = this.props;
        return (
            <div className={classes.root}>
                <List component="nav">
                    <ListItem>
                        <ListItemText primary={t("Dark Theme")}></ListItemText>
                        <ListItemSecondaryAction>
                            <Switch
                                checked={this.props.config.theme === 'dark'}
                                onChange={this.handleChangeTheme}
                                value="checkedB"
                                color="primary"
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                        <ListItemText primary={t("Font size")}></ListItemText>
                        <ListItemSecondaryAction className={classes.select}>
                            <Select
                                value={this.props.config.fontSize}
                                onChange={this.handleChangeFontSize}
                                displayEmpty
                                name="fontSize"
                            >
                                <MenuItem value={12}>{t('Small')}</MenuItem>
                                <MenuItem value={14}>{t('Medium')}</MenuItem>
                                <MenuItem value={16}>{t('Large')}</MenuItem>
                            </Select>
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                        <ListItemText primary={t("Channel maximum feeds")}></ListItemText>
                        <ListItemSecondaryAction className={classes.select}>
                            <Select
                                value={this.props.config.maxFeedsCount}
                                onChange={this.handleChangeMaxFeedsCount}
                                displayEmpty
                                name="maxFeedsCount"
                            >
                                <MenuItem value={20}>20</MenuItem>
                                <MenuItem value={100}>100</MenuItem>
                                <MenuItem value={500}>500</MenuItem>
                                <MenuItem value={1000}>1000</MenuItem>
                                <MenuItem value={-1}>{t("Unlimite")}</MenuItem>
                            </Select>
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                        <ListItemText primary={t("Update period (mins)")}></ListItemText>
                        <ListItemSecondaryAction className={classes.select}>
                            <Select
                                value={this.props.config.refreshPeriod}
                                onChange={this.handleChangeRefreshPeriod}
                                displayEmpty
                                name="refreshPeriod"
                            >
                                <MenuItem value={10}>10</MenuItem>
                                <MenuItem value={15}>15</MenuItem>
                                <MenuItem value={30}>30</MenuItem>
                                <MenuItem value={60}>60</MenuItem>
                            </Select>
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                        <ListItemText primary={t("Show recent updates")}></ListItemText>
                        <ListItemSecondaryAction>
                            <Switch
                                checked={this.props.config.showRecentUpdate}
                                onChange={this.handleChangeShowRecentUpdate}
                                color="primary"
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem button onClick={this.openCleanCacheConfirm}>
                        <ListItemText primary={t("Clean Cache")}></ListItemText>
                    </ListItem>
                    <ListItem button onClick={this.handleAboutClick}>
                        <ListItemText primary={t("About")} />
                        <Typography>
                            {this.state.aboutOpen ? <ExpandLess /> : <ExpandMore />}
                        </Typography>
                    </ListItem>
                    <Collapse in={this.state.aboutOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <ListItem button className={classes.nested}>
                                <ListItemText primary={t("Source")} />
                                <a href="/#" onClick={this.handleSourceClick}>
                                    <Typography variant="caption">
                                        GitHub
                                    </Typography>
                                </a>
                            </ListItem>
                            <ClickAwayListener onClickAway={this.handleSkrClose}>
                                <ListItem button onClick={this.doSkr} className={classes.nested}>
                                    <ListItemText primary={t("Version")} />
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
                <Dialog open={this.state.cleanCacheConfirm}>
                    <DialogTitle id="alert-dialog-title">{t("Confirm")}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                        {t("Delete all saved feeds?")}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.closeCleanCacheConfirm} color="primary">
                        {t('Cancel')}
                        </Button>
                        <Button onClick={this.handleCleanCacheClick} color="primary" autoFocus>
                        {t('OK')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withNamespaces()(Settings)));