import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Dashboard from './Dashboard'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/servers" element={<Dashboard />} />
        <Route path="/analytics" element={<Dashboard />} />
        <Route path="/sales-analytics" element={<Dashboard />} />
        <Route path="/monitoring" element={<Dashboard />} />
        <Route path="/pos-admins" element={<Dashboard />} />
        <Route path="/customers" element={<Dashboard />} />
        <Route path="/inventory" element={<Dashboard />} />
        <Route path="/suppliers" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}