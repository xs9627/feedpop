import React, { Component } from 'react';
import logo from '../logo.svg';
//import Parser from 'rss-parser';
/* global RSSParser */
import 'rss-parser/dist/rss-parser.min.js'
import './Reader.css';
import ChannelSelector from './ChannelSelector';
import FeedList from './FeedList';
import FeedContent from './FeedContent';


class Reader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      channel: [
        {
          name: 'CN - 1',
          url: 'https://www.feng.com/rss.xml'
        },
        {
          name: 'CN - 2',
          url: 'http://zhihurss.miantiao.me/dailyrss'
        }
      ],
      currentFeeds: {
        items: []
      },
      currentFeedItem: {},
      showContent: false
    };
    this.fetchFeed(this.state.channel[0].url);
  }

  fetchFeed = url => {
    let parser = new RSSParser();
    const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";
    parser.parseURL(CORS_PROXY + url, (err, feed) => {
      if (err) {
        alert(err.message);
      } else {
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
