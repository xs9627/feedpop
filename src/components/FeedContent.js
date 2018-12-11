import React, { Component }  from 'react'
import { connect } from "react-redux";
import { withStyles } from '@material-ui/core/styles';
import ChromeUtil from '../utils/ChromeUtil';
import { closeFeed, scrollFeedContent } from '../actions/index'

import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import OpenIcon from '@material-ui/icons/OpenInBrowser';
import MoreIcon from '@material-ui/icons/MoreHoriz';
import ShareVariantIcon from '@material-ui/icons/Share';
import Tooltip from '@material-ui/core/Tooltip';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { withNamespaces } from 'react-i18next';

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

const styles = theme => ({
    root: {
        width: '100%',
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
        background: 'inherit',
        fontFamily: 'Roboto',
        fontSize: 13,
        lineHeight: '20px',
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
});

class FeedContent extends Component {
    state = { feed: {} };
    createMarkup = () => {
        setTimeout(() => {
            const { feed } = this.props;
            const content = feed['content:encoded'] ? feed['content:encoded'] : feed.content;
            this.setState({ feed, contentHtml:  {__html: content} }, () => {
                if (this.props.feedContentTop > 0) {
                    const imgList = this.contentContainer.getElementsByTagName('img');
                    if (imgList.length > 0) {
                        let count = imgList.length;
                        const countImg = () => {
                            count--;
                            if (count === 0) {
                                this.contentContainer.scrollTop = this.props.feedContentTop;
                            }
                        }
                        for (let img of imgList) {
                            img.onload = countImg;
                            img.onerror = countImg;
                        }
                    } else {
                        this.contentContainer.scrollTop = this.props.feedContentTop;
                    }
                }
            });
        }, 0);
    }
    handleClick = e => {
        if (this.node.contains(e.target) && e.target.href !== undefined) {
            ChromeUtil.openTab(e.target.href);
        }
    }
    openFeed = url => {
        ChromeUtil.openTab(url);
    }
    trackScrolling = (e) => {
        const top  = e.target.scrollTop;
        setTimeout(() => {
            if (this.contentContainer.scrollTop === top) {
                this.props.scrollFeedContent(top);
            }
        }, 500);
    }
    componentDidMount = () => {
        this.createMarkup();
        document.addEventListener('click', this.handleClick);
        this.contentContainer.addEventListener('scroll', this.trackScrolling);
    }
    componentWillUnmount = () => {
        document.removeEventListener('click', this.handleClick);
        this.contentContainer.removeEventListener('scroll', this.trackScrolling);
    }
    componentWillReceiveProps(newProps) {
        if (newProps.feed.readerId && this.readerId != newProps.feed.readerId) {
            this.createMarkup();
            this.readerId = newProps.feed.readerId;
        }
    }
    render() {
        const { classes, t } = this.props;
        const { feed } = this.state;
        return (
            <div className={classes.root} ref={node => this.node = node}>
                <Paper square={true} className={classes.actionContainer}>
                    <Grid container wrap="nowrap">
                        <Grid item xs zeroMinWidth>
                            <IconButton key="close" className={classes.icon} onClick={this.props.closeFeed}>
                                <ArrowBackIcon />
                            </IconButton>
                        </Grid>
                        <Grid item>
                            <Tooltip title={t("Open in new tab")} enterDelay={100}>
                                <IconButton key="open" className={classes.icon} onClick={ () => this.openFeed(this.props.feed.link)}>
                                    <OpenIcon />
                                </IconButton>
                            </Tooltip>
                            {/* <IconButton key="more" className={classes.icon} onClick={this.props.closeFeed}>
                                <MoreIcon />
                            </IconButton> */}
                        </Grid>
                    </Grid>
                </Paper>
                { feed.deleted && <div class={classes.emptyMsg}>
                    <Typography variant="caption">{t("Feed has been deleted")}</Typography> 
                </div>}
                <div className={ classes.contentContainer } ref={node => this.contentContainer = node}>
                    <Grid container wrap="nowrap" direction="column">
                        <Grid item xs={12}>
                            <Typography variant="h6">
                                {feed.title}
                            </Typography>
                        </Grid>
                        <Grid item container>
                            <Grid item xs>
                                <Typography variant="subtitle2">
                                    {feed.isoDate ? (new Date(feed.isoDate)).toLocaleString() : null}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="subtitle2">
                                    {feed.creator}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Typography>
                        <div className={classes.content} dangerouslySetInnerHTML={this.state.contentHtml} />
                    </Typography>
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(withNamespaces()(FeedContent)));