import { useParams, useLocation, Link } from 'react-router-dom'
import '../styles/style.css'

const LETTERS = ['А','Б','В','Г']
const scoreColor = s => s>=80?'#15803D':s>=60?'#C47A00':'#B91C1C'
const scoreBg    = s => s>=80?'var(--green-light)':s>=60?'var(--amber-light)':'var(--red-light)'

export default function ExamResult() {
  const { id } = useParams()
  const location = useLocation()
  const { result, questions = [], answers = {} } = location.state || {}
  const score   = result?.score ?? 0
  const pct     = score
  const passed  = pct >= 60
  const correct = result?.correctCount ?? 0
  const total   = questions.length

  return (
    <div className="page-wrap">
      <div className="container" style={{maxWidth:760}}>
        <div style={{fontSize:12.5,color:'var(--text-3)',marginBottom:'1rem',display:'flex',gap:6,alignItems:'center'}}>
          <Link to="/exams" style={{color:'var(--blue)',textDecoration:'none'}}>Шалгалтууд</Link>
          <span>/</span>
          <Link to={`/exams/${id}`} style={{color:'var(--blue)',textDecoration:'none'}}>Шалгалт</Link>
          <span>/</span>
          <span>Үр дүн</span>
        </div>

        <div className="page-header">
          <h1 className="page-title">Шалгалтын үр дүн</h1>
          <p className="page-sub">{result?.exam?.title || 'Шалгалт'}</p>
        </div>

        <div className="card" style={{marginBottom:'1.25rem'}}>
          <div className="card-body" style={{textAlign:'center',padding:'2rem'}}>
            <div style={{
              width:110, height:110, borderRadius:'50%',
              background: scoreBg(pct),
              border:`4px solid ${scoreColor(pct)}`,
              display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center',
              margin:'0 auto 1.5rem',
            }}>
              <span style={{fontSize:30,fontWeight:800,color:scoreColor(pct)}}>{pct}%</span>
              <span style={{fontSize:11.5,fontWeight:600,color:scoreColor(pct)}}>
                {passed?'Тэнцсэн':'Тэнцээгүй'}
              </span>
            </div>

            <div className="grid-3" style={{gap:'0.75rem',marginBottom:'1.5rem'}}>
              {[
                { label:'Зөв хариулт',   value: `${correct}/${result?.totalCount ?? total}`, color:'var(--green)' },
                { label:'Буруу хариулт', value: `${(result?.totalCount ?? total) - correct}/${result?.totalCount ?? total}`, color:'var(--red)' },
                { label:'Нийт оноо',     value: `${pct}%`, color: scoreColor(pct) },
              ].map((s,i) => (
                <div key={i} className="stat-card">
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value" style={{fontSize:22,color:s.color}}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{display:'flex',gap:10,justifyContent:'center'}}>
              <Link to={`/exams/${id}/take`} className="btn btn-outline">Дахин өгөх</Link>
              {/* <Link to="/results" className="btn btn-ghost">Бүх үр дүн харах</Link>
              <Link to="/dashboard" className="btn btn-primary">Хянах самбар →</Link> */}
            </div>
          </div>
        </div>

        {questions.length > 0 && (
          <div className="card">
            <div className="card-header"><span className="card-title">Асуулт тус бүрийн хариулт</span></div>
            <div className="card-body" style={{display:'flex',flexDirection:'column',gap:10}}>
              {questions.map((q, i) => {
                const userAns = q.selectedIndex !== undefined ? q.selectedIndex : answers[i]
                const correctIdx = q.correctIndex
                const isCorrect  = q.isCorrect ?? (userAns === correctIdx)
                const notAnswered = userAns === null || userAns === undefined || userAns === -1
                const opts = q.options || []

                return (
                  <div key={i} style={{
                    padding:'12px 14px', borderRadius:8,
                    background: notAnswered?'var(--surface2)':isCorrect?'var(--green-light)':'var(--red-light)',
                    borderLeft:`3px solid ${notAnswered?'var(--border)':isCorrect?'var(--green)':'var(--red)'}`,
                  }}>
                    <div style={{fontSize:13,fontWeight:500,marginBottom:6}}>{i+1}. {q.text}</div>
                    <div style={{display:'flex',gap:16,fontSize:12.5,flexWrap:'wrap'}}>
                      {notAnswered ? (
                        <span style={{color:'var(--text-3)'}}>Хариулаагүй</span>
                      ) : (
                        <>
                          <span style={{color:isCorrect?'var(--green)':'var(--red)',fontWeight:600}}>
                            {isCorrect ? '✓ Зөв' : '✗ Буруу'} — {LETTERS[userAns]}. {opts[userAns]}
                          </span>
                          {!isCorrect && opts[correctIdx] && (
                            <span style={{color:'var(--text-2)'}}>
                              Зөв хариулт: {LETTERS[correctIdx]}. {opts[correctIdx]}
                            </span>
                          )}
                        </>
                      )}
                      {q.topic && (
                        <span className="badge badge-blue" style={{marginLeft:'auto'}}>{q.topic}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}