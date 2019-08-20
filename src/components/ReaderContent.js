import React, { useState, useEffect } from 'react';
import FeedList from './FeedList';
import FeedContent from './FeedContent';
import { connect } from "react-redux";

const mapStateToProps = state => {
    return {
        showContent: state.showContent,
    };
};

const ReaderContent = props => {
    return ([
            <FeedList />,
            props.showContent && <FeedContent />
    ]);
};

export default connect(mapStateToProps)(ReaderContent);