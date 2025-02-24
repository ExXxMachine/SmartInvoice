import './App.css'

import { Routes, Route } from 'react-router-dom'
import { AppHeader } from './components/AppHeader'
import { Workspace } from './Pages/Workspace'
import { Invoice } from './Pages/Invoice'

function App() {
	return (
		<>
			<Routes>
				<Route path='/' element={<AppHeader />}>
					<Route path='/' element={<Workspace />} />
					<Route path='/invoice/:id' element={<Invoice />} />
				</Route>
			</Routes>
		</>
	)
}

export default App
