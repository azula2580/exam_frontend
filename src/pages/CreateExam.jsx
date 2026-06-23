import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../styles/style.css'

const LETTERS   = ['А','Б','В','Г']

const emptyQ = () => ({ text:'', opts:['','','',''], correct:0, topic:'' })

export default function CreateExam() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  const [info, setInfo] = useState({
    title:'', duration:60, totalScore:100,
    passScore:60, startAt:'', endAt:'', description:'',
  })
  const [questions, setQuestions] = useState([emptyQ()])
  const [activeQ, setActiveQ] = useState(0)

  // PDF upload state
  const fileInputRef = useRef(null)
  const [pdfFile, setPdfFile] = useState(null)
  const [questionCount, setQuestionCount] = useState(5)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState('')
  const [ollamaStatus, setOllamaStatus] = useState(null)

  // Ollama холболт шалгах
  const checkOllama = async () => {
    try {
      const res = await axios.get('/api/exams/ollama/status', { headers })
      setOllamaStatus(res.data)
    } catch (err) {
      setOllamaStatus({ connected: false, error: 'Холбогдож чадсангүй' })
    }
  }

  // PDF файлаас асуулт үүсгэх
  const handlePdfUpload = (e) => {
    const file = e.target.files[0]
    if (file && file.type === 'application/pdf') {
      setPdfFile(file)
      setPdfError('')
    } else {
      setPdfError('Зөвхөн PDF файл оруулна уу')
      setPdfFile(null)
    }
  }

  const generateQuestionsFromPdf = async () => {
    if (!pdfFile) {
      setPdfError('PDF файл сонгоно уу')
      return
    }

    setPdfLoading(true)
    setPdfError('')

    try {
      const formData = new FormData()
      formData.append('pdf', pdfFile)
      formData.append('questionCount', questionCount)

      const res = await axios.post('/api/exams/generate-from-pdf', formData, {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data'
        }
      })

      if (res.data.success && res.data.questions) {
        // Үүссэн асуултуудыг нэмэх
        const newQuestions = res.data.questions.map(q => ({
          text: q.text || q.question,
          opts: q.options || q.opts || ['','','',''],
          correct: q.correctIndex ?? q.correct ?? 0,
          topic: q.topic || ''
        }))

        // Хоосон асуулт байвал солих, үгүй бол нэмэх
        if (questions.length === 1 && !questions[0].text) {
          setQuestions(newQuestions)
        } else {
          setQuestions(prev => [...prev, ...newQuestions])
        }
        
        setActiveQ(questions.length === 1 && !questions[0].text ? 0 : questions.length)
        setPdfFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    } catch (err) {
      setPdfError(err.response?.data?.message || 'Асуулт үүсгэхэд алдаа гарлаа. Ollama ажиллаж байгаа эсэхийг шалгана уу.')
    } finally {
      setPdfLoading(false)
    }
  }

  const addQ = () => { setQuestions(p=>[...p, emptyQ()]); setActiveQ(questions.length) }
  const removeQ = i => {
    if (questions.length===1) return
    const next = questions.filter((_,idx)=>idx!==i)
    setQuestions(next)
    setActiveQ(Math.min(activeQ, next.length-1))
  }
  const updateQ = (i, field, val) =>
    setQuestions(p=>p.map((q,idx)=>idx===i?{...q,[field]:val}:q))
  const updateOpt = (qi, oi, val) =>
    setQuestions(p=>p.map((q,idx)=>idx===qi?{...q,opts:q.opts.map((o,j)=>j===oi?val:o)}:q))

  const handleSave = async () => {
    if (loading) return
    setError('')
    const incomplete = questions.some(q => !q.text || q.opts.some(o => !o))
    if (incomplete) {
      setError('Бүх асуулт болон хариултуудыг бөглөнө үү.')
      return
    }

    setLoading(true)
    try {
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }
      const examRes = await axios.post('/api/exams', {
        title:       info.title,
        duration:    info.duration,
        totalScore:  info.totalScore,
        passScore:   info.passScore,
        startAt:     info.startAt || undefined,
        endAt:       info.endAt   || undefined,
        description: info.description,
      }, { headers })
      const examId = examRes.data.data._id 
      await axios.post(`/api/exams/${examId}/questions/bulk`, {
      questions: questions.map((q, i) => ({
        text:         q.text,
        options:      q.opts,
        correctIndex: q.correct,
        topic:        q.topic || '',
        order:        i + 1,
      }))
    }, { headers })

    setSaved(true)
    setTimeout(() => navigate('/exams'), 1500)
  } catch (err) {
    setError(err.response?.data?.message || 'Шалгалт үүсгэхэд алдаа гарлаа.')
  } finally {
    setLoading(false)
  }
}
  return (
    <div className="page-wrap">
      <div className="container" style={{maxWidth:860}}>
        <div className="page-header">
          <div className="page-header-row">
            <div>
              <h1 className="page-title">Шинэ шалгалт үүсгэх</h1>
              <p className="page-sub">Алхам {step}/2 — {step===1?'Үндсэн мэдээлэл':'Асуулт нэмэх'}</p>
            </div>
            <button className="btn btn-ghost" onClick={()=>navigate('/exams')}>← Буцах</button>
          </div>
        </div>

        <div style={{display:'flex',alignItems:'center',marginBottom:'1.5rem',gap:0}}>
          {['Үндсэн мэдээлэл','Асуулт нэмэх'].map((lbl,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',flex:i<1?1:'auto'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}} onClick={()=>setStep(i+1)}>
                <div style={{
                  width:28, height:28, borderRadius:'50%',
                  background: step>i?'var(--blue)':step===i+1?'var(--blue)':'var(--surface2)',
                  color: step>=i+1?'#fff':'var(--text-3)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:12, fontWeight:700,
                  border: step===i+1?'none':'1px solid var(--border)',
                }}>{i+1}</div>
                <span style={{fontSize:13,fontWeight:step===i+1?600:400,color:step===i+1?'var(--text)':'var(--text-3)'}}>{lbl}</span>
              </div>
              {i<1&&<div style={{flex:1,height:1,background:'var(--border)',margin:'0 12px'}}/>}
            </div>
          ))}
        </div>

        {saved && <div className="alert alert-success" style={{marginBottom:'1rem'}}>Шалгалт амжилттай үүсгэгдлээ! Хуудас руу шилжиж байна...</div>}
        {error && <div className="alert alert-danger" style={{marginBottom:'1rem'}}>{error}</div>}

        {step===1 && (
          <div className="card">
            <div className="card-header"><span className="card-title">Шалгалтын мэдээлэл</span></div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Шалгалтын нэр *</label>
                <input className="form-control" placeholder="жишээ нь: Математик — Хагас жилийн шалгалт" required
                  value={info.title} onChange={e=>setInfo(p=>({...p,title:e.target.value}))}/>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Хугацаа (минут) *</label>
                  <input className="form-control" type="number" min="10" max="300" value={info.duration}
                    onChange={e=>setInfo(p=>({...p,duration:Number(e.target.value)}))}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Тэнцэх оноо (%)</label>
                  <input className="form-control" type="number" min="0" max="100" value={info.passScore}
                    onChange={e=>setInfo(p=>({...p,passScore:Number(e.target.value)}))}/>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Эхлэх огноо, цаг</label>
                  <input className="form-control" type="datetime-local" value={info.startAt}
                    onChange={e=>setInfo(p=>({...p,startAt:e.target.value}))}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Дуусах огноо, цаг</label>
                  <input className="form-control" type="datetime-local" value={info.endAt}
                    onChange={e=>setInfo(p=>({...p,endAt:e.target.value}))}/>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Тайлбар</label>
                <textarea className="form-control" rows={3} placeholder="Шалгалтын тухай товч мэдээлэл..." style={{resize:'vertical'}}
                  value={info.description} onChange={e=>setInfo(p=>({...p,description:e.target.value}))}/>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button className="btn btn-primary" disabled={!info.title} onClick={()=>setStep(2)}>
                  Дараагийн алхам →
                </button>
                <button className="btn btn-ghost" onClick={()=>navigate('/exams')}>Болих</button>
              </div>
            </div>
          </div>
        )}

        {step===2 && (
          <div className="layout-main">
            <div className="body">
              {/* PDF-ээс асуулт үүсгэх хэсэг */}
              <div className="card" style={{marginBottom:'1rem', border: '1px dashed var(--blue)', background: 'var(--blue-light)'}}>
                <div className="card-header" style={{background: 'transparent'}}>
                  <span className="card-title" style={{color: 'var(--blue)'}}>
                    PDF-ээс асуулт автоматаар үүсгэх (Ollama AI)
                  </span>
                  <button 
                    className="btn btn-ghost btn-sm" 
                    onClick={checkOllama}
                    style={{fontSize: 11}}
                  >
                    Холболт шалгах
                  </button>
                </div>
                <div className="card-body">
                  {ollamaStatus && (
                    <div className={`alert ${ollamaStatus.connected ? 'alert-success' : 'alert-danger'}`} style={{marginBottom: '0.75rem', padding: '8px 12px', fontSize: 13}}>
                      {ollamaStatus.connected 
                        ? `Ollama холбогдсон (${ollamaStatus.model})` 
                        : `Ollama холбогдоогүй: ${ollamaStatus.error}`}
                    </div>
                  )}
                  
                  {pdfError && (
                    <div className="alert alert-danger" style={{marginBottom: '0.75rem', padding: '8px 12px', fontSize: 13}}>
                      {pdfError}
                    </div>
                  )}

                  <div style={{display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap'}}>
                    <div className="form-group" style={{flex: 2, minWidth: 200, marginBottom: 0}}>
                      <label className="form-label" style={{fontSize: 12}}>PDF файл сонгох</label>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept=".pdf"
                        onChange={handlePdfUpload}
                        className="form-control"
                        style={{padding: '6px 10px', fontSize: 13}}
                      />
                    </div>
                    
                    <div className="form-group" style={{flex: 1, minWidth: 120, marginBottom: 0}}>
                      <label className="form-label" style={{fontSize: 12}}>Асуултын тоо</label>
                      <select 
                        value={questionCount} 
                        onChange={e => setQuestionCount(Number(e.target.value))}
                        className="form-control"
                        style={{padding: '8px 10px', fontSize: 13}}
                      >
                        {[3, 5, 10, 15, 20, 25, 30].map(n => (
                          <option key={n} value={n}>{n} асуулт</option>
                        ))}
                      </select>
                    </div>

                    <button 
                      className="btn btn-primary"
                      onClick={generateQuestionsFromPdf}
                      disabled={!pdfFile || pdfLoading}
                      style={{height: 38, whiteSpace: 'nowrap'}}
                    >
                      {pdfLoading ? (
                        <>
                          <span className="spinner" style={{width: 14, height: 14, marginRight: 6}}></span>
                          Үүсгэж байна...
                        </>
                      ) : (
                        'Асуулт үүсгэх'
                      )}
                    </button>
                  </div>

                  {pdfFile && (
                    <div style={{marginTop: 10, fontSize: 12, color: 'var(--text-2)'}}>
                      Сонгосон файл: <strong>{pdfFile.name}</strong> ({(pdfFile.size / 1024).toFixed(1)} KB)
                    </div>
                  )}

                  <p style={{fontSize: 11, color: 'var(--text-3)', marginTop: 10, marginBottom: 0}}>
                    PDF файлаас агуулгыг уншиж, Ollama AI ашиглан сонгосон тооны асуулт автоматаар үүсгэнэ.
                  </p>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <span className="card-title">Асуулт {activeQ+1} / {questions.length}</span>
                  <div style={{display:'flex',gap:6}}>
                    <button className="btn btn-ghost btn-sm btn-danger" disabled={questions.length===1} onClick={()=>removeQ(activeQ)}>
                      Устгах
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={addQ}>+ Асуулт нэмэх</button>
                  </div>
                </div>
                <div className="card-body">
                  {(() => {
                    const q = questions[activeQ]
                    return (
                      <>
                        <div className="form-row" style={{marginBottom:'0.75rem'}}>
                          <div className="form-group" style={{flex:3}}>
                            <label className="form-label">Асуултын текст *</label>
                            <textarea className="form-control" rows={3} placeholder="Асуултыг энд бичнэ..." style={{resize:'vertical'}}
                              value={q.text} onChange={e=>updateQ(activeQ,'text',e.target.value)}/>
                          </div>
                          <div className="form-group" style={{flex:1}}>
                            <label className="form-label">Сэдэв</label>
                            <input className="form-control" placeholder="жишээ нь: Үг зүй" value={q.topic}
                              onChange={e=>updateQ(activeQ,'topic',e.target.value)}/>
                          </div>
                        </div>
                        <div style={{marginBottom:'0.75rem'}}>
                          <label className="form-label">Хариултын сонголтууд (зөв хариулт нь хажуугийн товч)</label>
                        </div>
                        {q.opts.map((opt,oi)=>(
                          <div key={oi} style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                            <div style={{
                              width:28, height:28, borderRadius:'50%', flexShrink:0,
                              background: q.correct===oi?'var(--blue)':'var(--surface2)',
                              color: q.correct===oi?'#fff':'var(--text-3)',
                              display:'flex', alignItems:'center', justifyContent:'center',
                              fontSize:12, fontWeight:700,
                              border: q.correct===oi?'none':'1px solid var(--border)',
                              cursor:'pointer',
                            }} onClick={()=>updateQ(activeQ,'correct',oi)}>{LETTERS[oi]}</div>
                            <input className="form-control" placeholder={`${LETTERS[oi]} сонголт...`}
                              value={opt} onChange={e=>updateOpt(activeQ,oi,e.target.value)}/>
                            {q.correct===oi && <span className="badge badge-green">Зөв</span>}
                          </div>
                        ))}
                        <p className="form-hint">Зөв хариулт дугаарлалт дээр дарж тэмдэглэнэ.</p>
                      </>
                    )
                  })()}
                </div>
                <div className="card-footer" style={{display:'flex',justifyContent:'space-between'}}>
                  <button className="btn btn-ghost" onClick={()=>setStep(1)}>← Буцах</button>
                  <div style={{display:'flex',gap:8}}>
                    <button className="btn btn-outline" onClick={addQ}>+ Асуулт нэмэх</button>
                    <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                      {loading ? 'Хадгалж байна...' : 'Шалгалт хадгалах'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="side">
              <div className="card">
                <div className="card-header"><span className="card-title">Асуултын жагсаалт</span></div>
                <div className="card-body" style={{padding:'0.5rem'}}>
                  {questions.map((q,i)=>(
                    <div key={i} onClick={()=>setActiveQ(i)} style={{
                      padding:'9px 10px', borderRadius:6, cursor:'pointer',
                      background: activeQ===i?'var(--blue-light)':'transparent',
                      border: activeQ===i?'1px solid #BFDBFE':'1px solid transparent',
                      marginBottom:4,
                    }}>
                      <div style={{fontSize:12.5,fontWeight:600,color:activeQ===i?'var(--blue)':'var(--text)'}}>
                        {i+1}. {q.text ? q.text.slice(0,40)+(q.text.length>40?'...':'') : <span style={{color:'var(--text-3)'}}>Асуулт оруулаагүй</span>}
                      </div>
                      {q.topic && <div style={{fontSize:11,color:'var(--text-3)',marginTop:2}}>{q.topic}</div>}
                    </div>
                  ))}
                  <button className="btn btn-outline btn-sm btn-full" style={{marginTop:6,justifyContent:'center'}} onClick={addQ}>
                    + Асуулт нэмэх
                  </button>
                </div>
              </div>
              <div className="card">
                <div className="card-body" style={{fontSize:13,color:'var(--text-2)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                    <span>Нийт асуулт</span><strong>{questions.length}</strong>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between'}}>
                    <span>Бөглөсөн</span>
                    <strong style={{color:'var(--green)'}}>{questions.filter(q=>q.text).length}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
