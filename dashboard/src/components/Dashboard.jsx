import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";

const Dashboard = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  axios.defaults.withCredentials = true;

  const handleLogout = () => {
    axios.get('http://localhost:5000/auth/logout')
      .then(result => {
        if (result.data.Status) {
          localStorage.removeItem("valid");
          localStorage.removeItem("role");
          navigate("/adminlogin");
        }
      })
      .catch(err => console.error(err));
  }

  return (
    <div className="container-fluid">
      <div className="row flex-nowrap">
        <div className="col-auto col-md-3 col-xl-2 px-sm-2 px-0 bg-dark" style={{ width: '250px' }}>
          <div className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-100">
            <Link
              to="/dashboard"
              className="d-flex align-items-center pb-3 mb-md-1 mt-md-3 me-md-auto text-white text-decoration-none"
            >
              <span className="fs-5 fw-bolder d-none d-sm-inline">OpenVOC</span>
            </Link>
            <ul className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start" id="menu">
              <li className="w-100">
                <Link to="/dashboard" className="nav-link text-white px-0 align-middle">
                  <i className="fs-4 bi-speedometer2 ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">Dashboard</span>
                </Link>
              </li>

              {(role === 'manager') && (
                <li className="w-100">
                  <Link to="/dashboard/tickets" className="nav-link px-0 align-middle text-white">
                    <i className="fs-4 bi bi-sticky ms-2"></i>
                    <span className="ms-2 d-none d-sm-inline">Gestion des tickets</span>
                  </Link>
                </li>
              )}

              {(role === 'user' || role === 'manager') && (
                <>
                  <li className="w-100">
                    <Link to="/dashboard/MesTickets" className="nav-link px-0 align-middle text-white">
                      <i className="fs-4 bi bi-stickies ms-2"></i>
                      <span className="ms-2 d-none d-sm-inline">Liste des tickets affectés</span>
                    </Link>
                  </li>
                  <li className="w-100">
                    <Link to="/dashboard/vulnerabilites" className="nav-link px-0 align-middle text-white">
                      <i className="fs-4 bi-columns ms-2"></i>
                      <span className="ms-2 d-none d-sm-inline">Liste des vulnérabilités</span>
                    </Link>
                  </li>
                  <li className="w-100">
                    <Link to="/dashboard/scans" className="nav-link px-0 align-middle text-white">
                      <i className="fs-4 bi bi-file-earmark ms-2"></i>
                      <span className="ms-2 d-none d-sm-inline">Historique des scans</span>
                    </Link>
                  </li>
                </>
              )}

              {role === 'manager' && (
                <>
                  <li className="w-100">
                    <Link to="/dashboard/gestionScans" className="nav-link px-0 align-middle text-white">
                      <i className="fs-4 bi bi-upc-scan ms-2"></i>
                      <span className="ms-2 d-none d-sm-inline">Gestion scans</span>
                    </Link>
                  </li>
                  <li className="w-100">
                    <Link to="/dashboard/gestionUtilisateurs" className="nav-link px-0 align-middle text-white">
                      <i className="fs-4 bi-people ms-2"></i>
                      <span className="ms-2 d-none d-sm-inline">Gestion des Analystes</span>
                    </Link>
                  </li>
                </>
              )}

              <li className="w-100" onClick={handleLogout}>
                <Link className="nav-link px-0 align-middle text-white">
                  <i className="fs-4 bi-power ms-2"></i>
                  <span className="ms-2 d-none d-sm-inline">Logout</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="col p-0 m-0" style={{ width: '1282px' }}>
          <div
            className="p-2 d-flex align-items-center shadow"
            style={{
              width: '1282px',
              borderRadius: '12px',
              backgroundColor: '#fff',
              position: 'relative',
            }}
          >
            <div className="d-flex align-items-center" style={{ gap: '12px' }}>
              <img
                src="https://i.pravatar.cc/40"
                alt="Profile"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #007bff',
                  boxShadow: '0 1px 4px rgba(0, 123, 255, 0.4)',
                }}
              />
              <span style={{ fontWeight: '600', color: '#2c3e50', userSelect: 'none' }}>
                John Doe
              </span>
            </div>

            <h4
              style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                margin: 0,
                fontWeight: '700',
                color: '#2c3e50',
                userSelect: 'none',
              }}
            >
              Vulnerability Operations Center
            </h4>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
