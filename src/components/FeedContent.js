import React, { Component }  from 'react'
import './FeedContent.scss'

class FeedContent extends Component {
    createMarkup(htmlString) { 
        return {__html: htmlString}; 
    };
    render() {
        return (
            <div className='Feed-content-panel'>
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