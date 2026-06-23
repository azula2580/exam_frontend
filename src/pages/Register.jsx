import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/style.css'
import '../styles/login.css'

export default function Register() {
  const navigate = useNavigate()
  const [role, setRole]     = useState('student')
  const [loading, setLoading] = useState(false)
  const [form, setForm]     = useState({ lastname:'', firstname:'', email:'', password:'', confirm:'', grade:'11А' })
  const [error, setError]   = useState('')

  const handle = e => setForm(p=>({...p,[e.target.name]:e.target.value}))

  const submit = e => {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Нууц үг таарахгүй байна.'); return }
    if (form.password.length < 8) { setError('Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой.'); return }
    setLoading(true); setError('')
    setTimeout(() => { setLoading(false); navigate('/dashboard') }, 1000)
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card" style={{ maxWidth:480 }}>
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
            <div className="auth-logo-name">ExamSys</div>
            <div className="auth-logo-sub">Цахим шалгалтын систем</div>
          </div>
        </div>

        <h1 className="auth-title">Бүртгэл үүсгэх</h1>
        <p className="auth-sub">Системд бүртгүүлж шалгалт өгч эхэлнэ.</p>

        <div style={{ marginBottom:'1.25rem' }}>
          <div className="form-label" style={{ marginBottom:8 }}>Хэрэглэгчийн төрөл</div>
          <div className="role-select">
            {[['student','🎓','Сурагч'],['teacher','👨‍🏫','Багш']].map(([r,icon,lbl])=>(
              <div key={r} className={`role-option ${role===r?'active':''}`} onClick={()=>setRole(r)}>
                <div className="role-icon">{icon}</div>
                <div className="role-label">{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {error && <div className="alert alert-danger" style={{ marginBottom:'1rem' }}>⚠ {error}</div>}

        <form onSubmit={submit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Овог *</label>
              <input className="form-control" name="lastname" placeholder="Батболд" required
                value={form.lastname} onChange={handle}/>
            </div>
            <div className="form-group">
              <label className="form-label">Нэр *</label>
              <input className="form-control" name="firstname" placeholder="Мөнхзаяа" required
                value={form.firstname} onChange={handle}/>
            </div>
          </div>

          {role === 'student' && (
            <div className="form-group">
              <label className="form-label">Анги</label>
              <select className="form-control" name="grade" value={form.grade} onChange={handle}>
                {['9А','9Б','10А','10Б','11А','11Б'].map(g=><option key={g}>{g}</option>)}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">И-мэйл *</label>
            <input className="form-control" name="email" type="email" placeholder="name@school.mn" required
              value={form.email} onChange={handle}/>
          </div>
          <div className="form-group">
            <label className="form-label">Нууц үг *</label>
            <input className="form-control" name="password" type="password" placeholder="Хамгийн багадаа 8 тэмдэгт" required
              value={form.password} onChange={handle}/>
          </div>
          <div className="form-group">
            <label className="form-label">Нууц үг давтах *</label>
            <input className="form-control" name="confirm" type="password" placeholder="••••••••" required
              value={form.confirm} onChange={handle}/>
            {form.confirm && form.password !== form.confirm &&
              <div className="form-error">Нууц үг таарахгүй байна.</div>}
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Бүртгэж байна...' : 'Бүртгэл үүсгэх →'}
          </button>
        </form>

        <div className="auth-footer">
          Бүртгэл байна уу?{' '}
          <Link to="/login" className="auth-link">Нэвтрэх</Link>
        </div>
      </div>
    </div>
  )
}
