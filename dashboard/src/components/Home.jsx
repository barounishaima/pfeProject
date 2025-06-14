import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell, Legend,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line,
} from 'recharts';

const COULEURS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Home = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = () => {
    axios
      .get('http://localhost:5000/api/wazuh/alerts')
      .then((res) => {
        setAlerts(res.data);
      })
      .catch((err) => {
        console.error('Échec de la récupération des alertes :', err);
      });
  };

  // Enhanced static data for better visualization
  const donneesGravite = [
    { name: 'Faible', value: 10, color: '#00C49F' },
    { name: 'Moyenne', value: 15, color: '#FFBB28' },
    { name: 'Élevée', value: 7, color: '#FF8042' },
    { name: 'Critique', value: 4, color: '#FF0000' },
  ];

  const donneesStatutTickets = [
    { status: 'Ouvert', count: 8 },
    { status: 'En cours', count: 5 },
    { status: 'Résolu', count: 12 },
    { status: 'Fermé', count: 6 },
  ];

  const vulnerabilitesParJour = [
    { date: '01/06', count: 2 },
    { date: '02/06', count: 3 },
    { date: '03/06', count: 5 },
    { date: '04/06', count: 4 },
    { date: '05/06', count: 6 },
    { date: '06/06', count: 3 },
    { date: '07/06', count: 7 },
  ];

  const typesDeScan = [
    { type: 'Scan complet', value: 20 },
    { type: 'Scan rapide', value: 15 },
    { type: 'Scan personnalisé', value: 10 },
  ];

  const alertesFactices = [
    {
      wazuhAlertId: 'a001',
      ruleId: '1001',
      severity: 7,
      timestamp: '2024-06-08T10:15:00Z',
      vulnerabilityId: 'vuln001',
    },
    {
      wazuhAlertId: 'a002',
      ruleId: '1002',
      severity: 9,
      timestamp: '2024-06-08T11:00:00Z',
      vulnerabilityId: null,
    },
    {
      wazuhAlertId: 'a003',
      ruleId: '1003',
      severity: 5,
      timestamp: '2024-06-07T18:45:00Z',
      vulnerabilityId: 'vuln002',
    },
    {
      wazuhAlertId: 'a004',
      ruleId: '1004',
      severity: 6,
      timestamp: '2024-06-06T14:30:00Z',
      vulnerabilityId: null,
    },
    {
      wazuhAlertId: 'a005',
      ruleId: '1005',
      severity: 4,
      timestamp: '2024-06-05T08:20:00Z',
      vulnerabilityId: 'vuln003',
    },
    {
      wazuhAlertId: 'a006',
      ruleId: '1006',
      severity: 8,
      timestamp: '2024-06-04T16:10:00Z',
      vulnerabilityId: 'vuln004',
    },
    {
      wazuhAlertId: 'a007',
      ruleId: '1007',
      severity: 3,
      timestamp: '2024-06-03T09:30:00Z',
      vulnerabilityId: null,
    },
  ];

  const alertesAffichees = alerts.length > 0 ? alerts : alertesFactices;

  const graphiques = [
    {
      titre: 'Gravité des scans',
      description: 'Répartition des scans par niveau de gravité',
      graphique: (
        <PieChart width={400} height={300}>
          <Pie
            data={donneesGravite}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {donneesGravite.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center"
            wrapperStyle={{ paddingTop: '20px' }}
          />
        </PieChart>
      ),
    },
    {
      titre: 'Tickets par statut',
      description: 'Nombre de tickets par statut de traitement',
      graphique: (
        <BarChart width={400} height={300} data={donneesStatutTickets}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="status" 
            angle={-45} 
            textAnchor="end"
            height={60}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar 
            dataKey="count" 
            name="Nombre de tickets" 
            fill="#8884d8" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      ),
    },
    {
      titre: 'Vulnérabilités par jour',
      description: 'Évolution des vulnérabilités détectées',
      graphique: (
        <LineChart width={400} height={300} data={vulnerabilitesParJour}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            angle={-45} 
            textAnchor="end"
            height={60}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="count" 
            name="Vulnérabilités" 
            stroke="#82ca9d" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      ),
    },
    {
      titre: 'Types de scan',
      description: 'Répartition des différents types de scans effectués',
      graphique: (
        <PieChart width={400} height={300}>
          <Pie
            data={typesDeScan}
            dataKey="value"
            nameKey="type"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
          >
            {typesDeScan.map((entry, index) => (
              <Cell key={`cell-scan-${index}`} fill={COULEURS[index + 2]} />
            ))}
          </Pie>
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center"
            wrapperStyle={{ paddingTop: '20px' }}
          />
        </PieChart>
      ),
    },
  ];

  return (
    <div className="container-fluid p-4" style={{ maxWidth: '1800px' }}>
      
      
      {/* Charts Section */}
      <div className="row mb-4">
        {graphiques.map(({ titre, description, graphique }, idx) => (
          <div key={idx} className="col-md-6 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-header bg-light">
                <h5 className="card-title mb-0">{titre}</h5>
                <small className="text-muted">{description}</small>
              </div>
              <div className="card-body d-flex flex-column align-items-center">
                {graphique}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts Table Section */}
      <div className="card shadow-sm">
        <div className="card-header bg-light">
          <h5 className="card-title mb-0">Dernières alertes de sécurité</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="thead-light">
                <tr>
                  <th>ID Alerte</th>
                  <th>ID Règle</th>
                  <th>Gravité</th>
                  <th>Date & Heure</th>
                  <th>Vulnérabilité</th>
                </tr>
              </thead>
              <tbody>
                {alertesAffichees.map((alert, idx) => (
                  <tr key={alert.wazuhAlertId || idx}>
                    <td>{alert.wazuhAlertId}</td>
                    <td>{alert.ruleId}</td>
                    <td>
                      <span className={`badge ${
                        alert.severity >= 8 ? 'bg-danger' :
                        alert.severity >= 5 ? 'bg-warning' : 'bg-info'
                      }`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td>{new Date(alert.timestamp).toLocaleString('fr-FR')}</td>
                    <td>
                      {alert.vulnerabilityId ? (
                        <span className="badge bg-secondary">{alert.vulnerabilityId}</span>
                      ) : (
                        <span className="text-muted">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;