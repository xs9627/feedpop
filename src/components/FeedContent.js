import React, { Component }  from 'react'
import { connect } from "react-redux";
import './FeedContent.scss'
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
            <div className='Feed-content-panel' ref={node => this.node = node}>
                <div>
                    <p>{this.props.feed.title}</p>
                    <button onClick={ this.props.closeFeed }>Close</button>
                </div>
                <div className="Feed-content-container" dangerouslySetInnerHTML={this.createMarkup(this.props.feed)} />
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(FeedContent);