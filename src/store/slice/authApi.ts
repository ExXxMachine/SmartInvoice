import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import Cookies from 'js-cookie'

export const authApi = createApi({
	reducerPath: 'authApi',
	baseQuery: fetchBaseQuery({
		baseUrl: 'https://x8ki-letl-twmt.n7.xano.io/api:dFOkzSMR/auth',
		prepareHeaders: (headers) => {
			const token = Cookies.get('token')
			if (token) {
				headers.set('Authorization', `Bearer ${token}`)
			}
			return headers
		},
	}),
	endpoints: builder => ({
		authLogin: builder.mutation({
			query: authData => ({
				url: '/login',
				method: 'POST',
				body: authData,
			}),
		}),
		authMe: builder.query({
			query: () => ({
				url: '/me',
			}),
		}),
		authSignup: builder.mutation({
			query: authData => ({
				url: '/signup',
				method:'POST',
				body: authData,
			})
		})
	}),
})

export const { useAuthLoginMutation, useAuthMeQuery, useAuthSignupMutation} = authApi
