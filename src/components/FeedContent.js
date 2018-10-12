import React, { Component }  from 'react'
import { connect } from "react-redux";
import { withStyles } from '@material-ui/core/styles';
import ChromeUtil from '../utils/ChromeUtil';
import { closeFeed } from '../actions/index'

import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
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
    title: {
        flex: '0 1 auto',
        zIndex: '2',
    },
    content: {
        flex: '1 1 auto',
        overflow: 'auto',
        padding: '0 16px',
        '& *': {
            color: theme.palette.text.primary + ' !important'
        },
        background: 'inherit',
        fontFamily: 'Roboto',
        fontSize: 13,
        lineHeight: '20px',
        '& img': {
            maxWidth: '100%'
        },
        '& span': {
            wordBreak: 'break-word'
        }
    },
    close: {
        padding: theme.spacing.unit / 2,
    },
});

class FeedContent extends Component {
    state = {};
    createMarkup = () => {
        const { feed } = this.props;
        const content = feed.content ? feed.content : feed['content:encoded']; 
        return {__html: content}; 
    }
    handleClick = e => {
        if (this.node.contains(e.target) && e.target.href !== undefined) {
            ChromeUtil.openTab(e.target.href);
        }
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
                <Paper className={classes.title}>
                    <Grid container>
                        <Grid item>
                            <Typography variant="body2">
                                {this.props.feed.title}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <IconButton key="close" className={classes.close} onClick={this.props.closeFeed}>
                                <CloseIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                </Paper>
                <div className={classes.content} dangerouslySetInnerHTML={this.state.contentHtml} />
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(FeedContent));