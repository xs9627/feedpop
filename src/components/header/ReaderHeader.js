import React, { Component } from 'react';
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

import { connect } from "react-redux";
import { setChannelSelectorEditMode, openActionMenu, closeActionMenu, updateChannelFeed } from "../../actions/index";

const mapStateToProps = state => {
    return {
        allUnreadCount: state.allUnreadCount,
        showContent: state.isShowActionMenu,
        contentName: state.actionName,
        currentChannelId: state.currentChannelId,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        setChannelSelectorEditMode: () => dispatch(setChannelSelectorEditMode()),
        openActionMenu: contentName => dispatch(openActionMenu(contentName)),
        closeActionMenu: () => dispatch(closeActionMenu()),
        updateChannelFeed: id => dispatch(updateChannelFeed(id)),
    };
};

const styles = theme => ({
    readerHeader: {
        width: '100%',
        flex: '0 1 auto',
        zIndex: '2'
    },
    actionPanel: {
        width: '100%',
        background: theme.palette.background.default,
    },
    menuCollapse: {
        width: '100%',
        position: 'absolute'
    },
    menuBackground: {
        position: 'absolute',
        width: '100%',
        height: 600,
        background: theme.palette.common.black,
        opacity: 0.3,
    },
    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelLoading: {
        marginTop: theme.spacing.unit,
    }
});
class ReaderHeader extends Component {
    setHeaderContent = (event, contentName) => {
        if (!this.props.showContent || this.props.contentName != contentName) {
            if (contentName == 'Update') {
                this.props.updateChannelFeed(this.props.currentChannelId).then(() => {
                    if (this.props.contentName == 'Update') {
                        this.props.closeActionMenu();
                    }
                });
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
            case 'Update': 
                return (
                    <Dialog open={this.props.showContent}>
                        <DialogContent>
                            <div className={this.props.classes.loadingContainer}>
                                <CircularProgress />
                            </div>
                            <div>
                                <Button className={this.props.classes.cancelLoading} onClick={this.props.closeActionMenu} color="primary">
                                    Cancel
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                );
            case 'Settings':
                return <ReaderSettings />;
            default:
                return null;
        };
    }
    render () {
        const { classes, allUnreadCount, showContent, contentName } = this.props;
        return (
            <Paper square={true} className={classes.readerHeader}>
                <BottomNavigation value={ showContent ? contentName : null } onChange={this.setHeaderContent} className={classes.actionPanel}>
                    <BottomNavigationAction label="List" value="List" icon={
                        !(showContent && contentName === "List") && allUnreadCount > 0 ? (
                            <Badge badgeContent={allUnreadCount < 1000 ? allUnreadCount : (
                                <Tooltip title={allUnreadCount} enterDelay={200}>
                                    <span>...</span>
                                </Tooltip>
                            )} color="primary">
                                <List className='ListAction' />
                            </Badge>
                        ) : <List className='ListAction' />
                    } />
                    <BottomNavigationAction label="Update" value="Update" icon={<Sync />} />
                    {/* <BottomNavigationAction label="Edit" value="Edit" icon={<Edit />} /> */}
                    <BottomNavigationAction label="Settings" value="Settings" icon={<Settings />} />
                </BottomNavigation>

                {showContent ? <div key='Menu-background' className={classes.menuBackground} onClick={this.closeActionMenu} /> : null}
                <Collapse in={showContent} className={classes.menuCollapse}>
                    {this.getHeaderContent()}
                </Collapse>
            </Paper>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ReaderHeader));