import React, { Component } from 'react';

class ChannelSelector extends Component {
    constructor(props) {
        super(props);
        this.state = {'value': this.props.selectedId};
    }
    renderChannels = () => {
        let channels = [];
        for (let i = 0; i < this.props.channel.length; i++) {
            channels.push(<option value={this.props.channel[i].id}>{this.props.channel[i].name}</option>);
        }
        return channels;
    }
    render () {
        return (
            <select onChange={event => {
                    this.props.onChange(event.target.value);
                    this.setState({'value': event.target.value});
                }} value={this.state.value}>
                {this.renderChannels()}
            </select>
        );
    }
}

export default ChannelSelector;