import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import '../styles/style.css'

const NAV_TEACHER = [
  { path: '/',          label: 'Нүүр хуудас' },
  { path: '/dashboard', label: 'Хянах самбар' },
  { path: '/exams',     label: 'Шалгалтууд' },
  { path: '/results',   label: 'Үр дүн' },
  { path: '/students',  label: 'Оюутнууд' },
]

const NAV_STUDENT = [
  { path: '/',      label: 'Нүүр хуудас' },
  { path: '/exams', label: 'Шалгалтууд' },
]

export default function Header() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef(null)

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const initials  = (user.lastname?.[0] || '') + (user.firstname?.[0] || '')
  const fullName  = `${user.lastname || ''} ${user.firstname || ''}`.trim()
  const roleLabel = user.role === 'admin' ? 'Админ' : user.role === 'teacher' ? 'Багш' : 'Оюутан'
  const nav       = ['teacher','admin'].includes(user?.role) ? NAV_TEACHER : NAV_STUDENT

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <header style={{
      height: 'var(--header-h)',
      background: '#0F172A',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div className="container" style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'space-between' }}>

        <Link to="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none' }}>
          <div style={{
            width:34, height:34, background:'var(--blue)', borderRadius:8,
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white"/>
              <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" opacity="0.6"/>
              <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" opacity="0.6"/>
              <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:'#fff', lineHeight:1.2 }}>ExamSystem</div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', lineHeight:1.2 }}>Цахим шалгалт</div>
          </div>
        </Link>

        {/* Nav */}
        <nav style={{ display:'flex', alignItems:'center', gap:2 }}>
          {nav.map(n => (
            <Link key={n.path} to={n.path} style={{
              padding:'6px 12px', borderRadius:6,
              fontSize:13.5, fontWeight:500,
              color: pathname === n.path || (n.path !== '/' && pathname.startsWith(n.path))
                ? '#fff' : 'rgba(255,255,255,0.55)',
              background: pathname === n.path || (n.path !== '/' && pathname.startsWith(n.path))
                ? 'rgba(27,79,216,0.35)' : 'transparent',
              textDecoration:'none',
            }}>
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {['teacher','admin'].includes(user?.role) && (
            <Link to="/exams/create" className="btn btn-primary btn-sm">
              + Шалгалт үүсгэх
            </Link>
          )}

          {user?.role && (
            <div ref={dropRef} style={{ position:'relative' }}>
              <button onClick={() => setDropOpen(p => !p)} style={{
                display:'flex', alignItems:'center', gap:8,
                background:'rgba(255,255,255,0.07)',
                border:'1px solid rgba(255,255,255,0.12)',
                borderRadius:8, padding:'5px 10px 5px 6px',
                cursor:'pointer',
              }}>
                <div style={{
                  width:28, height:28, borderRadius:'50%',
                  background:'var(--blue)', color:'#fff',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:11, fontWeight:700, flexShrink:0,
                }}>
                  {initials || '?'}
                </div>
                <div style={{ textAlign:'left' }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'#fff', lineHeight:1.2, whiteSpace:'nowrap' }}>
                    {fullName || 'Хэрэглэгч'}
                  </div>
                  <div style={{ fontSize:10.5, color:'rgba(255,255,255,0.45)', lineHeight:1.2 }}>
                    {roleLabel}
                  </div>
                </div>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{
                  marginLeft:2, transition:'transform .2s',
                  transform: dropOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}>
                  <path d="M2 4l4 4 4-4" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>

              {dropOpen && (
                <div style={{
                  position:'absolute', right:0, top:'calc(100% + 8px)',
                  background:'#1E293B',
                  border:'1px solid rgba(255,255,255,0.1)',
                  borderRadius:10, padding:'6px',
                  minWidth:180, boxShadow:'0 8px 24px rgba(0,0,0,0.4)',
                  zIndex:200,
                }}>
                  <div style={{
                    padding:'8px 10px 10px', marginBottom:4,
                    borderBottom:'1px solid rgba(255,255,255,0.08)',
                  }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#fff' }}>{fullName}</div>
                    <div style={{ fontSize:11.5, color:'rgba(255,255,255,0.4)', marginTop:2 }}>{user.email}</div>
                  </div>

                  {['teacher','admin'].includes(user?.role) && [
                    { to:'/profile',   icon:'👤', label:'Хувийн мэдээлэл' },
                    { to:'/dashboard', icon:'📊', label:'Хянах самбар' },
                  ].map(item => (
                    <Link key={item.to} to={item.to}
                      onClick={() => setDropOpen(false)}
                      style={{
                        display:'flex', alignItems:'center', gap:8,
                        padding:'8px 10px', borderRadius:6,
                        fontSize:13, color:'rgba(255,255,255,0.8)',
                        textDecoration:'none',
                      }}
                    >
                      <span>{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}

                  <div style={{ borderTop:'1px solid rgba(255,255,255,0.08)', marginTop:4, paddingTop:4 }}>
                    <button onClick={handleLogout} style={{
                      width:'100%', display:'flex', alignItems:'center', gap:8,
                      padding:'8px 10px', borderRadius:6, border:'none',
                      background:'transparent', cursor:'pointer',
                      fontSize:13, color:'#F87171',
                    }}>
                      <span>🚪</span> Гарах
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
