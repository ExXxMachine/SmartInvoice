import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthMeQuery } from '../store/slice/authApi' 

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
	const { data, error, isLoading } = useAuthMeQuery()
	const location = useLocation()

	if (isLoading) {
		return null 
	}

	if (error || !data) {
		return <Navigate to='/' replace state={{ from: location }} />
	}

	return children
}

export { ProtectedRoute }
