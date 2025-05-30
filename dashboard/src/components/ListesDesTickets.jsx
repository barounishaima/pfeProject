import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const severityOptions = [
  { label: 'Low (1)', value: 1 },
  { label: 'Medium (2)', value: 2 },
  { label: 'High (3)', value: 3 },
  { label: 'Critical (4)', value: 4 },
];

const tlpOptions = [
  { label: 'White (0)', value: 0 },
  { label: 'Green (1)', value: 1 },
  { label: 'Amber (2)', value: 2 },
];

const ListesDesTickets = () => {
  const [cases, setCases] = useState([]);
  const [form, setForm] = useState({ title: '', owner: '', severity: null, description: '', startDate: null, tlp: 2 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/cases');
      setCases(res.data);
    } catch (err) {
      console.error('Error fetching cases', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleDateChange = (e) => {
    setForm({ ...form, startDate: Math.floor(e.value.getTime() / 1000) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.owner || !form.severity) return;

    try {
      setLoading(true);
      await axios.post('http://localhost:5000/api/cases', form);
      setForm({ title: '', owner: '', severity: null, description: '', startDate: null, tlp: 2 });
      fetchCases();
    } catch (err) {
      console.error('Error creating case', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2>Gestion des Tickets</h2>

      {/* Styled form container */}
      <div style={{
        borderRadius: '20px',
        border: '1px solid #e0e0e0',
        padding: '2rem',
        marginBottom: '2rem',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <form onSubmit={handleSubmit} className="p-fluid">
          <div className="p-grid p-formgrid" style={{ gap: '1.5rem' }}>
            {/* Row 1 */}
            <div className="p-col-12 p-md-4">
              <div className="p-field">
                <label htmlFor="title">Titre</label>
                <InputText 
                  id="title" 
                  name="title" 
                  value={form.title} 
                  onChange={handleInputChange} 
                  required 
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div className="p-col-12 p-md-4">
              <div className="p-field">
                <label htmlFor="owner">Assigné à</label>
                <InputText 
                  id="owner" 
                  name="owner" 
                  value={form.owner} 
                  onChange={handleInputChange} 
                  required 
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div className="p-col-12 p-md-4">
              <div className="p-field">
                <label htmlFor="severity">Sévérité</label>
                <Dropdown 
                  id="severity" 
                  name="severity" 
                  value={form.severity} 
                  options={severityOptions} 
                  onChange={handleInputChange} 
                  placeholder="Choisir..." 
                  required 
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="p-col-12">
              <div className="p-field">
                <label htmlFor="description">Description</label>
                <InputText 
                  id="description" 
                  name="description" 
                  value={form.description} 
                  onChange={handleInputChange} 
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="p-col-12 p-md-6">
              <div className="p-field">
                <label htmlFor="startDate">Date de Début</label>
                <Calendar 
                  id="startDate" 
                  value={form.startDate ? new Date(form.startDate * 1000) : null} 
                  onChange={handleDateChange} 
                  showIcon 
                  showTime 
                  hourFormat="24" 
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div className="p-col-12 p-md-6">
              <div className="p-field">
                <label htmlFor="tlp">TLP</label>
                <Dropdown 
                  id="tlp" 
                  name="tlp" 
                  value={form.tlp} 
                  options={tlpOptions} 
                  onChange={handleInputChange} 
                  placeholder="TLP" 
                  required 
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Submit button */}
            <div className="p-col-12" style={{ textAlign: 'right', marginTop: '1rem' }}>
              <Button 
                label="Créer le ticket" 
                icon="pi pi-plus" 
                className="p-button-success" 
                type="submit" 
                loading={loading} 
              />
            </div>
          </div>
        </form>
      </div>

      <DataTable value={cases} paginator rows={5} responsiveLayout="scroll">
        <Column field="displayId" header="ID" sortable></Column>
        <Column field="title" header="Titre" sortable></Column>
        <Column field="owner" header="Assigné à" sortable></Column>
        <Column field="status" header="Statut" sortable></Column>
        <Column field="description" header="Description"></Column>
      </DataTable>
    </div>
  );
};

export default ListesDesTickets;