import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { initState, selectChannel, setChannels, updateUnreadCount, updateChannelFeed } from "../actions/index"
import './Reader.scss';
import FeedList from './FeedList';
import FeedContent from './FeedContent';
import ReaderHeader from './header/ReaderHeader';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide';
import blue from '@material-ui/core/colors/blue';
import yellow from '@material-ui/core/colors/yellow';

const mapStateToProps = state => {
  return {
    channels: state.channels,
    showContent: state.showContent,
    theme: state.settings.theme,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    initState: callback => dispatch(initState(callback)),
    selectChannel: id => dispatch(selectChannel(id)),
    updateUnreadCount: () => dispatch(updateUnreadCount()),
  };
};

function Transition(props) {
  return <Slide direction="up" {...props} />;
}

class Reader extends Component {
  constructor(props) {
    super(props);

    this.props.initState(state => {
      this.props.updateUnreadCount();
      if (!state.currentChannelId) {
        this.props.selectChannel();
      }
    });
  }

  getTheme = () => {
    const isDarkTheme = this.props.theme === "dark";
    return createMuiTheme({
      palette: {
        primary: !isDarkTheme ? blue : yellow,
        type: !isDarkTheme ? 'light' : 'dark',
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

  handleChannelChange = url => {
    this.setState({
      showContent: false
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
            <ReaderHeader />
          </div>
          <div className="Reader-content " style={{backgroundColor: theme.palette.background.paper}} ref={node => this.readerContent = node}>
            <div className='Reader-list'>
              <FeedList />
            </div>
            <Dialog
              fullScreen
              open={this.props.showContent}
              onClose={this.handleReaderItemClose}
              //TransitionComponent={Transition}
            >
              <div className={'Reader-item ' + (this.props.showContent ? 'Active' : 'Inactive')}
                  style={{color: theme.palette.text.primary}}>
                <FeedContent onCloseClick={this.handleContentCloseClick} />
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
