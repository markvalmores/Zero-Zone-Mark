import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    </HashRouter>
  );
}
