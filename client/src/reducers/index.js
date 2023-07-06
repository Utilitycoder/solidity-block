import { combineReducers } from 'redux';

import contracts from './contracts';
import auth from './auth'

export const reducers = combineReducers({ contracts, auth });
