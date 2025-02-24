import { configureStore } from '@reduxjs/toolkit'
import { clientApi } from './slice/clientApi'
import { invoiceApi } from './slice/invoiceApi'
import { authApi } from './slice/authApi'

const store = configureStore({
	reducer: {
		[clientApi.reducerPath]: clientApi.reducer,
		[invoiceApi.reducerPath]: invoiceApi.reducer,
		[authApi.reducerPath]: authApi.reducer,
	},
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware()
			.concat(clientApi.middleware)
			.concat(invoiceApi.middleware)
			.concat(authApi.middleware),
})
export default store
