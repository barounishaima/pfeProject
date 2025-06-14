import theHiveClient from '../config/theHiveConfig.js';

export const fetchUsers = async () => {
  const res = await theHiveClient.post('/user/_search', {});
  return res.data;
};

export const createNewUser = async (userData) => {
  const res = await theHiveClient.post('/user', userData);
  return res.data;
};

export const updateExistingUser = async (userId, updates) => {
  try {
    const res = await theHiveClient.patch(`/user/${userId}`, updates);
    return res.data;
  } catch (error) {
    console.error('TheHive PATCH error:', error.response?.data || error.message);
    throw error;
  }
};

export const removeUser = async (userId) => {
  await theHiveClient.delete(`/user/${userId}`);
};

export const setUserPassword = async (userId, newPassword) => {
  const res = await theHiveClient.post(`/user/${userId}/password/set`, {
    password: newPassword
  });
  return res.data;
};

export const changeUserPassword = async (userId, oldPassword, newPassword) => {
  const res = await theHiveClient.post(`/user/${userId}/password/change`, {
    currentPassword: oldPassword,
    password: newPassword
  });
  return res.data;
};