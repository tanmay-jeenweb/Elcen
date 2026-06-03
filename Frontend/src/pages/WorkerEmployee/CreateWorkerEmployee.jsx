import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import {
  createWorkerEmployee,
  updateWorkerEmployee,
  getWorkerEmployeeById,
} from "../../api/workerEmployeeApi";
import { getWorkerEmployeeTypes } from "../../api/workerEmployeeTypeApi";
import toast from "react-hot-toast";

const emptyForm = {
  workerEmployeeCode: "",
  workerEmployeeName: "",
  dateOfJoining: "",
  workerEmployeeTypeId: "",
  information: "",
};

export default function CreateWorkerEmployee() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [types, setTypes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditMode);

  useEffect(() => {
    const fetchWorkerEmployeeTypes = async () => {
      try {
        const res = await getWorkerEmployeeTypes();
        setTypes(res.data.data || []);
      } catch (err) {
        console.error("Failed to load worker/employee types dropdown data", err);
        toast.error("Unable to load worker/employee types.");
      }
    };

    const fetchWorkerEmployee = async () => {
      try {
        const res = await getWorkerEmployeeById(id);
        const we = res.data.data;
        if (we) {
          let formattedDate = "";
          if (we.date_of_joining) {
            formattedDate = new Date(we.date_of_joining).toISOString().split("T")[0];
          }

          setForm({
            workerEmployeeCode: we.worker_employee_code || "",
            workerEmployeeName: we.worker_employee_name || "",
            dateOfJoining: formattedDate,
            workerEmployeeTypeId: we.worker_employee_type_id ? String(we.worker_employee_type_id) : "",
            information: we.information || "",
          });
        }
      } catch (err) {
        console.error("Failed to load worker/employee details", err);
        toast.error("Unable to load worker/employee details.");
        navigate("/admin/worker-employees");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkerEmployeeTypes();
    if (isEditMode) fetchWorkerEmployee();
  }, [id, isEditMode, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.workerEmployeeCode.trim()) {
      toast.error("Worker/Employee code is required.");
      return;
    }
    if (!form.workerEmployeeName.trim()) {
      toast.error("Worker/Employee name is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        workerEmployeeCode: form.workerEmployeeCode.trim(),
        workerEmployeeName: form.workerEmployeeName.trim(),
        dateOfJoining: form.dateOfJoining || null,
        workerEmployeeTypeId: form.workerEmployeeTypeId ? Number(form.workerEmployeeTypeId) : null,
        information: form.information.trim() || null,
      };

      if (isEditMode) {
        await updateWorkerEmployee(id, payload);
        toast.success("Worker/Employee updated successfully");
      } else {
        await createWorkerEmployee(payload);
        toast.success(`Worker/Employee '${payload.workerEmployeeCode}' created successfully`);
      }
      navigate("/admin/worker-employees");
    } catch (err) {
      console.error("Failed to save worker/employee", err);
      const serverMessage = err?.response?.data?.message;
      toast.error(serverMessage || "Unable to save worker/employee. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#043464]/30 focus:border-[#043464] text-sm bg-slate-50 transition-colors";
  const labelCls = "block text-sm font-semibold text-slate-700 mb-2";

  return (
    <div className="flex-1 flex flex-col bg-slate-50 font-sans text-slate-900 h-screen overflow-hidden">
      <Navbar title="ERP Admin" />

      <main className="flex-1 flex flex-col w-full mx-auto py-8 px-4 sm:px-6 lg:px-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between w-full">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isEditMode ? "Edit Worker/Employee" : "Create Worker/Employee"}
            </h1>
            <p className="text-slate-500 mt-1">
              {isEditMode ? "Update configuration for this worker/employee." : "Add a new worker/employee to the system."}
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/worker-employees")}
            className="text-slate-500 hover:text-slate-700 font-medium text-sm flex items-center gap-1 transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Worker/Employee List
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#043464]" />
          </div>
        ) : (
          <div className="w-full pb-20">
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-800">Worker/Employee Details</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Code */}
                  <div className="space-y-1">
                    <label className={labelCls}>
                      Worker/Employee Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="workerEmployeeCode"
                      value={form.workerEmployeeCode}
                      onChange={handleChange}
                      className={inputCls}
                      placeholder="e.g. WRK001"
                      required
                      autoFocus={!isEditMode}
                    />
                  </div>

                  {/* Name */}
                  <div className="space-y-1">
                    <label className={labelCls}>
                      Worker/Employee Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="workerEmployeeName"
                      value={form.workerEmployeeName}
                      onChange={handleChange}
                      className={inputCls}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date of Joining */}
                  <div className="space-y-1">
                    <label className={labelCls}>Date of Joining</label>
                    <input
                      type="date"
                      name="dateOfJoining"
                      value={form.dateOfJoining}
                      onChange={handleChange}
                      className={inputCls}
                    />
                  </div>

                  {/* Worker/Employee Type */}
                  <div className="space-y-1">
                    <label className={labelCls}>Worker/Employee Type</label>
                    <select
                      name="workerEmployeeTypeId"
                      value={form.workerEmployeeTypeId}
                      onChange={handleChange}
                      className={inputCls}
                    >
                      <option value="">— Select Type —</option>
                      {types.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.worker_employee_type_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Information */}
                <div className="space-y-1">
                  <label className={labelCls}>Information</label>
                  <textarea
                    name="information"
                    value={form.information}
                    onChange={handleChange}
                    rows={4}
                    className={`${inputCls} resize-none`}
                    placeholder="Enter additional remarks or details..."
                  />
                </div>

                {/* Form Actions */}
                <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => navigate("/admin/worker-employees")}
                    className="px-6 py-2.5 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-[#043464] text-white px-8 py-2.5 rounded-lg font-medium hover:bg-[#03274b] transition-colors duration-200 disabled:cursor-not-allowed disabled:bg-slate-400 shadow-sm cursor-pointer"
                  >
                    {saving ? "Saving..." : isEditMode ? "Save Changes" : "Create Worker/Employee"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
