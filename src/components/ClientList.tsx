import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import {
	useGetClientsQuery,
	useCreateClientMutation,
	useDeleteClientMutation,
	useUpdateClientMutation,
} from '../store/slice/clientApi'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Spinner } from './Spinner/Spinner'
import { MaskedInput } from 'antd-mask-input'

interface Client {
	key: string
	id: number
	name: string
	phone: string
	email: string
}

function ClientList() {
	const { data: clients = [], error, isLoading } = useGetClientsQuery()
	const [dataSource, setDataSource] = useState<Client[]>([])
	const [isModalVisible, setIsModalVisible] = useState(false)
	const [form] = Form.useForm()
	const [deleteClient] = useDeleteClientMutation()
	const [createClient] = useCreateClientMutation()
	const [updateClient] = useUpdateClientMutation()
	const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)
	const [selectedKey, setSelectedKey] = useState<string | null>(null)
	const [isEditMode, setIsEditMode] = useState(false)
	const [editingClient, setEditingClient] = useState<Client | null>(null)
	const phoneMask = '+7 (000) 000-00-00'

	useEffect(() => {
		if (clients) {
			setDataSource(
				clients
					.slice()
					.sort((a, b) => a.id - b.id)
					.map(client => ({
						...client,
						key: client.id.toString(),
					}))
			)
		}
	}, [clients])

	const handleDelete = (key: string) => {
		setSelectedKey(key)
		setIsDeleteModalVisible(true)
	}

	const handleOkDelete = async () => {
		if (selectedKey) {
			try {
				await deleteClient(selectedKey).unwrap()
				console.log('Client is successfully deleted')
				toast.success('Client is successfully deleted!', {
					position: 'bottom-right',
				})
				setDataSource(dataSource.filter(item => item.key !== selectedKey))
				setIsDeleteModalVisible(false)
				setSelectedKey(null)
			} catch (error) {
				console.error('Error when removing the client:', error)
				toast.error('Error when removing the client!', {
					position: 'bottom-right',
				})
			}
		}
	}

	const showModal = () => {
		setIsModalVisible(true)
	}

	const handleEdit = (key: string) => {
		const clientToEdit = dataSource.find(item => item.key === key)

		if (clientToEdit) {
			setIsEditMode(true)
			setEditingClient(clientToEdit)

			setIsModalVisible(true)

			form.setFieldsValue(clientToEdit)
		}
	}
	const handleOk = async () => {
		try {
			const values = await form.validateFields()

			if (isEditMode && editingClient) {
				const updatedValues = { ...values, id: parseInt(editingClient!.key) }
				await updateClient(updatedValues).unwrap()
				console.log('The client is successfully updated')
				toast.success('The client is successfully updated!', {
					position: 'bottom-right',
				})

				setDataSource(
					dataSource.map(item =>
						item.key === editingClient!.key ? updatedValues : item
					)
				)

				setIsEditMode(false)
				setEditingClient(null)
			} else if (!isEditMode) {
				const newClient = await createClient(values).unwrap()
				console.log('The new client has been successfully added')
				toast.success('The new client has been successfully added!', {
					position: 'bottom-right',
				})

				setDataSource([
					...dataSource,
					{ key: newClient.id.toString(), ...newClient },
				])
			}

			form.resetFields()
			setIsModalVisible(false)
		} catch (errorInfo) {
			console.error('error:', errorInfo)
		}
	}

	const handleCancel = () => {
		setIsModalVisible(false)
		setIsDeleteModalVisible(false)
	}

	const columns = [
		{
			title: 'ID Client',
			dataIndex: 'id',
			key: 'id',
			width: '100px',
			render: (text: number) => <a href={`/client/${text}`}>{text}</a>,
		},
		{
			title: 'Name',
			dataIndex: 'name',
			key: 'name',
			width: '200px',
		},
		{
			title: 'Phone',
			dataIndex: 'phone',
			key: 'phone',
			width: '150px',
		},
		{
			title: 'Email',
			dataIndex: 'email',
			key: 'email',
			width: '200px',
		},
		{
			title: 'Address',
			dataIndex: 'address',
			key: 'address',
			width: '180px',
		},
		{
			title: 'Action',
			key: 'action',
			width: '150px',
			render: (_: any, record: Client) => (
				<>
					<Button type='link' onClick={() => handleEdit(record.key)}>
						Edit
					</Button>{' '}
					|
					<Button type='link' onClick={() => handleDelete(record.key)}>
						Delete
					</Button>
				</>
			),
		},
	]

	if (isLoading) return <Spinner />
	if (error) return <div>Error loading clients</div>

	return (
		<>
			<div
				style={{
					display: 'flex',
					justifyContent: 'flex-end',
					marginBottom: '16px',
				}}
			>
				<Button type='primary' icon={<PlusOutlined />} onClick={showModal} />
			</div>
			<Table
				dataSource={dataSource}
				columns={columns}
				pagination={{
					pageSize: 5,
					position: ['bottomRight'],
				}}
			/>
			<Modal
				title={isEditMode ? 'Edit the record' : 'Add a record'}
				visible={isModalVisible}
				onOk={handleOk}
				onCancel={() => {
					setIsModalVisible(false)
					form.resetFields()
				}}
			>
				<Form form={form} layout='vertical'>
					<Form.Item
						name='name'
						label='Name'
						rules={[{ required: true, message: 'Please enter a name!' }]}
					>
						<Input />
					</Form.Item>

					<Form.Item
						name='phone'
						label='Phone'
						rules={[
							{
								required: true,
								message: 'Please enter the phone number!',
							},
						]}
					>
						<MaskedInput mask={phoneMask} />
					</Form.Item>

					<Form.Item
						name='email'
						label='Email'
						rules={[
							{
								required: true,
								message: 'Please enter email!',
							},
						]}
					>
						<Input />
					</Form.Item>

					<Form.Item
						name='address'
						label='Address'
						rules={[{ required: false }]}
					>
						<Input />
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title='Confirmation of removal'
				visible={isDeleteModalVisible}
				onOk={handleOkDelete}
				onCancel={handleCancel}
			>
				Are you sure you want to delete this client?
			</Modal>

			<ToastContainer position='bottom-right' />
		</>
	)
}

export { ClientList }
