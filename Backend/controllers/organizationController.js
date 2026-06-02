const {
    getOrganizationDetails,
    upsertOrganizationDetails
} = require('../models/organizationModel.js');
const { createAuditLog } = require('../models/auditLogModel.js');

const getOrganizationController = async (req, res) => {
    try {
        const details = await getOrganizationDetails();
        res.status(200).json({
            success: true,
            message: 'Organization details retrieved successfully',
            data: details || {
                name: '',
                logo: '',
                address: '',
                gst_number: ''
            }
        });
    } catch (error) {
        console.error('Error retrieving organization details:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

const upsertOrganizationController = async (req, res) => {
    try {
        const { name, logo, address, gstNumber } = req.body;
        const addedBy = req.user.id;
        const deviceId = req.headers["x-device-id"] || req.headers["device-id"] || "Unknown";

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Organization Name is required'
            });
        }

        // Optional GST simple format validation (e.g. 15 chars) if provided
        if (gstNumber && gstNumber.trim() && gstNumber.trim().length !== 15) {
            return res.status(400).json({
                success: false,
                message: 'GST Number must be exactly 15 characters long if provided'
            });
        }

        const beforeData = await getOrganizationDetails();

        const result = await upsertOrganizationDetails(
            name.trim(),
            logo || null,
            address ? address.trim() : null,
            gstNumber ? gstNumber.trim().toUpperCase() : null,
            addedBy
        );

        // Fetch updated data for the audit log
        const afterData = await getOrganizationDetails();

        await createAuditLog(
            addedBy,
            req.user?.name || req.user?.username || 'Unknown',
            deviceId,
            'Organization Details Master',
            result.action === 'created' ? 'created' : 'updated',
            beforeData,
            afterData
        );

        res.status(200).json({
            success: true,
            message: `Organization details ${result.action === 'created' ? 'created' : 'updated'} successfully`,
            data: afterData
        });
    } catch (error) {
        console.error('Error saving organization details:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    getOrganizationController,
    upsertOrganizationController
};
