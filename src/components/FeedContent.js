import React, { useState, useEffect, useRef }  from 'react'
import { connect } from "react-redux";
import { makeStyles } from '@material-ui/core/styles';
import ChromeUtil from '../utils/ChromeUtil';
import { closeFeed, scrollFeedContent } from '../actions/index'

import { useGesture } from 'react-use-gesture'
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import OpenIcon from '@material-ui/icons/OpenInBrowser';
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
    };
};
  
const mapDispatchToProps = dispatch => {
    return {
        scrollFeedContent: top => dispatch(scrollFeedContent(top)),
        closeFeed: () => dispatch(closeFeed()),
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
    }
}));

const FeedContent = props => {
    const openFeed = url => {
        ChromeUtil.openTab(url);
    }
    
    const { feed, t, feedContentTop, scrollFeedContent } = props;
    const classes = useStyles(props);
    const contentContainer = useRef(null)
    const contentHtml = {__html: feed['content:encoded'] ? feed['content:encoded'] : feed.content}
    const [lastFeedContentTop] = useState(feedContentTop)

    useEffect(() => {
        const curContentContainer = contentContainer.current
        if (lastFeedContentTop > 0) {
            const imgList = curContentContainer.getElementsByTagName('img');
            if (imgList.length > 0) {
                let count = imgList.length;
                const countImg = () => {
                    count--;
                    if (count === 0) {
                        curContentContainer.scrollTop = lastFeedContentTop;
                    }
                }
                for (let i = 0; i < imgList.length; i++) {
                    imgList[i].onload = countImg;
                    imgList[i].onerror = countImg;
                }
            } else {
                curContentContainer.scrollTop = lastFeedContentTop;
            }
        }

        const trackScrolling = (e) => {
            const top  = e.target.scrollTop;
            setTimeout(() => {
                if (curContentContainer.scrollTop === top) {
                    scrollFeedContent(top);
                }
            }, 500);
        }

        const handleClick = e => {
            if (curContentContainer.contains(e.target) && e.target.href !== undefined) {
                ChromeUtil.openTab(e.target.href);
            }
        }

        document.addEventListener('click', handleClick);
        curContentContainer.addEventListener('scroll', trackScrolling);
        return () => {
            document.removeEventListener('click', handleClick);
            curContentContainer.removeEventListener('scroll', trackScrolling);
        }
    }, [lastFeedContentTop, scrollFeedContent])

    const onBackGesture = (vx) => {
        console.log(`${vx}`)
        if (vx < -1.6) {
            props.closeFeed()
        }
    }

    const bind = useGesture({
        onDrag: ({ vxvy: [vx] }) => onBackGesture(-vx),
        onWheel: ({ vxvy: [vx] }) => onBackGesture(vx)
    })

    return (
        <div {...bind()} className={classes.root}>
            <Paper square={true} className={classes.actionContainer}>
                <Grid container wrap="nowrap">
                    <Grid item xs zeroMinWidth>
                        <IconButton key="close" className={classes.icon} onClick={props.closeFeed}>
                            <ArrowBackIcon />
                        </IconButton>
                    </Grid>
                    <Grid item>
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
                    </Grid>
                </Grid>
            </Paper>
            <div className={ classes.contentContainer } ref={contentContainer}>
                { feed.deleted ? <div class={classes.emptyMsg}>
                    <Typography variant="caption">{t("Feed has been deleted")}</Typography> 
                </div> :
                <React.Fragment>
                    <Grid className={classes.feedInfo} container wrap="nowrap" direction="column">
                        <Grid item xs={12}>
                            <Typography variant="h6">
                                {feed.title}
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
        </div>
    );
}

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(FeedContent));