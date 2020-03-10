import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { syncState, setDefaultState, setupBackgroundConnection, setCurrentFeeds } from "../actions/index"
import ReaderContent from './ReaderContent';
import ReaderHeader from './header/ReaderHeader';
import ReaderMessageBar from './ReaderMessageBar';
import Guide from './Guide';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { CssBaseline } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import blue from '@material-ui/core/colors/blue';
import yellow from '@material-ui/core/colors/yellow';

const mapStateToProps = state => {
    return {
        channels: state.channels,
        showContent: state.showContent,
        theme: state.theme,
        fontSize: state.fontSize,
        expandView: state.expandView,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        syncState: isloadConfig => dispatch(syncState(isloadConfig)),
        setDefaultState: () => dispatch(setDefaultState()),
        setupBackgroundConnection: () => dispatch(setupBackgroundConnection()),
        setCurrentFeeds: () => dispatch(setCurrentFeeds()),
    };
};

const useStyles = makeStyles(theme => ({
    '@global': {
        body: {
            margin: 0,
            padding: 0,
            fontFamily: 'Roboto',
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
    root: props => ({
        height: 600,
        minWidth: `${props.expandView ? '640px' : '320px'}`,
        display: 'flex',
        flexFlow: `${props.expandView ? 'row' : 'column'}`,
    })
}));

// class Reader extends Component {
const Reader = props => {
    const {setupBackgroundConnection, syncState, setDefaultState, setCurrentFeeds} = props;
    const [synced, setSyneced] = useState(false);
    const [isDarkTheme, setIsDarkTheme] = useState(false);

    useEffect(() => {
        setupBackgroundConnection();

        let isSubscribed = true;
        async function syncDomainPerfix() {
            await syncState(true);
            if (isSubscribed) {
                setDefaultState();
                setCurrentFeeds();
                setSyneced(true);
            }
        };
        syncDomainPerfix();
        return () => isSubscribed = false;
    }, [syncState, setDefaultState, setCurrentFeeds, setupBackgroundConnection, setSyneced]);

    useEffect(() => {
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        const systemThemeChange = e => {
            setIsDarkTheme(e.matches);
        }
        if (props.theme === "system") {
            media.addListener(systemThemeChange);
            setIsDarkTheme(media.matches);
        } else {
            setIsDarkTheme(props.theme === "dark");
        }
        return () => media.removeListener(systemThemeChange);
    }, [props.theme, setIsDarkTheme]);

    const classes = useStyles(props);

    return !synced ? null : (
        <MuiThemeProvider theme={createMuiTheme({
            palette: {
                primary: !isDarkTheme ? blue : yellow,
                type: !isDarkTheme ? 'light' : 'dark',
            },
            typography: {
                fontSize: props.fontSize || 14,
            },
            overrides: {
                // Fix multiple scroll bar after upgrade mui to 4.7.0. 
                // Need to remove this if it fixed in future release. 
                // Related comments, https://github.com/mui-org/material-ui/issues/17774
                MuiTooltip: {
                    popper: {
                        position: 'absolute',
                        top: 0,
                    }
                }
            }
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
            <CssBaseline />
            <div className={classes.root}>
                <ReaderHeader />
                { props.channels.length > 0 ? <ReaderContent /> : <Guide/> }
                <ReaderMessageBar />
            </div>
        </MuiThemeProvider>
    );
}

Reader.propTypes = {
    render: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(Reader);
