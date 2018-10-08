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
        updateChannelFeed: (id, callback) => dispatch(updateChannelFeed(id, callback)),
    };
};

const styles = theme => ({
    readerHeader: {
        width: '100%',
    },
    actionPanel: {
        width: '100%',
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
});
class ReaderHeader extends Component {
    state = {
        contentName: null,
    };
    setHeaderContent = (event, contentName) => {
        if (!this.props.showContent || this.currentContentName != contentName) {
            if (contentName == 'Update') {
                this.props.updateChannelFeed(this.props.currentChannelId, () => {
                    if (this.currentContentName == 'Update') {
                        this.props.closeActionMenu();
                    }
                });
            } else if (this.currentContentName === 'List') {
                this.props.setChannelSelectorEditMode(false);
            }
            this.props.openActionMenu(contentName);
        } else {
            this.closeActionMenu();
        }
        this.currentContentName = contentName;
    }
    closeActionMenu = () => {
        this.props.closeActionMenu();
        //this.setState({ contentName: null, showContent: false });
    }
    getHeaderContent = () => {
        switch(this.props.contentName){
            case 'List': 
                return (
                    <ChannelSelector
                        onChange={channelId => {
                                
                                this.closeActionMenu();
                            }
                        }
                    />
                );
            case 'Update': 
                return <div className='Menu-item'>Updating</div>;
            case 'Settings':
                return (
                    <ReaderSettings />
                );
            default:
                return null;
        };
    }
    render () {
        const { classes, allUnreadCount, showContent, contentName } = this.props;
        return (
            <Paper className={classes.readerHeader}>
                <BottomNavigation value={contentName} onChange={this.setHeaderContent} className={classes.actionPanel}>
                    <BottomNavigationAction label="List" value="List" icon={
                        !(showContent && contentName === "List") && allUnreadCount > 0 ? (
                            <Badge badgeContent={allUnreadCount < 1000 ? allUnreadCount : '...'} color="primary">
                                <List />
                            </Badge>
                        ) : <List />
                    } />
                    <BottomNavigationAction label="Update" value="Update" icon={<Sync />} />
                    <BottomNavigationAction label="Edit" value="Edit" icon={<Edit />} />
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