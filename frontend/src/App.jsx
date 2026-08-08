import { Route, Routes } from 'react-router-dom';
import WorkspacePage from './pages/WorkspacePage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WorkspacePage />} />
      <Route path="/app" element={<WorkspacePage />} />
      <Route path="*" element={<WorkspacePage />} />
    </Routes>
  );
}
