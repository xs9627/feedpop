import React, { Component }  from 'react'
import { connect } from "react-redux";
import { withStyles } from '@material-ui/core/styles';
import ChromeUtil from '../utils/ChromeUtil';
import { closeFeed } from '../actions/index'

import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import OpenIcon from '@material-ui/icons/OpenInBrowser';
import MoreIcon from '@material-ui/icons/MoreHoriz';
import ShareVariantIcon from '@material-ui/icons/Share';
import Tooltip from '@material-ui/core/Tooltip';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';

const mapStateToProps = state => {
    return {
        feed: state.feeds.find(f => f.id === state.currentChannelId).feed.items.find(i => i.readerId === state.currentFeedItemId) || {},
    };
};
  
const mapDispatchToProps = dispatch => {
    return {
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
        zIndex: '2',
        paddingLeft: theme.spacing.unit * 2,
        paddingRight: theme.spacing.unit * 2,
        paddingTop: theme.spacing.unit,
        paddingBottom: theme.spacing.unit,
    },
    contentContainer: {
        flex: '1 1 auto',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '0 16px',
    },
    content: {
        '& *': {
            color: 'inherit !important'
        },
        background: 'inherit',
        fontFamily: 'Roboto',
        fontSize: 13,
        lineHeight: '20px',
        '& img': {
            maxWidth: '100%',
            height: 'auto',
        },
        '& span': {
            wordBreak: 'break-word'
        }
    },
    icon: {
        padding: theme.spacing.unit / 2,
    },
});

class FeedContent extends Component {
    state = {};
    createMarkup = () => {
        const { feed } = this.props;
        const content = feed['content:encoded'] ? feed['content:encoded'] : feed.content; 
        return {__html: content}; 
    }
    handleClick = e => {
        if (this.node.contains(e.target) && e.target.href !== undefined) {
            ChromeUtil.openTab(e.target.href);
        }
    }
    openFeed = url => {
        ChromeUtil.openTab(url);
    }
    componentDidMount = () => {
        setTimeout(() => {
            this.setState({ contentHtml: this.createMarkup() });
        }, 0);
        
        document.addEventListener('click', this.handleClick);
    }
    componentWillUnmount = () => {
        document.removeEventListener('click', this.handleClick);
    }
    render() {
        const { classes } = this.props;
        return (
            <div className={classes.root} ref={node => this.node = node}>
                <Paper className={classes.actionContainer}>
                    <Grid container wrap="nowrap">
                        <Grid item xs zeroMinWidth>
                            <IconButton key="close" className={classes.icon} onClick={this.props.closeFeed}>
                                <ArrowBackIcon />
                            </IconButton>
                        </Grid>
                        <Grid item>
                            <Tooltip title="Open in new tab">
                                <IconButton key="open" className={classes.icon} onClick={ () => this.openFeed(this.props.feed.link)}>
                                    <OpenIcon />
                                </IconButton>
                            </Tooltip>
                            <IconButton key="more" className={classes.icon} onClick={this.props.closeFeed}>
                                <MoreIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                </Paper>
                <div className={ classes.contentContainer }>
                    <Grid container wrap="nowrap" direction="column">
                        <Grid item xs={12}>
                            <Typography variant="h6">
                                {this.props.feed.title}
                            </Typography>
                        </Grid>
                        <Grid item container>
                            <Grid item xs>
                                <Typography variant="subtitle2">
                                    {this.props.feed.isoDate ? (new Date(this.props.feed.isoDate)).toLocaleString() : null}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="subtitle2">
                                    {this.props.feed.creator}
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

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(FeedContent));