import React, { Component } from 'react';
import { connect } from "react-redux";
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';

import { setFeedReadStatus, openFeed } from '../actions/index'

const mapStateToProps = state => {
    return {
        currentChannelId: state.currentChannelId,
        currentChannel: state.channels.find(c => c.id === state.currentChannelId) || {},
        feeds: state.currentFeeds,
        feedReadStatus: state.feedReadStatus,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        setFeedReadStatus: (channelId, feedId) => dispatch(setFeedReadStatus(channelId, feedId)),
        openFeed: feedItemId => dispatch(openFeed(feedItemId)),
    };
};

const styles = theme => ({
    root: {
        backgroundColor: theme.palette.background.paper,
        flex: '1 1 auto',
        overflow: 'auto',
        wordBreak: 'break-word',
    },
    listSection: {
        backgroundColor: 'inherit',
    },
    ul: {
        backgroundColor: 'inherit',
        padding: 0,
    },
    unRead: {
        color: theme.palette.primary.main,
        fontWeight: 'bold',
        '&::before': {
            content: '"● "',
        },
    },
    feedInfoContainer: {
        padding: 16,
        display: 'flex',
    },
    feedTitle: {
        lineHeight: '16px',
    },
    avatar: {
        width: 16,
        height: 16,
        fontSize: 12,
        marginRight: theme.spacing.unit,
    },
});

class FeedList extends Component {
    state = {
        faviconsReachable: false,
        collapseStatus: {},
        page: 1,
        arrangedFeeds: {}
    }
    faviconsApi = 'https://www.google.com/s2/favicons?domain=';
    arrangeFeeds = feeds => {
        if (feeds) {
            this.state.arrangedFeeds = feeds.items
            .filter(i => !this.state.collapseStatus[this.getDateStr(i.isoDate)])
            .slice(0, this.state.page * 20)
            .reduce((r, a) => {
                let dateStr = this.getDateStr(a.isoDate);
                r[dateStr] = r[dateStr] || [];
                if (!r[dateStr].find(f => f.readerId === a.readerId)) {
                    r[dateStr].push(a);
                }
                return r;
            }, this.state.arrangedFeeds);
        }
    }
    getDateStr = date => (new Date(date).toLocaleDateString())
    initCollapseStatus = currentChannelId => {
        if (currentChannelId !== this.state.currentChannelId) {
            this.feedList.scrollTop = 0;
            this.setState({ currentChannelId, collapseStatus: {}, arrangedFeeds: {}, page: 1 });
        }
    }
    handleSubheaderClick = dateStr => {
        const collapseStatus = this.state.collapseStatus;
        collapseStatus[dateStr] = !collapseStatus[dateStr];
        if (!collapseStatus[dateStr] && this.state.arrangedFeeds[dateStr].length < this.props.feeds.items.reduce((r, a) => (r += this.getDateStr(a.isoDate) === dateStr ? 1 : 0), 0)) {
            const keys = Object.keys(this.state.arrangedFeeds);
            for (let i = keys.length - 1; i >=0; i--) {
                if (keys[i] !== dateStr) {
                    delete this.state.arrangedFeeds[keys[i]];
                    collapseStatus[keys[i]] = false;
                } else {
                    break;
                }
            }
            this.state.page = Math.ceil(this.state.arrangedFeeds[dateStr].length / 20);
        } else {
            this.state.page -= Math.ceil(this.state.arrangedFeeds[dateStr].length / 20) - 1;
        }
        this.setState({ collapseStatus: collapseStatus });
    }
    isUnRead = readerId => {
        if (this.props.feedReadStatus) {
            const status = this.props.feedReadStatus.find(s => s.channelId === this.props.currentChannelId);
            if (status) {
                return !status.feedIds.some(id => id === readerId);
            } else {
                return true;
            }
        } else {
            return true;
        }
    }
    getTime = isoDate => {
        return new Date(isoDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
    testFaiconsApi = () => {
        const request = new XMLHttpRequest();
        request.timeout = 2000;
        request.open('GET', this.faviconsApi + 'google.com', true);
        request.onload = () => {
            this.setState({ faviconsReachable: true });
        };
        request.send();
    }
    renderChannelIcon = () => {
        const { feeds, classes } = this.props;
        if (feeds) {
            if (this.state.faviconsReachable) {
                const hostName = (new URL(feeds.link)).hostname;
                return <Avatar src={ this.faviconsApi + hostName } className={classes.avatar} />;
            } else {
                return <Avatar className={classes.avatar}>{ feeds.title.substr(0, 1)}</Avatar>;
            }
        }
    }
    componentDidMount() {
        this.testFaiconsApi();
        this.feedList.addEventListener('scroll', this.trackScrolling);
    }
    isBottom(e) {
        return e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    }
    componentWillUnmount() {
        this.feedList.removeEventListener('scroll', this.trackScrolling);
    }
    trackScrolling = (e) => {
        if (this.isBottom(e) && this.props.feeds) {
            this.setState(state => ({ page: state.page + 1 }));
        }
    };
    render() {
        const { classes, feeds, currentChannelId } = this.props;
        this.initCollapseStatus(currentChannelId);
        this.arrangeFeeds(feeds);
        const arranged = this.state.arrangedFeeds;
        return (
            <div className={classes.root} ref={node => this.feedList = node}>
                <div className={ classes.feedInfoContainer }>
                    { this.renderChannelIcon() }
                    <Typography variant="body2" className={ classes.feedTitle }>
                        { feeds ? feeds.title : null }
                    </Typography>
                </div>
                <Divider />
                <List subheader={<li />}>
                    {Object.keys(arranged).map(dateStr => (
                        <li key={`dateStr-${dateStr}`} className={classes.listSection}>
                            <ul className={classes.ul}>
                                <ListItem>
                                    <ListItemText primary={dateStr}></ListItemText>
                                    <ListItemSecondaryAction>
                                        <IconButton onClick={() => this.handleSubheaderClick(dateStr)}>
                                            {this.state.collapseStatus[dateStr] ? <ExpandLess /> : <ExpandMore />}
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                <Collapse in={!this.state.collapseStatus[dateStr]} timeout="auto" unmountOnExit>
                                    {arranged[dateStr].map(feed => (
                                        <ListItem 
                                            button  
                                            dense={true} 
                                            key={`item-${feed.readerId}`} 
                                            onClick={() => {
                                                this.props.setFeedReadStatus(currentChannelId, feed.readerId);
                                                this.props.openFeed(feed.readerId);
                                            }}
                                        >
                                            <ListItemText classes={{ primary: classNames({[classes.unRead]: this.isUnRead(feed.readerId)}) }} primary={feed.title} secondary={this.getTime(feed.isoDate)} />
                                        </ListItem>
                                    ))}
                                </Collapse>
                                <Divider light />
                            </ul>
                        </li>
                    ))}
                </List>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(FeedList));