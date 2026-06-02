const express = require('express');
const {
    createBOMController,
    getAllBOMsController,
    getBOMByIdController,
    updateBOMController,
    deleteBOMController
} = require('../controllers/bomController.js');
const { verifyToken, verifyPermission } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/', verifyToken, verifyPermission('bill_of_material', 'write'), createBOMController);
router.get('/', verifyToken, verifyPermission('bill_of_material', 'read'), getAllBOMsController);
router.get('/:id', verifyToken, verifyPermission('bill_of_material', 'read'), getBOMByIdController);
router.put('/:id', verifyToken, verifyPermission('bill_of_material', 'update'), updateBOMController);
router.delete('/:id', verifyToken, verifyPermission('bill_of_material', 'delete'), deleteBOMController);

module.exports = router;
