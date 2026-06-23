import { useState, useEffect } from 'react'
import axios from 'axios'
import '../styles/style.css'

export default function Profile() {
  const [tab, setTab] = useState('info')
  const [user, setUser] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [pwSaved, setPwSaved] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ lastname:'', firstname:'', phone:'', grade:'' })
  const [pwForm, setPwForm] = useState({ current:'', next:'', confirm:'' })

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
  const token = localStorage.getItem('token')  
  const headers = { Authorization: `Bearer ${token}` }
  if (!token) {
    navigate('/login')
    return
  }
  Promise.all([
    axios.get('/api/auth/me', { headers }),
    axios.get('/api/sessions/my', { headers }).catch(() => ({ data: { data: [] } })),
  ]).then(([userRes, sessRes]) => {
    const u = userRes.data.data.user
    setUser(u)
    setForm({ lastname: u.lastname||'', firstname: u.firstname||'', phone: u.phone||'', grade: u.grade||'' })
    setSessions(sessRes.data.data || [])
  }).catch(console.error)
  .finally(() => setLoading(false))
}, [])

  const handleSave = async (e) => {
  e.preventDefault()
  setError('')
  const token = localStorage.getItem('token') 
  const headers = { Authorization: `Bearer ${token}` }
  try {
    await axios.put('/api/auth/profile', form, { headers })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  } catch (err) {
    setError(err.response?.data?.message || 'Алдаа гарлаа.')
  }
}

const handlePw = async (e) => {
  e.preventDefault()
  setError('')
  if (pwForm.next !== pwForm.confirm) return
  const token = localStorage.getItem('token')  
  const headers = { Authorization: `Bearer ${token}` }
  try {
    await axios.put('/api/auth/change-password', {
      currentPassword: pwForm.current,
      newPassword: pwForm.next,
    }, { headers })
    setPwSaved(true)
    setPwForm({ current:'', next:'', confirm:'' })
    setTimeout(() => setPwSaved(false), 3000)
  } catch (err) {
    setError(err.response?.data?.message || 'Алдаа гарлаа.')
  }
}

  if (loading) return <div className="page-wrap"><div className="container" style={{textAlign:'center',padding:'4rem'}}>Уншиж байна...</div></div>
  if (!user) return null

  const passed  = sessions.filter(s => s.score >= 60).length
  const avgScore = sessions.length
    ? Math.round(sessions.reduce((a,b) => a+(b.score||0), 0) / sessions.length)
    : 0
  const initials = (user.lastname?.[0]||'')+(user.firstname?.[0]||'')

  return (
    <div className="page-wrap">
      <div className="container" style={{maxWidth:820}}>
        <div className="page-header">
          <h1 className="page-title">Хувийн мэдээлэл</h1>
          <p className="page-sub">Бүртгэлийн мэдээлэл болон тохиргоо</p>
        </div>

        <div className="card" style={{marginBottom:'1.25rem'}}>
          <div style={{height:90,background:'linear-gradient(135deg, #1B4FD8, #0D7A5F)',borderRadius:'var(--radius-lg) var(--radius-lg) 0 0'}}/>
          <div className="card-body" style={{paddingTop:0}}>
            <div style={{display:'flex',alignItems:'flex-end',gap:16,marginTop:-30,marginBottom:'1rem'}}>
              <div className="avatar avatar-lg avatar-blue" style={{width:64,height:64,fontSize:22,border:'4px solid var(--surface)'}}>
                {initials}
              </div>
              <div style={{paddingBottom:4}}>
                <div style={{fontWeight:700,fontSize:18}}>{user.lastname} {user.firstname}</div>
                <div style={{color:'var(--text-2)',fontSize:13}}>{user.email} {user.grade ? `· ${user.grade} анги` : ''}</div>
              </div>
              <div style={{marginLeft:'auto',display:'flex',gap:8}}>
                <span className="badge badge-green">Идэвхтэй</span>
                <span className="badge badge-blue">{user.role==='teacher'?'Багш':user.role==='admin'?'Админ':'Сурагч'}</span>
              </div>
            </div>
            <div className="grid-3" style={{gap:'0.75rem'}}>
              {[
                { label:'Нийт шалгалт', value: sessions.length },
                { label:'Тэнцсэн',      value: `${passed}/${sessions.length}` },
                { label:'Дундаж оноо',  value: `${avgScore}%` },
              ].map((s,i) => (
                <div key={i} className="stat-card" style={{padding:'0.875rem 1rem'}}>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value" style={{fontSize:22}}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="tabs">
          {[['info','Үндсэн мэдээлэл'],['history','Шалгалтын түүх'],['password','Нууц үг солих']].map(([id,lbl])=>(
            <div key={id} className={`tab ${tab===id?'active':''}`} onClick={()=>setTab(id)}>{lbl}</div>
          ))}
        </div>

        {error && <div className="alert alert-danger" style={{marginBottom:'1rem'}}>{error}</div>}

        {tab==='info' && (
          <div className="card">
            <div className="card-header"><span className="card-title">Хувийн мэдээлэл засах</span></div>
            <div className="card-body">
              {saved && <div className="alert alert-success" style={{marginBottom:'1rem'}}>✓ Мэдээлэл амжилттай хадгалагдлаа!</div>}
              <form onSubmit={handleSave}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Овог *</label>
                    <input className="form-control" value={form.lastname}
                      onChange={e=>setForm(p=>({...p,lastname:e.target.value}))} required/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Нэр *</label>
                    <input className="form-control" value={form.firstname}
                      onChange={e=>setForm(p=>({...p,firstname:e.target.value}))} required/>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Утасны дугаар</label>
                    <input className="form-control" value={form.phone}
                      onChange={e=>setForm(p=>({...p,phone:e.target.value}))}/>
                  </div>
                  {user.role === 'student' && (
                  <div className="form-group" style={{maxWidth:180}}>
                    <label className="form-label">Анги</label>
                    <select className="form-control" value={form.grade}
                      onChange={e=>setForm(p=>({...p,grade:e.target.value}))}>
                      <option value="">—</option>
                      {['9А','9Б','10А','10Б','11А','11Б'].map(g=><option key={g}>{g}</option>)}
                    </select>
                  </div>
                )}
                </div>
                <button type="submit" className="btn btn-primary">Хадгалах</button>
              </form>
            </div>
          </div>
        )}

        {tab==='history' && (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>#</th><th>Шалгалт</th><th>Огноо</th><th>Оноо</th><th>Дүн</th></tr></thead>
              <tbody>
                {sessions.length === 0 ? (
                  <tr><td colSpan={5} style={{textAlign:'center',color:'var(--text-3)'}}>Шалгалтын түүх байхгүй байна</td></tr>
                ) : sessions.map((s,i) => (
                  <tr key={s._id}>
                    <td style={{color:'var(--text-3)'}}>{i+1}</td>
                    <td style={{fontWeight:500}}>{s.exam?.title || '—'}</td>
                    <td style={{color:'var(--text-2)',fontSize:12.5}}>
                      {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString('mn-MN') : '—'}
                    </td>
                    <td><span className={`fw-7 ${s.score>=80?'score-high':s.score>=60?'score-mid':'score-low'}`}>{s.score}%</span></td>
                    <td><span className={`badge ${s.score>=60?'badge-green':'badge-red'}`}>{s.score>=60?'Тэнцсэн':'Тэнцээгүй'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab==='password' && (
          <div className="card">
            <div className="card-header"><span className="card-title">Нууц үг солих</span></div>
            <div className="card-body" style={{maxWidth:420}}>
              {pwSaved && <div className="alert alert-success" style={{marginBottom:'1rem'}}>✓ Нууц үг амжилттай солигдлоо!</div>}
              <form onSubmit={handlePw}>
                <div className="form-group">
                  <label className="form-label">Одоогийн нууц үг *</label>
                  <input className="form-control" type="password" placeholder="••••••••" required
                    value={pwForm.current} onChange={e=>setPwForm(p=>({...p,current:e.target.value}))}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Шинэ нууц үг *</label>
                  <input className="form-control" type="password" placeholder="••••••••" required
                    value={pwForm.next} onChange={e=>setPwForm(p=>({...p,next:e.target.value}))}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Шинэ нууц үг давтах *</label>
                  <input className="form-control" type="password" placeholder="••••••••" required
                    value={pwForm.confirm} onChange={e=>setPwForm(p=>({...p,confirm:e.target.value}))}/>
                  {pwForm.confirm && pwForm.next !== pwForm.confirm &&
                    <div className="form-error">Нууц үг таарахгүй байна.</div>}
                </div>
                <button type="submit" className="btn btn-primary"
                  disabled={pwForm.next !== pwForm.confirm && pwForm.confirm !== ''}>
                  Нууц үг солих
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}