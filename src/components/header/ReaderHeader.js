import React, { Component } from 'react';
import ChannelSelector from './ChannelSelector';
import ReaderSettings from './ReaderSettings';

import { withStyles } from '@material-ui/core/styles';
import Collapse from '@material-ui/core/Collapse';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import List from '@material-ui/icons/List';
import Sync from '@material-ui/icons/Sync';
import Edit from '@material-ui/icons/Edit';
import Settings from '@material-ui/icons/Settings';

const styles = {
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
        background: 'rgba(0, 0, 0, 0.3)'
    },
};
class ReaderHeader extends Component {
    state = {
        contentName: null,
    };
    setHeaderContent = (event, contentName) => {
        if (!this.state.showContent || this.currentContentName != contentName) {
            this.setState({ contentName });
            switch(contentName){
                case 'List': 
                    this.headerContent = (
                        <ChannelSelector
                            selectedId={this.props.currentChannelId}
                            channel={this.props.channel}
                            onChange={channelId => {
                                    this.props.fetchFeed(channelId);
                                    this.closeActionMenu();
                                }
                            } />
                    );
                    break;
                case 'Update': 
                    this.headerContent = <div className='Menu-item'>Updating</div>;
                    this.props.updateCurrentChannel().then(() => {
                        if (this.currentContentName == 'Update') {
                            this.setState({ showContent: false });
                        }
                    });
                    break;
                case 'Settings':
                    this.headerContent = (
                        <ReaderSettings 
                            config={this.props.settings} 
                            changeTheme={this.props.changeTheme}/>
                    );
                    break;
                default:
                    this.headerContent = null;
            };
            this.setState({ showContent: true });
        } else {
            this.closeActionMenu();
        }
        this.currentContentName = contentName;
    }
    closeActionMenu = () => {
        this.setState({ contentName: null, showContent: false });
    }
    render () {
        const { classes } = this.props;
        const { contentName, showContent } = this.state;
        return (
            <div className={classes.readerHeader}>
                <BottomNavigation value={contentName} onChange={this.setHeaderContent} className={classes.actionPanel}>
                    <BottomNavigationAction label="List" value="List" icon={<List />} />
                    <BottomNavigationAction label="Update" value="Update" icon={<Sync />} />
                    <BottomNavigationAction label="Edit" value="Edit" icon={<Edit />} />
                    <BottomNavigationAction label="Settings" value="Settings" icon={<Settings />} />
                </BottomNavigation>

                {showContent ? <div key='Menu-background' className={classes.menuBackground} onClick={this.closeActionMenu} /> : null}
                <Collapse in={showContent} className={classes.menuCollapse}>
                    {this.headerContent}
                </Collapse>
            </div>
        );
    }
}

export default withStyles(styles)(ReaderHeader);