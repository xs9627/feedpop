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
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import LaunchIcon from '@material-ui/icons/Launch';

import { connect } from "react-redux";
import { setSettins, cleanCache, toggleShowRecentUpdate, downloadConfig, restoreConfig, closeRestoreResult, showTestNotification, importOPML, exportOPML } from "../../actions/index"
import { withTranslation } from 'react-i18next';

const mapStateToProps = state => {
    const { theme, fontSize, maxFeedsCount, refreshPeriod, source, version, showRecentUpdate, keepHistoricFeeds, expandView, enableNotifaction, notifactionLevel, } = state;
    return {
        config: { theme, fontSize, maxFeedsCount, refreshPeriod, source, version, showRecentUpdate, keepHistoricFeeds, expandView, enableNotifaction, notifactionLevel, },
        logs: state.logs,
        showRestoreResult: state.tmp.showRestoreResult,
        restoreSuccess: state.tmp.restoreSuccess,
        restoreType: state.tmp.restoreType,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        setSettins: settings => dispatch(setSettins(settings)),
        cleanCache: () => dispatch(cleanCache()),
        toggleShowRecentUpdate: showRecentUpdate => dispatch(toggleShowRecentUpdate(showRecentUpdate)),
        downloadConfig: () => dispatch(downloadConfig()),
        restoreConfig: file => dispatch(restoreConfig(file)),
        closeRestoreResult: () => dispatch(closeRestoreResult()),
        showTestNotification: () => dispatch(showTestNotification()),
        importOPML: file => dispatch(importOPML(file)),
        exportOPML: () => dispatch(exportOPML()),
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
        this.props.setSettins({ theme: event.target.value });
    }

    handleChangeFontSize = event => {
        const fontSize = event.target.value;
        this.props.setSettins({ fontSize });
    }

    handleChangeNotification = event => {
        const enableNotifaction = event.target.checked;
        this.props.setSettins({ enableNotifaction });
    }

    handleChangeNotificationLevel = event => {
        this.props.setSettins({ notifactionLevel: event.target.value });
    }

    handleChangeexpandView = event => {
        const expandView = event.target.checked;
        this.props.setSettins({ expandView });
    }

    handleChangeKeepHistoricFeeds = event => {
        const keepHistoricFeeds = event.target.checked;
        this.props.setSettins({ keepHistoricFeeds });
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

    handleBackupClick = () => {
        this.setState(state => ({ backupOpen: !state.backupOpen }));
    };

    handleSkrClose = () => {
        this.setState({ skr: 0, openSkr: false });
    }

    handleSourceClick = () => {
        ChromeUtil.openTab(this.props.config.source);
    }

    handleRestore = event => {
        this.props.restoreConfig(event.target.files[0])
    }

    handleImportOPML = event => {
        this.props.importOPML(event.target.files[0])
    }

    handleCloseRestoreResult = () => {
        this.props.closeRestoreResult()
    }

    render () {
        const { classes, t } = this.props;
        return (
            <div className={classes.root}>
                <List component="nav">
                    <ListItem>
                        <ListItemText primary={t("Theme Mode")}></ListItemText>
                        <ListItemSecondaryAction>
                            <Select
                                value={this.props.config.theme}
                                onChange={this.handleChangeTheme}
                                displayEmpty
                                name="theme"
                            >
                                <MenuItem value={'light'}>{t('Light')}</MenuItem>
                                <MenuItem value={'dark'}>{t('Dark')}</MenuItem>
                                <MenuItem value={'system'}>
                                    <Tooltip title={t("Follow system setting")}>
                                        <Typography>{t('Auto')}</Typography>
                                    </Tooltip>
                                </MenuItem>
                            </Select>
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
                        <ListItemText primary={t("Expand View")}></ListItemText>
                        <ListItemSecondaryAction>
                            <Switch
                                checked={this.props.config.expandView}
                                onChange={this.handleChangeexpandView}
                                color="primary"
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem>
                        <ListItemText primary={t("Keep historic feeds")}></ListItemText>
                        <ListItemSecondaryAction>
                            <Switch
                                checked={this.props.config.keepHistoricFeeds}
                                onChange={this.handleChangeKeepHistoricFeeds}
                                color="primary"
                            />
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
                    <ListItem>
                        <ListItemText primary={t("Notification")}></ListItemText>
                        <ListItemSecondaryAction>
                            <Switch
                                checked={this.props.config.enableNotifaction}
                                onChange={this.handleChangeNotification}
                                color="primary"
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <Collapse in={this.props.config.enableNotifaction} timeout="auto" unmountOnExit>
                        <ListItem className={classes.nested}>
                            <ListItemText primary={t("Show for")}></ListItemText>
                            <ListItemSecondaryAction className={classes.select}>
                                <Select
                                    value={this.props.config.notifactionLevel}
                                    onChange={this.handleChangeNotificationLevel}
                                    displayEmpty
                                    name="notificationLevel"
                                >
                                    <MenuItem value={'summary'}>{t("Updated count")}</MenuItem>
                                    <MenuItem value={'detail'}>{t("Each new feed")}</MenuItem>
                                </Select>
                                <IconButton size="small" onClick={this.props.showTestNotification}>
                                    <LaunchIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    </Collapse>
                    <ListItem button onClick={this.openCleanCacheConfirm}>
                        <ListItemText primary={t("Clean Cache")}></ListItemText>
                    </ListItem>
                    <ListItem button onClick={this.handleBackupClick}>
                        <ListItemText primary={t("Backup & Restore")} />
                        <Typography>
                            {this.state.backupOpen ? <ExpandLess /> : <ExpandMore />}
                        </Typography>
                    </ListItem>
                    <Collapse in={this.state.backupOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <ListItem button className={classes.nested} onClick={this.props.downloadConfig}>
                                <ListItemText primary={t("Backup to local")} />
                            </ListItem>
                            <ListItem button className={classes.nested} onClick={() => {this.refs.fileUploader.click()}}>
                                <ListItemText primary={t("Restore from local")} />
                                <input type="file" id="file" ref="fileUploader" style={{display: "none"}} onChange={this.handleRestore}/>
                            </ListItem>
                            <ListItem button className={classes.nested} onClick={this.props.exportOPML}>
                                <ListItemText primary={t("Export OPML")} />
                            </ListItem>
                            <ListItem button className={classes.nested} onClick={() => {this.refs.opmlFileUploader.click()}}>
                                <ListItemText primary={t("Import OPML")} />
                                <input type="file" id="file" ref="opmlFileUploader" style={{display: "none"}} onChange={this.handleImportOPML}/>
                            </ListItem>
                        </List>
                    </Collapse>
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
                <Dialog open={this.props.showRestoreResult}>
                    <DialogTitle>{t("Information")}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                        {this.props.restoreSuccess ? 
                            (this.props.restoreType === 'opml' ? t("Import completed") : t("Restore completed")) : 
                            (this.props.restoreType === 'opml' ? t("Import failed") : t("Restore failed"))
                        }
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleCloseRestoreResult} color="primary" autoFocus>
                        {t('OK')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withTranslation()(Settings)));