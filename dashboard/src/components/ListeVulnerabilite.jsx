import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ListeVulnerabilite = () => {
  const [vulnerabilites, setVulnerabilites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVulnerabilites();
  }, []);

  const fetchVulnerabilites = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/defectdojo/vulnerabilities');
      setVulnerabilites(res.data);
    } catch (error) {
      console.error('Erreur lors du chargement des vulnérabilités :', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Liste des Vulnérabilités Actives</h2>
      {loading ? (
        <p>Chargement des données...</p>
      ) : vulnerabilites.length === 0 ? (
        <p>Aucune vulnérabilité trouvée.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Titre</th>
                <th>Gravité</th>
                <th>Produit</th>
                <th>Composant</th>
                <th>Atténuation</th>
                <th>Date</th>
                <th>Lien</th>
              </tr>
            </thead>
            <tbody>
              {vulnerabilites.map((vuln) => (
                <tr key={vuln.id}>
                  <td>{vuln.id}</td>
                  <td>{vuln.title}</td>
                  <td>
                    <span
                      className={`badge ${
                        vuln.severity === 'Critical'
                          ? 'bg-danger'
                          : vuln.severity === 'High'
                          ? 'bg-warning text-dark'
                          : 'bg-secondary'
                      }`}
                    >
                      {vuln.severity}
                    </span>
                  </td>
                  <td>{vuln.product}</td>
                  <td>{vuln.component}</td>
                  <td>{vuln.mitigation || 'N/A'}</td>
                  <td>{new Date(vuln.date).toLocaleDateString()}</td>
                  <td>
                    <a href={vuln.url} target="_blank" rel="noopener noreferrer">
                      Lien
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListeVulnerabilite;
