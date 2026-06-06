'use client';
import { useState, useEffect } from 'react';
import { Icons } from '@/components/UI';

export default function Login({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [bgImage, setBgImage] = useState('');

  useEffect(() => {
    try {
      const savedAjustos = localStorage.getItem('erp_ajustos');
      if (savedAjustos) {
        const parsed = JSON.parse(savedAjustos);
        if (parsed && parsed.bgImage) {
          setBgImage(parsed.bgImage);
        }
      }
    } catch (e) {
      console.error('Error loading custom background image:', e);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    
    const validUsers = ['gallardopujol@gmail.com', 'lauravinyals@gmail.com'];
    const validPassword = 'doble2Vi.';

    if (validUsers.includes(cleanEmail) && password === validPassword) {
      setError('');
      onSuccess(cleanEmail);
    } else {
      setError('Correu electrònic o contrasenya incorrectes ❌');
    }
  };

  return (
    <div className="login-wrapper" style={bgImage ? { backgroundImage: `url(${bgImage})` } : {}}>
      {/* Overlay fosc de la imatge de fons */}
      <div className="login-bg-overlay" />
      
      <div className="login-card">
        <div className="login-logo">
          {Icons.anchor}
          <h1>S/Y Afra2</h1>
          <p>ERP de Control de Bord</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}
          
          <div className="form-group">
            <label>Correu Electrònic</label>
            <input 
              type="email" 
              placeholder="usuari@correu.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Contrasenya</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full mt-2">
            Entrar a Bord
          </button>
        </form>
        
        <div className="login-footer">
          Ús exclusiu de la tripulació autoritzada.
        </div>
      </div>
    </div>
  );
}
