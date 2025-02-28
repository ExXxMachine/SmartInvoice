import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const invoiceItemApi = createApi({
	reducerPath: 'invoiceItemApi',
	baseQuery: fetchBaseQuery({
		baseUrl: 'https://x8ki-letl-twmt.n7.xano.io/api:muEPTbmd//invoice_item',
	}),
	endpoints: builder => ({
		createInvoiceItem: builder.mutation({
			query: recordData => ({
				url: '',
				method: 'POST',
				body: recordData,
			}),
		}),
		deleteInvoiceItem: builder.mutation({
			query: recordId => ({
				url: `/${recordId}`,
				method: 'DELETE',
			}),
		}),
		updateInvoiceItem: builder.mutation({
			query: invoiceItem => ({
				url: `/${invoiceItem.id}`,
				method: 'PATCH',
				body: invoiceItem,
			}),
		}),
	}),
})

export const { useCreateInvoiceItemMutation, useDeleteInvoiceItemMutation, useUpdateInvoiceItemMutation } =
	invoiceItemApi
