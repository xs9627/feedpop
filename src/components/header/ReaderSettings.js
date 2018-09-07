import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Switch from '@material-ui/core/Switch';

const styles = theme => ({
    root: {
      backgroundColor: theme.palette.background.paper,
    },
});

class Settings extends Component {
    state = {
        darkTheme: this.props.config.darkTheme,
    }

    handleChangeTheme = event => {
        let darkTheme = event.target.checked;
        this.setState({ darkTheme: darkTheme });
        this.props.changeTheme(darkTheme);
    }

    render () {
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                <List component="nav">
                    <ListItem>
                        <ListItemText primary="Dark Theme"></ListItemText>
                        <ListItemSecondaryAction>
                        <Switch
                            checked={this.state.darkTheme}
                            onChange={this.handleChangeTheme}
                            value="checkedB"
                            color="primary"
                        />
                        </ListItemSecondaryAction>
                    </ListItem>
                </List>
            </div>
        );
    }
}

export default withStyles(styles)(Settings);