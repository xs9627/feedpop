import { ADD_CHANNEL, SET_CHANNELS, DELETE_CHANNELS } from "../constants/action-types";

export const addChannel = channel => ({ type: ADD_CHANNEL, payload: channel });
export const setChannels = channels => ({ type: SET_CHANNELS, payload: channels });
export const deleteChannel = id => ({ type: DELETE_CHANNELS, payload:id });