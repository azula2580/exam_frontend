import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'
const AuthContext = createContext(null)
axios.defaults.baseURL = 'https://exam-backend-hs3y.onrender.com'
axios.interceptors.request.use(cfg => {
  const token = sessionStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})
axios.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
      window.location.href = '/exam_frontend/login'
    }
    return Promise.reject(err)
  }
)
const api = axios.create({
  baseURL: 'https://exam-backend-hs3y.onrender.com/api'
})
api.interceptors.request.use(cfg => {
  const token = sessionStorage.getItem('token')  
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const token = sessionStorage.getItem('token')  
      if (!token) { setLoading(false); return }
      try {
        const res = await api.get('/auth/me')
        setUser(res.data.data.user)
      } catch {
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('user')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { user, token } = res.data.data
    sessionStorage.setItem('token', token)          
    sessionStorage.setItem('user', JSON.stringify(user)) 
    setUser(user)
    return user
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem('token')   
    sessionStorage.removeItem('user')    
    setUser(null)
    window.location.href = '/exam_frontend/login'
  }, [])

  const updateUser = useCallback((updated) => {
    setUser(updated)
    sessionStorage.setItem('user', JSON.stringify(updated))  
  }, [])
  const value = {
    user, loading, login, logout, updateUser,
    isAdmin:   user?.role === 'admin',
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student',
    isLoggedIn: !!user,
  }
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth-г AuthProvider дотор ашиглана уу.')
  return ctx
}
