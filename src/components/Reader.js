import React, { Component } from 'react';
import logo from '../logo.svg';
import './Reader.scss';
import ChannelSelector from './ChannelSelector';
import FeedList from './FeedList';
import FeedContent from './FeedContent';
import FeedUtil from '../utils/FeedUtil';

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
    this.setState({ updating: true });
    FeedUtil.updateChannelFeed(this.state.currentChannelId).then((feedObj) => {
      this.setState({currentFeeds: feedObj.feed});
      this.setState({ updating: false });
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
        <header className="Reader-header">
          <img src={logo} className="App-logo" alt="logo" />
          <ChannelSelector channel={this.state.channel} onChange={this.fetchFeed} />
          <button onClick={this.updateCurrentChannel}>Update</button>
          { this.state.updating ? <div>Updating</div> : null }
        </header>
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
