import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import DeviceRegistration from "./pages/DeviceRegistration";
import PendingApproval from "./pages/PendingApproval";

import UserHome from "./pages/user/UserHome";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserGroupMaster from "./pages/admin/user/UserGroupMaster";
import LocationTypeMaster from "./pages/admin/location/LocationTypeMaster";
import LocationMaster from "./pages/admin/location/LocationMaster";
import CreateLocation from "./pages/admin/location/CreateLocation";
import CreateUser from "./pages/admin/user/CreateUser";
import DocumentMaster from "./pages/admin/document/DocumentMaster";
import VendorMaster from "./pages/admin/vendor/VendorMaster";
import CreateVendor from "./pages/admin/vendor/CreateVendor";
import EditVendor from "./pages/admin/vendor/EditVendor";
import CustomerMaster from "./pages/admin/customer/CustomerMaster";
import CreateCustomer from "./pages/admin/customer/CreateCustomer";
import EditCustomer from "./pages/admin/customer/EditCustomer";
import CreateUserType from "./pages/admin/user/CreateUserType";
import Profile from "./pages/Profile";
import MaterialGroupMaster from "./pages/Item/MaterialGroupMaster";
import UnitMaster from "./pages/Item/UnitMaster";
import MaterialMaster from "./pages/Item/MaterialMaster";
import CreateMaterial from "./pages/Item/CreateMaterial";
import BOMMaster from "./pages/Production/BOMMaster";
import CreateBOM from "./pages/Production/CreateBOM";
import OrganizationDetails from "./pages/admin/organization/OrganizationDetails";
import Reports from "./pages/Reports";
import ProtectedRoute from "./components/ProtectedRoute";

// Operator & Process Masters
import OperatorMaster from "./pages/Operator/OperatorMaster";
import OperatorTypeMaster from "./pages/Operator/OperatorTypeMaster";
import CreateOperator from "./pages/Operator/CreateOperator";
import ProcessMaster from "./pages/admin/process/ProcessMaster";

export default function AppRoutes() {

    return (
        <Routes>

            <Route
                path="/"
                element={<Login />}
            />

            <Route
                path="/device-registration"
                element={<DeviceRegistration />}
            />

            <Route
                path="/pending-approval"
                element={<PendingApproval />}
            />

            <Route element={<ProtectedRoute />}>
                <Route
                    path="/user/home"
                    element={<UserHome />}
                />
                <Route
                    path="/profile"
                    element={<Profile />}
                />
            </Route>

            <Route element={<ProtectedRoute />}>
                <Route
                    path="/reports"
                    element={<Reports />}
                />
            </Route>

            <Route element={<ProtectedRoute allowedRole="admin" />}>
                <Route
                    path="/admin/dashboard"
                    element={<AdminDashboard />}
                />
            </Route>

            <Route element={<ProtectedRoute allowedRole="admin" />}>
                <Route
                    path="/admin/users/create"
                    element={<CreateUser />}
                />
            </Route>

            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="user_type" requiredAction="read" />}>
                <Route
                    path="/admin/user-types"
                    element={<UserGroupMaster />}
                />
            </Route>

            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="user_type" requiredAction="write" />}>
                <Route
                    path="/admin/user-types/create"
                    element={<CreateUserType />}
                />
            </Route>

            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="location_type" requiredAction="read" />}>
                <Route
                    path="/admin/location-types"
                    element={<LocationTypeMaster />}
                />
            </Route>

            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="location" requiredAction="read" />}>
                <Route
                    path="/admin/locations"
                    element={<LocationMaster />}
                />
            </Route>

            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="location" requiredAction="write" />}>
                <Route
                    path="/admin/locations/create"
                    element={<CreateLocation />}
                />
            </Route>

            {/* Vendor Master Routes */}
            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="vendor" requiredAction="read" />}>
                <Route path="/admin/vendors" element={<VendorMaster />} />
            </Route>
            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="vendor" requiredAction="write" />}>
                <Route path="/admin/vendors/create" element={<CreateVendor />} />
            </Route>
            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="vendor" requiredAction="update" />}>
                <Route path="/admin/vendors/edit/:id" element={<EditVendor />} />
            </Route>

            {/* Customer Master Routes */}
            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="customer" requiredAction="read" />}>
                <Route path="/admin/customers" element={<CustomerMaster />} />
            </Route>
            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="customer" requiredAction="write" />}>
                <Route path="/admin/customers/create" element={<CreateCustomer />} />
            </Route>
            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="customer" requiredAction="update" />}>
                <Route path="/admin/customers/edit/:id" element={<EditCustomer />} />
            </Route>

            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="material_group" requiredAction="read" />}>
                <Route
                    path="/admin/material-groups"
                    element={<MaterialGroupMaster />}
                />
            </Route>

            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="unit" requiredAction="read" />}>
                <Route
                    path="/admin/units"
                    element={<UnitMaster />}
                />
            </Route>

            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="material" requiredAction="read" />}>
                <Route
                    path="/admin/materials"
                    element={<MaterialMaster />}
                />
            </Route>

            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="material" requiredAction="write" />}>
                <Route
                    path="/admin/materials/create"
                    element={<CreateMaterial />}
                />
            </Route>

            {/* Production BOM Routes */}
            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="bill_of_material" requiredAction="read" />}>
                <Route path="/admin/production/bom" element={<BOMMaster />} />
            </Route>
            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="bill_of_material" requiredAction="write" />}>
                <Route path="/admin/production/bom/create" element={<CreateBOM />} />
            </Route>

            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="organization_details" requiredAction="read" />}>
                <Route path="/admin/organization-details" element={<OrganizationDetails />} />
            </Route>

            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="document" requiredAction="read" />}>
                <Route
                    path="/admin/documents"
                    element={<DocumentMaster />}
                />
            </Route>

            {/* Operator Master Routes */}
            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="operator" requiredAction="read" />}>
                <Route path="/admin/operators" element={<OperatorMaster />} />
            </Route>
            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="operator" requiredAction="write" />}>
                <Route path="/admin/operators/create" element={<CreateOperator />} />
            </Route>
            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="operator" requiredAction="update" />}>
                <Route path="/admin/operators/edit/:id" element={<CreateOperator />} />
            </Route>

            {/* Operator Type Master Routes */}
            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="operator_type" requiredAction="read" />}>
                <Route path="/admin/operator-types" element={<OperatorTypeMaster />} />
            </Route>

            {/* Process Master Routes */}
            <Route element={<ProtectedRoute allowedRole="admin" requiredMaster="process_master" requiredAction="read" />}>
                <Route path="/admin/processes" element={<ProcessMaster />} />
            </Route>

        </Routes>
    );
}