import React from 'react'
import { Puff } from 'react-loader-spinner'
import classesSpinner from './Spinner.module.css'

const Spinner: React.FC = () => {
	return (
		<div className={classesSpinner.spinner_container}>
			<Puff color='#1677ff' height={100} width={100} ariaLabel='loading' />
		</div>
	)
}

export { Spinner }
