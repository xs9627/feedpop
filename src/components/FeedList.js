import React, { useState, useEffect, useRef } from 'react';
import { connect } from "react-redux";
import classNames from 'classnames';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Subject from '@material-ui/icons/Subject';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

import { useGesture } from 'react-use-gesture'
import { useSpring, animated } from 'react-spring'

import ChromeUtil from '../utils/ChromeUtil';
import { ChannelFixedID } from '../constants/index';
import { setFeedReadStatus, openFeed, loadHistoryFeeds, markAllAsRead, getAllUnreadLinks, openAllUnread, confirmOpenAllUnread, toggleOpenAllUnreadConfirm } from '../actions/index';
import { withTranslation } from 'react-i18next';
import GA from '../utils/GA';

const mapStateToProps = state => {
    return {
        channels: state.channels,
        recentFeeds: state.recentFeeds,
        historyFeedsLoaded: state.historyFeedsLoaded,
        currentChannelId: state.currentChannelId,
        feeds: state.currentFeeds,
        needResetChannelList: state.tmp.needResetChannelList,
        allUnreadLinks: state.tmp.allUnreadLinks,
        showOpenAllUnreadConfirm: state.tmp.showOpenAllUnreadConfirm,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        setFeedReadStatus: (channelId, feedId, isRead) => dispatch(setFeedReadStatus(channelId, feedId, isRead)),
        openFeed: feedItemId => dispatch(openFeed(feedItemId)),
        loadHistoryFeeds: () => dispatch(loadHistoryFeeds()),
        markAllAsRead: channelId => dispatch(markAllAsRead(channelId)),
        getAllUnreadLinks: () => dispatch(getAllUnreadLinks()),
        openAllUnread: () => dispatch(openAllUnread(true)),
        confirmOpenAllUnread: () => dispatch(confirmOpenAllUnread()),
        toggleOpenAllUnreadConfirm: () => dispatch(toggleOpenAllUnreadConfirm()),
    };
};

const useStyles = makeStyles(theme => ({
    root: {
        backgroundColor: theme.palette.background.paper,
        flex: '1 1 auto',
        overflow: 'auto',
        wordBreak: 'break-word',
    },
    list: {
        backgroundColor: 'inherit',
    },
    listSection: {
        backgroundColor: 'inherit',
        position: 'relative',
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
    sentinel: {
        // background: 'yellow',
        position: 'absolute',
        left: 0,
        right: 0,
        visibility: 'hidden',
    },
    sentinelBottom: {
        bottom: 0,
    },
    feedInfoContainer: {
        padding: `${theme.spacing.unit / 2}px ${theme.spacing.unit * 2}px`,
        paddingRight: '12px',
        display: 'flex',
        alignItems: 'center',
        height: 48,
    },
    groupHeader: {
        paddingTop: theme.spacing.unit / 2,
        paddingBottom: theme.spacing.unit / 2,
    },
    stickyHeader: {
        position: 'sticky',
        backgroundColor: 'inherit',
    },
    stickyTitle: {
        position: 'sticky',
        backgroundColor: 'inherit',
    },
    stickyShadow: {
        boxShadow: `rgba(0, 0, 0, 0.1) 0px 6px 12px 0px`,
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
        padding: theme.spacing.unit / 2,
    },
    emptyMsg: {
        textAlign: 'center',
        margin: theme.spacing.unit * 2,
        opacity: .5,
    },
    itemSecondaryContainer: {
        display: 'flex',
        alignItems: 'center',
    },
    channelMenuButton: {
        marginLeft: 'auto',
        padding: theme.spacing.unit,
    },
}));

//class FeedList extends Component {
const FeedList = props => {
    const [faviconsReachable, setFaviconsReachable] = useState(false)
    const [collapseStatus, setCollapseStatus] = useState({})
    const [page, setPage] = useState(1)
    const [arrangedFeeds, setArrangedFeeds] = useState(new Map())
    const [menuOpen, setMenuOpen] = useState(false)
    const [anchorEl, setAnchorEl] = useState()
    const [menuLeft, setMenuLeft] = useState()
    const [menuTop, setMenuTop] = useState()
    const [faviconsApi, setFaviconsApi] = useState()
    const [currentFeedItem, setCurrentFeedItem] = useState()
    const [lastChannelId, setLastChannelId] = useState()
    // const [stickyId, setStickyId] = useState()
    const [scrollDown, setScrollDown] = useState(true)

    const classes = useStyles(props);

    const feedTitle = useRef(null)
    const feedList = useRef(null)
    const arrangedGroups = useRef([])
    const sentinelTops = useRef([])
    const sentinelBottoms = useRef([])

    const {feeds, currentChannelId, channels, loadHistoryFeeds, historyFeedsLoaded, t } = props;
    
    //getDerivedStateFromProps(props, state) {
    useEffect(() => {
        const faviconsApis = [
            'https://www.google.com/s2/favicons?domain=',
            'https://www.google.cn/s2/favicons?domain=',
        ];
        faviconsApis.forEach(faviconsApi => {
            const request = new XMLHttpRequest();
            request.timeout = 2000;
            request.open('GET', faviconsApi + 'google.com', true);
            request.onload = () => {
                setFaviconsReachable(prevState => {
                    if (!prevState) {
                        setFaviconsApi(faviconsApi)
                    }
                    return true;
                })
            };
            request.send();
        });

        const isBottom = (e) => {
            return e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
        }
        const trackScrolling = (e) => {
            if (isBottom(e)) {
                setPage(prevState => prevState + 1)
            }
        }
        const curFeedList = feedList.current
        curFeedList.addEventListener('scroll', trackScrolling);
        return () => {
            curFeedList.removeEventListener('scroll', trackScrolling);
        }
    }, [])

    useEffect(() => {
        let isChannelChange = false;
        if (lastChannelId !== currentChannelId) {
            isChannelChange = true;
            feedList.current.scrollTop = 0;
            setLastChannelId(currentChannelId)
            setCollapseStatus({})
            setPage(1)
        }
        setArrangedFeeds(prevState => {
            if (feeds) {
                const pageSize = 20;
                if (!historyFeedsLoaded &&
                    feeds.items.filter(i => !collapseStatus[getDateStr(i.isoDate).index]).length < page * pageSize) {
                    loadHistoryFeeds();
                }

                const arrangedMap = feeds.items
                .filter(i => !collapseStatus[getDateStr(i.isoDate).index])
                .slice(0, page * 20)
                .reduce((r, a) => {
                    let result = getDateStr(a.isoDate);
                    if (!r.has(result.index)) {
                        r.set(result.index, { dateString: result.dateString, items: [] });
                    }
                    if (!r.get(result.index).items.find(f => f.readerId === a.readerId)) {
                        r.get(result.index).items.push(a);
                    } else {
                        r.get(result.index).items = r.get(result.index).items.map(i => (i.readerId === a.readerId) ? a : i);
                    }
                    return r;
                }, isChannelChange ? new Map() : prevState);
                arrangedGroups.current = [...arrangedMap].map(React.createRef)
                sentinelTops.current = [...arrangedMap].map(React.createRef)
                sentinelBottoms.current = [...arrangedMap].map(React.createRef)
                return new Map([...arrangedMap.entries()].sort((a, b) => a[0] - b[0]))
            } else {
                return new Map()
            }
        })
        
        // if (props.currentChannelId !== state.lastChannelId || 
        //     (props.currentChannelId === ChannelFixedID.RECENT && props.channels.length !== state.channelsCount)
        // ) {
        //     state =  {...state, arrangedFeeds: new Map(), collapseStatus: {}, page: 1, lastChannelId: props.currentChannelId, channelsCount: props.channels && props.channels.length, refresh: true};       
        // } else {
        //     state = {...state, refresh: false};
        // }
        // return {...state, arrangedFeeds: arrangeFeeds(props.feeds, state)};
    //}
    }, [feeds, page, currentChannelId, collapseStatus, historyFeedsLoaded, lastChannelId, loadHistoryFeeds])

    useEffect(() => {
        const sentinelFire = (target, stuck) => {
            target.classList.toggle(classes.stickyShadow, stuck);
        }

        const topObserver = new IntersectionObserver((records, observer) => {
            for (const record of records) {
                const targetInfo = record.boundingClientRect;
                const stickyTarget = record.target.parentElement.querySelector(`.${classes.stickyTitle}`);
                const rootBoundsInfo = record.rootBounds;
            
                // const groupId = parseInt(stickyTarget.getAttribute('data-id'))
                if (targetInfo.bottom < rootBoundsInfo.top) {
                    // setStickyId(groupId)
                    sentinelFire(stickyTarget, true)
                }
            
                if (targetInfo.bottom >= rootBoundsInfo.top && targetInfo.bottom < rootBoundsInfo.bottom) {
                    sentinelFire(stickyTarget, false)
                }
            }
        }, {
            threshold: [0],
            root: feedList.current
        });

        const bottomObserver = new IntersectionObserver((records, observer) => { 
            for (const record of records) {
                const targetInfo = record.boundingClientRect;
                const stickyTarget = record.target.parentElement.querySelector(`.${classes.stickyTitle}`);
                const rootBoundsInfo = record.rootBounds;
                const ratio = record.intersectionRatio;
            
                // const groupId = parseInt(stickyTarget.getAttribute('data-id'))
                if (targetInfo.bottom < 190 && targetInfo.bottom - rootBoundsInfo.top < 50 && ratio === 1) {
                    // setStickyId(groupId)
                    sentinelFire(stickyTarget, true)
                }
            
                if (targetInfo.top < rootBoundsInfo.top && targetInfo.bottom < rootBoundsInfo.bottom) {
                    sentinelFire(stickyTarget, false)
                }
            }
        }, {
            threshold: [1],
            root: feedList.current
        });

        sentinelTops.current.forEach(sentinelTop => { sentinelTop.current && topObserver.observe(sentinelTop.current)})
        sentinelBottoms.current.forEach(sentinelBottom => sentinelBottom.current && bottomObserver.observe(sentinelBottom.current))
        return () => {
            sentinelTops.current.forEach(sentinelTop => { sentinelTop.current && topObserver.unobserve(sentinelTop.current)})
            sentinelBottoms.current.forEach(sentinelBottom => sentinelBottom.current && bottomObserver.unobserve(sentinelBottom.current))
        }
    }, [arrangedFeeds, classes.stickyShadow, classes.stickyTitle])

    const getDateStr = date => {
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
                    return { index: 2, dateString: "Yesterday" };
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
    const handleSubheaderClick = (index, e) => {
        if (e.currentTarget.closest(`.${classes.stickyTitle}`).classList.contains(classes.stickyShadow)) {
            const groupContainer = e.currentTarget.closest(`.${classes.listSection}`)
            groupContainer.scrollIntoView()
        }
        const newCollapseStatus = {...collapseStatus, [index]: !collapseStatus[index]}
        if (!newCollapseStatus[index] && arrangedFeeds.get(index).items.length < props.feeds.items.reduce((r, a) => (r += getDateStr(a.isoDate).index === index ? 1 : 0), 0)) {
            arrangedFeeds.forEach((value, key) => {
                if (key > index) {
                    arrangedFeeds.delete(key);
                    newCollapseStatus[key] = false;
                }
            });
            setPage(Math.ceil(arrangedFeeds.get(index).items.length / 20))
        } else {
            setPage(page - (Math.ceil(arrangedFeeds.get(index).items.length / 20) - 1))
        }
        setCollapseStatus(newCollapseStatus)
    }

    const getTime = (isoDate, groupIndex) => {
        if (!isNaN(new Date(isoDate))) {
            const date = new Date(isoDate);
            let result = date.toLocaleTimeString([], {timeStyle: 'short'});
            if (groupIndex > 7) {
                const dateString = groupIndex < 13 ? date.toLocaleDateString([], {month:"2-digit", day:"2-digit"}) : date.toLocaleDateString();
                result = `${dateString} ${result}`;
            }
            return result;
        }
    }
    
    const renderChannelIcon = channelId => {
        const { recentFeeds, channels } = props;

        if (channelId === ChannelFixedID.RECENT) {
            return <Subject className={classes.avatar} />;
        }

        const currentChannel = channels.find(c => c.id === channelId);
        const feeds = (recentFeeds.find(rf => rf.channelId === channelId) || {}).feed;

        const title = feeds ? feeds.title : currentChannel.name;
        const url = feeds ? feeds.link : currentChannel.url;
        if (faviconsReachable && url) {
            const hostName = (new URL(url)).hostname;
            return <Avatar src={ faviconsApi + hostName } className={classes.avatar} />;
        } else {
            return <Avatar className={classes.avatar}>{ title && title.substr(0, 1)}</Avatar>;
        }
    }
 
    const handleItemContextMenu = (e, currentFeedItem) => {
        e.preventDefault();
        setMenuOpen(true)
        setCurrentFeedItem(currentFeedItem)
        setMenuLeft(e.clientX)
        setMenuTop(e.clientY)
    }
    const handleCloseContextMenu = () => {
        setMenuOpen(false)
    }
    const handleToggleIsRead = () => {
        const {setFeedReadStatus, currentChannelId} = props
        setFeedReadStatus(currentFeedItem.channelId || currentChannelId, currentFeedItem.readerId, !currentFeedItem.isRead);
        handleCloseContextMenu();
    }
    const handleOpenInNewTab = () => {
        const {setFeedReadStatus, currentChannelId} = props
        setFeedReadStatus(currentFeedItem.channelId || currentChannelId, currentFeedItem.readerId, true);
        ChromeUtil.openTab(currentFeedItem.link, false)
        handleCloseContextMenu();
    }
    const handleChannelMenuClick = event => {
        setAnchorEl(event.currentTarget)
    };
    const handleChannelMenuClose = () => {
        setAnchorEl(null)
    };
    const handleMarkAllAsReadClick = () => {
        props.markAllAsRead(props.currentChannelId);
        handleChannelMenuClose();
    };
    const handleOpenAllUnreadClick = () => {
        props.confirmOpenAllUnread()
        handleChannelMenuClose()
    }
    const closeOpenAllUnreadConfirm = () => {
        props.toggleOpenAllUnreadConfirm()
    }
    const handleOpenAllUnread = () => {
        props.openAllUnread()
    }

    const headerHeight = 48
    const [{ headerTop }, set] = useSpring(() => ({headerTop: 0}))
    const onListScroll = (yDirection) => {
        if (yDirection === 1 || yDirection === -1) {
            const scrollDown = yDirection > 0 || feedList.current.scrollTop === 0
            setScrollDown(scrollDown)
            set({headerTop: scrollDown ? -1 * headerHeight : 0})
        }
    }
    const listScrollBind = useGesture({
        onWheel: ({direction: [, yDirection]}) => onListScroll(yDirection)
    })

    /*const handleHoverHeader = (index, isHover) => {
        if (index === stickyId) {
            set({headerTop: isHover ? 0 : -1 * headerHeight})  
        }
    }*/

    const channelMenuOpen = Boolean(anchorEl);

    return (
        <div className={classes.root} ref={feedList} {...listScrollBind()}>
            <Menu
                id="simple-menu"
                open={menuOpen}
                onClose={handleCloseContextMenu}
                anchorReference="anchorPosition"
                anchorPosition={{left: menuLeft, top: menuTop}}
                BackdropProps={{
                    onContextMenu: e => {
                        e.preventDefault();
                        handleCloseContextMenu();
                    },
                    invisible: true
                }}
                >
                <MenuItem onClick={handleToggleIsRead}>{currentFeedItem && currentFeedItem.isRead ? t('Mark as unread') : t('Mark as read')}</MenuItem>
                <MenuItem onClick={handleOpenInNewTab}>{t('Open in new tab')}</MenuItem>
            </Menu>
            <Menu
                id="channel-menu"
                anchorEl={anchorEl}
                open={channelMenuOpen}
                onClose={handleChannelMenuClose}
                >
                <MenuItem onClick={handleMarkAllAsReadClick}>
                    {t('Mark all as read')}
                </MenuItem>
                <MenuItem onClick={handleOpenAllUnreadClick}>
                    {t('Open all unread')}
                </MenuItem>
            </Menu>
            <animated.div className={classes.stickyHeader} ref={feedTitle}
                style={{
                    top: headerTop,
                    zIndex: 2,
                }}
            >
                <Typography variant="body2" className={ classes.feedTitle }>
                    <div className={ classes.feedInfoContainer }>
                        { renderChannelIcon(currentChannelId) }
                        { currentChannelId === ChannelFixedID.RECENT ? t('Recent Updates') : channels.find(c => c.id === currentChannelId).name }
                        <IconButton
                            className={classes.channelMenuButton}
                            aria-label="More"
                            aria-owns={channelMenuOpen ? 'long-menu' : undefined}
                            aria-haspopup="true"
                            onClick={handleChannelMenuClick}
                            >
                            <MoreVertIcon />
                        </IconButton>
                    </div>
                    <Divider />
                </Typography>
            </animated.div>
            { !props.feeds && <div class={classes.emptyMsg}>
                <Typography variant="caption">{t("No feeds loaded")}</Typography> 
            </div>}
            <List subheader={<li />} className={classes.list}>
                {[...arrangedFeeds].map(([index, value], i) => (
                    <li key={`dateStr-${index}`} className={classes.listSection}>
                        <ul className={classes.ul}>
                            <animated.div className={classes.stickyTitle}
                                style={{
                                    top: headerTop.interpolate((top) => top + headerHeight),
                                    zIndex: 1,
                                }}
                                // data-id={i}
                                // ref={arrangedGroups.current[i - 1]}
                                //onMouseEnter={() => handleHoverHeader(index, true)}
                                //onMouseLeave={() => handleHoverHeader(index, false)}
                            >
                                <ListItem className={classes.groupHeader}>
                                    <ListItemText primary={<Typography variant="body2">{t(value.dateString)}</Typography>}></ListItemText>
                                    <ListItemSecondaryAction>
                                        <IconButton className={classes.collapseIcon} onClick={e => handleSubheaderClick(index, e)}>
                                            {collapseStatus[index] ? <ExpandLess /> : <ExpandMore />}
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            </animated.div>
                            <Collapse in={!collapseStatus[index]} timeout={200} unmountOnExit>
                                {value.items.sort((a, b)=> (new Date(b.isoDate) - new Date(a.isoDate))).map(feed => (
                                    <ListItem 
                                        button  
                                        dense={true} 
                                        key={`item-${feed.readerId}`} 
                                        onClick={() => {
                                            !feed.isRead && props.setFeedReadStatus(feed.channelId || currentChannelId, feed.readerId, true);
                                            props.openFeed(feed.readerId);
                                            GA.sendAppView('ContentView');
                                        }}
                                        onMouseDown={e => {
                                            if (e.nativeEvent.button === 1) {
                                                !feed.isRead && props.setFeedReadStatus(feed.channelId || currentChannelId, feed.readerId, true);
                                                ChromeUtil.openTab(feed.link, false)
                                                e.preventDefault()
                                            }
                                        }}
                                        onContextMenu={e => handleItemContextMenu(e, feed)}
                                    >
                                        <ListItemText classes={{ primary: classNames({[classes.unRead]: !feed.isRead}) }} primary={feed.title} secondary={<div className={classes.itemSecondaryContainer}>{feed.channelId && renderChannelIcon(feed.channelId)} {getTime(feed.isoDate, index)}</div>} />
                                        
                                    </ListItem>
                                ))}
                            </Collapse>
                            <animated.div style={{
                                    top: !scrollDown ? -1 * headerHeight : 0,
                                    height: 1,
                                }} className={classes.sentinel} ref={sentinelTops.current[i]}/>
                            <animated.div style={{
                                    bottom: !scrollDown ? headerHeight : 0,
                                    height: 10,
                                }} className={classes.sentinel} ref={sentinelBottoms.current[i]}/>
                            <Divider light />
                        </ul>
                    </li>
                ))}
            </List>
            {props.allUnreadLinks &&
            <Dialog open={props.showOpenAllUnreadConfirm}>
                    <DialogTitle>{t("Confirm")}</DialogTitle>
                    <DialogContent>
                            <DialogContentText>
                            {t("This will open all", {unreadCount: props.allUnreadLinks.length})}
                            </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                            <Button onClick={closeOpenAllUnreadConfirm} color="primary">
                            {t("Cancel")}
                            </Button>
                            <Button onClick={handleOpenAllUnread} color="primary" autoFocus>
                            {t("OK")}
                            </Button>
                    </DialogActions>
            </Dialog>}
        </div>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(FeedList));