import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import { AuthProvider } from './context/AuthContext.jsx'         
import ProtectedRoute from './component/ProtectedRoute.jsx'     

import Header     from './pages/Header.jsx'
import Footer     from './pages/Footer.jsx'
import Home       from './pages/Home.jsx'
import Login      from './pages/Login.jsx'
import Dashboard  from './pages/Dashboard.jsx'
import ExamList   from './pages/ExamList.jsx'
import ExamDetail from './pages/ExamDetail.jsx'
import TakeExam   from './pages/TakeExam.jsx'
import ExamResult from './pages/ExamResult.jsx'
import Results    from './pages/Results.jsx'
import CreateExam from './pages/CreateExam.jsx'
import Students   from './pages/Students.jsx'
import Profile    from './pages/Profile.jsx'

function App() {
  return (
    <AuthProvider>
      <Router basename="/exam_frontend">
        <Header />
        <main className="main-content">
          <Routes>

            <Route path="/"      element={<Home />} />
            <Route path="/login" element={<Login />} />

            <Route path="/dashboard" element={
              <ProtectedRoute roles={['teacher', 'admin']}>
                <Dashboard />
              </ProtectedRoute>
            }/>

            <Route path="/exams" element={<ExamList />} />
            <Route path="/exams/:id" element={<ExamDetail />} />
            <Route path="/exams/:id/result" element={<ExamResult />} />

            <Route path="/exams/create" element={
              <ProtectedRoute roles={['teacher', 'admin']}>
                <CreateExam />
              </ProtectedRoute>
            }/>

            <Route path="/exams/:id/take" element={
              <ProtectedRoute roles={['student']}>
                <TakeExam />
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
              <ProtectedRoute roles={['teacher', 'admin']}>
                <Profile />
              </ProtectedRoute>
            }/>

          </Routes>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  )
}

export default App
