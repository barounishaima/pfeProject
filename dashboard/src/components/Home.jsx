import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'

const Home = () => {
  const [adminTotal, setAdminTotal] = useState(0)
  const [employeeTotal, setEmployeeTotal] = useState(0)
  const [salaryTotal, setSalaryTotal] = useState(0)
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    fetchAlerts()
    adminCount()
    employeeCount()
    salaryCount()
  }, [])

  const fetchAlerts = () => {
    axios
      .get('http://localhost:5000/api/wazuh/alerts')
      .then((res) => {
        setAlerts(res.data)
      })
      .catch((err) => {
        console.error('Failed to fetch alerts:', err)
      })
  }

  const adminCount = () => {
    axios.get('http://localhost:5000/auth/admin_count').then((result) => {
      if (result.data.Status) {
        setAdminTotal(result.data.Result[0].admin)
      }
    })
  }
  const employeeCount = () => {
    axios.get('http://localhost:5000/auth/employee_count').then((result) => {
      if (result.data.Status) {
        setEmployeeTotal(result.data.Result[0].employee)
      }
    })
  }
  const salaryCount = () => {
    axios.get('http://localhost:5000/auth/salary_count').then((result) => {
      if (result.data.Status) {
        setSalaryTotal(result.data.Result[0].salaryOFEmp)
      } else {
        alert(result.data.Error)
      }
    })
  }

  return (
    <div>
      {/* Stats panels */}
      <div className="p-3 d-flex justify-content-around mt-3">
        <div className="px-3 pt-2 pb-3 border shadow-sm w-25">
          <div className="text-center pb-1">
            <h4>Tickets</h4>
          </div>
          <hr />
          <div className="d-flex justify-content-between">
            <h5>Total:</h5>
            <h5>{adminTotal}</h5>
          </div>
        </div>
        <div className="px-3 pt-2 pb-3 border shadow-sm w-25">
          <div className="text-center pb-1">
            <h4>Scans</h4>
          </div>
          <hr />
          <div className="d-flex justify-content-between">
            <h5>Total:</h5>
            <h5>{employeeTotal}</h5>
          </div>
        </div>
        <div className="px-3 pt-2 pb-3 border shadow-sm w-25">
          <div className="text-center pb-1">
            <h4>Vulnerabilite</h4>
          </div>
          <hr />
          <div className="d-flex justify-content-between">
            <h5>Total:</h5>
            <h5>{salaryTotal}</h5>
          </div>
        </div>
      </div>

      {/* Full-width alerts container */}
      <div className="p-4 mt-4 border shadow-sm" style={{ width: '100%' }}>
        <h2>Wazuh Alerts</h2>
        {alerts.length === 0 ? (
          <p>No alerts found.</p>
        ) : (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Rule ID</th>
                <th>Description</th>
                <th>Severity</th>
                <th>Agent Name</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert, idx) => (
                <tr key={idx}>
                  <td>{alert.ruleId}</td>
                  <td>{alert.description}</td>
                  <td>{alert.severity}</td>
                  <td>{alert.agentName}</td>
                  <td>{new Date(alert.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Home
