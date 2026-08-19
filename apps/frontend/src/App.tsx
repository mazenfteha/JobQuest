import { Routes, Route } from 'react-router-dom'
import AppLayout from './layout/AppLayout'
import Dashboard from './screens/Dashboard'
import Applications from './screens/Applications'
import QuestBoard from './screens/QuestBoard'
import Achievements from './screens/Achievements'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/quests" element={<QuestBoard />} />
        <Route path="/achievements" element={<Achievements />} />
      </Route>
    </Routes>
  )
}
