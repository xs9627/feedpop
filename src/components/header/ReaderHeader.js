import React, { Component } from 'react';
import classNames from 'classnames';
import ChannelSelector from './ChannelSelector';
import ReaderSettings from './ReaderSettings';

import { withStyles } from '@material-ui/core/styles';
import Badge from '@material-ui/core/Badge';
import Collapse from '@material-ui/core/Collapse';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import List from '@material-ui/icons/List';
import Sync from '@material-ui/icons/Sync';
import Edit from '@material-ui/icons/Edit';
import Settings from '@material-ui/icons/Settings';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import Drawer from '@material-ui/core/Drawer';

import { connect } from "react-redux";
import { setChannelSelectorEditMode, openActionMenu, closeActionMenu, updateChannelFeed, updateAllChannelsFeed } from "../../actions/index";
import { ChannelFixedID } from "../../constants/index"

import { withNamespaces } from 'react-i18next';

const mapStateToProps = state => {
    return {
        allUnreadCount: state.allUnreadCount,
        showContent: state.isShowActionMenu,
        contentName: state.actionName,
        currentChannelId: state.currentChannelId,
        isTourOpen: state.isTourOpen,
        channelFeedUpdating: state.channelFeedUpdating,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        setChannelSelectorEditMode: () => dispatch(setChannelSelectorEditMode()),
        openActionMenu: contentName => dispatch(openActionMenu(contentName)),
        closeActionMenu: () => dispatch(closeActionMenu()),
        updateChannelFeed: id => dispatch(updateChannelFeed(id)),
        updateAllChannelsFeed: () => dispatch(updateAllChannelsFeed()),
    };
};

const styles = theme => ({
    readerHeader: {
        width: '100%',
        flex: '0 1 auto',
        zIndex: theme.zIndex.drawer + 1,
    },
    actionPanel: {
        width: '100%',
        background: theme.palette.background.default,
    },
    menuDrawer: {
        zIndex: theme.zIndex.drawer,
    },
    menuContentPanel: {
        marginTop: theme.mixins.toolbar.minHeight
    },
    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelLoading: {
        marginTop: theme.spacing.unit,
    },
    '@keyframes rotate': {
        to: {
          transform: 'rotate(-360deg)',
        }
    },
    updating: {
        '& svg': {
            animation: 'rotate 1.5s ease infinite',
        },
    }
});
class ReaderHeader extends Component {
    setHeaderContent = (event, contentName) => {
        if (!this.props.showContent || this.props.contentName != contentName) {
            if (contentName == 'Update') {
                if (!this.props.channelFeedUpdating) {
                    const updateCallback = () => {
                        if (this.props.contentName == 'Update') {
                            this.props.closeActionMenu();
                        }
                    }
                    this.props.currentChannelId === ChannelFixedID.RECENT ? this.props.updateAllChannelsFeed().then(updateCallback) : 
                    this.props.updateChannelFeed(this.props.currentChannelId).then(updateCallback);
                } else {
                    return;
                }
            } else if (contentName === 'List') {
                this.props.setChannelSelectorEditMode(false);
            }
            this.props.openActionMenu(contentName);
        } else {
            this.closeActionMenu();
        }
    }
    closeActionMenu = () => {
        this.props.closeActionMenu();
    }
    getHeaderContent = () => {
        switch(this.props.contentName){
            case 'List': 
                return <ChannelSelector onChange={() => { this.closeActionMenu(); }} />;
            // case 'Update': 
            //     return (
            //         <Dialog open={this.props.showContent}>
            //             <DialogContent>
            //                 <div className={this.props.classes.loadingContainer}>
            //                     <CircularProgress />
            //                 </div>
            //                 <div>
            //                     <Button className={this.props.classes.cancelLoading} onClick={this.props.closeActionMenu} color="primary">
            //                         {this.props.t("Cancel")}
            //                     </Button>
            //                 </div>
            //             </DialogContent>
            //         </Dialog>
            //     );
            case 'Settings':
                return <ReaderSettings />;
            default:
                return null;
        };
    }
    render () {
        const { classes, allUnreadCount, showContent, contentName, isTourOpen, channelFeedUpdating, t } = this.props;
        return (
            <Paper square={true} className={classes.readerHeader}>
                <BottomNavigation value={ showContent ? contentName : null } onChange={this.setHeaderContent} className={classes.actionPanel}>
                    <BottomNavigationAction label={t('List')} value="List" icon={
                        !(showContent && contentName === "List") && allUnreadCount > 0 ? (
                            <Badge badgeContent={allUnreadCount < 1000 ? allUnreadCount : (
                                <Tooltip title={allUnreadCount} enterDelay={100}>
                                    <span>...</span>
                                </Tooltip>
                            )} color="primary">
                                <List className='ListAction' />
                            </Badge>
                        ) : <List className='ListAction' />
                    } />
                    <BottomNavigationAction label={t('Update')} value="Update" icon={<Sync />} className={classNames({[classes.updating]: channelFeedUpdating})} />
                    {/* <BottomNavigationAction label="Edit" value="Edit" icon={<Edit />} /> */}
                    <BottomNavigationAction label={t('Settings')} value="Settings" icon={<Settings />} />
                </BottomNavigation>
                <Drawer
                    className={classes.menuDrawer}
                    anchor="top"
                    open={showContent && contentName != 'Update'}
                    onClose={this.closeActionMenu}
                    transitionDuration={isTourOpen ? 0 : 200}
                >
                    <div className={classes.menuContentPanel}>
                        {this.getHeaderContent()}
                    </div>
                </Drawer>
            </Paper>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withNamespaces()(ReaderHeader)));