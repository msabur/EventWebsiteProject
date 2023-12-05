import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { AppState } from "../state/AppState";
import { observer } from 'mobx-react-lite';
import { useFetchWrapper } from '../api';

export const LoginPage = observer(() => {
  const fetchWrapper = useFetchWrapper();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const login = () => {
    // check if username and password were entered
    if (!username || !password) {
      setError('Please enter a username and password');
      return;
    }

    fetchWrapper.post('/login', { username, password })
      .then((data) => {
        setError('');
        AppState.onLogin(username, data);
      })
      .catch((err) => {
        setError(err);
      });
  };

  return (
    <Form>
      <h3>Please log in</h3>
      <Form.Group controlId="formBasicUsername">
        <Form.Label>Username</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={handleUsernameChange}
        />
      </Form.Group>
      <Form.Group controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Password"
          value={password}
          onChange={handlePasswordChange}
        />
      </Form.Group>
      <Button variant="primary" type="button" onClick={login}>
        Login
      </Button>
      {/* error message */}
      {error && <p className='loginError'>{error}</p>}
    </Form>
  );
});

