import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { initState, selectChannel, addChannel, setChannels, updateUnreadCount, updateChannelFeed, setFeedReadStatus } from "../actions/index"
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

const mapStateToProps = state => {
  return {
    currentChannelId: state.currentChannelId,
    channels: state.channels };
};

const mapDispatchToProps = dispatch => {
  return {
    initState: callback => dispatch(initState(callback)),
    selectChannel: id => dispatch(selectChannel(id)),
    addChannel: channel => dispatch(addChannel(channel)),
    setChannels: channels => dispatch(setChannels(channels)),
    updateUnreadCount: () => dispatch(updateUnreadCount()),
    updateChannelFeed: id => dispatch(updateChannelFeed(id)),
    setFeedReadStatus: (channelId, feedId) => dispatch(setFeedReadStatus(channelId, feedId)),
  };
};

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
      openStatus: [],
      showContent: false,
      settings: {},
    };

    this.props.initState(() => {
      this.props.updateUnreadCount();
      this.props.selectChannel();
    });
    // FeedUtil.getAllChannels().then(channels => {
    //   //this.setState({channel: channels});
    //   this.props.setChannels(channels);
    //   if (channels.length > 0) {
    //     this.setState({currentChannelId: channels[0].id});
    //     this.fetchFeed(channels[0].id);
    //   }
    // });

    // FeedUtil.getSettings().then(settings => {
    //   this.setState({ settings: settings});
    // });

    //this.props.updateUnreadCount();
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

  addChannel = (name, url) => {
    const channel = { name: name, url: url };
    this.props.addChannel(channel);
    this.props.updateUnreadCount(); // TODO
    this.props.updateChannelFeed(channel.id);
  }

  updateCurrentChannel = () => {
    this.props.updateChannelFeed(this.props.currentChannelId);
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
    this.props.setFeedReadStatus(this.props.currentChannelId, feedItem.readerId);
    FeedUtil.setFeedOpenStatus(this.props.currentChannelId, feedItem.readerId).then(() => {
      this.setState({
        currentFeedItem: feedItem,
        showContent: true
      });
      this.props.updateUnreadCount();
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
              currentChannelId={this.props.currentChannelId}
              channel={this.props.channels}
              addChannel={this.addChannel}
              updateCurrentChannel={this.updateCurrentChannel}
              changeTheme={this.changeTheme}
              settings={this.state.settings} />
          </div>
          <div className="Reader-content " style={{backgroundColor: theme.palette.background.paper}} ref={node => this.readerContent = node}>
            <div className='Reader-list'>
              <FeedList onListClick={this.handleListClick} />
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

Reader.propTypes = {
  channels: PropTypes.array,
  addChannel: PropTypes.func,
  setChannels: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(Reader);
