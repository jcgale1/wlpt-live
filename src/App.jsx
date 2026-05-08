import { Routes, Route, Navigate } from 'react-router-dom'
import { StoreProvider } from './lib/store.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Admin from './pages/Admin.jsx'

export default function App() {
  return (
    <StoreProvider>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tv" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </StoreProvider>
  )
}
