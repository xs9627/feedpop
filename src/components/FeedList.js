import React, { Component }  from 'react';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

const styles = theme => ({
  root: {
    backgroundColor: theme.palette.background.paper,
  },
  listSection: {
    backgroundColor: 'inherit',
  },
  ul: {
    backgroundColor: 'inherit',
    padding: 0,
  },
});

class FeedList extends Component {
  state = {
    collapseStatus: {},
  }
  arrangeFeeds = feedObj => {
    if (feedObj) {
      return feedObj.feed.items.reduce((r, a) => {
        let dateStr = new Date(a.isoDate).toLocaleDateString();
        r[dateStr] = r[dateStr] || [];
        r[dateStr].push(a);
        return r;
      }, Object.create(null));
    } else {
      return {};
    }
  }
  initCollapseStatus = feedObj => {
    if (feedObj && feedObj.id != this.state.feedObjId) {
      this.setState({ feedObjId: feedObj.id, collapseStatus: {} });
    }
  }
  handleSubheaderClick = dateStr => {
    const collapseStatus = this.state.collapseStatus;
    collapseStatus[dateStr] = !collapseStatus[dateStr];
    this.setState({ collapseStatus: collapseStatus });
  }
  render() {
    const { classes, feedObj, onListClick } = this.props;
    const arranged = this.arrangeFeeds(feedObj);
    this.initCollapseStatus(feedObj);
    return (
      <List className={classes.root} subheader={<li />}>
      {Object.keys(arranged).map(dateStr => (
        <li key={`dateStr-${dateStr}`} className={classes.listSection}>
          <ul className={classes.ul}>
            <ListItem>
              <ListItemText primary={dateStr}></ListItemText>
                <ListItemSecondaryAction>
                  <IconButton onClick={() => this.handleSubheaderClick(dateStr)}>
                    {this.state.collapseStatus[dateStr] ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            <Collapse in={!this.state.collapseStatus[dateStr]} timeout="auto" unmountOnExit>
              {arranged[dateStr].map(feed => (
                <ListItem button dense={true} key={`item-${feed.isoDate}`} onClick={() => onListClick(feed)}>
                  <ListItemText primary={feed.title} />
                </ListItem>
              ))}
            </Collapse>
          </ul>
        </li>
      ))}
    </List>
    );
  }
}

export default withStyles(styles)(FeedList);