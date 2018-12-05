import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import { Spring } from 'react-spring'
//import { Gesture } from 'react-with-gesture'
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

import ChannelGestureListItem from './ChannelGestureListItem'

const mapStateToProps = state => {
  return {
    channels: state.channels
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
    position: 'absolute'
  },
  actionPanel: {
    position: 'absolute'
  }

})

const clamp = (n, min, max) => Math.max(Math.min(n, max), min)
function reinsert(arr, from, to) {
  const _arr = arr.slice(0)
  const val = _arr[from]
  _arr.splice(from, 1)
  _arr.splice(to, 0, val)
  return _arr
}

class ChannelGestureList extends React.Component {
  itemsCount = this.props.channels.length
  state = { mouseY: 0, topDeltaY: 0, isPressed: false, originalPosOfLastPressed: 0, order: range(this.itemsCount) }

  componentDidMount() {
    window.addEventListener('touchmove', this.handleTouchMove)
    window.addEventListener('touchend', this.handleMouseUp)
    window.addEventListener('mousemove', this.handleMouseMove)
    window.addEventListener('mouseup', this.handleMouseUp)
  }

  handleTouchStart = (key, pressLocation, e) => this.handleMouseDown(key, pressLocation, e.touches[0])
  handleTouchMove = e => e.preventDefault() || this.handleMouseMove(e.touches[0])
  handleMouseUp = () => this.setState({ isPressed: false, topDeltaY: 0 })
  handleMouseDown = (pos, pressY, { pageY }) =>
    this.setState({ topDeltaY: pageY - pressY, mouseY: pressY, isPressed: true, originalPosOfLastPressed: pos })
  handleMouseMove = ({ pageY }) => {
    const { isPressed, topDeltaY, order, originalPosOfLastPressed } = this.state
    if (isPressed) {
      const mouseY = pageY - topDeltaY
      const currentRow = clamp(Math.round(mouseY / 100), 0, this.itemsCount - 1)
      let newOrder = order
      if (currentRow !== order.indexOf(originalPosOfLastPressed))
        newOrder = reinsert(order, order.indexOf(originalPosOfLastPressed), currentRow)
      this.setState({ mouseY: mouseY, order: newOrder })
    }
  }

  render() {
    const { mouseY, isPressed, originalPosOfLastPressed, order } = this.state
    const { classes } = this.props
    console.log(order)
    return (
      <List className={classes.list}>
        {range(this.itemsCount).map(i => {
          const channel = this.props.channels[i]
          const active = originalPosOfLastPressed === i && isPressed
          const style = active
            ? { scale: 1, shadow: 16, y: mouseY }
            : { scale: 1, shadow: 0, y: order.indexOf(i) * 54 }
          return (
            <Spring immediate={name => active && name === 'y'} to={style} key={i}>
              {({ scale, shadow, y }) => (
                <div 
                className={classes.listItem}
                style={{
                  boxShadow: `rgba(0, 0, 0, 0.2) 0px ${shadow}px ${2 * shadow}px 0px`,
                  transform: `translate3d(0, ${y}px, 0) scale(${scale})`,
                  zIndex: i === originalPosOfLastPressed ? 99 : i,
                }}>
                  <ChannelGestureListItem onMouseDown={this.handleMouseDown.bind(null, i, y)}
                      onTouchStart={this.handleTouchStart.bind(null, i, y)} />
                </div>
              )}
            </Spring>
          )
        })}
      </List>
    )
  }
}

export default connect(mapStateToProps)(withStyles(styles)(ChannelGestureList))
