import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { syncState, selectChannel, setDefaultState, setupBackgroundConnection } from "../actions/index"
import './Reader.scss';
import FeedList from './FeedList';
import FeedContent from './FeedContent';
import ReaderHeader from './header/ReaderHeader';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide';
import blue from '@material-ui/core/colors/blue';
import yellow from '@material-ui/core/colors/yellow';

const mapStateToProps = state => {
    return {
        channels: state.channels,
        showContent: state.showContent,
        theme: state.settings.theme,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        syncState: () => dispatch(syncState()),
        selectChannel: id => dispatch(selectChannel(id)),
        setDefaultState: () => dispatch(setDefaultState()),
        setupBackgroundConnection: () => dispatch(setupBackgroundConnection()),
    };
};

// function Transition(props) {
//     return <Slide direction="up" {...props} />;
// }

class Reader extends Component {
    constructor(props) {
        super(props);
        this.props.syncState().then(state => {
            const lastActiveSpan = new Date() - new Date(state.lastActiveTime);
            console.log(lastActiveSpan);  
            if (lastActiveSpan > .1 * 60 * 1000) {
                this.props.setDefaultState();
            }
            return state;
        });
        this.props.setupBackgroundConnection();
    }

    render() {
        const isDarkTheme = this.props.theme === "dark";
        return (
            <MuiThemeProvider theme={createMuiTheme({
                palette: {
                    primary: !isDarkTheme ? blue : yellow,
                    type: !isDarkTheme ? 'light' : 'dark',
                },
                // overrides: {
                //     MuiBottomNavigation: {
                //         root: {
                //             height: 46,
                //         }
                //     },
                //     MuiBottomNavigationAction: {
                //         root: {
                //             height: 46,
                //             '& $svg': {
                //                 fontSize: 16,
                //             }
                //         },
                //         label: {
                //             '&$selected': {
                //                 fontSize: 12
                //             }
                //         },
                //     },
                // },
            })}>
                <div className='Reader'>
                    <div className="Reader-header">
                        <ReaderHeader />
                    </div>
                    <div className="Reader-content ">
                        <div className='Reader-list'>
                            <FeedList />
                        </div>
                        <Dialog
                            fullScreen
                            open={this.props.showContent}
                            //TransitionComponent={Transition}
                        >
                            <FeedContent />
                        </Dialog>
                    </div>
                </div>
            </MuiThemeProvider>
        );
    }
}

Reader.propTypes = {
    render: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(Reader);
