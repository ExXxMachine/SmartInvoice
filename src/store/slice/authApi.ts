import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const authApi = createApi({
	reducerPath: 'authApi',
	baseQuery: fetchBaseQuery({
		baseUrl: 'https://x8ki-letl-twmt.n7.xano.io/api:dFOkzSMR/auth',
	}),
	endpoints: builder => ({
		authLogin: builder.mutation({
			query: authData => ({
				url: '',
				method: 'POST',
				body: authData,
			}),
		}),
	}),
})

export const { useAuthLoginMutation } = authApi
