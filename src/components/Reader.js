import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { syncState, setDefaultState, setupBackgroundConnection, setCurrentFeeds } from "../actions/index"
import FeedList from './FeedList';
import FeedContent from './FeedContent';
import ReaderHeader from './header/ReaderHeader';
import ReaderMessageBar from './ReaderMessageBar';
import Guide from './Guide';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide';
import blue from '@material-ui/core/colors/blue';
import yellow from '@material-ui/core/colors/yellow';

const mapStateToProps = (state, ownProps) => {
    return {
        channels: state.channels,
        showContent: state.showContent,
        theme: state.theme,
        contentPath: ownProps.match.params.content,
        history: ownProps.history,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        syncState: () => dispatch(syncState()),
        setDefaultState: () => dispatch(setDefaultState()),
        setupBackgroundConnection: () => dispatch(setupBackgroundConnection()),
        setCurrentFeeds: () => dispatch(setCurrentFeeds()),
    };
};

const styles = theme => ({
    '@global': {
        body: {
            margin: 0,
            padding: 0,
            fontFamily: 'Roboto',
            minWidth: 320,
        },
        '::-webkit-scrollbar': {
                width: '0.25em',
        },
        // '::-webkit-scrollbar-track': {
        //     '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.2)',
        // },
        '::-webkit-scrollbar-thumb': {
            backgroundColor: 'darkgrey',
            outline: '1px solid slategrey',
        },
    },
    root: {
        height: '600px',
        display: 'flex',
        flexFlow: 'column',
    }
});
// function Transition(props) {
//     return <Slide direction="up" {...props} />;
// }

class Reader extends Component {
    constructor(props) {
        super(props);
        this.props.setupBackgroundConnection();
        this.props.syncState().then(() => {
            this.props.setDefaultState();
            if (this.props.showContent && !props.contentPath) {
                props.history.push('/content');
            } else if (!this.props.showContent && props.contentPath) {
                props.history.push('/');
            }
            return this.props.setCurrentFeeds();
        });
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
                <div className={this.props.classes.root}>
                    <ReaderHeader />
                    { this.props.channels.length > 0 ? <FeedList /> : <Guide/> }                    
                    <Dialog
                        fullScreen
                        open={this.props.showContent && this.props.contentPath}
                        //TransitionComponent={Transition}
                    >
                        <FeedContent />
                    </Dialog>
                    <ReaderMessageBar />
                </div>
            </MuiThemeProvider>
        );
    }
}

Reader.propTypes = {
    render: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Reader));
