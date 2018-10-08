import React, { Component }  from 'react'
import { connect } from "react-redux";
import { withStyles } from '@material-ui/core/styles';
import ChromeUtil from '../utils/ChromeUtil';
import { closeFeed } from '../actions/index'

const mapStateToProps = state => {
    return {
        feed: state.currentFeedItem,
    };
};
  
const mapDispatchToProps = dispatch => {
    return {
        closeFeed: () => dispatch(closeFeed()),
    };
};

const styles = theme => ({
    root: {
        '& *': {
            color: theme.palette.text.primary + ' !important'
        },
        padding: '0 16px',
        background: 'inherit',
        fontFamily: 'Roboto',
        fontSize: 13,
        lineHeight: '20px',
    },
    content: {
        width: '100%',
        '& img': {
            maxWidth: '100%'
        },
        '& span': {
            wordBreak: 'break-word'
        }
    }
});

class FeedContent extends Component {
    createMarkup = feed => {
        const content = feed.content ? feed.content : feed['content:encoded']; 
        return {__html: content}; 
    }
    handleClick = e => {
        if (this.node.contains(e.target) && e.target.href !== undefined) {
            ChromeUtil.openTab(e.target.href);
        }
    }
    componentDidMount = () => {
        document.addEventListener('click', this.handleClick);
    }
    componentWillUnmount = () => {
        document.removeEventListener('click', this.handleClick);
    }
    render() {
        return (
            <div className={this.props.classes.root} ref={node => this.node = node}>
                <div>
                    <p>{this.props.feed.title}</p>
                    <button onClick={ this.props.closeFeed }>Close</button>
                </div>
                <div className={this.props.classes.content} dangerouslySetInnerHTML={this.createMarkup(this.props.feed)} />
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(FeedContent));