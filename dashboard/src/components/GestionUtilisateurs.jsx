// src/pages/GestionUtilisateurs.jsx
import React, { useState, useEffect } from 'react';
import api from '../utils/axiosInstance';

const GestionUtilisateurs = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
  
      const response = await api.get('/auth/user'); // or /auth/users if that's your correct endpoint
  
      if (response.data?.Result) {
        setUsers(response.data.Result); // Assuming the result is in 'Result'
      } else {
        setError("Unexpected response format");
      }
  
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(
        err.response?.data?.Error || // Use .Error because your backend returns it that way
        err.message ||
        'Failed to load users'
      );
    } finally {
      setLoading(false);
    }
  };
  

  if (error) {
    return (
      <div className="alert alert-danger m-3">
        <h4>Error</h4>
        <p>{error}</p>
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={fetchUsers}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-3">
      <h2>User Management</h2>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`badge ${
                    user.role === 'manager' ? 'bg-primary' : 'bg-secondary'
                  }`}>
                    {user.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GestionUtilisateurs;
