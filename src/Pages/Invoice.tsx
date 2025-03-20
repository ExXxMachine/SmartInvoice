import {useState, useEffect } from 'react'
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
import {
	Typography,
	Table,
	Button,
	Form,
	Input,
	Select,
	Modal,
	Row,
	Col,
} from 'antd'
import { Spinner } from '../Components/Spinner/Spinner'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const { Title, Text } = Typography
const { Option } = Select

interface InvoiceItem {
	id: number
	description: string
	quantity: number
	unit_price: number
	total: number
}

interface InvoiceData {
	id: number
	invoice_number: string
	invoice_date: string
	due_date: string
	status: string
	notes: string
	client_id: number
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
	const [form] = Form.useForm()
	const [editForm] = Form.useForm()
	const [currentRecord, setCurrentRecord] = useState<InvoiceItem | null>(null)
	const [isEditing, setIsEditing] = useState(true)
	const [invoiceDetails, setInvoiceDetails] = useState<InvoiceData | null>(null)

	useEffect(() => {
		if (invoiceData && invoiceData.result1) {
			setInvoiceDetails(invoiceData.result1)
		}
	}, [invoiceData])

	if (isLoading || isClientsLoading || !invoiceDetails) {
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

	const handleSaveInvoice = async () => {
		try {
			const totalAmount = calculateTotal()
			await updateInvoice({
				id: invoiceDetails.id,
				invoice_number: invoiceDetails.invoice_number,
				invoice_date: invoiceDetails.invoice_date,
				due_date: invoiceDetails.due_date,
				amount: totalAmount,
				status: invoiceDetails.status,
				notes: invoiceDetails.notes,
				client_id: invoiceDetails.client_id,
			}).unwrap()
			setIsEditing(false)
			toast.success('Invoice successfully saved!', {
				position: 'bottom-right',
			})
		} catch (error) {
			console.error('Error during editing invoice:', error)
			toast.error('Error saving invoice!', {
				position: 'bottom-right',
			})
		}
	}

	const handleChange = (field: string, value: any) => {
		setInvoiceDetails({
			...invoiceDetails,
			[field]: value,
		})
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
			<div style={{ display: 'flex', justifyContent: 'space-between' }}>
				<Title level={2}>Invoice {invoiceDetails.invoice_number}</Title>

				<Button type='primary' onClick={handleSaveInvoice}>
					Save Invoice
				</Button>
			</div>
			<Row gutter={16}>
				<Col span={12}>
					<Text strong>Invoice Number:</Text>

					<Input
						value={invoiceDetails.invoice_number}
						onChange={e => handleChange('invoice_number', e.target.value)}
					/>
				</Col>
				<Col span={12}>
					<Text strong>Invoice Date:</Text>

					<Input
						value={invoiceDetails.invoice_date}
						onChange={e => handleChange('invoice_date', e.target.value)}
					/>
				</Col>
			</Row>
			<Row gutter={16}>
				<Col span={12}>
					<Text strong>Due Date:</Text>

					<Input
						value={invoiceDetails.due_date}
						onChange={e => handleChange('due_date', e.target.value)}
					/>
				</Col>
			</Row>
			<Row gutter={16}>
				<Col span={12} style={{ marginTop: '10px' }}>
					<Text strong>Status:</Text>

					<Select
						value={invoiceDetails.status}
						onChange={value => handleChange('status', value)}
					>
						{statusOptions.map(status => (
							<Option key={status} value={status}>
								{status}
							</Option>
						))}
					</Select>
				</Col>
				<Col span={12} style={{ marginTop: '10px' }}>
					<Text strong>Client:</Text>

					<Select
						value={invoiceDetails.client_id}
						onChange={value => handleChange('client_id', value)}
						dropdownStyle={{
							overflowY: 'auto',
							minWidth: `${
								Math.max(...clients.map(client => client.name.length)) * 10
							}px`,
						}}
					>
						{clients.map(client => (
							<Option key={client.id} value={client.id}>
								{client.name}
							</Option>
						))}
					</Select>
				</Col>
			</Row>
			<div>
				<Text strong>Notes:</Text>

				<Input.TextArea
					value={invoiceDetails.notes}
					onChange={e => handleChange('notes', e.target.value)}
				/>
			</div>
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
				<Title level={2}>Total: {calculateTotal().toFixed(2)} </Title>
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
			<ToastContainer position='bottom-right' />
		</div>
	)
}

export { Invoice }
