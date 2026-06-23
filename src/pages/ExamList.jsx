import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import '../styles/style.css'

const STATUS_MAP = {
  active:  { cls:'badge-green', lbl:'Идэвхтэй' },
  draft:   { cls:'badge-amber', lbl:'Ноорог' },
  closed:  { cls:'badge-gray',  lbl:'Хаагдсан' },
}
const scoreColor = s => s>=80?'#15803D':s>=60?'#C47A00':'#B91C1C'

export default function ExamList() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isTeacher = ['teacher','admin'].includes(user?.role)

  const [deleting, setDeleting] = useState(null)
  const [exams, setExams]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')
  const [search, setSearch]     = useState('')

  const handleDelete = async (id) => {
    if (!window.confirm('Энэ шалгалтыг устгах уу?')) return
    setDeleting(id)
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`/api/exams/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setExams(prev => prev.filter(e => e._id !== id))
    } catch (err) {
      alert(err.response?.data?.message || 'Устгахад алдаа гарлаа.')
    } finally {
      setDeleting(null)
    }
  }

  const handleStatus = async (id, status) => {
    const token = localStorage.getItem('token')
    try {
      await axios.patch(`/api/exams/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setExams(prev => prev.map(e => e._id === id ? {...e, status} : e))
    } catch (err) {
      alert(err.response?.data?.message || 'Алдаа гарлаа.')
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    const params = !isTeacher ? { params: { status: 'active' } } : {}
    axios.get('/api/exams', {
      headers: { Authorization: `Bearer ${token}` },
      ...params
    })
      .then(res => setExams(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = exams.filter(e => {
    const matchF = filter === 'all' || e.status === filter
    const matchS = e.title?.toLowerCase().includes(search.toLowerCase()) ||
                   e.subject?.toLowerCase().includes(search.toLowerCase())
    return matchF && matchS
  })

  if (loading) return <div className="page-wrap"><div className="container" style={{textAlign:'center',padding:'4rem'}}>Уншиж байна...</div></div>

  return (
    <div className="page-wrap">
      <div className="container">
        <div className="page-header">
          <div className="page-header-row">
            <div>
              <h1 className="page-title">Шалгалтууд</h1>
              <p className="page-sub">Нийт {exams.length} шалгалт бүртгэлтэй</p>
            </div>
            {/* ✅ Зөвхөн багш/admin шинэ шалгалт үүсгэх */}
            {isTeacher && (
              <Link to="/exams/create" className="btn btn-primary">+ Шинэ шалгалт</Link>
            )}
          </div>
        </div>

        {/* ✅ Зөвхөн багш/admin шүүлтүүр харна */}
        {isTeacher && (
          <div style={{display:'flex',gap:10,marginBottom:'1rem',flexWrap:'wrap',alignItems:'center'}}>
            <input className="form-control" type="search" placeholder="🔍  Шалгалт хайх..."
              value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:260}}/>
            {[['all','Бүгд'],['active','Идэвхтэй'],['draft','Ноорог'],['closed','Хаагдсан']].map(([v,l])=>(
              <button key={v} className={`btn btn-sm ${filter===v?'btn-primary':'btn-ghost'}`} onClick={()=>setFilter(v)}>{l}</button>
            ))}
            <span style={{fontSize:12.5,color:'var(--text-3)',marginLeft:'auto'}}>{filtered.length} шалгалт</span>
          </div>
        )}

        {/* ✅ Сурагчид хайлт харагдана, шүүлтүүр харагдахгүй */}
        {!isTeacher && (
          <div style={{display:'flex',gap:10,marginBottom:'1rem'}}>
            <input className="form-control" type="search" placeholder="🔍  Шалгалт хайх..."
              value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:260}}/>
            <span style={{fontSize:12.5,color:'var(--text-3)',marginLeft:'auto'}}>{filtered.length} шалгалт</span>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="card"><div className="card-body">
            <div className="empty">
              <div className="empty-icon">📋</div>
              <div className="empty-title">Шалгалт олдсонгүй</div>
              <div className="empty-desc">Хайлт эсвэл шүүлтүүрийг өөрчилнө үү</div>
            </div>
          </div></div>
        ) : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Шалгалтын нэр</th><th>Хичээл</th><th>Асуулт</th>
                  <th>Хугацаа</th>
                  {isTeacher && <><th>Оролцогч</th><th>Дундаж</th><th>Огноо</th><th>Төлөв</th></>}
                  <th>Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(ex => {
                  const sb   = STATUS_MAP[ex.status] || STATUS_MAP.draft
                  const date = ex.startAt ? new Date(ex.startAt).toLocaleDateString('mn-MN') : '—'
                  return (
                    <tr key={ex._id}>
                      <td style={{fontWeight:600}}>{ex.title}</td>
                      <td><span className="badge badge-blue">{ex.subject}</span></td>
                      <td>{ex.questions?.length || 0}</td>
                      <td>{ex.duration} мин</td>
                      {isTeacher && (
                        <>
                          <td>{ex.participantCount || 0}</td>
                          <td>{ex.avgScore
                            ? <span style={{fontWeight:700,color:scoreColor(ex.avgScore)}}>{ex.avgScore}%</span>
                            : <span style={{color:'var(--text-3)'}}>—</span>}
                          </td>
                          <td style={{color:'var(--text-2)',fontSize:12.5}}>{date}</td>
                          <td><span className={`badge ${sb.cls}`}>{sb.lbl}</span></td>
                        </>
                      )}
                      <td>
                        <div style={{display:'flex',gap:6}}>
                          <Link to={`/exams/${ex._id}`} className="btn btn-outline btn-sm">Харах</Link>

                          {/* Сурагч */}
                          {!isTeacher && ex.status === 'active' && (
                            <Link to={`/exams/${ex._id}/take`} className="btn btn-primary btn-sm">Өгөх</Link>
                          )}

                          {/* Багш/admin */}
                          {isTeacher && (
                            <>
                              {ex.status === 'draft' && (
                                <button className="btn btn-success btn-sm" onClick={() => handleStatus(ex._id, 'active')}>
                                  Нээх
                                </button>
                              )}
                              {ex.status === 'active' && (
                                <button className="btn btn-ghost btn-sm" onClick={() => handleStatus(ex._id, 'closed')}>
                                  Хаах
                                </button>
                              )}
                              <button
                                className="btn btn-danger btn-sm"
                                disabled={deleting === ex._id}
                                onClick={() => handleDelete(ex._id)}
                              >
                                {deleting === ex._id ? '...' : 'Устгах'}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}