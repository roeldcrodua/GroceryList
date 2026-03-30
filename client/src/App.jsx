import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import EditListPage from './pages/EditListPage'
import ListDetailPage from './pages/ListDetailPage'
import ListsPage from './pages/ListsPage'
import NewListPage from './pages/NewListPage'

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ListsPage />} />
        <Route path="/lists/new" element={<NewListPage />} />
        <Route path="/lists/:listId" element={<ListDetailPage />} />
        <Route path="/lists/:listId/edit" element={<EditListPage />} />
      </Routes>
    </Layout>
  )
}

export default App
