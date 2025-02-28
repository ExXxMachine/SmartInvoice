import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
	useGetInvoiceRecordQuery,
	useUpdateInvoiceMutation,
} from '../store/slice/invoiceApi'
import {
	useCreateInvoiceItemMutation,
	useDeleteInvoiceItemMutation,
	useUpdateInvoiceItemMutation,
} from '../store/slice/invoiceItemApi'
import { useGetClientsQuery } from '../store/slice/clientApi'
import { Typography, Table, Button, Modal, Form, Input, Select } from 'antd'
import { Spinner } from '../Components/Spinner/Spinner'
import { ArrowLeftOutlined } from '@ant-design/icons'

const { Title, Text } = Typography
const { Option } = Select

interface InvoiceItem {
	id: number
	description: string
	quantity: number
	unit_price: number
	total: number
}

function Invoice() {
	const { id } = useParams<{ id: string }>()
	const { data: invoiceData, error, isLoading } = useGetInvoiceRecordQuery(id)
	const {
		data: clients,
		isLoading: isClientsLoading,
		error: clientsError,
	} = useGetClientsQuery()
	const [createInvoiceItem] = useCreateInvoiceItemMutation()
	const [deleteInvoiceItem] = useDeleteInvoiceItemMutation()
	const [updateInvoiceItem] = useUpdateInvoiceItemMutation()
	const [updateInvoice] = useUpdateInvoiceMutation()
	const [isModalVisible, setIsModalVisible] = useState(false)
	const [isEditModalVisible, setIsEditModalVisible] = useState(false)
	const [isInvoiceEditModalVisible, setIsInvoiceEditModalVisible] =
		useState(false)
	const [form] = Form.useForm()
	const [editForm] = Form.useForm()
	const [invoiceEditForm] = Form.useForm()
	const [currentRecord, setCurrentRecord] = useState<InvoiceItem | null>(null)

	if (isLoading || isClientsLoading) {
		return (
			<div
				style={{
					minHeight: '90vh',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<Spinner />
			</div>
		)
	}

	if (error || clientsError) {
		return <div>Error: {error?.message || clientsError?.message}</div>
	}

	if (!invoiceData || !clients) {
		return <div>No invoice found</div>
	}

	const { result1, items } = invoiceData

	const calculateTotal = () => {
		return items.reduce((acc: number, item: InvoiceItem) => acc + item.total, 0)
	}

	const dataSource = items.map((item: InvoiceItem) => ({
		...item,
		key: item.id,
		id: item.id,
		description: item.description,
		quantity: item.quantity,
		unit_price: item.unit_price,
		total: item.total,
	}))

	const handleAdd = () => {
		setIsModalVisible(true)
	}

	const handleOk = async () => {
		try {
			const values = await form.validateFields()
			const newTotal = values.quantity * values.unit_price
			await createInvoiceItem({
				invoice_id: result1.id,
				description: values.description,
				quantity: values.quantity,
				unit_price: values.unit_price,
				total: newTotal,
			}).unwrap()
			setIsModalVisible(false)
			window.location.reload()
		} catch (error) {
			console.error('Error during adding item:', error)
		}
	}

	const handleCancel = () => {
		setIsModalVisible(false)
	}

	const handleDelete = async (itemId: number) => {
		try {
			await deleteInvoiceItem(itemId).unwrap()
			window.location.reload()
		} catch (error) {
			console.error('Error during deleting item:', error)
		}
	}

	const handleEdit = (record: InvoiceItem) => {
		console.log('Editing record:', record)
		setCurrentRecord(record)
		setIsEditModalVisible(true)
		editForm.setFieldsValue(record)
	}

	const handleEditOk = async () => {
		try {
			const values = await editForm.validateFields()
			const newTotal = values.quantity * values.unit_price
			if (currentRecord) {
				await updateInvoiceItem({
					id: currentRecord.id,
					invoice_id: result1.id,
					description: values.description,
					quantity: values.quantity,
					unit_price: values.unit_price,
					total: newTotal,
				}).unwrap()
			}
			setIsEditModalVisible(false)
			window.location.reload()
		} catch (error) {
			console.error('Error during editing item:', error)
		}
	}

	const handleEditCancel = () => {
		setIsEditModalVisible(false)
	}

	const handleInvoiceEdit = () => {
		setIsInvoiceEditModalVisible(true)
		invoiceEditForm.setFieldsValue(result1)
	}

	const handleInvoiceEditOk = async () => {
		try {
			const values = await invoiceEditForm.validateFields()
			await updateInvoice({
				id: result1.id,
				invoice_number: values.invoice_number,
				invoice_date: values.invoice_date,
				due_date: values.due_date,
				amount: values.amount,
				status: values.status,
				notes: values.notes,
				client_id: values.client_id, 
			}).unwrap()
			setIsInvoiceEditModalVisible(false)
			window.location.reload()
		} catch (error) {
			console.error('Error during editing invoice:', error)
		}
	}

	const handleInvoiceEditCancel = () => {
		setIsInvoiceEditModalVisible(false)
	}

	const columns = [
		{
			title: 'Description',
			dataIndex: 'description',
			key: 'description',
		},
		{
			title: 'Quantity',
			dataIndex: 'quantity',
			key: 'quantity',
			width: '100px',
		},
		{
			title: 'Unit Price',
			dataIndex: 'unit_price',
			key: 'unit_price',
			width: '100px',
		},
		{
			title: 'Total',
			dataIndex: 'total',
			key: 'total',
		},
		{
			title: 'Action',
			key: 'action',
			width: '170px',
			render: (_: any, record: InvoiceItem) => (
				<>
					<Button type='link' onClick={() => handleEdit(record)}>
						Edit
					</Button>{' '}
					<Button type='link' onClick={() => handleDelete(record.id)}>
						Delete
					</Button>
				</>
			),
		},
	]

	const statusOptions = ['Invoiced', 'In payment', 'Paid', 'Timed out']

	const selectedClient = clients.find(client => client.id === result1.client_id)

	return (
		<div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
			<Link to='/workspace'>
				<Button
					type='primary'
					icon={<ArrowLeftOutlined />}
					style={{ padding: '10px 20px' }}
				>
					Return to the Invoices page
				</Button>
			</Link>
			<Button
				type='primary'
				onClick={handleInvoiceEdit}
				style={{ marginBottom: '10px', float: 'right' }}
			>
				Edit Invoice
			</Button>
			<Title level={2}>Invoice {result1.invoice_number}</Title>
			<div style={{ display: 'flex', justifyContent: 'space-between' }}>
				<div>
					<Text strong>Invoice Date: </Text>
					<Text>{result1.invoice_date}</Text>
				</div>
				<div>
					<Text strong>Due Date: </Text>
					<Text>{result1.due_date}</Text>
				</div>
			</div>
			<div style={{ display: 'flex', justifyContent: 'space-between' }}>
				<div>
					<Text strong>Amount: </Text>
					<Text>{result1.amount}</Text>
				</div>
				<div>
					<Text strong>Status: </Text>
					<Text>{result1.status}</Text>
				</div>
			</div>
			<div>
				<Text strong>Client: </Text>
				<Text>{selectedClient ? selectedClient.name : 'Not chosen'}</Text>
			</div>
			<Text strong>Notes: </Text>
			<Text>{result1.notes}</Text>
			<Title level={3} style={{ marginTop: '20px' }}>
				Items:
			</Title>
			<Button
				type='primary'
				onClick={handleAdd}
				style={{ marginBottom: '10px', float: 'right' }}
			>
				Add Item
			</Button>
			<Table columns={columns} dataSource={dataSource} pagination={false} />
			<div style={{ textAlign: 'right', marginTop: '10px' }}>
				<Text strong>Общий счет: </Text>
				<Text>{calculateTotal().toFixed(2)}</Text>
			</div>
			<Modal
				title='Add Item'
				visible={isModalVisible}
				onOk={handleOk}
				onCancel={handleCancel}
			>
				<Form form={form} layout='vertical'>
					<Form.Item
						name='description'
						label='Description'
						rules={[{ required: true, message: 'Please enter description!' }]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						name='quantity'
						label='Quantity'
						rules={[{ required: true, message: 'Please enter quantity!' }]}
					>
						<Input type='number' />
					</Form.Item>
					<Form.Item
						name='unit_price'
						label='Unit Price'
						rules={[{ required: true, message: 'Please enter unit price!' }]}
					>
						<Input type='number' />
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title='Edit Item'
				visible={isEditModalVisible}
				onOk={handleEditOk}
				onCancel={handleEditCancel}
			>
				<Form form={editForm} layout='vertical'>
					<Form.Item
						name='description'
						label='Description'
						rules={[{ required: true, message: 'Please enter description!' }]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						name='quantity'
						label='Quantity'
						rules={[{ required: true, message: 'Please enter quantity!' }]}
					>
						<Input type='number' />
					</Form.Item>
					<Form.Item
						name='unit_price'
						label='Unit Price'
						rules={[{ required: true, message: 'Please enter unit price!' }]}
					>
						<Input type='number' />
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title='Edit Invoice'
				visible={isInvoiceEditModalVisible}
				onOk={handleInvoiceEditOk}
				onCancel={handleInvoiceEditCancel}
			>
				<Form form={invoiceEditForm} layout='vertical'>
					<Form.Item
						name='invoice_number'
						label='Invoice Number'
						rules={[
							{ required: true, message: 'Please enter invoice number!' },
						]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						name='invoice_date'
						label='Invoice Date'
						rules={[{ required: true, message: 'Please enter invoice date!' }]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						name='due_date'
						label='Due Date'
						rules={[{ required: true, message: 'Please enter due date!' }]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						name='amount'
						label='Amount'
						rules={[{ required: true, message: 'Please enter amount!' }]}
					>
						<Input type='number' />
					</Form.Item>
					<Form.Item
						name='status'
						label='Status'
						rules={[{ required: true, message: 'Please enter status!' }]}
					>
						<Select>
							{statusOptions.map(status => (
								<Option key={status} value={status}>
									{status}
								</Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item
						name='client_id'
						label='Client'
						rules={[{ required: true, message: 'Please select client!' }]}
					>
						<Select placeholder='Select a client'>
							{clients.map(client => (
								<Option key={client.id} value={client.id}>
									{client.name}
								</Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item name='notes' label='Notes'>
						<Input />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	)
}

export { Invoice }
