import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

import Welcome from './pages/Welcome';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Dinheiro from './pages/Dinheiro';
import Contas from './pages/Contas';
import Assinaturas from './pages/Assinaturas';
import Dividas from './pages/Dividas';
import Investimentos from './pages/Investimentos';

import './styles/index.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dinheiro" element={<Dinheiro />} />
          <Route path="/contas" element={<Contas />} />
          <Route path="/assinaturas" element={<Assinaturas />} />
          <Route path="/dividas" element={<Dividas />} />
          <Route path="/investimentos" element={<Investimentos />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;