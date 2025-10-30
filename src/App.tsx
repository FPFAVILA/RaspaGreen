import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { User } from './types';
import { RegistrationForm } from './components/RegistrationForm';
import { GameDashboard } from './components/GameDashboard';

const USER_STORAGE_KEY = 'raspadinha_user_data';
const REGISTRATION_BONUS_KEY = 'raspadinha_registration_bonus';
const VALID_REGISTRATION_KEY = 'raspadinha_valid_registration';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      const validRegistration = localStorage.getItem(VALID_REGISTRATION_KEY);

      if (savedUser && validRegistration === 'true') {
        const userData = JSON.parse(savedUser);
        setUser(userData);

        // Se já está registrado e tenta acessar /cadastro, redireciona para /dashboard
        if (location.pathname === '/cadastro') {
          navigate('/dashboard', { replace: true });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar usuário salvo:', error);
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(VALID_REGISTRATION_KEY);
      localStorage.removeItem(REGISTRATION_BONUS_KEY);
    } finally {
      setIsLoading(false);
    }
  }, [navigate, location.pathname]);

  const handleRegister = (newUser: User) => {
    // Marcar que o usuário completou o fluxo correto de cadastro
    localStorage.setItem(VALID_REGISTRATION_KEY, 'true');

    const initialGameState = {
      balance: 14.70,
      scratchCardsUsed: 0,
      hasWonIphone: false
    };
    localStorage.setItem('raspadinha_game_state', JSON.stringify(initialGameState));
    localStorage.setItem(REGISTRATION_BONUS_KEY, 'true');

    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
    }

    setUser(newUser);

    setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 1800);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-bold">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/cadastro" element={<RegistrationForm onRegister={handleRegister} />} />
      <Route path="/dashboard" element={<GameDashboard user={user} />} />
      <Route path="/" element={<GameDashboard user={user} />} />
      <Route path="*" element={<GameDashboard user={user} />} />
    </Routes>
  );
}

export default App;