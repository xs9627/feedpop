import React, { Component }  from 'react'
import './FeedContent.css'

class FeedContent extends Component {
    createMarkup(htmlString) { 
        return {__html: htmlString}; 
    };
    render() {
        return (
            <div className={'Feed-content-panel ' + (this.props.showContent ? 'Active' : 'Inactive')}>
                <div>
                    <p>{this.props.feed.title}</p>
                    <button onClick={() => this.props.onCloseClick()}>Close</button>
                </div>
                <div className="Feed-content-container" dangerouslySetInnerHTML={this.createMarkup(this.props.feed.content)} />
            </div>
        );
    }
}

export default FeedContent;