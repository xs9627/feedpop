import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import { Spring, animated } from 'react-spring'
import { withGesture } from 'react-with-gesture'
import range from 'lodash/range'
import { connect } from "react-redux"
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import ListItemText from '@material-ui/core/ListItemText';
import DragHandle from '@material-ui/icons/DragHandle';
import RemoveIcon from '@material-ui/icons/Remove';
import { withStyles } from '@material-ui/core/styles';


const mapStateToProps = state => {
    return {
        editMode: state.channelSelectorEditMode,
    }
}

const styles = theme => ({
    root: {
        height:500
    },
    list: {
        height: 500,
        maxHeight: 470,
        overflowY: 'auto',
        overflowX: 'hidden',
    },
    listItem: {
        backgroundColor: theme.palette.background.paper,
    },
    actionPanel: {
        position: 'absolute'
    }
})

class ChannelGestureListItem extends React.Component {
    render() {
        const { classes, xDelta, down, onMouseDown, onTouchStart, isSorting, editMode } = this.props
        return (
            <Spring native to={{ x: editMode ? 50 : !isSorting && down ? xDelta : 0 }}>
                {({ x }) => (
                    <div>
                        <div className={classes.actionPanel}>
                            <Typography onMouseDown={onMouseDown} onTouchStart={onTouchStart}>
                                <DragHandle fontSize="small" />
                            </Typography>
                            <Button variant="fab" mini color="secondary" aria-label="Add">
                                <RemoveIcon fontSize="small" />
                            </Button>
                        </div>
                        <animated.div style={{ transform: x.interpolate(x => `translate3d(${x}px,0,0)`) }}>
                            <ListItem className={classes.listItem}>
                                <ListItemText primary={'channel.name'} primaryTypographyProps={{noWrap: true}} />
                            </ListItem>
                        </animated.div>
                    </div> 
                )}
            </Spring>
        )
    }
}

export default connect(mapStateToProps)(withStyles(styles)(withGesture(ChannelGestureListItem)))
