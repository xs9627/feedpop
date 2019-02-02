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

import { setFeedReadStatus, openFeed, loadHistoryFeeds } from '../actions/index';
import { withNamespaces } from 'react-i18next';
import GA from '../utils/GA';

const mapStateToProps = state => {
    return {
        channels: state.channels,
        recentFeeds: state.recentFeeds,
        historyFeedsLoaded: state.historyFeedsLoaded,
        currentChannelId: state.currentChannelId,
        currentChannel: state.headerChannels.find(c => c.id === state.currentChannelId) || {},
        feeds: state.currentFeeds,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        setFeedReadStatus: (channelId, feedId) => dispatch(setFeedReadStatus(channelId, feedId)),
        openFeed: feedItemId => dispatch(openFeed(feedItemId)),
        loadHistoryFeeds: () => dispatch(loadHistoryFeeds()),
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
        fontWeight: '500',
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
    collapseIcon: {
        padding: theme.spacing.unit,
    },
    emptyMsg: {
        textAlign: 'center',
        margin: theme.spacing.unit * 2,
        opacity: .5,
    },
    itemSecondaryContainer: {
        display: 'flex',
    }
});

class FeedList extends Component {
    state = {
        faviconsReachable: false,
        collapseStatus: {},
        page: 1,
        arrangedFeeds: new Map()
    }
    faviconsApis = [
        'https://www.google.com/s2/favicons?domain=',
        'https://www.google.cn/s2/favicons?domain=',
    ];
    resetState() {
        Object.assign(this.state, {arrangedFeeds: new Map(), collapseStatus: {}, page: 1});
        if (this.feedList) {
            this.feedList.scrollTop = 0;
        }
    }
    setCurrentChannelId = currentChannelId => {
        if (this.state.currentChannelId !== currentChannelId) {
            this.resetState();
            this.state.currentChannelId = currentChannelId;
        }
    }
    arrangeFeeds = feeds => {
        if (feeds) {
            const pageSize = 20;
            if (!this.props.historyFeedsLoaded &&
                feeds.items.filter(i => !this.state.collapseStatus[this.getDateStr(i.isoDate).index]).length < this.state.page * pageSize) {
                this.props.loadHistoryFeeds();
            }
            
            const arrangedMap = feeds.items
            .filter(i => !this.state.collapseStatus[this.getDateStr(i.isoDate).index])
            .slice(0, this.state.page * 20)
            .reduce((r, a) => {
                let result = this.getDateStr(a.isoDate);
                if (!r.has(result.index)) {
                    r.set(result.index, { dateString: result.dateString, items: [] });
                }
                if (!r.get(result.index).items.find(f => f.readerId === a.readerId)) {
                    r.get(result.index).items.push(a);
                } else {
                    r.get(result.index).items = r.get(result.index).items.map(i => (i.readerId === a.readerId) ? a : i);
                }
                return r;
            }, this.state.arrangedFeeds);
            this.state.arrangedFeeds = new Map([...arrangedMap.entries()].sort((a, b) => a[0] - b[0]));
        } else {
            this.resetState();
        }
    }
    getDateStr = date => {
        const itemDate = new Date(date);
        if (!isNaN(itemDate)) {
            let compareDate = new Date();
            compareDate.setHours(0,0,0,0); //Today
            itemDate.setHours(0,0,0,0);
            const diff = compareDate - itemDate;
            const dayMilliseconds = 1000 * 60 * 60 * 24;

            if (diff < dayMilliseconds * 7) {
                if (diff < dayMilliseconds) {
                    return { index: 1, dateString: "Today" };
                } else if (diff < dayMilliseconds * 2) {
                    return { index: 2, dateString: "Yestoday" };
                } else {
                    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    return { index: (diff / dayMilliseconds) + 1, dateString: days[itemDate.getDay()] };
                }
            } else if (diff < dayMilliseconds * 14) {
                return { index: 8, dateString: "Last Week" };
            } else if (diff < dayMilliseconds * 21) {
                return { index: 9, dateString: "2 Weed Ago" };
            } else if (diff < dayMilliseconds * 28) {
                return { index: 10, dateString: "3 Weed Ago" };
            } else {
                compareDate.setDate(1); //Last month
                compareDate.setMonth(compareDate.getMonth() - 1);
                if (itemDate >= compareDate) {
                    return { index: 11, dateString: "Last Month" };
                }
                else {
                    compareDate.setMonth(0) //This year
                    if (itemDate >= compareDate) {
                        return { index: 12, dateString: "This Year" };
                    } else {
                        return { index: 13, dateString: "Older" };
                    }
                }
            }
        } else {
            return { index: 13, dateString: "Older" };
        }
    }
    handleSubheaderClick = index => {
        const collapseStatus = this.state.collapseStatus;
        collapseStatus[index] = !collapseStatus[index];
        if (!collapseStatus[index] && this.state.arrangedFeeds.get(index).items.length < this.props.feeds.items.reduce((r, a) => (r += this.getDateStr(a.isoDate).index === index ? 1 : 0), 0)) {
            const keys = Object.keys(this.state.arrangedFeeds);
            
            this.state.arrangedFeeds.forEach((value, key) => {
                if (key > index) {
                    this.state.arrangedFeeds.delete(key);
                    collapseStatus[key] = false;
                }
            });
            this.state.page = Math.ceil(this.state.arrangedFeeds.get(index).items.length / 20);
        } else {
            this.state.page -= Math.ceil(this.state.arrangedFeeds.get(index).items.length / 20) - 1;
        }
        this.setState({ collapseStatus: collapseStatus });
    }
    getTime = (isoDate, groupIndex) => {
        if (!isNaN(new Date(isoDate))) {
            const date = new Date(isoDate);
            let result = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            if (groupIndex > 7) {
                const dateString = groupIndex < 13 ? date.toLocaleDateString([], {month:"2-digit", day:"2-digit"}) : date.toLocaleDateString();
                result = `${dateString} ${result}`;
            }
            return result;
        }
    }
    testFaiconsApi = () => {
        this.faviconsApis.forEach(faviconsApi => {
            const request = new XMLHttpRequest();
            request.timeout = 2000;
            request.open('GET', faviconsApi + 'google.com', true);
            request.onload = () => {
                if (!this.state.faviconsReachable) {
                    this.setState({ faviconsReachable: true, faviconsApi });
                }
            };
            request.send();
        });
    }
    renderChannelIcon = channelId => {
        const { classes, recentFeeds, channels } = this.props;

        if (channelId === 'RECENT') {
            return <Avatar className={classes.avatar}>R</Avatar>;
        }

        const currentChannel = channels.find(c => c.id === channelId);
        const feeds = (recentFeeds.find(rf => rf.channelId === channelId) || {}).feed;

        const title = feeds ? feeds.title : currentChannel.name;
        const url = feeds ? feeds.link : currentChannel.url;
        if (this.state.faviconsReachable && url) {
            const hostName = (new URL(url)).hostname;
            return <Avatar src={ this.state.faviconsApi + hostName } className={classes.avatar} />;
        } else {
            return <Avatar className={classes.avatar}>{ title && title.substr(0, 1)}</Avatar>;
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
        const { classes, feeds, currentChannelId, currentChannel, t } = this.props;
        this.setCurrentChannelId(currentChannelId);
        this.arrangeFeeds(feeds);
        const arranged = this.state.arrangedFeeds;
        return (
            <div className={classes.root} ref={node => this.feedList = node}>
                <div className={ classes.feedInfoContainer }>
                    { this.renderChannelIcon(currentChannelId) }
                    <Typography variant="body2" className={ classes.feedTitle }>
                        { currentChannel.name }
                    </Typography>
                </div>
                <Divider />
                { !feeds && <div class={classes.emptyMsg}>
                    <Typography variant="caption">{t("No feeds loaded")}</Typography> 
                </div>}
                <List subheader={<li />}>
                    {[...arranged].map(([index, value]) => (
                        <li key={`dateStr-${index}`} className={classes.listSection}>
                            <ul className={classes.ul}>
                                <ListItem>
                                    <ListItemText primary={t(value.dateString)}></ListItemText>
                                    <ListItemSecondaryAction>
                                        <IconButton className={classes.collapseIcon} onClick={() => this.handleSubheaderClick(index)}>
                                            {this.state.collapseStatus[index] ? <ExpandLess /> : <ExpandMore />}
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                <Collapse in={!this.state.collapseStatus[index]} timeout="auto" unmountOnExit>
                                    {value.items.sort((a, b)=> (new Date(b.isoDate) - new Date(a.isoDate))).map(feed => (
                                        <ListItem 
                                            button  
                                            dense={true} 
                                            key={`item-${feed.readerId}`} 
                                            onClick={() => {
                                                this.props.setFeedReadStatus(feed.channelId || currentChannelId, feed.readerId);
                                                this.props.openFeed(feed.readerId);
                                                GA.sendAppView('ContentView');
                                            }}
                                        >
                                            <ListItemText classes={{ primary: classNames({[classes.unRead]: !feed.isRead}) }} primary={feed.title} secondary={<div className={classes.itemSecondaryContainer}>{feed.channelId && this.renderChannelIcon(feed.channelId)} {this.getTime(feed.isoDate, index)}</div>} />
                                            
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

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withNamespaces()(FeedList)));