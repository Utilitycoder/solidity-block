import { FETCH_ALL, CREATE, DELETE, UPDATE } from '../constants/constantVar';

import * as api from '../api/index.js';


export const getContracts = () => async(dispatch) => {
  try {
    const { data } = await api.fetchContracts()
    dispatch({ type: FETCH_ALL, payload: data })
  } catch (error) {
    console.log(error)
  }
}

export const createContract = (contract) => async(dispatch) => {
  try {
    const { data } = await api.createContract(contract)
    dispatch({ type: CREATE, payload: data })
    console.log(data)
  } catch (error) {
    console.log(error.message)
  }
}

export const updateContract = (id, contract) => async (dispatch) => {
  try {
    const { data } = await api.updateContract(id, contract)

    dispatch({ type: UPDATE, payload: data })
  } catch (error) {
    console.log(error)
    alert(error.response.data.message)
  }
}

export const deleteContract = (id) => async(dispatch) => {
  try {
    await api.deleteContract(id)
    dispatch({ type: DELETE, payload: id})
  } catch (error) {
    console.log(error)
  }
}


