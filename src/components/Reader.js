import React, { Component } from 'react';
import './Reader.scss';
import FeedList from './FeedList';
import FeedContent from './FeedContent';
import FeedUtil from '../utils/FeedUtil';
import ReaderHeader from './header/ReaderHeader';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import 'typeface-roboto';

class Reader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      channel: [],
      currentFeeds: {
        items: []
      },
      currentFeedItem: {},
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
      overrides: {
        MuiBottomNavigation: {
          root: {
            height: 46,
          }
        },
        MuiBottomNavigationAction: {
          root: {
            height: 46,
            '& $svg': {
              fontSize: 16,
            }
          },
          label: {
            '&$selected': {
              fontSize: 12
            }
          },
        },
      },
    });
  }

  fetchFeed = id => {
    this.setState({currentChannelId: id});
    FeedUtil.getChannelFeed(id).then(feedObj => {
      this.setState({currentFeeds: feedObj.feed});
    });
  }

  updateCurrentChannel = () => {
    return FeedUtil.updateChannelFeed(this.state.currentChannelId).then((feedObj) => {
      this.setState({currentFeeds: feedObj.feed});
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
    return (
      <MuiThemeProvider theme={this.getTheme()}>
        <div className={"Reader " + (this.state.showContent ? 'Model-open' : '')}>
          <ReaderHeader 
            currentChannelId={this.state.currentChannelId}
            channel={this.state.channel} 
            fetchFeed={this.fetchFeed} 
            updateCurrentChannel={this.updateCurrentChannel}
            changeTheme={this.changeTheme}
            settings={this.state.settings} />
          <div className="Reader-content">
            <div className='Reader-list'>
              <FeedList feeds={this.state.currentFeeds.items} onListClick={this.handleListClick} />
            </div>
            <div className={'Reader-item ' + (this.state.showContent ? 'Active' : 'Inactive')}>
              <FeedContent feed={this.state.currentFeedItem} onCloseClick={this.handleContentCloseClick} />
            </div>
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default Reader;
