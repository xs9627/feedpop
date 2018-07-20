/* global chrome */
import React, { Component } from 'react';
import logo from '../logo.svg';
import './Reader.css';
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

    FeedUtil.getAllChannels((channels) => {
      this.setState({channel: channels});
    })
    //this.fetchFeed(this.state.channel[0].url);
    chrome.storage.local.get('feeds', (data) => {
      let feeds = data.feeds;
      this.setState({currentFeeds: feeds[feeds.length - 1].feed});
    });
  }

  fetchFeed = url => {
    FeedUtil.fetchFeed(url, (err, feed) => {
      if (err) {
        alert(err.message);
      } else {
        chrome.storage.local.get('feeds', (data) => {
          let feeds = data.feeds;
          feeds.push({time: Date.now(), feed: feed});
          chrome.storage.local.set({'feeds': feeds});
        });
        this.setState({currentFeeds: feed});
      }
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
      <div className="Reader">
        <header className="Reader-header">
          <img src={logo} className="App-logo" alt="logo" />
          <ChannelSelector channel={this.state.channel} onChange={this.fetchFeed} />
        </header>
        <div className="Reader-content">
          <div className="Reader-list">
            <FeedList feeds={this.state.currentFeeds.items} onListClick={this.handleListClick} />
          </div>
          <div className="Reader-item">
            <FeedContent feed={this.state.currentFeedItem} showContent={this.state.showContent} onCloseClick={this.handleContentCloseClick} />
          </div>
        </div>
      </div>
    );
  }
}

export default Reader;
