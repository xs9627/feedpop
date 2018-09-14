import React, { Component } from 'react';
import ChannelSelector from './ChannelSelector';
import ReaderSettings from './ReaderSettings';
import FeedUtil from '../../utils/FeedUtil';

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
        if (!this.state.showContent || this.currentContentName != contentName) {
            this.setState({ contentName });
            if (contentName == 'Update') {
                this.props.updateCurrentChannel().then(() => {
                    if (this.currentContentName == 'Update') {
                        this.setState({ showContent: false });
                    }
                });
            }
            this.setState({ showContent: true });
        } else {
            this.closeActionMenu();
        }
        this.currentContentName = contentName;
    }
    closeActionMenu = () => {
        this.setState({ contentName: null, showContent: false });
        this.headerContent = null;
    }
    getHeaderContent = () => {
        switch(this.state.contentName){
            case 'List': 
                return (
                    <ChannelSelector
                        selectedId={this.props.currentChannelId}
                        channel={this.props.channel}
                        addChannel={this.props.addChannel}
                        deleteChannel={this.props.deleteChannel}
                        onChange={channelId => {
                                this.props.fetchFeed(channelId);
                                this.closeActionMenu();
                            }
                        } />
                );
            case 'Update': 
                return <div className='Menu-item'>Updating</div>;
            case 'Settings':
                return (
                    <ReaderSettings 
                        config={this.props.settings} 
                        changeTheme={this.props.changeTheme}/>
                );
            default:
                return null;
        };
    }
    getUnreadCount = () => {

    }
    render () {
        const { classes, allUnreadCount } = this.props;
        const { contentName, showContent } = this.state;
        return (
            <Paper className={classes.readerHeader}>
                <BottomNavigation value={contentName} onChange={this.setHeaderContent} className={classes.actionPanel}>
                    <BottomNavigationAction label="List" value="List" icon={
                        !showContent && allUnreadCount > 0 ? (
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

export default withStyles(styles)(ReaderHeader);