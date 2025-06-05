import theHiveClient from '../config/theHiveConfig.js';

export const createObservable = async (caseId, observableData) => {
  const res = await theHiveClient.post(`/case/${caseId}/artifact`, observableData);
  return res.data;
};

export const getObservablesByCaseId = async (caseId) => {
  const body = {
    _parent: {
      _type: 'case',
      _query: {
        _id: caseId
      }
    }
  };
  const res = await theHiveClient.post(`/case/artifact/_search`, body);
  return res.data;
};

export const updateObservableById = async (observableId, updates) => {
  const res = await theHiveClient.patch(`case/artifact/${observableId}`, updates);
  return res.data;
};

export const deleteObservableById = async (observableId) => {
  await theHiveClient.delete(`case/artifact/${observableId}`);
};
