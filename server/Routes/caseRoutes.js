const express = require('express');
const router = express.Router();
const { 
  createNewCase, 
  getCases, 
  modifyCase, 
  removeCase 
} = require('../controllers/caseController');

router.post('/', createNewCase);
router.get('/', getCases);
router.put('/:caseId', modifyCase);
router.delete('/:caseId', removeCase);

module.exports = router;