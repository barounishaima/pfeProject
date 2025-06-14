import React, { useState, useEffect, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import { AiOutlinePlusCircle, AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import axios from 'axios';
import './GestionScans.css';
const GestionScans = () => {
  const [scans, setScans] = useState([]);
  const [formData, setFormData] = useState({ name: '', comment: '', selectedTarget: null, selectedSchedule: null });
  const [targets, setTargets] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [targetDialogVisible, setTargetDialogVisible] = useState(false);
  const [scheduleDialogVisible, setScheduleDialogVisible] = useState(false);
  const [editMode, setEditMode] = useState(false); 
  const [editingScanId, setEditingScanId] = useState(null); 
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [scanToDelete, setScanToDelete] = useState(null);

  const toastRef = useRef(null);

  const [newTarget, setNewTarget] = useState({
    name: '', comment: '', hostType: 'machine', hostIp: '', hostFile: null,
    excludeHostType: 'une machine', excludeHostIp: '', excludeHostFile: null
  });

  const [newSchedule, setNewSchedule] = useState({
    name: '', comment: '', startDate: '', startTime: '', recurrence: 'once',
    endDate: '', endTime: '', runAlways: true
  });

  const recurrenceOptions = [
    { label: 'Once', value: 'once' },
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Hourly', value: 'hourly' },
    { label: 'Yearly', value: 'yearly' },
    { label: 'Monthly', value: 'monthly' },
  ];

  useEffect(() => {
    fetchScans();
    fetchTargets();
    fetchSchedules();
  }, []);

  const fetchScans = async () => {
    try {
      const res = await axios.get('/api/scans');
      setScans(res.data);
      console.log(res.data);
    } catch (err) {
      console.error('Error loading scans:', err);
    }
  };

  const fetchTargets = async () => {
    try {
      const res = await axios.get('/api/targets/');
      setTargets(res.data);
    } catch (err) {
      console.error('Error loading targets:', err);
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await axios.get('/api/schedules/');
      setSchedules(res.data);
    } catch (err) {
      console.error('Error loading schedules:', err);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewTargetChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setNewTarget((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setNewTarget((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleNewScheduleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewSchedule((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const setTimeNow = () => {
    const now = new Date();
    const hh = now.getHours().toString().padStart(2, '0');
    const mm = now.getMinutes().toString().padStart(2, '0');
    setNewSchedule((prev) => ({ ...prev, startTime: `${hh}:${mm}` }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!editMode) {
      // For creation, require all fields
      if (!formData.name.trim() || !formData.selectedTarget || !formData.selectedSchedule) {
        alert('Veuillez remplir tous les champs.');
        return;
      }
    } else {
      // For update, require at least one field to be modified (optional)
      if (!formData.name.trim() && !formData.comment.trim() && !formData.selectedTarget && !formData.selectedSchedule) {
        alert('Veuillez modifier au moins un champ.');
        return;
      }
    }
  
    const payload = {};
    if (formData.name.trim()) payload.name = formData.name;
    if (formData.comment.trim()) payload.comment = formData.comment;
    if (formData.selectedTarget) payload.target_id = formData.selectedTarget?.Id;
    if (formData.selectedSchedule) payload.schedule_id = formData.selectedSchedule?.id;


    try {
      if (editMode) {
        await axios.put(`/api/scans/${editingScanId}`, payload);
        toastRef.current?.show({
          severity: 'success',
          summary: 'Scan modifié',
          detail: `Scan ${editingScanId} mis à jour avec succès.`,
          life: 3000
        });
      } else {
        await axios.post('/api/scans', payload);
        toastRef.current?.show({
          severity: 'success',
          summary: 'Scan créé',
          detail: 'Scan ajouté avec succès.',
          life: 3000
        });
      }
  
      // Reset
      setFormData({ name: '', comment: '', selectedTarget: null, selectedSchedule: null });
      setEditingScanId(null);
      setEditMode(false);
      setShowForm(false);
      fetchScans();
    } catch (err) {
      console.error('Erreur de soumission:', err);
      alert('Erreur lors de la soumission du scan.');
    }
  };
  
  

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/scans/${id}`);
      fetchScans();
    } catch (err) {
      console.error('Error deleting scan:', err);
    }
  };
  const addTarget = async () => {
    if (!newTarget.name.trim() || !newTarget.hostIp.trim()) {
      alert("Veuillez fournir un nom et au moins une adresse IP.");
      return;
    }
  
    try {
      // Step 1: Format IP lists
      const ipList = newTarget.hostIp
        .split(',')
        .map(ip => ip.trim())
        .filter(ip => ip);
      console.log("ip list  :",ipList);
  
      const excludeList = newTarget.excludeHostIp
        .split(',')
        .map(ip => ip.trim())
        .filter(ip => ip);
      

      // Step 2: Build payload expected by backend
      const payload = {
        Name: newTarget.name,
        Comment: newTarget.comment,
        IpAdresses: ipList,
        exclude_hosts: excludeList
      };
  
      // Step 3: Send to backend
      const res = await axios.post('/api/targets/', payload);
      console.log(res)
      const createdTarget = res.id;
      await fetchTargets();
      // Step 4: Update UI
      setTargets(prev => [...prev, createdTarget]);
      setFormData(prev => ({ ...prev, selectedTarget: createdTarget }));
  
      setNewTarget({
        name: '',
        comment: '',
        hostType: 'machine',
        hostIp: '',
        hostFile: null,
        excludeHostType: 'une machine',
        excludeHostIp: '',
        excludeHostFile: null
      });
  
      setTargetDialogVisible(false);
      toastRef.current?.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Cible ajoutée avec succès',
        life: 3000
      });
    } catch (err) {
      console.error('Error adding target:', err);
      alert(err.response?.data?.error || "Erreur lors de l'ajout de la cible.");
    }
  };
  
  const addSchedule = async () => {
    if (!newSchedule.name.trim() || !newSchedule.startDate || !newSchedule.startTime) {
      alert("Veuillez remplir le nom, la date et l'heure de début.");
      return;
    }
  
    try {
      const startDateTime = new Date(`${newSchedule.startDate}T${newSchedule.startTime}`);
      const isoStart = startDateTime.toISOString();
  
      let isoFinish = isoStart; // Default value
      if (newSchedule.recurrence !== 'once' && !newSchedule.runAlways) {
        if (!newSchedule.endDate || !newSchedule.endTime) {
          alert("Veuillez fournir une date et heure de fin.");
          return;
        }
        const finishDateTime = new Date(`${newSchedule.endDate}T${newSchedule.endTime}`);
        isoFinish = finishDateTime.toISOString();
      }
  
      const payload = {
        name: newSchedule.name,
        comment: newSchedule.comment || '',
        startDate: isoStart,
        finishDate: isoFinish,
      };
  
      const res = await axios.post('/api/schedules/', payload);
      const createdSchedule = res.data;
      console.log("payload",payload);
      console.log("resultat",res.data);
      await fetchSchedules();
      setSchedules((prev) => [...prev, createdSchedule]);
      setFormData((prev) => ({ ...prev, selectedSchedule: createdSchedule }));
      setNewSchedule({
        name: '', comment: '', startDate: '', startTime: '',
        recurrence: 'once', endDate: '', endTime: '', runAlways: true
      });
      setScheduleDialogVisible(false);
      toastRef.current?.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Horaire ajouté avec succès',
        life: 3000
      });
    } catch (err) {
      console.error('Error adding schedule:', err);
      alert(err.response?.data?.error || "Erreur lors de l'ajout de la cible.");
    }
  };
 
  const startScan = async (id) => {
    try {
      await axios.post(`/api/scans/${id}`);
      toastRef.current?.show({
        severity: 'success',
        summary: 'Scan lancé',
        detail: `Scan ${id} démarré avec succès.`,
        life: 3000
      });
      console.log("taks started");
      fetchScans(); // Refresh scan list
    } catch (err) {
      console.error('Erreur lors du démarrage du scan:', err);
      toastRef.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: `Impossible de démarrer le scan.`,
        life: 3000
      });
    }
  };
  const updateScan = async (id, updatedData) => {
    try {
      await axios.put(`/api/scans/${id}`, updatedData);
      toastRef.current?.show({
        severity: 'success',
        summary: 'Scan mis à jour',
        detail: `Scan ${id} mis à jour.`,
        life: 3000
      });
      fetchScans(); // Refresh list
    } catch (err) {
      console.error('Erreur mise à jour:', err);
      toastRef.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: `Échec de la mise à jour du scan.`,
        life: 3000
      });
    }
  };
  const openEditDialog = (scan) => {
    const matchedTarget = targets.find(t => t.TargetId === scan.target_Id);
    const matchedSchedule = schedules.find(s => s.id === scan.schedule_Id);
  console.log(scan);
    setFormData({
      name: scan.name || '',
      comment: scan.comment || '',
      selectedTarget: matchedTarget || null,
      selectedSchedule: matchedSchedule || null,
    });
  
    setEditingScanId(scan.id);
    setEditMode(true);
    setShowForm(true);
  };
  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/scans/${scanToDelete.id}`);
      toastRef.current?.show({
        severity: 'success',
        summary: 'Supprimé',
        detail: `Scan "${scanToDelete.name}" supprimé avec succès.`,
        life: 3000,
      });
      fetchScans();
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      toastRef.current?.show({
        severity: 'error',
        summary: 'Erreur',
        detail: `Échec de la suppression du scan.`,
        life: 3000,
      });
    } finally {
      setDeleteDialogVisible(false);
      setScanToDelete(null);
    }
  };
  
  
  
  
  return (
    <div className="container mt-5">
      <Toast ref={toastRef} />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Liste des Scans</h2>
        <Button label="Créer Scan" icon="pi pi-plus" onClick={() => setShowForm(true)} />
      </div>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Cible</th>
            <th>Statut</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {scans.map((scan) => (
            <tr key={scan.id}>
              <td>{scan.name}</td>
              <td>{targets.find(t => t.TargetId === scan.target_Id)?.Name || '---'}</td>
              <td>{scan.status}</td>
            <td>
              <div className="button-group">
                <Button 
                  icon="pi pi-play" 
                  className="p-button-text scan-btn-green"  
                  onClick={() => startScan(scan.id)} 
                />
                <Button 
                  icon={<AiOutlineEdit />} 
                  className="p-button-text scan-btn-blue" 
                  onClick={() => openEditDialog(scan)} 
                />
                <Button 
                  icon={<AiOutlineDelete />} 
                  className="p-button-text scan-btn-red" 
                  onClick={() => {
                    setScanToDelete(scan);
                    setDeleteDialogVisible(true);
                  }} 
                />
              </div>
            </td>


            </tr>
          ))}
        </tbody>
      </table>

      <Dialog header="Créer un Scan" visible={showForm} onHide={() => setShowForm(false)} style={{ width: '700px' }} modal>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Nom</label>
            <InputText name="name" value={formData.name} onChange={handleFormChange} className="w-full" />
          </div>
          <div className="field">
            <label>Commentaire</label>
            <InputText name="comment" value={formData.comment} onChange={handleFormChange} className="w-full" />
          </div>
          <div className="field">
            <label>Cible</label>
            <div className="d-flex align-items-center">
            <Dropdown
  value={formData.selectedTarget}
  options={targets.filter(t => t && t.Name)}
  optionLabel="Name"
  onChange={(e) =>
    setFormData((prev) => ({
      ...prev,
      selectedTarget: e.value
    }))
  }
  className="w-full mr-2"
  placeholder="Sélectionnez une cible"
/>



              <AiOutlinePlusCircle size={24} onClick={() => setTargetDialogVisible(true)} style={{ cursor: 'pointer', color: '#000' }} />
              
            </div>
          </div>
          <div className="field">
            <label>Horaire</label>
            <div className="d-flex align-items-center">
            <Dropdown
  value={formData.selectedSchedule}
  options={schedules.filter(s => s && s.name)}
  optionLabel="name"
  onChange={(e) =>
    setFormData((prev) => ({
      ...prev,
      selectedSchedule: e.value
    }))
  }
  className="w-full mr-2"
  placeholder="Sélectionnez un horaire"
/>



              <AiOutlinePlusCircle size={24} onClick={() => setScheduleDialogVisible(true)} style={{ cursor: 'pointer' }} />
            </div>
          </div>
          <Button label="Valider" type="submit" className="mt-2" />
        </form>
      </Dialog>

       {/* Target Dialog */}
<Dialog
  header="Ajouter une nouvelle cible"
  visible={targetDialogVisible}
  onHide={() => {
    setShowForm(false);
    setEditMode(false);
    setEditingScanId(null);
    setFormData({ name: '', comment: '', selectedTarget: null, selectedSchedule: null });
  }}
  
  style={{ width: '600px' }}
  modal
  draggable={false}
  resizable={false}
>
  <div className="p-fluid">
    {/* Name */}
    <div className="field">
      <label>Nom</label>
      <InputText
        name="name"
        value={newTarget.name}
        onChange={handleNewTargetChange}
      />
    </div>

    {/* Comment */}
    <div className="field">
      <label>Commentaire</label>
      <InputText
        name="comment"
        value={newTarget.comment}
        onChange={handleNewTargetChange}
      />
    </div>

    {/* Host Type (Radio) */}
    <div className="field">
      <label>Type d'hôte</label>
      <div className="flex gap-4 mt-2">
        <label>
          <input
            type="radio"
            name="hostType"
            value="machine"
            checked={newTarget.hostType === 'machine'}
            onChange={handleNewTargetChange}
          />{' '}
          Machine
        </label>
        <label>
          <input
            type="radio"
            name="hostType"
            value="network"
            checked={newTarget.hostType === 'network'}
            onChange={handleNewTargetChange}
          />{' '}
          Plusieurs machines
        </label>
      </div>
    </div>

    {/* Host IP Input - Unified for both single and multiple IPs */}
    <div className="field">
      <label>
        {newTarget.hostType === 'machine' ? 'Adresse IP' : 'Adresses IP'}
      </label>
      <InputText
        name="hostIp"
        value={newTarget.hostIp}
        onChange={handleNewTargetChange}
        placeholder={
          newTarget.hostType === 'machine' 
            ? 'Ex: 192.168.1.1' 
            : 'Ex: 192.168.1.1, 192.168.1.2, 192.168.1.3'
        }
        style={{
          height: newTarget.hostType === 'network' ? '80px' : undefined,
        }}
        multiline={newTarget.hostType === 'network'}
        rows={newTarget.hostType === 'network' ? 3 : 1}
      />
      {newTarget.hostType === 'network' && (
        <small className="p-text-secondary">Séparez les adresses IP par des virgules</small>
      )}
    </div>

    {/* Exclude Host Type (Radio) */}
    <div className="field">
      <label>Exclure hôte (type)</label>
      <div className="flex gap-4 mt-2">
        <label>
          <input
            type="radio"
            name="excludeHostType"
            value="une machine"
            checked={newTarget.excludeHostType === 'une machine'}
            onChange={handleNewTargetChange}
          />{' '}
          Une machine
        </label>
        <label>
          <input
            type="radio"
            name="excludeHostType"
            value="plusieurs machines"
            checked={newTarget.excludeHostType === 'plusieurs machines'}
            onChange={handleNewTargetChange}
          />{' '}
          Plusieurs machines
        </label>
      </div>
    </div>

    {/* Exclude IP Input - Unified for both single and multiple IPs */}
    <div className="field">
      <label>
        {newTarget.excludeHostType === 'une machine' 
          ? 'Adresse IP à exclure' 
          : 'Adresses IP à exclure'}
      </label>
      {newTarget.excludeHostType === 'une machine' ? (
        <InputText
          name="excludeHostIp"
          value={newTarget.excludeHostIp}
          onChange={handleNewTargetChange}
          placeholder="Ex: 192.168.1.5"
          className="w-full"
        />
      ) : (
        <div className="flex flex-column gap-1">
          <textarea
            name="excludeHostIp"
            value={newTarget.excludeHostIp}
            onChange={handleNewTargetChange}
            placeholder="Ex: 192.168.1.5, 192.168.1.6"
            className="w-full p-2 border-round"
            style={{ minHeight: '100px', resize: 'vertical' }}
            rows={4}
          />
          <small className="p-text-secondary">Séparez les adresses IP par des virgules</small>
        </div>
      )}
    </div>

    <Button label="Ajouter" onClick={addTarget} className="mt-3" />
  </div>
</Dialog>

 {/* Schedule Dialog */}
<Dialog
  header="Ajouter un nouvel horaire"
  visible={scheduleDialogVisible}
  onHide={() => setScheduleDialogVisible(false)}
  style={{ width: '600px' }}
  modal
>
  <div className="p-fluid">
    <div className="field">
      <label>Nom</label>
      <InputText name="name" value={newSchedule.name} onChange={handleNewScheduleChange} />
    </div>

    <div className="field">
      <label>Commentaire</label>
      <InputText name="comment" value={newSchedule.comment} onChange={handleNewScheduleChange} />
    </div>

    <div className="field">
      <label>Date de début</label>
      <InputText
        type="date"
        name="startDate"
        value={newSchedule.startDate}
        onChange={handleNewScheduleChange}
      />
    </div>

    <div className="field d-flex align-items-center">
      <label className="mr-2">Heure de début</label>
      <InputText
        type="time"
        name="startTime"
        value={newSchedule.startTime}
        onChange={handleNewScheduleChange}
      />
      <Button label="Maintenant" onClick={setTimeNow} className="ml-2" size="small" />
    </div>

    <div className="field">
      <label>Récurrence</label>
      <Dropdown
        value={newSchedule.recurrence}
        options={recurrenceOptions}
        onChange={(e) => setNewSchedule((prev) => ({ ...prev, recurrence: e.value }))}
        placeholder="Sélectionnez la récurrence"
      />
    </div>

    {/* ✅ Show checkbox only if recurrence is NOT 'once' */}
    {newSchedule.recurrence !== 'once' && (
      <div className="field-checkbox">
        <input
          type="checkbox"
          name="runAlways"
          checked={newSchedule.runAlways}
          onChange={handleNewScheduleChange}
          id="runAlways"
        />
        <label htmlFor="runAlways" className="ml-2">Exécuter toujours</label>
      </div>
    )}

    {/* ✅ Show end date/time only if recurrence is NOT once and NOT runAlways */}
    {(newSchedule.recurrence !== 'once' && !newSchedule.runAlways) && (
      <>
        <div className="field">
          <label>Date de fin</label>
          <InputText
            type="date"
            name="endDate"
            value={newSchedule.endDate}
            onChange={handleNewScheduleChange}
          />
        </div>

        <div className="field">
          <label>Heure de fin</label>
          <InputText
            type="time"
            name="endTime"
            value={newSchedule.endTime}
            onChange={handleNewScheduleChange}
          />
        </div>
      </>
    )}

    <Button label="Ajouter" type='submit' onClick={addSchedule} className="mt-3" />
  </div>
</Dialog>
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
    <span>
      Êtes-vous sûr de vouloir supprimer le scan <b>{scanToDelete?.name}</b> ?
    </span>
  </div>
</Dialog>


    </div>
  );
};

export default GestionScans;