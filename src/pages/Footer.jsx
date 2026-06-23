import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{
      background: '#0F172A',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      padding: '1.25rem 0',
      marginTop: 'auto',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.35)' }}>
          © 2026 ExamSystem — Цахим шалгалт ба үнэлгээний систем
        </span>
        <div style={{ display: 'flex', gap: 20 }}>
          {[['/', 'Нүүр'], ['/exams', 'Шалгалт'], ['/results', 'Үр дүн']].map(([to, lbl]) => (
            <Link key={to} to={to} style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
              {lbl}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
