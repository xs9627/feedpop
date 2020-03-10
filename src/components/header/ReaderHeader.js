import React, { useRef, useEffect } from 'react';
import classNames from 'classnames';
import ChannelSelector from './ChannelSelector';
import ReaderSettings from './ReaderSettings';

import { makeStyles } from '@material-ui/core/styles';
import Badge from '@material-ui/core/Badge';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import List from '@material-ui/icons/List';
import Autorenew from '@material-ui/icons/Autorenew';
import Settings from '@material-ui/icons/Settings';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import Drawer from '@material-ui/core/Drawer';

import { connect } from "react-redux";
import { setChannelSelectorEditMode, openActionMenu, closeActionMenu, updateChannelFeed, updateAllChannelsFeed } from "../../actions/index";
import { ChannelFixedID } from "../../constants/index"

import { withTranslation } from 'react-i18next';

const mapStateToProps = state => {
    return {
        allUnreadCount: state.allUnreadCount,
        showContent: state.isShowActionMenu,
        contentName: state.actionName,
        currentChannelId: state.currentChannelId,
        isTourOpen: state.tourOption.isTourOpen,
        channelFeedUpdating: state.channelFeedUpdating,
        expandView: state.expandView,
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

const useStyles = makeStyles(theme => ({
    readerHeader: props => ({
        width: `${props.expandView ? '62px' : '100%'}`,
        flex: '0 1 auto',
        zIndex: theme.zIndex.drawer + 1,
    }),
    actionPanel: props => ({
        width: '100%',
        background: theme.palette.background.default,
        height: `${props.expandView ? '100%' : 'auto'}`,
        flexFlow: `${props.expandView ? 'column' : 'row'}`,
    }),
    menuDrawer: {
        zIndex: `${theme.zIndex.drawer} !important`,
    },
    menuContentPanel: props => ({
        marginTop: `${props.expandView ? 'auto' : `${theme.mixins.toolbar.minHeight}px`}`,
        marginLeft: `${props.expandView ? '62px' : 'auto'}`,
        width: `${props.expandView ? '320px' : '100%'}`,
        height: `${props.expandView ? '100%' : 'auto'}`,
    }),
    horizonButton: {
        minWidth: 62,
        flexGrow: 0,
        minHeight: 62,
    },
    horizonSettingButton: {
        marginTop: 'auto'
    },
    actionLabel: {
        fontSize: `${theme.typography.overline.fontSize} !important`,
    },
    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelLoading: {
        marginTop: theme.spacing.unit,
    },
    '@global @keyframes rotate': {
        to: {
          transform: 'rotate(360deg)',
        }
    },
    updating: {
        '& svg': {
            animation: 'rotate 1.5s ease infinite',
        },
    }
}));

const ReaderHeader = props => {
    const classes = useStyles(props);

    const contentNameRef = useRef();
    useEffect(() => {
        contentNameRef.current = props.contentName;
    });

    const setHeaderContent = (event, contentName) => {
        if (!props.showContent || props.contentName !== contentName) {
            if (contentName === 'Update') {
                if (!props.channelFeedUpdating) {
                    const updateCallback = () => {
                        if (contentNameRef.current === 'Update') {
                            props.closeActionMenu();
                        }
                    }
                    props.currentChannelId === ChannelFixedID.RECENT ? props.updateAllChannelsFeed().then(updateCallback) : 
                    props.updateChannelFeed(props.currentChannelId).then(updateCallback);
                } else {
                    return;
                }
            } else if (contentName === 'List') {
                props.setChannelSelectorEditMode(false);
            }
            props.openActionMenu(contentName);
        } else {
            closeActionMenu();
        }
    }
    const closeActionMenu = () => {
        props.closeActionMenu();
    }
    const getHeaderContent = () => {
        switch(props.contentName){
            case 'List': 
                return <ChannelSelector onChange={() => { closeActionMenu(); }} />;
            // case 'Update': 
            //     return (
            //         <Dialog open={props.showContent}>
            //             <DialogContent>
            //                 <div className={props.classes.loadingContainer}>
            //                     <CircularProgress />
            //                 </div>
            //                 <div>
            //                     <Button className={props.classes.cancelLoading} onClick={props.closeActionMenu} color="primary">
            //                         {props.t("Cancel")}
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
    const {allUnreadCount, showContent, contentName, isTourOpen, channelFeedUpdating, expandView, t } = props;
    
    return (
        <Paper square={true} className={classes.readerHeader}>
            <BottomNavigation value={ showContent ? contentName : null } onChange={setHeaderContent} className={classes.actionPanel}>
                <BottomNavigationAction label={t('List')} value="List" 
                classes={expandView && { root: classes.horizonButton, label: classes.actionLabel }}
                icon={
                    !(showContent && contentName === "List") && allUnreadCount > 0 ? (
                        <Badge badgeContent={allUnreadCount < 10000 ? allUnreadCount : (
                            <Tooltip title={allUnreadCount} enterDelay={100}>
                                <span>9999+</span>
                            </Tooltip>
                        )} max={9999} color="primary">
                            <List className='ListAction' />
                        </Badge>
                    ) : <List className='ListAction' />
                } />
                <BottomNavigationAction label={t('Update')} value="Update" icon={<Autorenew />}
                classes={{ root: classNames({[classes.updating]: channelFeedUpdating, [classes.horizonButton]: expandView}), label: expandView && classes.actionLabel }} />
                {/* <BottomNavigationAction label="Edit" value="Edit" icon={<Edit />} /> */}
                <BottomNavigationAction label={t('Settings')} value="Settings" icon={<Settings />}
                classes={expandView && { root: `${classes.horizonButton} ${classes.horizonSettingButton}`, label: classes.actionLabel }} />
            </BottomNavigation>
            <Drawer
                classes={{root: classes.menuDrawer}}
                anchor={props.expandView ? "left" : "top"}
                open={showContent && contentName !== 'Update'}
                onClose={closeActionMenu}
                transitionDuration={isTourOpen ? 0 : 200}
            >
                <div className={classes.menuContentPanel}>
                    {getHeaderContent()}
                </div>
            </Drawer>
        </Paper>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(ReaderHeader));