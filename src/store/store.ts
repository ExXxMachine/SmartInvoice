import { configureStore } from '@reduxjs/toolkit'
import { clientApi } from './slice/clientApi'
import { invoiceApi } from './slice/invoiceApi'
import { authApi } from './slice/authApi'
import { invoiceItemApi } from './slice/invoiceItemApi'

const store = configureStore({
	reducer: {
		[clientApi.reducerPath]: clientApi.reducer,
		[invoiceApi.reducerPath]: invoiceApi.reducer,
		[authApi.reducerPath]: authApi.reducer,
		[invoiceItemApi.reducerPath]: invoiceItemApi.reducer,
	},
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware()
			.concat(clientApi.middleware)
			.concat(invoiceApi.middleware)
			.concat(authApi.middleware)
			.concat(invoiceItemApi.middleware),
})

export default store
