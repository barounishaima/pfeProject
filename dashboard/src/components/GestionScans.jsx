import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { AiOutlinePlusCircle } from 'react-icons/ai';
import axios from 'axios';
import { FileUpload } from 'primereact/fileupload';

const GestionScans = () => {
  const [formData, setFormData] = useState({
    name: '',
    comment: '',
    selectedTarget: null,
    selectedSchedule: null,
  });

  const [targets, setTargets] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const [targetDialogVisible, setTargetDialogVisible] = useState(false);
  const [scheduleDialogVisible, setScheduleDialogVisible] = useState(false);

  const [newTarget, setNewTarget] = useState({
    name: '',
    comment: '',
    hostType: 'machine',
    hostIp: '',
    hostFile: null,
    excludeHostType: 'une machine',
    excludeHostIp: '',
    excludeHostFile: null,
  });

  const [newSchedule, setNewSchedule] = useState({
    name: '',
    comment: '',
    startDate: '',
    startTime: '',
    recurrence: 'once',
    endDate: '',
    endTime: '',
    runAlways: true,
  });

  // Load targets and schedules from backend on mount
  useEffect(() => {
    fetchTargets();
    fetchSchedules();
  }, []);

  const fetchTargets = async () => {
    try {
      const res = await axios.get('/api/targets');
      setTargets(res.data);
    } catch (err) {
      console.error('Error loading targets:', err);
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await axios.get('/api/schedules');
      setSchedules(res.data);
    } catch (err) {
      console.error('Error loading schedules:', err);
    }
  };

  // --- Handlers ---
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

  // --- Add Target ---
  const addTarget = async () => {
    if (!newTarget.name.trim()) return;

    try {
      // Prepare form data if files exist
      let payload = {
        ...newTarget,
        hostFile: undefined,
        excludeHostFile: undefined,
      };

      // If files exist, you'd normally upload differently, but let's send text fields first:
      if (newTarget.hostFile || newTarget.excludeHostFile) {
        // For demo, ignoring files upload
        alert('File upload not implemented. Please add later.');
      }

      const res = await axios.post('/api/targets', payload);
      const createdTarget = res.data;

      setTargets((prev) => [...prev, createdTarget]);
      setFormData((prev) => ({ ...prev, selectedTarget: createdTarget }));

      // Reset target form
      setNewTarget({
        name: '',
        comment: '',
        hostType: 'machine',
        hostIp: '',
        hostFile: null,
        excludeHostType: 'une machine',
        excludeHostIp: '',
        excludeHostFile: null,
      });
      setTargetDialogVisible(false);
    } catch (err) {
      console.error('Error adding target:', err);
      alert('Erreur lors de l\'ajout de la cible.');
    }
  };

  // --- Add Schedule ---
  const addSchedule = async () => {
    if (!newSchedule.name.trim()) return;

    try {
      const res = await axios.post('/api/schedules', newSchedule);
      const createdSchedule = res.data;

      setSchedules((prev) => [...prev, createdSchedule]);
      setFormData((prev) => ({ ...prev, selectedSchedule: createdSchedule }));

      setNewSchedule({
        name: '',
        comment: '',
        startDate: '',
        startTime: '',
        recurrence: 'once',
        endDate: '',
        endTime: '',
        runAlways: true,
      });
      setScheduleDialogVisible(false);
    } catch (err) {
      console.error('Error adding schedule:', err);
      alert('Erreur lors de l\'ajout de l\'horaire.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Veuillez entrer un nom pour le scan.');
      return;
    }
    if (!formData.selectedTarget) {
      alert('Veuillez sélectionner une cible.');
      return;
    }
    if (!formData.selectedSchedule) {
      alert('Veuillez sélectionner un horaire.');
      return;
    }

    try {
      // Prepare scan data
      const payload = {
        name: formData.name,
        comment: formData.comment,
        targetId: formData.selectedTarget._id || formData.selectedTarget.id || formData.selectedTarget.name, // adjust according to backend
        scheduleId: formData.selectedSchedule._id || formData.selectedSchedule.id || formData.selectedSchedule.name,
      };

      const res = await axios.post('/api/scans', payload);

      alert('Scan créé avec succès !');

      // Reset form
      setFormData({
        name: '',
        comment: '',
        selectedTarget: null,
        selectedSchedule: null,
      });
    } catch (err) {
      console.error('Error creating scan:', err);
      alert('Erreur lors de la création du scan.');
    }
  };

  const recurrenceOptions = [
    { label: 'Once', value: 'once' },
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Hourly', value: 'hourly' },
    { label: 'Yearly', value: 'yearly' },
    { label: 'Monthly', value: 'monthly' },
  ];

  return (
    <div className="container mt-5" style={{ maxWidth: '700px', margin: 'auto' }}>
      <form
        onSubmit={handleSubmit}
        className="p-4"
        style={{
          border: '1px solid #ccc',
          borderRadius: '15px',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          backgroundColor: '#fff',
        }}
      >
        <h2 className="text-center mb-4">Créer un Scan</h2>

        {/* Name */}
        <label htmlFor="name" className="mb-1">
          Nom :
        </label>
        <InputText
          id="name"
          name="name"
          className="w-full mb-3"
          value={formData.name}
          onChange={handleFormChange}
          placeholder="Entrez le nom"
        />

        {/* Comment */}
        <label htmlFor="comment" className="mb-1">
          Commentaire :
        </label>
        <InputText
          id="comment"
          name="comment"
          className="w-full mb-3"
          value={formData.comment}
          onChange={handleFormChange}
          placeholder="Entrez un commentaire"
        />

        {/* Targets */}
        <div className="mb-3">
          <label>Target :</label>
          <div className="d-flex align-items-center">
            <Dropdown
              value={formData.selectedTarget}
              options={targets}
              optionLabel="name"
              placeholder="Sélectionnez une cible"
              className="w-full mr-2"
              style={{ flex: 1 }}
              onChange={(e) => setFormData((prev) => ({ ...prev, selectedTarget: e.value }))}
            />
            <AiOutlinePlusCircle
              size={24}
              onClick={() => setTargetDialogVisible(true)}
              style={{ margin: '20px', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Schedules */}
        <div className="mb-3">
          <label>Schedule :</label>
          <div className="d-flex align-items-center">
            <Dropdown
              value={formData.selectedSchedule}
              options={schedules}
              optionLabel="name"
              placeholder="Sélectionnez un horaire"
              className="w-full mr-2"
              style={{ flex: 1 }}
              onChange={(e) => setFormData((prev) => ({ ...prev, selectedSchedule: e.value }))}
            />
            <AiOutlinePlusCircle
              size={24}
              onClick={() => setScheduleDialogVisible(true)}
              style={{ margin: '20px', cursor: 'pointer' }}
            />
          </div>
        </div>

        <Button label="Créer" icon="pi pi-check" type="submit" className="w-full" />

        {/* Target Dialog */}
        <Dialog
  header="Ajouter une nouvelle cible"
  visible={targetDialogVisible}
  onHide={() => setTargetDialogVisible(false)}
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
          Réseau
        </label>
      </div>
    </div>

    {/* Host IP or FileUpload */}
    {newTarget.hostType === 'machine' ? (
      <div className="field">
        <label>Adresse IP</label>
        <InputText
          name="hostIp"
          value={newTarget.hostIp}
          onChange={handleNewTargetChange}
          placeholder="Ex: 192.168.1.1"
        />
      </div>
    ) : (
      <div className="field">
        <label>Fichier de réseau</label>
        <FileUpload
          name="hostFile"
          customUpload
          chooseLabel="Choisir un fichier"
          mode="basic"
          onSelect={(e) =>
            setNewTarget((prev) => ({
              ...prev,
              hostFile: e.files[0],
            }))
          }
        />
      </div>
    )}

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

    {/* Exclude IP or FileUpload */}
    {newTarget.excludeHostType === 'une machine' ? (
      <div className="field">
        <label>Adresse IP à exclure</label>
        <InputText
          name="excludeHostIp"
          value={newTarget.excludeHostIp}
          onChange={handleNewTargetChange}
          placeholder="Ex: 192.168.1.5"
        />
      </div>
    ) : (
      <div className="field">
        <label>Fichier d'exclusion</label>
        <FileUpload
          name="excludeHostFile"
          customUpload
          chooseLabel="Choisir un fichier"
          mode="basic"
          onSelect={(e) =>
            setNewTarget((prev) => ({
              ...prev,
              excludeHostFile: e.files[0],
            }))
          }
        />
      </div>
    )}

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
  draggable={false}
  resizable={false}
>
  <div className="p-fluid">
    <div className="field">
      <label>Nom</label>
      <InputText
        name="name"
        value={newSchedule.name}
        onChange={handleNewScheduleChange}
      />
    </div>
    <div className="field">
      <label>Commentaire</label>
      <InputText
        name="comment"
        value={newSchedule.comment}
        onChange={handleNewScheduleChange}
      />
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
      <Button
        label="Maintenant"
        onClick={setTimeNow}
        className="ml-2"
        size="small"
      />
    </div>

    <div className="field">
      <label>Récurrence</label>
      <Dropdown
        value={newSchedule.recurrence}
        options={recurrenceOptions}
        onChange={(e) =>
          setNewSchedule((prev) => ({ ...prev, recurrence: e.value }))
        }
        placeholder="Sélectionnez la récurrence"
      />
    </div>

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

    <div className="field-checkbox">
      <input
        type="checkbox"
        name="runAlways"
        checked={newSchedule.runAlways}
        onChange={handleNewScheduleChange}
        id="runAlways"
      />
      <label htmlFor="runAlways" className="ml-2">
        Exécuter toujours
      </label>
    </div>

    <Button label="Ajouter" onClick={addSchedule} className="mt-3" />
  </div>
</Dialog>
      </form>
    </div>
  );
};

export default GestionScans;
