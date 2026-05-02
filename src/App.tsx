import { ShellLayout } from '@/layouts/ShellLayout'
import { ProgramPage } from '@/pages/ProgramPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { ProgressPage } from '@/pages/ProgressPage'
import { TodayPage } from '@/pages/TodayPage'
import { WorkoutSessionPage } from '@/pages/WorkoutSessionPage'
import { Route, Routes } from 'react-router-dom'

export default function App() {
  return (
    <Routes>
      <Route element={<ShellLayout />}>
        <Route path="/" element={<TodayPage />} />
        <Route path="/program" element={<ProgramPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="/workout" element={<WorkoutSessionPage />} />
    </Routes>
  )
}
