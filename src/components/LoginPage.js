import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Button, Input, Alert, AlertTitle, AlertDescription } from '@/components/ui';


function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      axios.post('http://localhost:3001/', { username, password })
        .then(response => {
          login(response.data.token);
          navigate('/'); 
        })
        .catch(error => {
          console.error('Erreur de connexion', error);
          setError('Échec de la connexion. Veuillez réessayer.');
        });
    } catch (error) {
      console.error('Erreur lors du traitement de la connexion', error);
      setError('Une erreur est survenue.');
    }
  };

  return (
    <div className="login-container" style={{ color: '#0a69c9' }}>
      <form className="login-form" onSubmit={handleSubmit}>
        <h1>Connexion</h1>
        {error && (
          <Alert>
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Input
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          placeholder="Mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit">Se Connecter</Button>
      </form>
    </div>
  );
}

export default LoginPage;
