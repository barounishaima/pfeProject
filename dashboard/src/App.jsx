import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import 'primereact/resources/themes/lara-light-indigo/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'
import Home from './components/Home'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HistoriqueDesScans from './components/HistoriqueDesScans'
import ListeVulnerabilite from './components/ListeVulnerabilite'
import ListesDesTickets from './components/ListesDesTickets'
import GestionUtilisateurs from './components/GestionUtilisateurs'
import GestionScans from './components/GestionScans'
import AddUser from './components/AddUser'
import TicketUtilisateur from './components/TicketUtilisateur'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<Login />} />
        <Route path='/adminlogin' element={<Login />} />

        {/* Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['user', 'manager']} />}>
      <Route path='/dashboard' element={<Dashboard />}>
        <Route index element={<Home />} />

        {/* Shared route (both user and manager) */}
        <Route path='vulnerabilites' element={<ListeVulnerabilite />} />
        <Route path='scans' element={<HistoriqueDesScans />} />

        {/* Only for user */}
        <Route element={<ProtectedRoute allowedRoles={['user']} />}>
          <Route path='MesTickets' element={<TicketUtilisateur />} />
        </Route>

        {/* Only for manager */}
        <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
          <Route path='tickets' element={<ListesDesTickets />} />
          <Route path='gestionScans' element={<GestionScans />} />
          <Route path='gestionUtilisateurs' element={<GestionUtilisateurs />} />
          <Route path='AddUser' element={<AddUser />} />
        </Route>
      </Route>
    </Route>


        {/* Fallback */}
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
