import React, { useEffect, useRef }  from 'react'
import { connect } from "react-redux";
import { makeStyles } from '@material-ui/core/styles';
import ChromeUtil from '../utils/ChromeUtil';
import Utils from '../utils/Utils';
import { closeFeed, setSettins } from '../actions/index'

import { useGesture } from 'react-use-gesture'
import { useSpring, animated } from 'react-spring'
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import OpenIcon from '@material-ui/icons/OpenInBrowser';
import LaunchIcon from '@material-ui/icons/Launch';
import {ArrowExpand as ArrowExpandIcon} from 'mdi-material-ui';
import {ArrowCollapse as ArrowCollapseIcon} from 'mdi-material-ui';
import {Qrcode as QRCodeIcon} from 'mdi-material-ui';
import Tooltip from '@material-ui/core/Tooltip';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import { withTranslation } from 'react-i18next';

import QRCode from 'qrcode.react';

const mapStateToProps = state => {
    return {
        feed: (state.currentFeeds && state.currentFeeds.items.find(i => i.readerId === state.currentFeedItemId)) || { deleted: true },
        feedContentTop: state.feedContentTop,
        expandView: state.expandView,
    };
};
  
const mapDispatchToProps = dispatch => {
    return {
        closeFeed: () => {
            ChromeUtil.sendMessageToBackground({key: 'setFeedContentTop', value: 0})
            dispatch(closeFeed())
        },
        setSettins: settings => dispatch(setSettins(settings)),
    };
};

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        height: '100%',
        display: 'flex',
        'flex-flow': 'column',
    },
    actionContainer: {
        flex: '0 1 auto',
        paddingLeft: theme.spacing.unit * 2,
        paddingRight: theme.spacing.unit * 2,
        paddingTop: theme.spacing.unit,
        paddingBottom: theme.spacing.unit,
        zIndex: theme.zIndex.appBar,
    },
    contentContainer: {
        flex: '1 1 auto',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
    },
    content: {
        '& *': {
            color: theme.palette.type === 'dark' ? 'inherit !important' : 'auto',
        },
        marginTop: theme.spacing.unit,
        background: 'inherit',
        fontFamily: 'Roboto',
        fontSize: 'inherit',
        lineHeight: 'inherit',
        '& img': {
            maxWidth: '100% !important',
            height: 'auto !important',
        },
        '& span': {
            wordBreak: 'break-word'
        }
    },
    icon: {
        padding: theme.spacing.unit / 2,
    },
    emptyMsg: {
        textAlign: 'center',
        margin: theme.spacing.unit * 2,
        opacity: .5,
    },
    feedInfo: {
        marginBottom: theme.spacing.unit * 2,
    },
    qrCodeTip: {
        display: 'flex',
        padding: `${theme.spacing.unit}px`,
    },
    gestureClose: {
        position: 'absolute',
        top: 'calc(50% - 25px)',
        left: -50,
        display: 'inline-flex',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 12,
    },
    headerTitle: {
        minWidth: 0
    }
}));

const FeedContent = props => {
    console.log('renderd')
    const openFeed = url => {
        ChromeUtil.openTab(url);
    }
    
    const { feed, t, feedContentTop, feed: {link} } = props;
    const classes = useStyles(props);
    const contentContainer = useRef(null)
    const contentHtml = {__html: feed['content:encoded'] ? feed['content:encoded'] : feed.content}

    useEffect(() => {
        const curContentContainer = contentContainer.current
        if (feedContentTop > 0 && feedContentTop !== curContentContainer.scrollTop) {
            const imgList = curContentContainer.getElementsByTagName('img');
            if (imgList.length > 0) {
                let count = imgList.length;
                const countImg = () => {
                    count--;
                    if (count === 0 && curContentContainer.scrollTop === 0) {
                        curContentContainer.scrollTop = feedContentTop;
                    }
                }
                for (let i = 0; i < imgList.length; i++) {
                    imgList[i].onload = countImg;
                    imgList[i].onerror = countImg;
                }
                return () => {
                    for (let item of imgList) {
                        item.onload = null
                        item.onerror = null
                    }
                }
            } else {
                curContentContainer.scrollTop = feedContentTop;
            }
        }
    }, [feedContentTop])

    useEffect(() => {
        const curContentContainer = contentContainer.current
        const handleClick = e => {
            if (curContentContainer.contains(e.target) && e.target.href !== undefined) {
                let url = e.target.href
                if (e.target.protocol === 'chrome-extension:') {
                    const linkUrl = new URL(link)
                    url = url.replace(e.target.origin, linkUrl.origin)
                }
                ChromeUtil.openTab(url)
            }
        }
        document.addEventListener('click', handleClick);
        return () => {
            document.removeEventListener('click', handleClick);
        }
    }, [link])

    const [{ x, opacity }, api] = useSpring(() => ({ x: 0, opacity: 0 }))
    let xMove = 0
    const onBackGesture = (xDelta, xDirection, active) => {
        const backTriggerX = 100, xDirectionThreshold = -.8
        if(xDirection <= xDirectionThreshold) {
            xMove += -xDelta
            if (xMove >= backTriggerX) {
                xMove = backTriggerX
            }
            api.start({x: xMove, opacity: xMove / backTriggerX * (xMove < backTriggerX / 2 ? .5 : 1)})
            if (xMove === backTriggerX) {
                props.closeFeed()
            }
        }
        if (!active) {
            xMove = 0
            api.start({x: 0})
        }
    }
    const bind = useGesture({
        //onDrag: ({ xy: [x], vxvy: [vx] }) => onBackGesture(x, -vx),
        onWheel: ({ delta: [xDelta], direction: [xDirection], active }) => onBackGesture(xDelta, xDirection, active)
    })

    const getTitleOpacity = (top) => {
        const showTitleTop = 50
        const calTop = top - showTitleTop
        const ttitleOpacity = calTop > 0 ? 1 : 0
        return {titleOpacity: ttitleOpacity, titleCursor: ttitleOpacity === 1 ? 'auto': 'default'}
    }
    const [{ titleOpacity, titleCursor }, contentScrollApi] = useSpring(() => (getTitleOpacity(0)))
    const onContentScroll = (top) => {
        contentScrollApi.start(getTitleOpacity(top))
    }
    const contentContainerBind = useGesture({
        onScroll: ({xy: [, y], offset: [, yOffSet], vxvy: [, vy], distance}) => {
            onContentScroll(y)
            if (vy === 0 && distance > 10) {
                ChromeUtil.sendMessageToBackground({key: 'setFeedContentTop', value: yOffSet})
            }
        }
    })

    return (
        <div {...bind()} className={classes.root}>
            <Paper square={true} className={classes.actionContainer}>
                <Grid container wrap="nowrap">
                    <Grid item xs zeroMinWidth>
                        <Grid container>
                            <Grid item>
                                <IconButton key="close" className={classes.icon} onClick={props.closeFeed}>
                                    <ArrowBackIcon />
                                </IconButton>
                            </Grid>
                            <Grid item xs zeroMinWidth container alignItems="center">
                                <animated.div className={classes.headerTitle} style={{
                                    opacity: titleOpacity,
                                    cursor: titleCursor,
                                }}>
                                    <Tooltip title={Utils.replaceXmlCharacter(feed.title)} enterDelay={300} PopperProps={{disablePortal: true}}>
                                        <Typography noWrap>
                                            {Utils.replaceXmlCharacter(feed.title)}
                                        </Typography>
                                    </Tooltip>
                                </animated.div>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item>
                        <Tooltip title={t("Pop out to a new window")}>
                            <IconButton key="launch" className={classes.icon} onClick={() => ChromeUtil.popOut(props.expandView)}>
                                <LaunchIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip classes={{tooltip: classes.qrCodeTip}} title={
                            <React.Fragment>
                                <QRCode value={props.feed.link} />
                            </React.Fragment>
                        }>
                            <IconButton key="more" className={classes.icon}>
                                <QRCodeIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t("Open in new tab")}>
                            <IconButton key="open" className={classes.icon} onClick={ () => openFeed(props.feed.link)}>
                                <OpenIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={!props.expandView ? t("Enter expand view") : t("Exit expand view")}>
                            <IconButton key="open" className={classes.icon} onClick={() => {
                                const expandView = !props.expandView
                                props.setSettins({ expandView })
                                ChromeUtil.updatePopoutSize(expandView)
                            }}>
                                {!props.expandView ? <ArrowExpandIcon /> : <ArrowCollapseIcon />}
                            </IconButton>
                        </Tooltip>
                    </Grid>
                </Grid>
            </Paper>
            <div className={ classes.contentContainer } ref={contentContainer} {...contentContainerBind()}>
                { feed.deleted ? <div class={classes.emptyMsg}>
                    <Typography variant="caption">{t("Feed has been deleted")}</Typography> 
                </div> :
                <React.Fragment>
                    <Grid className={classes.feedInfo} container wrap="nowrap" direction="column">
                        <Grid item xs={12}>
                            <Typography variant="h6">
                                {Utils.replaceXmlCharacter(feed.title)}
                            </Typography>
                        </Grid>
                        <Grid item container>
                            <Grid item xs>
                                <Typography variant="subtitle2" color="textSecondary">
                                    {feed.isoDate ? (new Date(feed.isoDate)).toLocaleString() : null}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="subtitle2" color="textSecondary">
                                    {feed.creator}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Divider />
                    <Typography variant="body2">
                        <div className={classes.content} dangerouslySetInnerHTML={contentHtml} />
                    </Typography>
                </React.Fragment> }
            </div>
            <animated.div className={classes.gestureClose}
                style={{
                    transform: x.to((x) => `translate3D(${x}px, 0, 0)`),
                    opacity
                }}
            >
                <ArrowBackIcon />
            </animated.div>
            
        </div>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(FeedContent));