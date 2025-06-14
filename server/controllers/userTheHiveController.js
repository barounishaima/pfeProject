//controllers/userTheHiveController.js

import {
  fetchUsers,
  createNewUser,
  updateExistingUser,
  removeUser,
  setUserPassword,
  changeUserPassword
} from '../services/userTheHiveService.js';

export const getUsers = async (req, res) => {
  try {
    const users = await fetchUsers();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createUser = async (req, res) => {
  const { login, name, roles, password } = req.body;

  if (!login || !name) {
    return res.status(400).json({ error: 'Missing required fields: login, name, roles (array)' });
  }

  try {
    const newUser = await createNewUser({
      login,
      name,
      password,
      roles: ['read'], // hardcoded
    });
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const updatedUser = await updateExistingUser(req.params.userId, req.body);
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await removeUser(req.params.userId);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const setPassword = async (req, res) => {
  const { userId } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required.' });
  }

  try {
    const result = await setUserPassword(userId, password);
    res.status(200).json({ message: 'Password set successfully.', result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const changePassword = async (req, res) => {
  const { userId } = req.params;
  const { currentPassword, password } = req.body;

  if (!currentPassword || !password) {
    return res.status(400).json({ error: 'Both currentPassword and new password are required.' });
  }

  try {
    const result = await changeUserPassword(userId, currentPassword, password);
    res.status(200).json({ message: 'Password changed successfully.', result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
