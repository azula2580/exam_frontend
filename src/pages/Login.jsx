import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'  
import '../styles/style.css'
import '../styles/login.css'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()  
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

 const handleSubmit = async (e) => {
  e.preventDefault()
  setError('')
  if (!form.email || !form.password) {
    setError('Бүх талбарыг бөглөнө үү.')
    return
  }
  setLoading(true)
  try {
    const res = await axios.post('https://exam-backend-hs3y.onrender.com/api/auth/login', form)
    const { user, token } = res.data.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    
    if (user.role === 'teacher' || user.role === 'admin') {
      window.location.href = '/exam_frontend/dashboard'
    } else {
      window.location.href = '/exam_frontend/'
    }
  } catch (err) {
    setError(err.response?.data?.message || 'Нэвтрэхэд алдаа гарлаа')
  } finally {
    setLoading(false)
  }
}

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white"/>
              <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" opacity="0.6"/>
              <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" opacity="0.6"/>
              <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white"/>
            </svg>
          </div>
          <div>
            <div className="auth-logo-name">ExamSystem</div>
            <div className="auth-logo-sub">Цахим шалгалт ба үнэлгээний систем</div>
          </div>
        </div>
        <h1 className="auth-title">Нэвтрэх</h1>
        <p className="auth-sub">Системд нэвтрэхийн тулд мэдээллээ оруулна уу.</p>
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">И-мэйл хаяг</label>
            <input className="form-control" type="email" name="email"
              placeholder="example@school.mn" value={form.email} onChange={handleChange}/>
          </div>
          <div className="form-group">
            <label className="form-label">Нууц үг</label>
            <input className="form-control" type="password" name="password"
              placeholder="••••••••" value={form.password} onChange={handleChange}/>
            <div style={{ textAlign:'right', marginTop:6 }}>
              <a href="#" className="auth-link" style={{ fontSize:12 }}>Нууц үг мартсан уу?</a>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg"
            disabled={loading} style={{ marginTop:4 }}>
            {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх →'}
          </button>
        </form>
      </div>
    </div>
  )
}
