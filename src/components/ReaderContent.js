import React from 'react';
import FeedList from './FeedList';
import FeedContent from './FeedContent';
import { connect } from "react-redux";
import Dialog from '@material-ui/core/Dialog';

const mapStateToProps = state => {
    return {
        showContent: state.showContent,
    };
};

const ReaderContent = props => {
    return ([
            <FeedList />,
            <Dialog fullScreen open={props.showContent}>
                <FeedContent />
            </Dialog>,
            // props.showContent && <FeedContent />
    ]);
};

export default connect(mapStateToProps)(ReaderContent);