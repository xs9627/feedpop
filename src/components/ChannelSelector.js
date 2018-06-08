import React from 'react';

function ChannelSelector(props) {
    let channels = [];
    for (let i = 0; i < props.channel.length; i++) {
        channels.push(<option value={props.channel[i].url}>{props.channel[i].name}</option>);
    }
    return (
        <select onChange={event => props.onChange(event.target.value)}>
            {channels}
        </select>
    );
}

export default ChannelSelector;