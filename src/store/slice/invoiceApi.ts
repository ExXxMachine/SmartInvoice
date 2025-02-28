import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

interface Invoice {
	id: number
	created_at: number
	invoice_number: string
	invoice_date: string
	due_date: string
	amount: number
	status: string
	notes: string
	sent_at: number
	client_id: number
}

export const invoiceApi = createApi({
	reducerPath: 'invoiceApi',
	baseQuery: fetchBaseQuery({
		baseUrl: 'https://x8ki-letl-twmt.n7.xano.io/api:muEPTbmd/invoice',
	}),
	endpoints: builder => ({
		getInvoices: builder.query<Invoice[], void>({
			query: () => '',
		}),
		createInvoice: builder.mutation({
			query: newInvoice => ({
				url: '',
				method: 'POST',
				body: newInvoice,
			}),
		}),
		deleteInvoice: builder.mutation({
			query: invoiceId => ({
				url: `/${invoiceId}`,
				method: 'DELETE',
			}),
		}),
		updateInvoice: builder.mutation({
			query: invoice => ({
				url: `/${invoice.id}`,
				method: 'PATCH',
				body: invoice,
			}),
		}),
		getInvoiceRecord: builder.query({
			query: invoiceId => ({
				url: `/${invoiceId}`,
			}),
		}),	
	}),
})

export const {
	useGetInvoicesQuery,
	useCreateInvoiceMutation,
	useDeleteInvoiceMutation,
	useUpdateInvoiceMutation,
	useGetInvoiceRecordQuery
} = invoiceApi

