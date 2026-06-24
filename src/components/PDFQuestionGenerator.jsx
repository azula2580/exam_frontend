import { useState } from 'react'
import axios from 'axios'
import '../styles/style.css'

export default function PDFQuestionGenerator({ examId, onQuestionsGenerated }) {
  const [file, setFile]                 = useState(null)
  const [questionCount, setQuestionCount] = useState(10)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [success, setSuccess]           = useState('')
  const [aiStatus, setAiStatus]         = useState(null)

  // Groq холболт шалгах
  const checkAI = async () => {
    try {
      const res = await axios.get('/api/exams/ollama/status')
      setAiStatus({ connected: true, model: res.data.model })
    } catch (err) {
      setAiStatus({ connected: false, message: err.response?.data?.message || 'AI холбогдоогүй' })
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setError('')
    } else {
      setError('Зөвхөн PDF файл сонгоно уу')
      setFile(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) { setError('PDF файл сонгоно уу'); return }

    setLoading(true)
    setError('')
    setSuccess('')

    const formData = new FormData()
    formData.append('pdf', file)
    formData.append('examId', examId)
    formData.append('questionCount', questionCount)

    try {
      const res = await axios.post(
        `/api/exams/${examId}/generate-from-pdf`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60000
        }
      )
      setSuccess(`${res.data.count} асуулт амжилттай үүсгэгдлээ!`)
      setFile(null)
      if (onQuestionsGenerated) onQuestionsGenerated(res.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Алдаа гарлаа. Дахин оролдоно уу.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">PDF-ээс асуулт автоматаар үүсгэх (Groq AI)</span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={checkAI}>
          Холболт шалгах
        </button>
      </div>
      <div className="card-body">
        {aiStatus && (
          <div className={`alert ${aiStatus.connected ? 'alert-success' : 'alert-danger'}`}
            style={{ marginBottom: '1rem' }}>
            {aiStatus.connected
              ? <span style={{ color: '#15803D', fontWeight: 600 }}>
                  ✓ Groq AI холбогдсон — {aiStatus.model}
                </span>
              : <span style={{ color: '#B91C1C' }}>{aiStatus.message}</span>
            }
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">PDF файл сонгох</label>
            <div
              style={{
                border: '2px dashed var(--border)', borderRadius: 8,
                padding: '2rem', textAlign: 'center', cursor: 'pointer',
                background: file ? 'var(--blue-light)' : 'transparent',
              }}
              onClick={() => document.getElementById('pdf-input').click()}
            >
              <input type="file" id="pdf-input" accept=".pdf"
                onChange={handleFileChange} style={{ display: 'none' }} />
              {file ? (
                <div>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>📄</div>
                  <div style={{ fontWeight: 500 }}>{file.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>📁</div>
                  <div style={{ color: 'var(--text-2)' }}>PDF файлаа дарж сонгоно уу</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>Дээд хэмжээ: 10MB</div>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">Үүсгэх асуултын тоо</label>
            <select className="form-control" value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}>
              {[5, 10, 15, 20, 25, 30].map(n => (
                <option key={n} value={n}>{n} асуулт</option>
              ))}
            </select>
          </div>

          {error   && <div className="alert alert-danger"  style={{ marginBottom: '1rem' }}>{error}</div>}
          {success && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{success}</div>}

          <button type="submit" className="btn btn-primary btn-full"
            disabled={loading || !file} style={{ justifyContent: 'center' }}>
            {loading ? 'Асуулт үүсгэж байна...' : 'Асуулт үүсгэх'}
          </button>
        </form>

        <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--blue-light)', borderRadius: 8, fontSize: 12.5 }}>
          PDF файлаас агуулгыг уншиж, Groq AI ашиглан сонгосон тооны асуулт автоматаар үүсгэнэ.
        </div>
      </div>
    </div>
  )
}
