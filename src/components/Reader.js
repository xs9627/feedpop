import React, { Component } from 'react';
import logo from '../logo.svg';
import './Reader.scss';
import FeedList from './FeedList';
import FeedContent from './FeedContent';
import FeedUtil from '../utils/FeedUtil';
import ReaderHeader from './header/ReaderHeader'

class Reader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      channel: [],
      currentFeeds: {
        items: []
      },
      currentFeedItem: {},
      showContent: false
    };

    FeedUtil.getAllChannels().then(channels => {
      this.setState({channel: channels});
      this.setState({currentChannelId: channels[0].id});
      this.fetchFeed(channels[0].id);
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
      <div className={"Reader " + (this.state.showContent ? 'Model-open' : '')}>
        <ReaderHeader 
          currentChannelId={this.state.currentChannelId}
          channel={this.state.channel} 
          fetchFeed={this.fetchFeed} 
          updateCurrentChannel={this.updateCurrentChannel} />
        <div className="Reader-content">
          <div className='Reader-list'>
            <FeedList feeds={this.state.currentFeeds.items} onListClick={this.handleListClick} />
          </div>
          <div className={'Reader-item ' + (this.state.showContent ? 'Active' : 'Inactive')}>
            <FeedContent feed={this.state.currentFeedItem} onCloseClick={this.handleContentCloseClick} />
          </div>
        </div>
      </div>
    );
  }
}

export default Reader;
