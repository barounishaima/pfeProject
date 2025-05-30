const { 
    createCase, 
    getAllCases, 
    updateCase, 
    deleteCase 
} = require('../services/theHiveService');
  
const createNewCase = async (req, res) => {
    try {
        if (!req.body.title || !req.body.owner) {
            return res.status(400).json({ error: "Missing title or owner" });
        }
        if (req.body.severity && (req.body.severity < 1 || req.body.severity > 4)) {
            return res.status(400).json({ error: "Severity must be 1-4" });
        }
      
        const newCase = await createCase(req.body);
        res.status(201).json({
          id: newCase.caseId, // Use numeric ID
          title: newCase.title,
          owner: newCase.owner,
          status: newCase.status
        });
    } catch (error) {
      console.error('TheHive API Error (createNewCase):', {
        status: error.response?.status,
        data: error.response?.data,
        request: error.config?.data
      });
      res.status(error.response?.status || 500).json({
        error: error.response?.data?.message || 'Case creation failed'
      });
    }
};
  
const getCases = async (req, res) => {
    try {
        const cases = await getAllCases();
        const formattedCases = cases.map(c => ({
          displayId: c.caseId,    // Numeric ID for display
          apiId: c.id,            // Elasticsearch ID for operations
          title: c.title,
          owner: c.owner,
          status: c.status
        }));
        res.status(200).json(formattedCases);
    } catch (error) {
      console.error('TheHive API Error (getCases):', {
        status: error.response?.status,
        data: error.response?.data,
        request: error.config?.data
      });
      res.status(error.response?.status || 500).json({
        error: error.response?.data?.message || 'Failed to retrieve cases'
      });
    }
};
  
const modifyCase = async (req, res) => {
    try {
      if (!req.params.caseId) {
        return res.status(400).json({ error: "Missing caseId parameter" });
      }
  
      const updatedCase = await updateCase(req.params.caseId, req.body);
      res.status(200).json(updatedCase);
    } catch (error) {
      console.error('TheHive API Error (modifyCase):', {
        status: error.response?.status,
        data: error.response?.data,
        request: error.config?.data
      });
      res.status(error.response?.status || 500).json({
        error: error.response?.data?.message || 'Failed to update case'
      });
    }
};
  
const removeCase = async (req, res) => {
    try {
      if (!req.params.caseId) {
        return res.status(400).json({ error: "Missing caseId parameter" });
      }
  
      await deleteCase(req.params.caseId);
      res.status(204).send();
    } catch (error) {
      console.error('TheHive API Error (removeCase):', {
        status: error.response?.status,
        data: error.response?.data,
        request: error.config?.data
      });
      res.status(error.response?.status || 500).json({
        error: error.response?.data?.message || 'Failed to delete case'
      });
    }
};
  
module.exports = { createNewCase, getCases, modifyCase, removeCase };