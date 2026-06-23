import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import '../styles/style.css'
import PDFQuestionGenerator from '../components/PDFQuestionGenerator'
import { useAuth } from '../context/AuthContext'

const scoreColor = s => s>=80?'#15803D':s>=60?'#C47A00':'#B91C1C'

export default function ExamDetail() {
  const { id } = useParams()
  const { isAdmin, isTeacher } = useAuth()
  const [exam, setExam]       = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    Promise.all([
      axios.get(`/api/exams/${id}`, { headers }),
      axios.get(`/api/sessions/exam/${id}`, { headers }).catch(() => ({ data: { data: [] } })),
    ]).then(([examRes, sessRes]) => {
      setExam(examRes.data.data)
      setSessions(sessRes.data.data || [])
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="page-wrap"><div className="container" style={{textAlign:'center',padding:'4rem'}}>Уншиж байна...</div></div>
  if (!exam) return <div className="page-wrap"><div className="container"><p>Шалгалт олдсонгүй.</p></div></div>

  const avg = sessions.length
    ? Math.round(sessions.reduce((s, r) => s + (r.score || 0), 0) / sessions.length)
    : 0
  const passed  = sessions.filter(s => s.score >= (exam.passScore || 60)).length
  const failed  = sessions.length - passed
  const highest = sessions.length ? Math.max(...sessions.map(s => s.score || 0)) : 0
  const lowest  = sessions.length ? Math.min(...sessions.map(s => s.score || 0)) : 0
  const date    = exam.startAt ? new Date(exam.startAt).toLocaleDateString('mn-MN') : '—'
  const recent  = [...sessions].sort((a,b) => new Date(b.submittedAt) - new Date(a.submittedAt)).slice(0, 5)

  return (
    <div className="page-wrap">
      <div className="container">
        <div style={{fontSize:12.5,color:'var(--text-3)',marginBottom:'1rem',display:'flex',gap:6,alignItems:'center'}}>
          <Link to="/exams" style={{color:'var(--blue)',textDecoration:'none'}}>Шалгалтууд</Link>
          <span>/</span>
          <span>{exam.title}</span>
        </div>

        <div className="page-header">
          <div className="page-header-row">
            <div>
              <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:6}}>
                <span className="badge badge-blue">{exam.subject}</span>
                <span className={`badge ${exam.status==='active'?'badge-green':exam.status==='draft'?'badge-amber':'badge-gray'}`}>
                  {exam.status==='active'?'Идэвхтэй':exam.status==='draft'?'Ноорог':'Хаагдсан'}
                </span>
              </div>
              <h1 className="page-title">{exam.title}</h1>
              <p className="page-sub">{exam.description}</p>
            </div>
            <div style={{display:'flex',gap:8,flexShrink:0}}>
              <Link to={`/exams/${id}/take`} className="btn btn-primary btn-lg">Шалгалт өгөх →</Link>
            </div>
          </div>
        </div>

        <div className="layout-main">
          <div className="body">
            <div className="card">
              <div className="card-header"><span className="card-title">Шалгалтын мэдээлэл</span></div>
              <div className="card-body">
                <div className="grid-3" style={{gap:'0.75rem',marginBottom:'1.25rem'}}>
                  {[
                    { label:'Нийт асуулт',  value: exam.questions?.length || 0 },
                    { label:'Хугацаа',       value: `${exam.duration} мин` },
                    { label:'Тэнцэх оноо',  value: `${exam.passScore || 60}%` },
                    { label:'Нийт оноо',    value: exam.totalScore || 100 },
                    { label:'Оролцогч',     value: sessions.length },
                    { label:'Огноо',        value: date },
                  ].map((s,i) => (
                    <div key={i} className="stat-card" style={{padding:'0.875rem 1rem'}}>
                      <div className="stat-label">{s.label}</div>
                      <div className="stat-value" style={{fontSize:20}}>{s.value}</div>
                    </div>
                  ))}
                </div>
                {sessions.length > 0 && (
                  <div style={{marginBottom:'0.5rem'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:6,fontSize:13}}>
                      <span style={{color:'var(--text-2)'}}>Дундаж оноо</span>
                      <span style={{fontWeight:700,color:scoreColor(avg)}}>{avg}%</span>
                    </div>
                    <div className="progress">
                      <div className="progress-fill" style={{width:`${avg}%`,background:scoreColor(avg)}}/>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">Сүүлийн үр дүн</span>
                <Link to="/results" className="btn btn-ghost btn-sm">Бүгдийг харах →</Link>
              </div>
              <div className="tbl-wrap" style={{border:'none',borderRadius:0,boxShadow:'none'}}>
                <table className="tbl">
                  <thead><tr><th>Оролцогч</th><th>Оноо</th><th>Дүн</th><th>Цаг</th></tr></thead>
                  <tbody>
                    {recent.length === 0 ? (
                      <tr><td colSpan={4} style={{textAlign:'center',color:'var(--text-3)'}}>Үр дүн байхгүй байна</td></tr>
                    ) : recent.map((r, i) => {
                      const name = r.student?.lastname
                        ? `${r.student.lastname[0]}. ${r.student.firstname}`
                        : r.student?.firstname || 'Тодорхойгүй'
                      const timeAgo = r.submittedAt
                        ? new Date(r.submittedAt).toLocaleString('mn-MN')
                        : '—'
                      return (
                        <tr key={i}>
                          <td>
                            <div style={{display:'flex',alignItems:'center',gap:8}}>
                              <div className="avatar avatar-sm avatar-blue">{name.slice(0,2)}</div>
                              <span style={{fontWeight:500}}>{name}</span>
                            </div>
                          </td>
                          <td><span style={{fontWeight:700,color:scoreColor(r.score)}}>{r.score}%</span></td>
                          <td><span className={`badge ${r.score>=60?'badge-green':'badge-red'}`}>{r.score>=60?'Тэнцсэн':'Тэнцээгүй'}</span></td>
                          <td style={{color:'var(--text-3)',fontSize:12}}>{timeAgo}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

<div className="side">
            {/* PDF-ээс асуулт үүсгэх - зөвхөн багш, админд */}
            {(isAdmin || isTeacher) && (
              <PDFQuestionGenerator 
                examId={id} 
                onQuestionsGenerated={(newQuestions) => {
                  setExam(prev => ({
                    ...prev,
                    questions: [...(prev.questions || []), ...newQuestions]
                  }))
                }}
              />
            )}

            <div className="card">
              <div className="card-header"><span className="card-title">Оролцогчийн статистик</span></div>
              <div className="card-body">
                {[
                  { label:'Нийт оролцогч',  value: sessions.length },
                  { label:'Тэнцсэн',        value: `${passed} (${sessions.length?Math.round(passed/sessions.length*100):0}%)`, color:'#15803D' },
                  { label:'Тэнцээгүй',      value: `${failed} (${sessions.length?Math.round(failed/sessions.length*100):0}%)`, color:'#B91C1C' },
                  { label:'Хамгийн өндөр',  value: sessions.length ? `${highest}%` : '—' },
                  { label:'Хамгийн бага',   value: sessions.length ? `${lowest}%`  : '—' },
                ].map((s,i) => (
                  <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid var(--border)',fontSize:13.5}}>
                    <span style={{color:'var(--text-2)'}}>{s.label}</span>
                    <span style={{fontWeight:700,color:s.color||'var(--text)'}}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <Link to={`/exams/${id}/take`} className="btn btn-primary btn-full btn-lg" style={{justifyContent:'center',marginBottom:8}}>
                  Шалгалт өгөх →
                </Link>
                <Link to="/results" className="btn btn-ghost btn-full" style={{justifyContent:'center'}}>
                  Үр дүн харах
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
