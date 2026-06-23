import { useState, useEffect } from 'react'
import axios from 'axios'
import '../styles/style.css'

const AVATAR_COLORS = [
  { bg:'#DBEAFE', color:'#1B4FD8' },
  { bg:'#DCFCE7', color:'#15803D' },
  { bg:'#FEF3C7', color:'#C47A00' },
  { bg:'#DCFDF5', color:'#0D7A5F' },
]
const scoreColor = s => s>=80?'score-high':s>=60?'score-mid':'score-low'

export default function Students() {
  const [students, setStudents] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [status, setStatus]     = useState('all')
  const [showAdd, setShowAdd]   = useState(false)
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState('')
  const [selected, setSelected] = useState(null)
  const [addForm, setAddForm]   = useState({ lastname:'', firstname:'', email:'', password:'' })

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const fetchStudents = () => {
    axios.get('/api/users', { headers })
      .then(res => setStudents((res.data.data || []).filter(u => u.role === 'student')))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchStudents() }, [])

  const filtered = students.filter(s => {
    const name = `${s.lastname || ''} ${s.firstname || ''}`
    const matchQ  = name.toLowerCase().includes(search.toLowerCase()) ||
                    (s.email||'').toLowerCase().includes(search.toLowerCase())
    const matchSt = status === 'all' || s.status === status
    return matchQ && matchSt
  })

  const totalAvg = students.length
    ? Math.round(students.reduce((a,b) => a + (b.avgScore||0), 0) / students.length)
    : 0
  const active = students.filter(s => s.status === 'active').length

  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await axios.post('/api/users', {
        lastname:  addForm.lastname,
        firstname: addForm.firstname,
        email:     addForm.email,
        password:  addForm.password,
        role:      'student',
      }, { headers })
      setSaved(true)
      setShowAdd(false)
      setAddForm({ lastname:'', firstname:'', email:'', password:'' })
      fetchStudents()
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Алдаа гарлаа.')
    }
  }

  if (loading) return <div className="page-wrap"><div className="container" style={{textAlign:'center',padding:'4rem'}}>Уншиж байна...</div></div>

  return (
    <div className="page-wrap">
      <div className="container">
        <div className="page-header">
          <div className="page-header-row">
            <div>
              <h1 className="page-title">Оюутнууд</h1>
              <p className="page-sub">Нийт {students.length} оюутан бүртгэгдсэн</p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Оюутан нэмэх</button>
          </div>
        </div>

        <div className="grid-4" style={{marginBottom:'1.25rem'}}>
          {[
            { label:'Нийт оюутан', value: students.length, icon:'👥' },
            { label:'Идэвхтэй',      value: active,           icon:'✅' },
            { label:'Дундаж оноо',   value: `${totalAvg}%`,  icon:'📊' },
            { label:'Тэнцсэн',       value: students.filter(s=>(s.avgScore||0)>=60).length, icon:'🏆' },
          ].map((s,i) => (
            <div key={i} className="stat-card">
              <div className="stat-label">{s.icon} {s.label}</div>
              <div className="stat-value" style={{fontSize:24}}>{s.value}</div>
            </div>
          ))}
        </div>

        {saved && <div className="alert alert-success" style={{marginBottom:'1rem'}}>Оюутан амжилттай нэмэгдлээ!</div>}
        {error && <div className="alert alert-danger" style={{marginBottom:'1rem'}}>{error}</div>}

        {showAdd && (
          <div className="card" style={{marginBottom:'1.25rem'}}>
            <div className="card-header">
              <span className="card-title">Шинэ оюутан нэмэх</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAdd(false)}>✕ Хаах</button>
            </div>
            <div className="card-body">
              <form onSubmit={handleAdd}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Овог *</label>
                    <input className="form-control" placeholder="жишээ нь: Батболд" required
                      value={addForm.lastname} onChange={e=>setAddForm(p=>({...p,lastname:e.target.value}))}/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Нэр *</label>
                    <input className="form-control" placeholder="жишээ нь: Мөнхзаяа" required
                      value={addForm.firstname} onChange={e=>setAddForm(p=>({...p,firstname:e.target.value}))}/>
                  </div>
                </div>
                <div className="form-group">
                    <label className="form-label">И-мэйл *</label>
                    <input className="form-control" type="email" placeholder="student@school.mn" required
                      value={addForm.email} onChange={e=>setAddForm(p=>({...p,email:e.target.value}))}/>
                  </div>
                <div className="form-group">
                  <label className="form-label">Нууц үг *</label>
                  <input className="form-control" type="password" placeholder="Доод тал нь 6 тэмдэгт" required
                    value={addForm.password} onChange={e=>setAddForm(p=>({...p,password:e.target.value}))}/>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button type="submit" className="btn btn-primary">Нэмэх</button>
                  <button type="button" className="btn btn-ghost" onClick={()=>setShowAdd(false)}>Болих</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div style={{display:'flex',gap:10,marginBottom:'1rem',flexWrap:'wrap',alignItems:'center'}}>
          <input className="form-control" type="search" placeholder="Нэр, и-мэйлээр хайх..."
            value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:260}}/>
          <select className="form-control" style={{maxWidth:140}} value={status} onChange={e=>setStatus(e.target.value)}>
            <option value="all">Бүх төлөв</option>
            <option value="active">Идэвхтэй</option>
            <option value="inactive">Идэвхгүй</option>
          </select>
          <span style={{fontSize:12.5,color:'var(--text-3)',marginLeft:'auto'}}>{filtered.length} оюутан</span>
        </div>

        <div className="tbl-wrap">
          {filtered.length === 0 ? (
            <div className="empty" style={{background:'var(--surface)'}}>
              <div className="empty-icon">👥</div>
              <div className="empty-title">Оюутан олдсонгүй</div>
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr><th>#</th><th>Нэр</th><th>И-мэйл</th><th>Төлөв</th><th>Үйлдэл</th></tr>
              </thead>
              <tbody>
                {filtered.map((s,i) => {
                  const av = AVATAR_COLORS[i % AVATAR_COLORS.length]
                  const name = `${s.lastname||''} ${s.firstname||''}`
                  return (
                    <tr key={s._id}>
                      <td style={{color:'var(--text-3)',fontWeight:600}}>{i+1}</td>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:10}}>
                          <div className="avatar avatar-sm" style={{background:av.bg,color:av.color}}>
                            {(s.lastname?.[0]||'')+(s.firstname?.[0]||'')}
                          </div>
                          <span style={{fontWeight:600}}>{name}</span>
                        </div>
                      </td>
                      <td style={{color:'var(--text-2)',fontSize:12.5}}>{s.email}</td>
                      <td>
                        <span className={`badge ${s.status==='active'?'badge-green':'badge-gray'}`}>
                          {s.status==='active'?'Идэвхтэй':'Идэвхгүй'}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-outline btn-sm" onClick={()=>setSelected(s)}>Дэлгэрэнгүй</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {selected && (
          <div style={{position:'fixed',inset:0,background:'rgba(15,23,42,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200}}
            onClick={()=>setSelected(null)}>
            <div className="card" style={{width:380,padding:0}} onClick={e=>e.stopPropagation()}>
              <div className="card-header">
                <span className="card-title">Оюутны мэдээлэл</span>
                <button className="btn btn-ghost btn-sm" onClick={()=>setSelected(null)}>✕</button>
              </div>
              <div className="card-body">
                <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:'1.25rem'}}>
                  <div className="avatar avatar-lg avatar-blue">
                    {(selected.lastname?.[0]||'')+(selected.firstname?.[0]||'')}
                  </div>
                  <div>
                    <div style={{fontWeight:700,fontSize:16}}>{selected.lastname} {selected.firstname}</div>
                    <div style={{color:'var(--text-2)',fontSize:13}}>{selected.email}</div>
                  </div>
                </div>
                {[
                  ['Утас', selected.phone||'—'],
                  ['Төлөв', selected.status==='active'?'Идэвхтэй':'Идэвхгүй'],
                ].map(([l,v],i) => (
                  <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid var(--border)',fontSize:13.5}}>
                    <span style={{color:'var(--text-2)'}}>{l}</span>
                    <span style={{fontWeight:600}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
