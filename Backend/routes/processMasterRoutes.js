const express = require('express');
const {
    addProcessController,
    getAllProcessesController,
    updateProcessController,
    deleteProcessController
} = require('../controllers/processMasterController.js');
const { verifyToken, verifyPermission } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/', verifyToken, verifyPermission('process_master', 'write'), addProcessController);
router.get('/', verifyToken, verifyPermission('process_master', 'read'), getAllProcessesController);
router.put('/:id', verifyToken, verifyPermission('process_master', 'update'), updateProcessController);
router.delete('/:id', verifyToken, verifyPermission('process_master', 'delete'), deleteProcessController);

module.exports = router;
