import React, { useEffect, useState } from "react";
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { AiOutlinePlusCircle } from 'react-icons/ai';
import axios from 'axios';

function GestionUtilisateurs() {
  const [users, setUsers] = useState([
    {
      _id: '1',
      username: 'admin',
      email: 'admin@example.com',
      phonenumber: '+1234567890'
    },
    {
      _id: '2',
      username: 'john.doe',
      email: 'john.doe@company.com',
      phonenumber: '+1987654321'
    },
    {
      _id: '3',
      username: 'jane.smith',
      email: 'jane.smith@company.com',
      phonenumber: '+1555123456'
    },
    {
      _id: '4',
      username: 'michael.johnson',
      email: 'michael.j@company.com',
      phonenumber: '+1444333222'
    },
    {
      _id: '5',
      username: 'sarah.williams',
      email: 'sarah.w@company.com',
      phonenumber: '+1666777888'
    }
  ]);

  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    phonenumber: '',
  });

  const [userDialogVisible, setUserDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchUsers = async () => {
    try {
      console.log("Fetching users...");
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      console.log("Adding user:", newUser);
      setUserDialogVisible(false);
      alert("User added successfully! (simulated)");
    } catch (err) {
      console.error("Error adding user:", err);
      alert(err.response?.data?.Error || "Failed to add user");
    }
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = () => {
    setUsers(users.filter(user => user._id !== userToDelete._id));
    setDeleteDialogVisible(false);
    alert(`User ${userToDelete.username} deleted! (simulated)`);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-4" style={{
      margin: '20px',
      border: '1px solid #ccc',
      borderRadius: '15px',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      backgroundColor: '#fff',
    }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-center">Gestion des Analystes</h2>
        <Button 
          label="Ajouter un Analyste" 
          icon="pi pi-plus" 
          onClick={() => setUserDialogVisible(true)}
        />
      </div>

      {/* Users Table */}
      <div className="table-responsive">
        <table className="table table-hover">
          <thead style={{ backgroundColor: '#f8f9fa' }}>
            <tr>
              <th>Nom d'analyste</th>
              <th>Email</th>
              <th>Numéro</th>
              
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.phonenumber}</td>
                <td>
                  <Button 
                    icon="pi pi-trash" 
                    severity="danger" 
                    onClick={() => handleDeleteUser(user)}
                    tooltip="Supprimer"
                    tooltipOptions={{ position: 'top' }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Dialog */}
      <Dialog
        header="Ajouter un Analyste"
        visible={userDialogVisible}
        onHide={() => setUserDialogVisible(false)}
        style={{ width: '600px' }}
        modal
        draggable={false}
        resizable={false}
      >
        <form onSubmit={handleAddUser}>
          <div className="p-fluid">
            <div className="field mb-3">
              <label htmlFor="username">Nom d'utilisateur</label>
              <InputText
                id="username"
                name="username"
                value={newUser.username}
                onChange={handleChange}
                className="w-full"
                required
              />
            </div>

            <div className="field mb-3">
              <label htmlFor="email">Email</label>
              <InputText
                id="email"
                name="email"
                value={newUser.email}
                onChange={handleChange}
                className="w-full"
                required
              />
            </div>

            <div className="field mb-3">
              <label htmlFor="password">Mot de passe</label>
              <InputText
                id="password"
                name="password"
                type="password"
                value={newUser.password}
                onChange={handleChange}
                className="w-full"
                required
              />
            </div>

            <div className="field mb-4">
              <label htmlFor="phonenumber">Numéro de téléphone</label>
              <InputText
                id="phonenumber"
                name="phonenumber"
                value={newUser.phonenumber}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div className="flex justify-content-end">
              <Button 
                label="Ajouter" 
                type="submit" 
              />
            </div>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        header="Confirmer la suppression"
        visible={deleteDialogVisible}
        onHide={() => setDeleteDialogVisible(false)}
        style={{ width: '500px' }}
        modal
        footer={
          <div>
            <Button 
              label="Annuler" 
              icon="pi pi-times" 
              onClick={() => setDeleteDialogVisible(false)} 
              className="p-button-text" 
            />
            <Button 
              label="Supprimer" 
              icon="pi pi-check" 
              onClick={confirmDelete} 
              severity="danger" 
            />
          </div>
        }
      >
        <div className="confirmation-content">
          <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
          <span>Êtes-vous sûr de vouloir supprimer l'analyste <b>{userToDelete?.username}</b> ?</span>
        </div>
      </Dialog>
    </div>
  );
}

export default GestionUtilisateurs;