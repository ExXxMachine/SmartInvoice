import { useState } from 'react'
import { Layout, Menu, theme } from 'antd'
import { ClientList } from '../Components/ClientList'
import { InvoiceList } from '../Components/invoiceList'
import type { MenuProps } from 'antd'

const { Sider, Content } = Layout

function Workspace() {
	const [selectedKey, setSelectedKey] = useState('Invoice')

	const items1: MenuProps['items'] = ['Invoice', 'Clients'].map(key => ({
		key,
		label: key,
	}))

	const {
		token: { colorBgContainer, borderRadiusLG },
	} = theme.useToken()

	const handleMenuClick = (e: { key: string }) => {
		setSelectedKey(e.key)
	}

	const renderContent = () => {
		switch (selectedKey) {
			case 'Invoice':
				return <InvoiceList />
			case 'Clients':
				return <ClientList />
			default:
				return null
		}
	}

	return (
		<Layout
			style={{
				padding: '24px',
				margin: '50px',
				background: colorBgContainer,
				borderRadius: borderRadiusLG,
				minHeight: '75vh',
			}}
		>
			<Sider width={'200px'}>
				<Menu
					mode='inline'
					defaultSelectedKeys={['Invoice']}
					selectedKeys={[selectedKey]}
					onClick={handleMenuClick}
					style={{ height: '100%', borderRight: '2px solid #e8e8e8' }}
					items={items1}
				/>
			</Sider>
			<Content style={{ padding: '0 24px', minHeight: 280 }}>
				{renderContent()}
			</Content>
		</Layout>
	)
}

export { Workspace }
