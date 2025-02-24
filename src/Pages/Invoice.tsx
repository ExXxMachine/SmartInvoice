import { useParams } from 'react-router-dom'
function Invoice() {
	const { id } = useParams<{ id: string }>()
	return <div>{id}</div>
}

export { Invoice }
