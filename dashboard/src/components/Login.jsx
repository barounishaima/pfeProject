// src/pages/Login.jsx
import React, { useState } from 'react';
import './style.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:5000';

const Login = () => {
  const [values, setValues] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const result = await axios.post('/auth/adminlogin', values);

      if (result.data.loginStatus && result.data.token) {
        console.log('Token received:', result.data.token);
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('valid', 'true');
        localStorage.setItem('role', result.data.role);
        navigate('/dashboard');
      } else {
        setError(result.data.Error || 'token failed.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div className='loginPage d-flex justify-content-center align-items-center'>
      <div className='p-4 rounded loginForm bg-white' style={{ width: '100%', maxWidth: '400px' }}>
        <div className='text-danger mb-3'>{error && error}</div>
        <h2 className='text-center mb-4'>Login Page</h2>
        <form onSubmit={handleSubmit}>
          <div className='mb-3'>
            <label htmlFor="email"><strong>Email:</strong></label>
            <input
              type="email"
              name='email'
              autoComplete='off'
              placeholder='Enter Email'
              onChange={(e) => setValues({ ...values, email: e.target.value })}
              className='form-control'
              required
            />
          </div>
          <div className='mb-3'>
            <label htmlFor="password"><strong>Password:</strong></label>
            <input
              type="password"
              name='password'
              placeholder='Enter Password'
              onChange={(e) => setValues({ ...values, password: e.target.value })}
              className='form-control'
              required
            />
          </div>
          <button type="submit" className='btn btn-success w-100 py-2 mb-3'>Log in</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
