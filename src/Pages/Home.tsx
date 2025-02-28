import { Typography, Button } from 'antd'
import { Link } from 'react-router-dom'
import { useAuthMeQuery } from '../store/slice/authApi'
import { Spinner } from '../Components/Spinner/Spinner'

const { Title, Text } = Typography

const Home = () => {
	const { data, error, isLoading } = useAuthMeQuery()

	if (isLoading) {
		return <Spinner/>
	}

	const isAuthenticated = data && !error

	return (
		<div
			style={{
				textAlign: 'center',
				padding: '20vh 0',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
			}}
		>
			<Title level={1}>Welcome to Smartinvoice!</Title>
			<Text type='secondary'>
				This application is designed to manage accounts and financial
				transactions.
			</Text>
			{isAuthenticated && (
				<Button
					type='primary'
					size='large'
					style={{ marginTop: '20px' }}
				>
					<Link to='/workspace'>Go to Workspace</Link>
				</Button>
			)}
		</div>
	)
}

export { Home }
