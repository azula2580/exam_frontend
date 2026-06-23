import { useState, useEffect } from 'react'
import axios from 'axios'
import '../styles/style.css'

const scoreColor = s => s>=80?'#15803D':s>=60?'#C47A00':'#B91C1C'
const AVATAR_COLORS = [
  { bg:'#DBEAFE', color:'#1B4FD8' },
  { bg:'#DCFCE7', color:'#15803D' },
  { bg:'#FEF3C7', color:'#C47A00' },
  { bg:'#DCFDF5', color:'#0D7A5F' },
]

export default function Results() {
  const [tab, setTab]         = useState('overview')
  const [exams, setExams]     = useState([])
  const [sessions, setSessions] = useState([])
  const [selectedExam, setSelectedExam] = useState('')
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('token')
  const user  = JSON.parse(localStorage.getItem('user') || '{}')
  const headers = { Authorization: `Bearer ${token}` }
  const isTeacher = user.role === 'teacher' || user.role === 'admin'

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isTeacher) {
          // Багш: бүх шалгалт татаж, сонгосон шалгалтын session-уудыг харна
          const examRes = await axios.get('/api/exams', { headers })
          const examList = examRes.data.data || []
          setExams(examList)
          if (examList.length > 0) {
            setSelectedExam(examList[0]._id)
          }
        } else {
          // Сурагч: өөрийн session-уудыг харна
          const sessRes = await axios.get('/api/sessions/my', { headers })
          setSessions(sessRes.data.data || [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Багш сонгосон шалгалтын session-уудыг татах
  useEffect(() => {
    if (!selectedExam || !isTeacher) return
    axios.get(`/api/sessions/exam/${selectedExam}`, { headers })
      .then(res => setSessions(res.data.data || []))
      .catch(console.error)
  }, [selectedExam])

  if (loading) return (
    <div className="page-wrap">
      <div className="container" style={{textAlign:'center',padding:'4rem'}}>Уншиж байна...</div>
    </div>
  )

  // Статистик тооцоолох
  const total    = sessions.length
  const avgScore = total ? Math.round(sessions.reduce((s,r) => s+(r.score||0), 0) / total) : 0
  const passed   = sessions.filter(s => s.score >= 60).length
  const failed   = total - passed
  const highest  = total ? Math.max(...sessions.map(s => s.score||0)) : 0
  const lowest   = total ? Math.min(...sessions.map(s => s.score||0)) : 0
  const median   = total ? [...sessions].sort((a,b)=>a.score-b.score)[Math.floor(total/2)]?.score : 0

  // Оноосны тархалт
  const dist = [
    { range:'90–100%', count: sessions.filter(s=>s.score>=90).length, color:'#15803D' },
    { range:'80–89%',  count: sessions.filter(s=>s.score>=80&&s.score<90).length, color:'#1B4FD8' },
    { range:'70–79%',  count: sessions.filter(s=>s.score>=70&&s.score<80).length, color:'#85B7EB' },
    { range:'60–69%',  count: sessions.filter(s=>s.score>=60&&s.score<70).length, color:'#C47A00' },
    { range:'0–59%',   count: sessions.filter(s=>s.score<60).length, color:'#B91C1C' },
  ]
  const maxDist = Math.max(...dist.map(d=>d.count), 1)

  const sorted = [...sessions].sort((a,b) => (b.score||0)-(a.score||0))

  return (
    <div className="page-wrap">
      <div className="container">
        <div className="page-header">
          <div className="page-header-row">
            <div>
              <h1 className="page-title">Үр дүн & Дүн шинжилгээ</h1>
              <p className="page-sub">Шалгалтын дэлгэрэнгүй үр дүн, статистик мэдээлэл</p>
            </div>
            {isTeacher && exams.length > 0 && (
              <select className="form-control" style={{maxWidth:280}}
                value={selectedExam} onChange={e=>setSelectedExam(e.target.value)}>
                {exams.map(e => (
                  <option key={e._id} value={e._id}>{e.title}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="tabs">
          {[['overview','Ерөнхий'],['detail','Дэлгэрэнгүй']].map(([id,lbl])=>(
            <div key={id} className={`tab ${tab===id?'active':''}`} onClick={()=>setTab(id)}>{lbl}</div>
          ))}
        </div>

        {tab==='overview' && (
          <div>
            <div className="grid-4" style={{marginBottom:'1.25rem'}}>
              {[
                { label:'Нийт оролцогч', value: total },
                { label:'Дундаж оноо',   value: `${avgScore}%` },
                { label:'Тэнцсэн',       value: passed },
                { label:'Тэнцээгүй',     value: failed },
              ].map((s,i) => (
                <div key={i} className="stat-card">
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value">{s.value}</div>
                </div>
              ))}
            </div>

            <div className="grid-2">
              <div className="card">
                <div className="card-header"><span className="card-title">Оноосны тархалт</span></div>
                <div className="card-body">
                  {total === 0 ? (
                    <p style={{color:'var(--text-3)',fontSize:13}}>Өгөгдөл байхгүй байна.</p>
                  ) : dist.map((d,i) => (
                    <div key={i} className="bar-row">
                      <div className="bar-lbl">{d.range}</div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{width:`${(d.count/maxDist)*100}%`,background:d.color}}/>
                      </div>
                      <div className="bar-val">{d.count}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="card-header"><span className="card-title">Дэлгэрэнгүй статистик</span></div>
                <div className="card-body">
                  {[
                    ['Нийт оролцогч', total],
                    ['Дундаж оноо',   `${avgScore}%`],
                    ['Медиан оноо',   `${median}%`],
                    ['Хамгийн өндөр', total ? `${highest}%` : '—'],
                    ['Хамгийн бага',  total ? `${lowest}%`  : '—'],
                    ['Тэнцсэн (≥60%)',`${passed} (${total?Math.round(passed/total*100):0}%)`],
                    ['Тэнцээгүй',    `${failed} (${total?Math.round(failed/total*100):0}%)`],
                  ].map(([l,v],i) => (
                    <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid var(--border)',fontSize:13.5}}>
                      <span style={{color:'var(--text-2)'}}>{l}</span>
                      <span style={{fontWeight:700}}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab==='detail' && (
          <div className="tbl-wrap">
            {total === 0 ? (
              <div className="empty" style={{background:'var(--surface)'}}>
                <div className="empty-icon">📊</div>
                <div className="empty-title">Үр дүн байхгүй байна</div>
              </div>
            ) : (
              <table className="tbl">
                <thead>
                  <tr><th>#</th><th>Нэр</th><th>Шалгалт</th><th>Оноо</th><th>Огноо</th><th>Дүн</th></tr>
                </thead>
                <tbody>
                  {sorted.map((s,i) => {
                    const av   = AVATAR_COLORS[i % AVATAR_COLORS.length]
                    const name = s.student?.lastname
                      ? `${s.student.lastname[0]}. ${s.student.firstname}`
                      : s.student?.firstname || 'Тодорхойгүй'
                    const date = s.submittedAt
                      ? new Date(s.submittedAt).toLocaleDateString('mn-MN')
                      : '—'
                    const examTitle = s.exam?.title || '—'
                    return (
                      <tr key={s._id}>
                        <td style={{color:'var(--text-3)',fontWeight:700}}>{i+1}</td>
                        <td>
                          <div style={{display:'flex',alignItems:'center',gap:9}}>
                            <div className="avatar avatar-sm" style={{background:av.bg,color:av.color}}>
                              {name.slice(0,2)}
                            </div>
                            <span style={{fontWeight:600}}>{name}</span>
                          </div>
                        </td>
                        <td style={{color:'var(--text-2)',fontSize:12.5}}>{examTitle}</td>
                        <td><span style={{fontWeight:700,color:scoreColor(s.score)}}>{s.score}%</span></td>
                        <td style={{color:'var(--text-2)',fontSize:12.5}}>{date}</td>
                        <td><span className={`badge ${s.score>=60?'badge-green':'badge-red'}`}>{s.score>=60?'Тэнцсэн':'Тэнцээгүй'}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}