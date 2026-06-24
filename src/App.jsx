import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './component/ProtectedRoute.jsx'
import Header from './pages/Header.jsx'
import Footer from './pages/Footer.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ExamList from './pages/ExamList.jsx'
import ExamDetail from './pages/ExamDetail.jsx'
import TakeExam from './pages/TakeExam.jsx'
import ExamResult from './pages/ExamResult.jsx'
import Results from './pages/Results.jsx'
import CreateExam from './pages/CreateExam.jsx'
import Students from './pages/Students.jsx'
import Profile from './pages/Profile.jsx'

function Layout() {
  const location = useLocation()
  const isLogin = location.pathname === '/login'

  return (
    <>
      {!isLogin && <Header />}
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute roles={['teacher', 'admin', 'student']}>
              <Home />
            </ProtectedRoute>
          }/>
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['teacher', 'admin']}>
              <Dashboard />
            </ProtectedRoute>
          }/>
          <Route path="/exams" element={
            <ProtectedRoute roles={['teacher', 'admin', 'student']}>
              <ExamList />
            </ProtectedRoute>
          }/>
          <Route path="/exams/create" element={
            <ProtectedRoute roles={['teacher', 'admin']}>
              <CreateExam />
            </ProtectedRoute>
          }/>
          <Route path="/exams/:id" element={
            <ProtectedRoute roles={['teacher', 'admin', 'student']}>
              <ExamDetail />
            </ProtectedRoute>
          }/>
          <Route path="/exams/:id/take" element={
            <ProtectedRoute roles={['student']}>
              <TakeExam />
            </ProtectedRoute>
          }/>
          <Route path="/exams/:id/result" element={
            <ProtectedRoute roles={['teacher', 'admin', 'student']}>
              <ExamResult />
            </ProtectedRoute>
          }/>
          <Route path="/results" element={
            <ProtectedRoute roles={['teacher', 'admin']}>
              <Results />
            </ProtectedRoute>
          }/>
          <Route path="/students" element={
            <ProtectedRoute roles={['teacher', 'admin']}>
              <Students />
            </ProtectedRoute>
          }/>
          <Route path="/profile" element={
            <ProtectedRoute roles={['teacher', 'admin', 'student']}>
              <Profile />
            </ProtectedRoute>
          }/>
        </Routes>
      </main>
      {!isLogin && <Footer />}
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router basename="/exam_frontend">
        <Layout />
      </Router>
    </AuthProvider>
  )
}

export default App
