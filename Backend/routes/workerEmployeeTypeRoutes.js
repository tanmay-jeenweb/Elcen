const express = require('express');
const {
    addWorkerEmployeeType,
    getAllWorkerEmployeeTypesController,
    updateWorkerEmployeeTypeController,
    deleteWorkerEmployeeTypeController
} = require('../controllers/workerEmployeeTypeController.js');
const { verifyToken, verifyPermission } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/add', verifyToken, verifyPermission('worker_employee_type', 'write'), addWorkerEmployeeType);
router.get('/all', verifyToken, verifyPermission('worker_employee_type', 'read'), getAllWorkerEmployeeTypesController);
router.put('/update/:id', verifyToken, verifyPermission('worker_employee_type', 'update'), updateWorkerEmployeeTypeController);
router.delete('/delete/:id', verifyToken, verifyPermission('worker_employee_type', 'delete'), deleteWorkerEmployeeTypeController);

module.exports = router;
