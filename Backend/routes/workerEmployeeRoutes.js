const express = require('express');
const {
    addWorkerEmployee,
    getAllWorkerEmployeesController,
    getWorkerEmployeeByIdController,
    updateWorkerEmployeeController,
    toggleWorkerEmployeeActiveController,
    deleteWorkerEmployeeController
} = require('../controllers/workerEmployeeController.js');
const { verifyToken, verifyPermission } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/add', verifyToken, verifyPermission('worker_employee', 'write'), addWorkerEmployee);
router.get('/all', verifyToken, verifyPermission('worker_employee', 'read'), getAllWorkerEmployeesController);
router.get('/:id', verifyToken, verifyPermission('worker_employee', 'read'), getWorkerEmployeeByIdController);
router.put('/update/:id', verifyToken, verifyPermission('worker_employee', 'update'), updateWorkerEmployeeController);
router.patch('/toggle/:id', verifyToken, verifyPermission('worker_employee', 'update'), toggleWorkerEmployeeActiveController);
router.delete('/delete/:id', verifyToken, verifyPermission('worker_employee', 'delete'), deleteWorkerEmployeeController);

module.exports = router;
