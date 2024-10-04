import axios from 'axios';

export const loginUser = (fields, role) => async (dispatch) => {
    try {
        const url = role === 'Admin'
            ? 'https://attend-api.vercel.app/AdminLogin'
            : 'https://attend-api.vercel.app/StudentLogin';  // or TeacherLogin
        
        const response = await axios.post(url, fields);
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: response.data });
    } catch (error) {
        dispatch({ type: 'LOGIN_FAILURE', payload: error.response.data });
    }
};
