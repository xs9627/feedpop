import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

const styles = theme => ({
    root: {
      backgroundColor: theme.palette.background.paper,
    },
});

class ChannelSelector extends Component {
    constructor(props) {
        super(props);
        this.state = {'value': this.props.selectedId};
    }
    changeChannel = channelId => {
        this.props.onChange(channelId);
        this.setState({'value': channelId});
    }
    renderChannels = () => {
        let channels = [];
        for (let i = 0; i < this.props.channel.length; i++) {
            channels.push(
            <ListItem button
                selected={this.state.value == this.props.channel[i].id}
                onClick={() => this.changeChannel(this.props.channel[i].id)}>
                <ListItemText primary={this.props.channel[i].name} />
            </ListItem>
            );
        }
        return channels;
    }
    render () {
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                <List component="nav">
                    {this.renderChannels()}
                </List>
            </div>
        );
    }
}

export default withStyles(styles)(ChannelSelector);