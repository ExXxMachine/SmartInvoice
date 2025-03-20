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
	Collapse,
} from 'antd'
import { PlusOutlined, FilterOutlined } from '@ant-design/icons'
import {
	useGetInvoicesQuery,
	useCreateInvoiceMutation,
	useDeleteInvoiceMutation,
	useUpdateInvoiceMutation,
} from '../store/slice/invoiceApi'
import { useGetClientsQuery } from '../store/slice/clientApi'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Spinner } from './Spinner/Spinner'
import moment from 'moment'
import { Link, useNavigate } from 'react-router-dom'

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
	const {
		data: clients = [],
		isLoading: isClientsLoading,
		error: clientsError,
	} = useGetClientsQuery()
	const [originalData, setOriginalData] = useState<Invoice[]>([])
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
	const [selectedDate, setSelectedDate] = useState<string | null>(null)
	const [selectedClient, setSelectedClient] = useState<number | null>(null)
	const [selectedDueDate, setSelectedDueDate] = useState<string | null>(null)
	const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const navigate = useNavigate()

	const dateFormat = 'YYYY-MM-DD'

	useEffect(() => {
		if (invoices) {
			const formattedInvoices = invoices
				.slice()
				.sort((a, b) => a.id - b.id)
				.map(invoice => ({
					...invoice,
					key: invoice.id,
					invoice_date: moment(invoice.invoice_date).format(dateFormat),
					due_date: moment(invoice.due_date).format(dateFormat),
				}))
			setOriginalData(formattedInvoices)
			setDataSource(formattedInvoices)
		}
	}, [invoices])

	const handleDelete = (id: number) => {
		console.log('Deleting invoice with ID:', id)
		setSelectedKey(id)
		setIsDeleteModalVisible(true)
	}

	const handleOkDelete = async () => {
		if (selectedKey) {
			console.log('Attempting to delete invoice with selectedKey:', selectedKey)
			try {
				const result = await deleteInvoice(selectedKey).unwrap()
				console.log('Delete result:', result)
				toast.success('Invoice successfully deleted!', {
					position: 'bottom-right',
				})
				setDataSource(prevDataSource =>
					prevDataSource.filter(item => item.id !== selectedKey)
				)
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
		setIsSubmitting(true)
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
				const newInvoice = await createInvoice(values).unwrap()
				console.log('The new invoice has been successfully added')
				toast.success('The new invoice has been successfully added!', {
					position: 'bottom-right',
				})

				const formattedInvoice = {
					...newInvoice,
					key: newInvoice.id,
					invoice_date: moment(newInvoice.invoice_date).format(dateFormat),
					due_date: moment(newInvoice.due_date).format(dateFormat),
				}
				setDataSource([...dataSource, formattedInvoice])
				navigate(`/invoice/${formattedInvoice.id}`)
			}

			form.resetFields()
			setIsModalVisible(false)
		} catch (errorInfo) {
			console.error('error:', errorInfo)
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleCancel = () => {
		setIsModalVisible(false)
		setIsDeleteModalVisible(false)
		form.resetFields()
	}

	const SearchByFilter = () => {
		const filteredData = originalData.filter(element => {
			const dateMatch = !selectedDate || element.invoice_date === selectedDate
			const clientMatch =
				!selectedClient || element.client_id === selectedClient
			const dueDateMatch =
				!selectedDueDate || element.due_date === selectedDueDate
			const statusMatch = !selectedStatus || element.status === selectedStatus

			return dateMatch && clientMatch && dueDateMatch && statusMatch
		})
		setDataSource(filteredData)
	}

	const ResetFilter = () => {
		setSelectedDate(null)
		setSelectedClient(null)
		setSelectedDueDate(null)
		setSelectedStatus(null)
		setDataSource(originalData)
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
				<span>{moment(dueDate).format(dateFormat)}</span>
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

	if (isLoading || isClientsLoading) return <Spinner />
	if (error || clientsError) return <div>Error loading invoices</div>

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

			<Collapse style={{ marginBottom: '16px', width: '100%' }}>
				<Collapse.Panel
					header={
						<span>
							<FilterOutlined /> Filters
						</span>
					}
					key='1'
				>
					<div
						style={{
							display: 'flex',
							gap: '10px',
							flexWrap: 'wrap',
							alignItems: 'flex-end',
							width: '100%',
						}}
					>
						<div style={{ flex: 1, minWidth: '250px' }}>
							<label style={{ display: 'block', marginBottom: '4px' }}>
								Client:
							</label>
							<Select
								showSearch
								style={{ width: '100%' }}
								placeholder='Select a client'
								optionFilterProp='children'
								value={selectedClient}
								onChange={value => setSelectedClient(value)}
								filterOption={(input, option) =>
									(option?.children as string)
										?.toLowerCase()
										.indexOf(input.toLowerCase()) >= 0
								}
							>
								{clients.map(client => (
									<Select.Option key={client.id} value={client.id}>
										{client.name}
									</Select.Option>
								))}
							</Select>
						</div>

						<div style={{ flex: 1, minWidth: '150px' }}>
							<label style={{ display: 'block', marginBottom: '4px' }}>
								Invoice Date:
							</label>
							<DatePicker
								style={{ width: '100%' }}
								format={dateFormat}
								value={selectedDate ? moment(selectedDate) : null}
								onChange={(date, dateString) => setSelectedDate(dateString)}
							/>
						</div>

						<div style={{ flex: 1, minWidth: '150px' }}>
							<label style={{ display: 'block', marginBottom: '4px' }}>
								Due Date:
							</label>
							<DatePicker
								style={{ width: '100%' }}
								format={dateFormat}
								value={selectedDueDate ? moment(selectedDueDate) : null}
								onChange={(date, dateString) => setSelectedDueDate(dateString)}
							/>
						</div>

						<div style={{ flex: 1, minWidth: '100px' }}>
							<label style={{ display: 'block', marginBottom: '4px' }}>
								Status:
							</label>
							<Select
								style={{ width: '100%' }}
								placeholder='Select a status'
								value={selectedStatus}
								onChange={value => setSelectedStatus(value)}
							>
								{invoiceStatuses.map(status => (
									<Select.Option key={status.value} value={status.value}>
										{status.label}
									</Select.Option>
								))}
							</Select>
						</div>

						<div style={{ flex: 1, minWidth: '200px', marginTop: 'auto' }}>
							<Button type='primary' onClick={SearchByFilter}>
								Search
							</Button>
							<Button onClick={ResetFilter} style={{ marginLeft: '10px' }}>
								Clear
							</Button>
						</div>
					</div>
				</Collapse.Panel>
			</Collapse>

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
				okButtonProps={{
					loading: isSubmitting, 
					disabled: isSubmitting, 
				}}
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
