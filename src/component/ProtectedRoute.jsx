import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F8F9FC',
        flexDirection: 'column',
        gap: 12,
      }}>
        <div style={{
          width: 36,
          height: 36,
          border: '3px solid #E2E6F0',
          borderTop: '3px solid #1B4FD8',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <span style={{ fontSize: 13, color: '#8896B3' }}>Уншиж байна...</span>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Оюутан зөвхөн зөвшөөрөгдсөн хуудсууд руу хандана
  if (roles && !roles.includes(user.role)) {
    // Оюутан бол нүүр хуудас руу шилжүүлэх
    if (user.role === 'student') {
      return <Navigate to="/" replace />
    }
    return <Navigate to="/dashboard" replace />
  }
  return children
}
