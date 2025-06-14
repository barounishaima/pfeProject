import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { ListBox } from 'primereact/listbox';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

const ListesDesTickets = () => {
  const [selectedTickets, setSelectedTickets] = useState(new Set());
  const [selectedAnalyst, setSelectedAnalyst] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const staticTickets = [
    { _id: '1', Title: 'SQL Injection in login form' },
    { _id: '2', Title: 'Cross-Site Scripting in search bar' },
    { _id: '3', Title: 'Broken Authentication in session handling' },
    { _id: '4', Title: 'Insecure Deserialization vulnerability' },
    { _id: '5', Title: 'Directory Traversal in file upload' },
    { _id: '6', Title: 'Sensitive Data Exposure in API' },
  ];

  const staticAnalysts = [
    { id: 'a1', name: 'Analyste 1' },
    { id: 'a2', name: 'Analyste 2' },
    { id: 'a3', name: 'Analyste 3' },
  ];

  const toggleTicketSelection = (ticketId) => {
    setSelectedTickets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(ticketId)) newSet.delete(ticketId);
      else newSet.add(ticketId);
      return newSet;
    });
  };

  const handleConfirm = () => {
    setModalVisible(false);
  };

  const styles = {
    wrapper: {
      padding: '0 20px',
    },
    header: {
      textAlign: 'center',
      marginTop: '1.5rem',
      marginBottom: '1.5rem',
      color: '#2c3e50',
      fontWeight: '700',
      fontSize: '2rem',
      letterSpacing: '1px',
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginBottom: '1.5rem',
    },
    cardsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '1.5rem',
    },
    card: {
      backgroundColor: '#f4f7fa',  // slightly lighter blueish shade
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',  // stronger shadow
      position: 'relative',
      transition: 'transform 0.2s ease, box-shadow 0.3s ease',
      cursor: 'default',
      userSelect: 'none',
    },
    cardHover: {
      transform: 'scale(1.03)',
      boxShadow: '0 12px 30px rgba(0, 0, 0, 0.18)', // more pronounced on hover
    },
    checkbox: {
      position: 'absolute',
      top: 15,
      right: 15,
      cursor: 'pointer',
      width: '20px',
      height: '20px',
    },
    title: {
      fontSize: '1.2rem',
      fontWeight: '700',
      marginBottom: '0.75rem',
      color: '#34495e',
      minHeight: '2.5em',
    },
    ticketId: {
      fontSize: '0.85rem',
      color: '#7f8c8d',
      marginBottom: '0.5rem',
    },
    button: {
      padding: '15px',
      color: '#fff',
    },
  };

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.header}>Gestion des Tickets</h2>

      <div style={styles.buttonContainer}>
        <Button
          label="Affecter à un analyste"
          icon="pi pi-user-edit"
          disabled={selectedTickets.size === 0}
          onClick={() => setModalVisible(true)}
          className="p-button-rounded p-button-outlined p-button-primary"
          style={{ padding: '15px 20px', color: '#fff' }}
        />
      </div>

      <div style={styles.cardsContainer}>
        {staticTickets.map((ticket) => (
          <div
            key={ticket._id}
            style={styles.card}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.03)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.18)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.12)';
            }}
          >
            <input
              type="checkbox"
              style={styles.checkbox}
              checked={selectedTickets.has(ticket._id)}
              onChange={() => toggleTicketSelection(ticket._id)}
            />
            <div style={styles.ticketId}>ID: {ticket._id}</div>
            <h3 style={styles.title}>{ticket.Title}</h3>
          </div>
        ))}
      </div>

      <Dialog
        header="Affecter les tickets à un analyste"
        visible={modalVisible}
        style={{ width: '400px' }}
        modal
        onHide={() => setModalVisible(false)}
        footer={
          <div>
            <Button
              label="Confirmer"
              icon="pi pi-check"
              onClick={handleConfirm}
              disabled={!selectedAnalyst}
              className="p-button-success"
              style={{ padding: '15px' }}
            />
          </div>
        }
      >
        <ListBox
          options={staticAnalysts}
          optionLabel="name"
          optionValue="id"
          value={selectedAnalyst}
          onChange={(e) => setSelectedAnalyst(e.value)}
          filter
          placeholder="Choisir un analyste"
          style={{ maxHeight: 250, overflowY: 'auto' }}
        />
      </Dialog>
    </div>
  );
};

export default ListesDesTickets;
