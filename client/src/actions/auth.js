import { AUTH } from "../constants/constantVar"
import * as api from "../api/index.js"

export const signin = (formData, router) => async (dispatch) => {
    try {
        const { data } = await api.signIn(formData)

        dispatch({ type: AUTH, data })

        router("/")
    } catch (error) {
        console.log(error)
        alert(error.response.data.message)
    }
}

export const signup = (formData, router) => async (dispatch) => {
    try {
        const { data } = await api.signUp(formData)

        dispatch({ type: AUTH, data })

        router("/")
    } catch (error) {
        console.log(error)
        alert(error.response.data.message)
    }
}
