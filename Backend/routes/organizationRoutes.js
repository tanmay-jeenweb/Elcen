const express = require('express');
const {
    getOrganizationController,
    upsertOrganizationController
} = require('../controllers/organizationController.js');
const { verifyToken, verifyPermission } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.get('/', verifyToken, verifyPermission('organization_details', 'read'), getOrganizationController);
router.post('/', verifyToken, verifyPermission('organization_details', 'write'), upsertOrganizationController);

module.exports = router;
