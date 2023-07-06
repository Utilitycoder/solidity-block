import { FETCH_ALL, CREATE, DELETE, UPDATE } from '../constants/constantVar';

export default (contracts = [], action) => {
  switch (action.type) {
    case FETCH_ALL:
      return action.payload;
    case CREATE:
      return [...contracts, action.payload];
    case UPDATE: 
      return contracts.map((post) => post.id === action.payload._id ? action.payload : post)
    case DELETE:
      return contracts.filter((post) => post._id !== action.payload);
    default:
      return contracts;
  }
};