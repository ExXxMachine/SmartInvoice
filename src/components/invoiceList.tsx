import { useState, useEffect } from 'react'
import {
	Table,
	Button,
	Modal,
	Form,
	Input,
	Select,
	Tag,
	DatePicker,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import {
	useGetInvoicesQuery,
	useCreateInvoiceMutation,
	useDeleteInvoiceMutation,
	useUpdateInvoiceMutation,
} from '../store/slice/invoiceApi'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Spinner } from './Spinner/Spinner'
import moment from 'moment'
import {Link} from 'react-router-dom'

interface Invoice {
	id: number
	created_at: number
	invoice_number: string
	invoice_date: string
	due_date: string
	amount: number
	status: string
	notes: string
	sent_at: number
	client_id: number
}

function InvoiceList() {
	const { data: invoices = [], error, isLoading } = useGetInvoicesQuery()
	const [dataSource, setDataSource] = useState<Invoice[]>([])
	const [isModalVisible, setIsModalVisible] = useState(false)
	const [form] = Form.useForm()
	const [deleteInvoice] = useDeleteInvoiceMutation()
	const [createInvoice] = useCreateInvoiceMutation()
	const [updateInvoice] = useUpdateInvoiceMutation()
	const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)
	const [selectedKey, setSelectedKey] = useState<number | null>(null)
	const [isEditMode, setIsEditMode] = useState(false)
	const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)

	const dateFormat = 'YYYY-MM-DD'

	useEffect(() => {
		if (invoices) {
			setDataSource(
				invoices
					.slice()
					.sort((a, b) => a.id - b.id)
					.map(invoice => ({
						...invoice,
						key: invoice.id,
						invoice_date: moment(invoice.invoice_date).format(dateFormat),
						due_date: moment(invoice.due_date).format(dateFormat),
					}))
			)
		}
	}, [invoices])

	const handleDelete = (id: number) => {
		setSelectedKey(id)
		setIsDeleteModalVisible(true)
	}

	const handleOkDelete = async () => {
		if (selectedKey) {
			try {
				await deleteInvoice(selectedKey).unwrap()
				console.log('Invoice successfully deleted')
				toast.success('Invoice successfully deleted!', {
					position: 'bottom-right',
				})
				setDataSource(dataSource.filter(item => item.id !== selectedKey))
				setIsDeleteModalVisible(false)
				setSelectedKey(null)
			} catch (error) {
				console.error('Error when removing the invoice:', error)
				toast.error('Error when removing the invoice!', {
					position: 'bottom-right',
				})
			}
		}
	}

	const showModal = () => {
		setIsModalVisible(true)
		form.resetFields()
		setIsEditMode(false)
		form.setFieldsValue({ invoice_date: new Date().toISOString().slice(0, 10) })
	}

	const handleEdit = (id: number) => {
		const invoiceToEdit = dataSource.find(item => item.id === id)

		if (invoiceToEdit) {
			setIsEditMode(true)
			form.setFieldsValue({
				...invoiceToEdit,
				invoice_date: moment(invoiceToEdit.invoice_date),
				due_date: moment(invoiceToEdit.due_date),
			})
			setIsModalVisible(true)
		}
	}

	const handleOk = async () => {
		try {
			const values = await form.validateFields()

			if (isEditMode && editingInvoice) {
				const updatedValues = { ...values, id: editingInvoice.id }
				await updateInvoice(updatedValues).unwrap()
				console.log('The invoice is successfully updated')
				toast.success('The invoice is successfully updated!', {
					position: 'bottom-right',
				})

				setDataSource(
					dataSource.map(item =>
						item.id === editingInvoice.id ? updatedValues : item
					)
				)

				setIsEditMode(false)
				setEditingInvoice(null)
			} else if (!isEditMode) {
				values.invoice_date = new Date().toISOString().slice(0, 10)
				await createInvoice(values).unwrap()
				console.log('The new invoice has been successfully added')
				toast.success('The new invoice has been successfully added!', {
					position: 'bottom-right',
				})

				setDataSource([...dataSource, { key: `${Date.now()}`, ...values }])
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
		form.resetFields()
	}

	const invoiceStatuses = [
		{ value: 'Invoiced', label: 'Invoiced', color: 'blue' },
		{ value: 'In payment', label: 'In payment', color: 'orange' },
		{ value: 'Paid', label: 'Paid', color: 'green' },
		{ value: 'Timed out', label: 'Timed out', color: 'red' },
	]

	const getStatusColor = (status: string) => {
		const statusObj = invoiceStatuses.find(item => item.value === status)
		return statusObj ? statusObj.color : 'default'
	}

	const columns = [
		{
			title: 'ID Invoice',
			dataIndex: 'id',
			key: 'id',
			width: '70px',
			render: (text: number) => <Link to={`/invoice/${text}`}>{text}</Link>,
		},
		{
			title: 'Invoice Number',
			dataIndex: 'invoice_number',
			key: 'invoice_number',
			width: '70px',
		},
		{
			title: 'Invoice date',
			dataIndex: 'invoice_date',
			key: 'invoice_date',
			width: '70px',
		},
		{
			title: 'Due date',
			dataIndex: 'due_date',
			key: 'due_date',
			width: '70px',
			render: (dueDate: string) => (
				<span>{new Date(dueDate).toLocaleDateString()}</span>
			),
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			width: '50px',
			render: (status: string) => (
				<Tag color={getStatusColor(status)}>{status}</Tag>
			),
		},
		{
			title: 'Action',
			key: 'action',
			width: '150px',
			render: (_: any, record: Invoice) => (
				<>
					<Button type='link' onClick={() => handleEdit(record.id)}>
						Edit
					</Button>{' '}
					|
					<Button type='link' onClick={() => handleDelete(record.id)}>
						Delete
					</Button>
				</>
			),
		},
	]

	if (isLoading) return <Spinner />
	if (error) return <div>Error loading invoices</div>

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
				title={isEditMode ? 'Edit Invoice' : 'Add Invoice'}
				visible={isModalVisible}
				onOk={handleOk}
				onCancel={handleCancel}
			>
				<Form form={form} layout='vertical'>
					<Form.Item
						name='invoice_number'
						label='Invoice Number'
						rules={[
							{ required: true, message: 'Please enter an invoice number!' },
						]}
					>
						<Input />
					</Form.Item>

					<Form.Item
						name='due_date'
						label='Due Date'
						rules={[{ required: true, message: 'Please choose the due date!' }]}
					>
						<DatePicker style={{ width: '100%' }} format={dateFormat} />
					</Form.Item>

					<Form.Item
						name='status'
						label='Status'
						rules={[{ required: true, message: 'Please choose the status!' }]}
					>
						<Select placeholder='Choose the status'>
							{invoiceStatuses.map(status => (
								<Select.Option key={status.value} value={status.value}>
									{status.label}
								</Select.Option>
							))}
						</Select>
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title='Confirmation of removal'
				visible={isDeleteModalVisible}
				onOk={handleOkDelete}
				onCancel={handleCancel}
			>
				Are you sure you want to delete this invoice?
			</Modal>

			<ToastContainer position='bottom-right' />
		</>
	)
}

export { InvoiceList }
