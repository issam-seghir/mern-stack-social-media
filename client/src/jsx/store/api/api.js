import { SERVER_URL } from "@jsx/data/constants";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { clearCredentials, setCredentials } from "@store/slices/authSlice";

const baseQuery = fetchBaseQuery({
	baseUrl: `${SERVER_URL}/api/v1`,
	credentials: "include", // Include cookies in requests
	prepareHeaders: (headers, { getState }) => {
		// Use Redux's useSelector to get the token from the state
		// usually we use local storage but in this case we already setup react-persist
		const token = getState().store.auth.token;
		if (token) {
			headers.set("authorization", `Bearer ${token}`);
		}
		return headers;
	},
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
	let result = await baseQuery(args, api, extraOptions);
	console.log(result);
	if (result?.error?.originalStatus === 403) {
		// send refresh token to get new access token
		const refreshResult = await baseQuery("/refresh", api, extraOptions);
		if (refreshResult?.data) {
			const newToken = refreshResult.data.token;
			const user = api.getState().store.auth.user;
			// store the new token
			api.dispatch(setCredentials({ token: newToken, user }));
			// retry the original query with new access token
			result = await baseQuery(args, api, extraOptions);
		} else {
			api.dispatch(clearCredentials());
		}
	}

	return result;
};

export const api = createApi({
	// defaults to 'api'
	reducerPath: "api",
	baseQuery: baseQueryWithReauth,
	refetchOnFocus: true,
	refetchOnReconnect: true,
	endpoints: (builder) => ({}),
});
