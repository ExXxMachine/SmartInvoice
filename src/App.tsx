import './App.css'
import { Routes, Route } from 'react-router-dom'
import { AppHeader } from './Components/AppHeader'
import { Workspace } from './Pages/Workspace'
import { Invoice } from './Pages/Invoice'
import { Home } from './Pages/Home'
import { ProtectedRoute } from './Features/ProtectedRoute'

function App() {
	return (
		<>
			<Routes>
				<Route path='/' element={<AppHeader />}>
					<Route path='/' element={<Home />} />
					<Route
						path='/workspace'
						element={
							<ProtectedRoute>
								<Workspace />
							</ProtectedRoute>
						}
					/>
					<Route
						path='/invoice/:id'
						element={
							<ProtectedRoute>
								<Invoice />
							</ProtectedRoute>
						}
					/>
				</Route>
			</Routes>
		</>
	)
}

export default App
