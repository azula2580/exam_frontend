import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import '../styles/style.css'

const scoreColor = s => s >= 80 ? '#15803D' : s >= 60 ? '#C47A00' : '#B91C1C'

export default function Dashboard() {
  const [exams, setExams] = useState([])
  const [sessions, setSessions] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
  const fetchAll = async () => {
    try {
      const [examsRes, usersRes] = await Promise.all([
        axios.get('/api/exams', { headers }),
        axios.get('/api/users', { headers }).catch(() => ({ data: { data: [] } })),
      ])
      const examList = examsRes.data.data || []
      setExams(examList)
      setStudents((usersRes.data.data || []).filter(u => u.role === 'student'))
      const sessRes = await axios.get('/api/sessions/all', { headers })
        .catch(() => ({ data: { data: [] } }))
      setSessions(sessRes.data.data || [])

    } catch (err) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }
  fetchAll()
}, [])

  // useEffect(() => {
  //   const fetchAll = async () => {
  //     try {
  //       const [examsRes, sessionsRes, usersRes] = await Promise.all([
  //         axios.get('/api/exams', { headers }),
  //         axios.get('/api/sessions/exam/all', { headers }).catch(() => ({ data: { data: [] } })),
  //         axios.get('/api/users', { headers }).catch(() => ({ data: { data: [] } })),
  //       ])
  //       setExams(examsRes.data.data || [])
  //       setSessions(sessionsRes.data.data || [])
  //       const studentList = (usersRes.data.data || [])
  //         .filter(u => u.role === 'student')
  //       setStudents(studentList)
  //     } catch (err) {
  //       console.error('Dashboard fetch error:', err)
  //     } finally {
  //       setLoading(false)
  //     }
  //   }
  //   fetchAll()
  // }, [])

  const totalExams = exams.length
  const activeExams = exams.filter(e => e.status === 'active')
  const totalParticipants = students.length
  const avgScore = sessions.length
    ? Math.round(sessions.reduce((sum, s) => sum + (s.score || 0), 0) / sessions.length)
    : 0

  // Шилдэг оролцогчид — session-оос нэгтгэх
  const studentScores = students.map(stu => {
    const stuSessions = sessions.filter(s => s.student?._id === stu._id || s.student === stu._id)
    const avg = stuSessions.length
      ? Math.round(stuSessions.reduce((sum, s) => sum + (s.score || 0), 0) / stuSessions.length)
      : null
    return { ...stu, avgScore: avg }
  }).filter(s => s.avgScore !== null).sort((a, b) => b.avgScore - a.avgScore).slice(0, 5)

  // Хичээлийн харьцуулалт — exam subject-ээр бүлэглэх
  const subjectMap = {}
  sessions.forEach(s => {
    const subject = s.exam?.subject || s.exam?.title || 'Бусад'
    if (!subjectMap[subject]) subjectMap[subject] = { total: 0, count: 0 }
    subjectMap[subject].total += s.score || 0
    subjectMap[subject].count += 1
  })
  const subjects = Object.entries(subjectMap).map(([name, v]) => ({
    name,
    pct: Math.round(v.total / v.count),
  }))

  if (loading) return (
    <div className="page-wrap">
      <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
        <p>Уншиж байна...</p>
      </div>
    </div>
  )

  return (
    <div className="page-wrap">
      <div className="container">
        <div className="page-header">
          <div className="page-header-row">
            <div>
              <h1 className="page-title">Хянах самбар</h1>
              <p className="page-sub">2026 оны хавар — Системийн ерөнхий мэдээлэл</p>
            </div>
            <Link to="/exams/create" className="btn btn-primary">+ Шалгалт үүсгэх</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: '1.25rem' }}>
          {[
            { label: 'Нийт шалгалт',     value: totalExams,        change: `${activeExams.length} идэвхтэй`, up: true },
            { label: 'Идэвхтэй шалгалт', value: activeExams.length, change: 'одоо явагдаж байна',             up: true },
            { label: 'Нийт оролцогч',    value: totalParticipants,  change: 'бүртгэлтэй сурагч',              up: true },
            { label: 'Дундаж оноо',      value: `${avgScore}%`,     change: 'нийт шалгалтын дундаж',          up: avgScore >= 60 },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className={`stat-change ${s.up ? 'up' : 'down'}`}>{s.change}</div>
            </div>
          ))}
        </div>

        <div className="layout-main">
          <div className="body">
            {/* Идэвхтэй шалгалтууд */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Идэвхтэй шалгалтууд</span>
                <Link to="/exams" className="btn btn-ghost btn-sm">Бүгдийг харах →</Link>
              </div>
              <div className="card-body">
                {activeExams.length === 0 ? (
                  <p style={{ color: 'var(--text-3)', fontSize: 13 }}>Идэвхтэй шалгалт байхгүй байна.</p>
                ) : activeExams.map(ex => {
                  const exSessions = sessions.filter(s => s.exam?._id === ex._id || s.exam === ex._id)
                  const avg = exSessions.length
                    ? Math.round(exSessions.reduce((sum, s) => sum + (s.score || 0), 0) / exSessions.length)
                    : 0
                  return (
                    <div key={ex._id} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14.5, marginBottom: 3 }}>{ex.title}</div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <span className="badge badge-blue">{ex.subject || 'Ерөнхий'}</span>
                            <span className="text-sm text-muted">{ex.questions?.length || 0} асуулт · {ex.duration || 0} мин</span>
                          </div>
                        </div>
                        <Link to={`/exams/${ex._id}`} className="btn btn-outline btn-sm">Дэлгэрэнгүй</Link>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div className="progress" style={{ flex: 1 }}>
                          <div className="progress-fill" style={{ width: `${avg}%`, background: scoreColor(avg) }} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: scoreColor(avg), whiteSpace: 'nowrap' }}>
                          {avg}% · {exSessions.length} оролцогч
                        </span>
                      </div>
                    </div>
                  )
                })}
                <Link to="/exams/create" className="btn btn-primary btn-full" style={{ justifyContent: 'center' }}>
                  + Шинэ шалгалт үүсгэх
                </Link>
              </div>
            </div>

            {/* Хичээлийн харьцуулалт */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Хичээлийн онооны харьцуулалт</span>
                <Link to="/results" className="btn btn-ghost btn-sm">Дэлгэрэнгүй →</Link>
              </div>
              <div className="card-body">
                {subjects.length === 0 ? (
                  <p style={{ color: 'var(--text-3)', fontSize: 13 }}>Өгөгдөл байхгүй байна.</p>
                ) : subjects.map((s, i) => (
                  <div key={i} className="bar-row">
                    <div className="bar-lbl">{s.name}</div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${s.pct}%`, background: scoreColor(s.pct) }} />
                    </div>
                    <div className="bar-val">{s.pct ? `${s.pct}%` : '—'}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="side">
            {/* Шилдэг оролцогчид */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">Шилдэг оролцогчид</span>
                <Link to="/students" className="btn btn-ghost btn-sm">Бүгд →</Link>
              </div>
              <div className="card-body" style={{ padding: '0.5rem 1rem' }}>
                {studentScores.length === 0 ? (
                  <p style={{ color: 'var(--text-3)', fontSize: 13, padding: '0.5rem 0' }}>Өгөгдөл байхгүй.</p>
                ) : studentScores.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', width: 20 }}>{i + 1}.</span>
                    <div className="avatar avatar-sm avatar-blue">{(s.lastname?.[0] || '') + (s.firstname?.[0] || '')}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{s.lastname} {s.firstname}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{s.grade || '—'}</div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: scoreColor(s.avgScore) }}>{s.avgScore}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}