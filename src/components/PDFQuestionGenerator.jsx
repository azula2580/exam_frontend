import { useState } from 'react'
import axios from 'axios'
import '../styles/style.css'

export default function PDFQuestionGenerator({ examId, onQuestionsGenerated }) {
  const [file, setFile] = useState(null)
  const [questionCount, setQuestionCount] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [ollamaStatus, setOllamaStatus] = useState(null)

  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}` }

  // Ollama холболт шалгах
  const checkOllama = async () => {
    try {
      const res = await axios.get('/api/exams/ollama/status', { headers })
      setOllamaStatus({ connected: true, models: res.data.models })
    } catch (err) {
      setOllamaStatus({ connected: false, message: err.response?.data?.message || 'Ollama холбогдоогүй' })
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
    if (!file) {
      setError('PDF файл сонгоно уу')
      return
    }

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
          headers: {
            ...headers,
            'Content-Type': 'multipart/form-data'
          },
          timeout: 120000 // 2 минут - Ollama удаан ажиллаж болно
        }
      )

      setSuccess(`${res.data.count} асуулт амжилттай үүсгэгдлээ!`)
      setFile(null)
      
      if (onQuestionsGenerated) {
        onQuestionsGenerated(res.data.data)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Алдаа гарлаа. Дахин оролдоно уу.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">PDF-ээс асуулт үүсгэх (Ollama AI)</span>
        <button 
          type="button" 
          className="btn btn-ghost btn-sm"
          onClick={checkOllama}
        >
          Ollama шалгах
        </button>
      </div>
      <div className="card-body">
        {ollamaStatus && (
          <div className={`alert ${ollamaStatus.connected ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '1rem' }}>
            {ollamaStatus.connected ? (
              <>
                <span style={{ color: '#15803D', fontWeight: 600 }}>Ollama холбогдсон</span>
                {ollamaStatus.models?.length > 0 && (
                  <div style={{ fontSize: 12, marginTop: 4, color: 'var(--text-2)' }}>
                    Боломжит моделууд: {ollamaStatus.models.join(', ')}
                  </div>
                )}
              </>
            ) : (
              <span style={{ color: '#B91C1C' }}>{ollamaStatus.message}</span>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">PDF файл сонгох</label>
            <div 
              className="file-drop-zone"
              style={{
                border: '2px dashed var(--border)',
                borderRadius: 8,
                padding: '2rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: file ? 'var(--bg-2)' : 'transparent',
                transition: 'all 0.2s'
              }}
              onClick={() => document.getElementById('pdf-input').click()}
            >
              <input
                type="file"
                id="pdf-input"
                accept=".pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
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
                  <div style={{ color: 'var(--text-2)' }}>
                    PDF файлаа энд дарж эсвэл чирж оруулна уу
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
                    Дээд хэмжээ: 10MB
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label className="form-label">Үүсгэх асуултын тоо</label>
            <select
              className="form-input"
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
            >
              {[5, 10, 15, 20, 25, 30].map(n => (
                <option key={n} value={n}>{n} асуулт</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
              {success}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading || !file}
            style={{ justifyContent: 'center' }}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ marginRight: 8 }}></span>
                Асуулт үүсгэж байна... (1-2 минут)
              </>
            ) : (
              'Асуулт үүсгэх'
            )}
          </button>
        </form>

        <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-2)', borderRadius: 8, fontSize: 12.5 }}>
          <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-2)' }}>
            Ollama тохиргоо:
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-3)' }}>
            <li>Ollama суулгах: <code>ollama.com</code></li>
            <li>Модел татах: <code>ollama pull llama3.2</code></li>
            <li>Ажиллуулах: <code>ollama serve</code></li>
            <li>Порт: <code>http://localhost:11434</code></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
