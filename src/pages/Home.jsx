import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import '../styles/style.css'

const features = [
  { icon: '📋', title: 'Шалгалт үүсгэх', desc: 'Олон төрлийн асуулт, хугацааны тохиргоотой шалгалт хялбархан үүсгэнэ.' },
  { icon: '⏱️', title: 'Цаг хязгаартай', desc: 'Шалгалт тус бүрд хугацааны хязгаар тохируулж, автоматаар дуусгана.' },
  { icon: '📊', title: 'Дүн шинжилгээ', desc: 'Оролцогч тус бүрийн гүйцэтгэлийг дэлгэрэнгүй статистикаар харна.' },
  { icon: '🏆', title: 'Жагсаалт', desc: 'Оноогоор эрэмблэсэн жагсаалт болон хичээл хоорондын харьцуулалт.' },
]

const scoreColor = s => s >= 80 ? '#15803D' : s >= 60 ? '#C47A00' : '#B91C1C'

export default function Home() {
  const navigate = useNavigate()
  const { user, loading: authLoading, isAdmin, isTeacher, isStudent, isLoggedIn } = useAuth()

  const [exams, setExams] = useState([])
  const [myResults, setMyResults] = useState([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (!isLoggedIn) {
      navigate('/login')
      return
    }

    if (isStudent) {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      Promise.all([
        axios.get('/api/exams', { headers, params: { status: 'active' } }).catch(() => ({ data: { data: [] } })),
        axios.get('/api/sessions/my', { headers }).catch(() => ({ data: { data: [] } })),
      ]).then(([examsRes, sessionsRes]) => {
        setExams(examsRes.data.data || [])
        setMyResults(sessionsRes.data.data || [])
      }).finally(() => setDataLoading(false))
    } else {
      setDataLoading(false)
    }
  }, [navigate, authLoading, isLoggedIn, isStudent])

  // Auth loading хүлээх
  if (authLoading) {
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

  // Оюутан нэвтэрсэн бол өөрт зориулсан хуудас харуулна
  if (isStudent) {
    const avgScore = myResults.length
      ? Math.round(myResults.reduce((sum, r) => sum + (r.score || 0), 0) / myResults.length)
      : 0
    const passedCount = myResults.filter(r => (r.score || 0) >= 60).length

    return (
      <div className="page-wrap">
        <div className="container">
          {/* Hero section for student */}
          <div style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1B4FD8 100%)',
            borderRadius: 16,
            padding: '2.5rem 2rem',
            marginBottom: '1.5rem',
            color: '#fff',
          }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
              Сайн байна уу, {user?.firstname || 'Оюутан'}!
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15 }}>
              Шалгалтуудаа үзэж, дүнгээ хянаарай.
            </p>
          </div>

          {/* Statistics */}
          <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
            {[
              { label: 'Идэвхтэй шалгалт', value: exams.length },
              { label: 'Өгсөн шалгалт', value: myResults.length },
              { label: 'Дундаж оноо', value: `${avgScore}%` },
              { label: 'Тэнцсэн', value: passedCount },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ fontSize: 24 }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="layout-main">
            <div className="body">
              {/* Идэвхтэй шалгалтууд */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Идэвхтэй шалгалтууд</span>
                  <Link to="/exams" className="btn btn-ghost btn-sm">Бүгдийг харах</Link>
                </div>
                <div className="card-body">
                  {dataLoading ? (
                    <p style={{ color: 'var(--text-3)', fontSize: 13 }}>Уншиж байна...</p>
                  ) : exams.length === 0 ? (
                    <div className="empty">
                      <div className="empty-icon">📋</div>
                      <div className="empty-title">Идэвхтэй шалгалт байхгүй</div>
                    </div>
                  ) : (
                    exams.slice(0, 5).map(ex => {
                      const taken = myResults.find(r => r.exam?._id === ex._id || r.exam === ex._id)
                      return (
                        <div key={ex._id} style={{
                          padding: '14px',
                          borderBottom: '1px solid var(--border)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{ex.title}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                              {ex.duration} минут
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {taken ? (
                              <span style={{
                                padding: '4px 12px',
                                borderRadius: 6,
                                background: taken.score >= 60 ? 'var(--green-light)' : 'var(--red-light)',
                                color: scoreColor(taken.score),
                                fontWeight: 700,
                                fontSize: 13,
                              }}>
                                {taken.score}%
                              </span>
                            ) : (
                              <Link to={`/exams/${ex._id}/take`} className="btn btn-primary btn-sm">
                                Шалгалт өгөх
                              </Link>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="side">
              {/* Миний дүнгүүд */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Миний дүнгүүд</span>
                </div>
                <div className="card-body" style={{ padding: '0.5rem 1rem' }}>
                  {myResults.length === 0 ? (
                    <p style={{ color: 'var(--text-3)', fontSize: 13, padding: '0.5rem 0' }}>
                      Өгсөн шалгалт байхгүй.
                    </p>
                  ) : (
                    myResults.slice(0, 6).map((r, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 0',
                        borderBottom: i < Math.min(myResults.length, 6) - 1 ? '1px solid var(--border)' : 'none',
                      }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>
                            {r.exam?.title || 'Шалгалт'}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                            {new Date(r.endedAt || r.createdAt).toLocaleDateString('mn-MN')}
                          </div>
                        </div>
                        <span style={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: scoreColor(r.score),
                        }}>
                          {r.score}%
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Багш/Админ нэвтэрсэн бол
  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1B4FD8 100%)',
        padding: '5rem 0 4rem',
        textAlign: 'center',
      }}>
        <div className="container">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(255,255,255,0.1)', borderRadius: 99,
            padding: '4px 14px', fontSize: 12.5, color: 'rgba(255,255,255,0.75)',
            marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.15)',
          }}>
            Боловсролын салбарт зориулагдсан цахим шалгалт, үнэлгээний систем
          </div>
          <h1 style={{
            fontSize: 44, fontWeight: 700, color: '#fff',
            lineHeight: 1.2, marginBottom: '1.25rem', letterSpacing: -0.5,
          }}>
            Цахим шалгалт ба<br />
            <span style={{ color: '#93C5FD' }}>үнэлгээний систем</span>
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.65)', maxWidth: 540, margin: '0 auto 2rem', lineHeight: 1.7 }}>
            Шалгалт үүсгэх, явуулах, дүн дүгнэх бүх үйл ажиллагааг нэг дороос.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/exams" className="btn btn-primary btn-lg">
              Шалгалтууд харах
            </Link>
            {(isAdmin || isTeacher) && (
              <Link to="/dashboard" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
                Хянах самбар
              </Link>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{ fontSize: 26, fontWeight: 700, textAlign: 'center', marginBottom: '0.75rem' }}>
            Системийн онцлогууд
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-2)', marginBottom: '2.5rem' }}>
            Боловсролын байгуулагад шаардлагатай бүх хэрэгсэл
          </p>
          <div className="grid-4">
            {features.map((f, i) => (
              <div key={i} className="card">
                <div className="card-body" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>{f.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
