import { AppState } from "../state/AppState";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"

// adapted from https://jasonwatmore.com/post/2021/09/17/react-fetch-set-authorization-header-for-api-requests-if-user-logged-in
export function useFetchWrapper() {
    return {
        get: request('GET'),
        post: request('POST'),
        put: request('PUT'),
        delete: request('DELETE')
    };

    function request(method) {
        return async (path, body) => {
            const requestOptions = {
                method,
                headers: authHeader()
            };
            if (body) {
                requestOptions.headers['Content-Type'] = 'application/json';
                requestOptions.body = JSON.stringify(body);
            }
            const response = await fetch(`${BACKEND_URL}${path}`, requestOptions);
            return handleResponse(response);
        }
    }

    // helper functions

    function authHeader() {
        // return auth header with jwt if user is logged in
        const isLoggedIn = AppState.loggedIn;
        const token = AppState.token;
        if (isLoggedIn) {
            return { Authorization: `Bearer ${token}` };
        } else {
            return {};
        }
    }

    function handleResponse(response) {
        return response.json().then(data => {
            if (!response.ok) {
                const error = (data && data.message) || response.statusText;
                AppState.onError(error);
                return Promise.reject(error);
            }
            return data;
        });
    }
}
