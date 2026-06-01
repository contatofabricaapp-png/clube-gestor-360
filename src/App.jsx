import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import SocioHome from './pages/socio/HomePage'
import ReservaPage from './pages/socio/ReservaPage'
import MinhasReservasPage from './pages/socio/MinhasReservasPage'
import FilaPage from './pages/socio/FilaPage'
import LousaPage from './pages/funcionario/LousaPage'
import AdminDashboard from './pages/admin/DashboardPage'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import { StoreProvider } from './store/useStore.jsx'

function PrivateRoute({ children, roles }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.perfil)) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
    <StoreProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/socio" element={<PrivateRoute roles={['socio', 'admin']}><SocioHome /></PrivateRoute>} />
        <Route path="/socio/reserva/:moduloId" element={<PrivateRoute roles={['socio', 'admin']}><ReservaPage /></PrivateRoute>} />
        <Route path="/socio/reservas" element={<PrivateRoute roles={['socio', 'admin']}><MinhasReservasPage /></PrivateRoute>} />
        <Route path="/socio/fila" element={<PrivateRoute roles={['socio', 'admin']}><FilaPage /></PrivateRoute>} />

        <Route path="/lousa" element={
          <PrivateRoute roles={['funcionario', 'admin']}>
            <LousaPage />
          </PrivateRoute>
        } />

        <Route path="/admin/*" element={
          <PrivateRoute roles={['admin']}>
            <AdminDashboard />
          </PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
    </StoreProvider>
    </AuthProvider>
  )
}
