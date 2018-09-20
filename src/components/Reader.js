import React, { Component } from 'react';
import './Reader.scss';
import FeedList from './FeedList';
import FeedContent from './FeedContent';
import FeedUtil from '../utils/FeedUtil';
import ReaderHeader from './header/ReaderHeader';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide';
import blue from '@material-ui/core/colors/blue';
import yellow from '@material-ui/core/colors/yellow';

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class Reader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      channel: [],
      currentFeeds: {
        feed: {
          items: []
        }
      },
      currentFeedItem: {},
      openStatus: {},
      showContent: false,
      settings: {},
    };

    FeedUtil.getAllChannels().then(channels => {
      this.setState({channel: channels});
      if (channels.length > 0) {
        this.setState({currentChannelId: channels[0].id});
        this.fetchFeed(channels[0].id);
      }
    });

    FeedUtil.getSettings().then(settings => {
      this.setState({ settings: settings});
    });

    this.updateUnreadCount();
  }

  getTheme = () => {
    return createMuiTheme({
      palette: {
        primary: !this.state.settings.darkTheme ? blue : yellow,
        type: !this.state.settings.darkTheme ? 'light' : 'dark',
      },
      // overrides: {
      //   MuiBottomNavigation: {
      //     root: {
      //       height: 46,
      //     }
      //   },
      //   MuiBottomNavigationAction: {
      //     root: {
      //       height: 46,
      //       '& $svg': {
      //         fontSize: 16,
      //       }
      //     },
      //     label: {
      //       '&$selected': {
      //         fontSize: 12
      //       }
      //     },
      //   },
      // },
    });
  }

  fetchFeed = id => {
    this.setState({currentChannelId: id});
    FeedUtil.getChannelFeed(id).then(feedObj => {
      if (feedObj) {
        FeedUtil.getFeedOpenStatus(feedObj.id).then(openStatus => {
          this.readerContent.scrollTop = 0;
          this.setState({ currentFeeds: feedObj, openStatus: openStatus });
        });
      }
    });
  }

  updateUnreadCount = () => {
    FeedUtil.getAllUnreadCount().then(result => {
      const channel = this.state.channel;
      channel.forEach(c => c.unreadCount = result.feedsCount[c.id])
      this.setState({ 
        allUnreadCount: result.allCount,
        channel: channel,
      });
    });
  };
  addChannel = (name, url) => {
    FeedUtil.addChannel(name, url).then(
    (added) => {
      FeedUtil.getAllChannels().then(channels => {
        this.state.channel = channels;
        this.updateUnreadCount();
      });
      FeedUtil.updateChannelFeed(added.id).then(this.updateUnreadCount);
    });
  }

  deleteChannel = channelId => {
    FeedUtil.deleteChannel(channelId).then(() => {
      FeedUtil.getAllChannels().then(channels => {
        this.setState({channel: channels});
      });
      this.updateUnreadCount();
    });
  }

  updateCurrentChannel = () => {
    return FeedUtil.updateChannelFeed(this.state.currentChannelId).then((feedObj) => {
      if (feedObj) {
        this.setState({currentFeeds: feedObj});
      }
      this.updateUnreadCount();
    });
  }

  changeTheme = darkTheme => {
    this.setState({ settings: { ...this.state.settings, darkTheme: darkTheme} }, () => {
      FeedUtil.setSettings(this.state.settings);
    });
  }

  handleChannelChange = url => {
    this.setState({
      showContent: false
    });
  }

  handleListClick = feedItem => {
    this.state.openStatus.push(feedItem.readerId);
    FeedUtil.setFeedOpenStatus(this.state.currentChannelId, feedItem.readerId).then(() => {
      this.setState({
        currentFeedItem: feedItem,
        showContent: true
      });
      this.updateUnreadCount();
    });
  }

  handleContentCloseClick = () => {
    this.setState({
      showContent: false
    });
  }

  handleReaderItemClose = () => {
    this.setState({ showContent: false });
  }

  render() {
    const { classes } = this.props;
    const theme = this.getTheme();
    return (
      <MuiThemeProvider theme={theme}>
        <div className='Reader'>
          <div className="Reader-header">
            <ReaderHeader
              currentChannelId={this.state.currentChannelId}
              channel={this.state.channel} 
              fetchFeed={this.fetchFeed}
              addChannel={this.addChannel}
              deleteChannel={this.deleteChannel}
              updateCurrentChannel={this.updateCurrentChannel}
              changeTheme={this.changeTheme}
              settings={this.state.settings}
              allUnreadCount={this.state.allUnreadCount} />
          </div>
          <div className="Reader-content " style={{backgroundColor: theme.palette.background.paper}} ref={node => this.readerContent = node}>
            <div className='Reader-list'>
              <FeedList feedObj={this.state.currentFeeds} openStatus={this.state.openStatus} onListClick={this.handleListClick} />
            </div>
            <Dialog
              fullScreen
              open={this.state.showContent}
              onClose={this.handleReaderItemClose}
              //TransitionComponent={Transition}
            >
              <div className={'Reader-item ' + (this.state.showContent ? 'Active' : 'Inactive')}
                  style={{color: theme.palette.text.primary}}>
                <FeedContent feed={this.state.currentFeedItem} onCloseClick={this.handleContentCloseClick} />
              </div>
            </Dialog>
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default Reader;
