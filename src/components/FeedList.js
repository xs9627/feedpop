import React, { Component }  from 'react';


class FeedList extends Component {
    render() {
      let feeds = [];
      let self = this;
      this.props.feeds.forEach(function(item) {
        feeds.push(<li onClick={() => self.props.onListClick(item)}>{item.title}</li>)
      });
      return (
        <ol>
          {feeds}
        </ol>
      );
    }
}

export default FeedList;