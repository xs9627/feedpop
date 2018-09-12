import React, { Component } from 'react';
import './Reader.scss';
import FeedList from './FeedList';
import FeedContent from './FeedContent';
import FeedUtil from '../utils/FeedUtil';
import ReaderHeader from './header/ReaderHeader';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

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
      this.setState({currentChannelId: channels[0].id});
      this.fetchFeed(channels[0].id);
    });

    FeedUtil.getSettings().then(settings => {
      this.setState({ settings: settings});
    });
  }

  getTheme = () => {
    return createMuiTheme({
      palette: {
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
          this.setState({ currentFeeds: feedObj, openStatus: openStatus });
        });
      }
    });
  }

  updateCurrentChannel = () => {
    return FeedUtil.updateChannelFeed(this.state.currentChannelId).then((feedObj) => {
      if (feedObj) {
        this.setState({currentFeeds: feedObj});
      }
    });
  }

  changeTheme = darkTheme => {
    let settings = {darkTheme: darkTheme};
    this.setState({settings: settings});
    FeedUtil.setSettings(settings);
  }

  handleChannelChange = url => {
    this.setState({
      showContent: false
    });
  }

  handleListClick = feedItem => {
    this.setState({
      currentFeedItem: feedItem,
      showContent: true
    });
  }

  handleContentCloseClick = () => {
    this.setState({
      showContent: false
    });
  }

  render() {
    const { classes } = this.props;
    const theme = this.getTheme();
    return (
      <MuiThemeProvider theme={theme}>
        <div className={"Reader " + (this.state.showContent ? 'Model-open' : '')}>
          <div className="Reader-header">
            <ReaderHeader
              currentChannelId={this.state.currentChannelId}
              channel={this.state.channel} 
              fetchFeed={this.fetchFeed} 
              updateCurrentChannel={this.updateCurrentChannel}
              changeTheme={this.changeTheme}
              settings={this.state.settings} />
          </div>
          <div className="Reader-content " style={{backgroundColor: theme.palette.background.paper}}>
            <div className='Reader-list'>
              <FeedList feedObj={this.state.currentFeeds} openStatus={this.state.openStatus} onListClick={this.handleListClick} />
            </div>
            <div className={'Reader-item ' + (this.state.showContent ? 'Active' : 'Inactive')}
                style={{color: theme.palette.text.primary}}>
              <FeedContent feed={this.state.currentFeedItem} onCloseClick={this.handleContentCloseClick} />
            </div>
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default Reader;
