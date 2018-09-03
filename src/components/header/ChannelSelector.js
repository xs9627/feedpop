import React, { Component } from 'react';
import './ChannelSelector.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'

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
            <div className={'Channel Menu-item' + (this.state.value == this.props.channel[i].id ? ' Selected' : '')} 
                onClick={() => this.changeChannel(this.props.channel[i].id)}>
                <FontAwesomeIcon className='Check-icon' icon={faCheck} />
                <span>{this.props.channel[i].name}</span>
            </div>
            );
        }
        return channels;
    }
    render () {
        return (
            <div className='Channel-selector'>
                {this.renderChannels()}
            </div>
        );
    }
}

export default ChannelSelector;