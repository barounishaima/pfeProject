import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddUser = () => {
  const [user, setUser] = useState({
    username: "",
    email: "",
    role: "user", // Default to "user"
    phoneNumber: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Please login first");
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/auth/add_user',
        {
          ...user,
          role: user.role === "admin" ? "manager" : user.role // Convert "admin" to "manager"
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        alert("User added successfully!");
        navigate('/dashboard/utilisateurs');
      } else {
        setError(response.data.message || "Operation failed");
      }
    } catch (err) {
      console.error("Add user error:", err);
      
      if (err.response) {
        switch (err.response.status) {
          case 401:
            setError("Session expired - Please refresh the page");
            break;
          case 403:
            setError("You don't have permission to perform this action");
            break;
          default:
            setError(err.response.data?.message || "Failed to add user");
        }
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center mt-3">
      <div className="p-3 rounded w-50 border">
        <h3 className="text-center">Ajouter utilisateur</h3>
        
        {error && (
          <div className="alert alert-danger mb-3">
            {error}
            {error.includes("expired") && (
              <button 
                className="btn btn-sm btn-link"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </button>
            )}
          </div>
        )}

        <form className="row g-1" onSubmit={handleSubmit}>
          {/* Form fields remain the same */}
          <div className="col-12 mt-3">
            <button 
              type="submit" 
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Processing...
                </>
              ) : (
                "Ajouter utilisateur"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;