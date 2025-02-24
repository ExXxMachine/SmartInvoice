import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

interface Client {
	id: number
	created_at: number
	name: string
	email: string
	phone: string
	address: string
}

export const clientApi = createApi({
	reducerPath: 'clientApi',
	baseQuery: fetchBaseQuery({
		baseUrl: 'https://x8ki-letl-twmt.n7.xano.io/api:muEPTbmd/client',
	}),
	endpoints: builder => ({
		getClients: builder.query<Client[], void>({
			query: () => '',
		}),
		createClient: builder.mutation({
			query: newClient => ({
				url: '',
				method: 'POST',
				body: newClient,
			}),
		}),
		deleteClient: builder.mutation({
			query: clientId => ({
				url: `/${clientId}`,
				method: 'DELETE',
			}),
		}),
		updateClient: builder.mutation({
			query: client => ({
				url: `/${client.id}`,
				method: 'PATCH',
				body: client,
			}),
		}),
	}),
})

export const {
	useGetClientsQuery,
	useCreateClientMutation,
	useDeleteClientMutation,
	useUpdateClientMutation,
} = clientApi
