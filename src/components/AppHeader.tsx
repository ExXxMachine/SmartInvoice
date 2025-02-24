import { useState } from 'react'
import { Layout, Button, Modal, Form, Input } from 'antd'
import { Outlet } from 'react-router-dom'

const { Header } = Layout

function AppHeader() {
	const [isModalVisible, setIsModalVisible] = useState(false)
	const [isLogin, setIsLogin] = useState(true)

	const showModal = () => {
		setIsModalVisible(true)
	}

	const handleOk = () => {
		setIsModalVisible(false)
	}

	const handleCancel = () => {
		setIsModalVisible(false)
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
				<Button
					type='primary'
					onClick={showModal}
					style={{ marginRight: '50px', padding: '0 15px' }}
				>
					Login
				</Button>
			</Header>

			<Modal
				title={isLogin ? 'Authorization' : 'Registration'}
				visible={isModalVisible}
				onOk={handleOk}
				onCancel={handleCancel}
			>
				<Form layout='vertical'>
					{!isLogin && (
						<Form.Item
							name='username'
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
					)}
					<Form.Item
						name='email'
						label='Email'
						rules={[
							{
								required: true,
								message: 'Please enter e-mail!',
							},
						]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						name='password'
						label='Password'
						rules={[{ required: true, message: 'Please enter the password!' }]}
					>
						<Input.Password />
					</Form.Item>
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
