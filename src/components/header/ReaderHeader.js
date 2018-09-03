import React, { Component } from 'react';
import './ReaderHeader.scss';
import ChannelSelector from './ChannelSelector';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faList, faSyncAlt, faEdit, faCog } from '@fortawesome/free-solid-svg-icons'

class ReaderHeader extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    setHeaderContent = (contentName) => {
        if (!this.state.showContent || this.currentContentName != contentName) {
            switch(contentName){
                case 'List': 
                    this.headerContent = (
                        <ChannelSelector
                            selectedId={this.props.currentChannelId}
                            channel={this.props.channel}
                            onChange={this.props.fetchFeed} />
                    );
                    break;
                case 'Update': 
                    this.headerContent = <div>Updating</div>;
                    this.props.updateCurrentChannel().then(() => {
                        if (this.currentContentName == 'Update') {
                            this.setState({ showContent: false });
                        }
                    });
                    break;
                default:
                    this.headerContent = null;
            };
            this.setState({ showContent: true });
        } else {
            this.setState({ showContent: false });
        }
        this.currentContentName = contentName;
    }
    render () {
        return (
            <div className='ReaderHeader'>
                <div className={'Action-panel' + (this.state.showContent ? ' Show-content' : '')}>
                    <div className={'Action List' + (this.currentContentName == 'List' ? ' Active' : '')} onClick={() => this.setHeaderContent('List')}>
                        <FontAwesomeIcon className='Icon' icon={faList} />
                        <label>List</label>
                    </div>
                    <div  className={'Action Update' + (this.currentContentName == 'Update' ? ' Active' : '')} onClick={() => this.setHeaderContent('Update')}>
                        <FontAwesomeIcon className='Icon' icon={faSyncAlt} />
                        <label>Update</label>
                    </div>
                    <div className={'Action Edit' + (this.currentContentName == 'Edit' ? ' Active' : '')} onClick={() => this.setHeaderContent('Edit')}>
                        <FontAwesomeIcon className='Icon' icon={faEdit} />
                        <label>Edit</label>
                    </div>
                    <div className={'Action Settings' + (this.currentContentName == 'Settings' ? ' Active' : '')} onClick={() => this.setHeaderContent('Settings')}>
                        <FontAwesomeIcon className='Icon' icon={faCog} />
                        <label>Settings</label>
                    </div>
                </div>
                <div>
                    {this.state.showContent ? this.headerContent : ''}
                </div>
            </div>
        );
    }
}

export default ReaderHeader;