import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../styles/style.css'

const LETTERS = ['А','Б','В','Г']
const fmtTime = s => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`

export default function TakeExam() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [exam, setExam]       = useState(null)
  const [questions, setQuestions] = useState([])
  const [sessionId, setSessionId] = useState(null)
  const [cur, setCur]         = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmit] = useState(false)
  const [timeLeft, setTime]   = useState(null)
  const [loading, setLoading] = useState(true)

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    // 1. Шалгалтын мэдээлэл татах
    axios.get(`/api/exams/${id}`, { headers })
      .then(async res => {
        const e = res.data.data
        setExam(e)
        setTime((e.duration || 60) * 60)

        // 2. Session эхлүүлэх
        const sessRes = await axios.post('/api/sessions/start', { examId: id }, { headers })
        setSessionId(sessRes.data.data._id)

        // 3. Асуулт татах
        const qRes = await axios.get(`/api/exams/${id}/questions`, { headers })
        setQuestions(qRes.data.data || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
  axios.get(`/api/exams/${id}`, { headers })
    .then(async res => {
      const e = res.data.data
      setExam(e)
      setTime((e.duration || 60) * 60)

      const sessRes = await axios.post('/api/sessions/start', { examId: id }, { headers })
      console.log('SESSION RES:', sessRes.data)
      
      const sid = sessRes.data.data?.sessionId || sessRes.data.data?._id
      setSessionId(sid)

      const qRes = await axios.get(`/api/exams/${id}/questions`, { headers })
      setQuestions(qRes.data.data || [])
    })
    .catch(console.error)
    .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async () => {
  if (submitted) return
  setSubmit(true)
  try {
    const answersArr = questions.map((q, i) => ({
      questionId:    q._id,
      selectedIndex: answers[i] !== undefined ? answers[i] : -1,
    }))

    const res = await axios.post(`/api/sessions/${sessionId}/submit`,
      { answers: answersArr }, { headers })
    const result = res.data.data
    navigate(`/exams/${id}/result`, {
      state: {
        result,
        questions: result.review,  
        answers,
      }
    })
  } catch (err) {
    console.error(err)
    navigate(`/exams/${id}/result`, { state: { questions, answers } })
  }
}

  if (loading) return <div className="page-wrap"><div className="container" style={{textAlign:'center',padding:'4rem'}}>Шалгалт ачааллаж байна...</div></div>
  if (!exam || questions.length === 0) return <div className="page-wrap"><div className="container"><p>Асуулт олдсонгүй.</p></div></div>
  if (submitted) return null

  const q = questions[cur]
  const total = questions.length
  const answered = Object.keys(answers).length

  return (
    <div className="page-wrap">
      <div className="container">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.25rem'}}>
          <div>
            <h1 className="page-title" style={{fontSize:18}}>{exam.title}</h1>
            <p className="page-sub">{answered}/{total} асуултад хариулсан</p>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{
              padding:'6px 14px', borderRadius:8,
              background: timeLeft < 300 ? 'var(--red-light)' : 'var(--blue-light)',
              color: timeLeft < 300 ? 'var(--red)' : 'var(--blue)',
              fontFamily:'var(--font-mono)', fontSize:18, fontWeight:700,
              border:`1px solid ${timeLeft < 300 ? '#FECACA' : '#BFDBFE'}`,
            }}>⏱ {fmtTime(timeLeft)}</div>
            <button className="btn btn-danger" onClick={handleSubmit}>Дуусгах ✓</button>
          </div>
        </div>

        <div className="progress" style={{marginBottom:'1.25rem',height:8}}>
          <div className="progress-fill" style={{width:`${(cur/total)*100}%`,background:'var(--blue)'}}/>
        </div>

        <div className="layout-main">
          <div className="body">
            <div className="card">
              <div className="card-header">
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:12,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.05em'}}>
                    Асуулт {cur+1} / {total}
                  </span>
                  {q.topic && <span className="badge badge-blue">{q.topic}</span>}
                </div>
              </div>
              <div className="card-body">
                <p style={{fontSize:16,fontWeight:500,lineHeight:1.7,marginBottom:'1.5rem',color:'var(--text)'}}>{q.text}</p>
                {(q.options || q.opts || []).map((opt, i) => {
                  const isSel = answers[cur] === i
                  return (
                    <div key={i} className={`q-opt${isSel?' sel':''}`}
                      onClick={() => setAnswers(p => ({...p,[cur]:i}))}>
                      <div className="q-circle">{LETTERS[i]}</div>
                      <span>{opt}</span>
                    </div>
                  )
                })}
                <div style={{display:'flex',justifyContent:'space-between',marginTop:'1.5rem'}}>
                  <button className="btn btn-ghost" disabled={cur===0} onClick={()=>setCur(p=>p-1)}
                    style={{opacity:cur===0?0.4:1}}>← Өмнөх</button>
                  {cur < total-1
                    ? <button className="btn btn-primary" onClick={()=>setCur(p=>p+1)}>Дараах →</button>
                    : <button className="btn btn-success" onClick={handleSubmit}>Шалгалт дуусгах ✓</button>
                  }
                </div>
              </div>
            </div>
          </div>

          <div className="side">
            <div className="card">
              <div className="card-header"><span className="card-title">Асуулт навигаци</span></div>
              <div className="card-body">
                <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6,marginBottom:'0.75rem'}}>
                  {questions.map((_,i) => {
                    const isAns = answers[i] !== undefined
                    const isCur = i === cur
                    return (
                      <div key={i} onClick={()=>setCur(i)} style={{
                        height:34, borderRadius:6, cursor:'pointer',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:12, fontWeight:700,
                        background: isCur?'var(--blue)':isAns?'var(--green-light)':'var(--surface2)',
                        color: isCur?'#fff':isAns?'var(--green)':'var(--text-3)',
                        border: isCur?'none':`1px solid ${isAns?'#BBF7D0':'var(--border)'}`,
                      }}>{i+1}</div>
                    )
                  })}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <div style={{fontSize:13,color:'var(--text-2)',marginBottom:10}}>
                  {answered === total
                    ? <span style={{color:'var(--green)',fontWeight:600}}>✓ Бүх асуултад хариуллаа!</span>
                    : `${total-answered} асуулт хариулаагүй байна`}
                </div>
                <button className="btn btn-success btn-full" style={{justifyContent:'center'}} onClick={handleSubmit}>
                  Шалгалт дуусгах ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}