import {
  createObservable,
  getObservablesByCaseId,
  updateObservableById,
  deleteObservableById
} from '../services/observableService.js';

/**
 * Fetch all observables for a specific case.
 * 
 * Endpoint: GET /cases/:caseId/observables
 */
export const fetchObservables = async (req, res) => {
  try {
    const observables = await getObservablesByCaseId(req.params.caseId);
    // result.artifacts contains the observables arr
    res.status(200).json(observables);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Create a new observable for a given case.
 * 
 * Endpoint: POST /cases/:caseId/observables
 * 
 * Expected req.body structure:
 * {
 *   "dataType": "domain" | "ip" | "hash" | "url" | etc.,
 *   "data": "malicious.com",
 *   "message": "Description of why this is suspicious",
 *   "tlp": 0 | 1 | 2 | 3,
 *   "ioc": true | false,
 *   "sighted": true | false
 * }
 */
export const addObservable = async (req, res) => {
  try {
    const result = await createObservable(req.params.caseId, req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Update an existing observable by its ID.
 * 
 * Endpoint: PATCH /observables/:observableId
 * 
 * Expected req.body structure:
 * {
 *   "data": "new-malicious.com",        // optional
 *   "message": "Updated message",       // optional
 *   "ioc": true | false,                // optional
 *   "sighted": true | false,            // optional
 *   "tlp": 0 | 1 | 2 | 3                 // optional
 * }
 */
export const updateObservable = async (req, res) => {
  try {
    const result = await updateObservableById(req.params.observableId, req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Delete an observable by its ID.
 * 
 * Endpoint: DELETE /observables/:observableId
 */
export const deleteObservable = async (req, res) => {
  try {
    await deleteObservableById(req.params.observableId);
    res.status(204).send(); // No Content
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
