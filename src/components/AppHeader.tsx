import { useState, useEffect } from 'react'
import { Layout, Button, Modal, Form, Input, Space, Typography } from 'antd'
import { Outlet } from 'react-router-dom'
import {
	useAuthLoginMutation,
	useAuthMeQuery,
	useAuthSignupMutation,
} from '../store/slice/authApi'
import Cookies from 'js-cookie'

const { Title } = Typography

const { Header } = Layout

function AppHeader() {
	const [isModalVisible, setIsModalVisible] = useState(false)
	const [isLogin, setIsLogin] = useState(true)
	const [authLogin] = useAuthLoginMutation()
	const [form] = Form.useForm()
	const [isLoggedIn, setIsLoggedIn] = useState(false)
	const [username, setUsername] = useState('')
	const { data: user, error} = useAuthMeQuery()
	const [authSingup] = useAuthSignupMutation()

	const handleSingup = async () => {
		try {
			const values = await form.validateFields()
			const response = await authSingup(values).unwrap()
			const token = response.authToken
			Cookies.set('token', token)
			setIsModalVisible(false)
			setIsLoggedIn(true)
			window.location.reload()
		} catch (error) {
			if (error.status === 400) {
				const errorMessage = error.data.message
				form.setFields([
					{
						name: 'password',
						errors: [errorMessage],
					},
				])
			} else {
				console.error('Error during signup:', error)
			}
		}
	}

	useEffect(() => {
		if (user) {
			setIsLoggedIn(true)
			if (user.name) {
				setUsername(user.name)
			}
		} else if (error) {
			setIsLoggedIn(false)
		}
	}, [user, error])

	const showModal = () => {
		setIsModalVisible(true)
	}

	const handleOk = async () => {
		try {
			const values = await form.validateFields()
			const response = await authLogin(values).unwrap()
			const token = response.authToken
			Cookies.set('token', token)
			setIsLoggedIn(true)
			setIsModalVisible(false)
			window.location.reload()
		} catch (error) {
			console.error('Error during login:', error)
		}
	}

	const handleCancel = () => {
		setIsModalVisible(false)
	}
	const handleLogout = () => {
		Cookies.remove('token')
		setIsLoggedIn(false)
		window.location.reload()
	}
	const toggleForm = () => {
		setIsLogin(!isLogin)
	}

	return (
		<>
			<Header
				style={{
					display: 'flex',
					justifyContent: 'end',
					alignItems: 'center',
					padding: 0,
				}}
			>
				{isLoggedIn ? (
					<Space
						style={{
							marginRight: '50px',
						}}
					>
						<Title level={4} style={{ color: 'white', margin: '0' }}>
							{username}{' '}
						</Title>
						<Button type='primary' onClick={handleLogout}>
							Logout
						</Button>
					</Space>
				) : (
					<Button
						type='primary'
						onClick={showModal}
						style={{ marginRight: '50px', padding: '0 15px' }}
					>
						Login
					</Button>
				)}
			</Header>

			<Modal
				title={isLogin ? 'Authorization' : 'Registration'}
				visible={isModalVisible}
				onOk={isLogin ? handleOk : handleSingup}
				onCancel={handleCancel}
			>
				<Form
					layout='vertical'
					form={form}
				>
					{isLogin ? (
						<>
							<Form.Item
								name='email'
								label='Email'
								rules={[
									{
										required: true,
										message: 'Please enter e-mail!',
									},
									{
										type: 'email',
										message: 'Please enter a valid email!',
									},
								]}
							>
								<Input />
							</Form.Item>
							<Form.Item
								name='password'
								label='Password'
								rules={[
									{ required: true, message: 'Please enter the password!' },
								]}
							>
								<Input.Password />
							</Form.Item>
						</>
					) : (
						<>
							<Form.Item
								name='name'
								label='Username'
								rules={[
									{
										required: true,
										message: 'Please enter the user name!',
									},
								]}
							>
								<Input />
							</Form.Item>
							<Form.Item
								name='email'
								label='Email'
								rules={[
									{
										required: true,
										message: 'Please enter e-mail!',
									},
									{
										type: 'email',
										message: 'Please enter a valid email!',
									},
								]}
							>
								<Input />
							</Form.Item>
							<Form.Item
								name='password'
								label='Password'
								rules={[
									{ required: true, message: 'Please enter the password!' },
								]}
							>
								<Input.Password />
							</Form.Item>
						</>
					)}
				</Form>
				<Button type='link' onClick={toggleForm}>
					{isLogin
						? 'No account? Register!'
						: 'Is there already an account? Login!'}
				</Button>
			</Modal>
			<Outlet />
		</>
	)
}

export { AppHeader }
