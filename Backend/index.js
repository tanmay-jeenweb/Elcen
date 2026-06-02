require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { connectDB } = require("./config/db.js");

// Routes
const authRoutes = require("./routes/authRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const userTypeMasterRoutes = require("./routes/userTypeMasterRoutes.js");
const locationTypeRoutes = require("./routes/locationTypeRoutes.js");
const locationRoutes = require("./routes/locationRoutes.js");
const userPreferenceRoutes = require("./routes/userPreferenceRoutes.js");
const materialGroupRoutes = require("./routes/materialGroupRoutes.js");
const unitRoutes = require("./routes/unitRoutes.js");
const materialRoutes = require("./routes/materialRoutes.js");
const vendorRoutes = require("./routes/vendorRoutes.js");
const customerRoutes = require("./routes/customerRoutes.js");
const documentMasterRoutes = require("./routes/documentRoutes.js");
const operatorTypeRoutes = require("./routes/operatorTypeRoutes.js");
const operatorRoutes = require("./routes/operatorRoutes.js");
const processMasterRoutes = require("./routes/processMasterRoutes.js");
const bomRoutes = require("./routes/bomRoutes.js");

// Model Initializations
const { initUserModel } = require("./models/userModel.js");
const { createUserTypesTable, createUserTypePermissionsTable } = require("./models/userTypeModel.js");
const { createAuditLogsTable } = require("./models/auditLogModel.js");
const { createUserDevicesTable } = require("./models/deviceModel.js");
const { createLocationTypesTable } = require("./models/locationTypeModel.js");
const { createLocationsTable } = require("./models/locationModel.js");
const { createUserPreferencesTable } = require("./models/userPreferenceModel.js");
const { createMaterialGroupsTable } = require("./models/materialGroupModel.js");
const { createUnitsTable } = require("./models/unitModel.js");
const { createMaterialsTable, ensureMaterialColumns } = require("./models/materialModel.js");
const { createVendorTables, ensureVendorColumns } = require("./models/vendorModel.js");
const { createCustomerTables, ensureCustomerColumns } = require("./models/customerModel.js");
const { createDocumentMasterTable } = require("./models/documentMaster.js");
const { createOperatorTypesTable } = require("./models/operatorTypeModel.js");
const { createOperatorsTable, ensureOperatorColumns } = require("./models/operatorModel.js");
const { createProcessMastersTable } = require("./models/processMasterModel.js");
const { createBOMTables } = require("./models/bomModel.js");

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "https://erp.elcen.com",
    "http://erp.elcen.com",
    "https://www.erp.elcen.com",
    "http://www.erp.elcen.com",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-HTTP-Method-Override", "x-device-id", "device-id"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
}));
app.use(express.json());
app.use(cookieParser());

// HTTP Method Override middleware for environments that block PUT and DELETE requests
app.use((req, res, next) => {
    const methodOverride = req.headers['x-http-method-override'];
    if (req.method === 'POST' && methodOverride) {
        req.method = methodOverride.toUpperCase();
    }
    next();
});

app.use(["/api/auth", "/auth"], authRoutes);
app.use(["/api/admin", "/admin"], adminRoutes);
app.use(["/api/usertypes", "/usertypes"], userTypeMasterRoutes);
app.use(["/api/locationtypes", "/locationtypes"], locationTypeRoutes);
app.use(["/api/locations", "/locations"], locationRoutes);
app.use(["/api/table-preferences", "/table-preferences"], userPreferenceRoutes);
app.use(["/api/materialgroups", "/materialgroups"], materialGroupRoutes);
app.use(["/api/units", "/units"], unitRoutes);
app.use(["/api/materials", "/materials"], materialRoutes);
app.use(["/api/vendors", "/vendors"], vendorRoutes);
app.use(["/api/customers", "/customers"], customerRoutes);
app.use(["/api/document-masters", "/document-masters"], documentMasterRoutes);
app.use(["/api/operator-types", "/operator-types"], operatorTypeRoutes);
app.use(["/api/operators", "/operators"], operatorRoutes);
app.use(["/api/process-masters", "/process-masters"], processMasterRoutes);
app.use(["/api/boms", "/boms"], bomRoutes);

// Global 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack);
    res.status(500).json({ success: false, message: "Something went wrong" });
});

const startServer = async () => {
    try {
        await connectDB();

        console.log("Initializing database tables...");
        // Initialize tables in correct dependency order
        await initUserModel();
        await createUserTypesTable();
        await createUserTypePermissionsTable();
        await createAuditLogsTable();
        await createUserDevicesTable();
        await createLocationTypesTable();
        await createLocationsTable();
        await createUserPreferencesTable();
        await createMaterialGroupsTable();
        await createUnitsTable();
        await createMaterialsTable();
        await ensureMaterialColumns();
        await createDocumentMasterTable();
        await createVendorTables();
        await ensureVendorColumns();
        await createCustomerTables();
        await ensureCustomerColumns();
        await createOperatorTypesTable();
        await createOperatorsTable();
        await ensureOperatorColumns();
        await createProcessMastersTable();
        await createBOMTables();

        console.log("All database tables are initialized and ready.");

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server Running on Port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start application server:", error);
        process.exit(1);
    }
};

startServer();