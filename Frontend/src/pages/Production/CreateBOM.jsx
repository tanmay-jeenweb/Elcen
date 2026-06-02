import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getMaterials } from "../../api/materialApi";
import { getProcesses } from "../../api/processMasterApi";
import { createBOM, updateBOM, getBOMById } from "../../api/bomApi";
import toast from "react-hot-toast";

export default function CreateBOM() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const isEditMode = Boolean(editId);

  // States
  const [materials, setMaterials] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [targetMaterialId, setTargetMaterialId] = useState("");
  const [rawMaterialsRows, setRawMaterialsRows] = useState([]);
  const [processRows, setProcessRows] = useState([]);

  // Load materials & processes & existing BOM data
  useEffect(() => {
    const loadPageData = async () => {
      setLoading(true);
      try {
        const [materialsRes, processesRes] = await Promise.all([
          getMaterials(false), // only active
          getProcesses(),
        ]);

        const allMaterials = materialsRes.data.data || [];
        setMaterials(allMaterials);
        setProcesses(processesRes.data.data || []);

        if (isEditMode) {
          const bomRes = await getBOMById(editId);
          const bomData = bomRes.data.data;
          if (bomData) {
            setTargetMaterialId(String(bomData.material_id));
            
            // Map raw materials rows
            const mappedRMs = (bomData.rawMaterials || []).map((rm) => {
              // Find matching material from allMaterials to ensure we have latest unit info
              const matDetail = allMaterials.find((m) => m.id === rm.materialId);
              return {
                materialId: String(rm.materialId),
                quantity: String(rm.quantity),
                unitName: matDetail?.unit_name || rm.unitName || "—",
              };
            });
            setRawMaterialsRows(mappedRMs);

            // Map processes rows
            const mappedProcesses = (bomData.processes || []).map((p) => ({
              processId: String(p.processId),
              standardCycleTime: String(p.standardCycleTime),
            }));
            setProcessRows(mappedProcesses);
          }
        } else {
          // Prefill with 1 empty row for convenience
          setRawMaterialsRows([{ materialId: "", quantity: "", unitName: "—" }]);
          setProcessRows([{ processId: "", standardCycleTime: "" }]);
        }
      } catch (err) {
        console.error("Failed to load BOM page data", err);
        toast.error("Unable to load page data.");
        navigate("/admin/production/bom");
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, [editId, isEditMode, navigate]);

  // Filter finished/semi-finished materials for target dropdown
  const targetMaterialsList = useMemo(() => {
    return materials.filter(
      (m) =>
        m.material_type === "Finished Goods" ||
        m.material_type === "Semi Finished Goods"
    );
  }, [materials]);

  // Filter list of available raw materials (excluding current target if selected)
  const rawMaterialsList = useMemo(() => {
    return materials.filter((m) => String(m.id) !== targetMaterialId);
  }, [materials, targetMaterialId]);

  // Real-time calculation of total standard cycle time
  const totalCycleTime = useMemo(() => {
    return processRows.reduce((sum, row) => {
      const time = parseFloat(row.standardCycleTime) || 0;
      return sum + time;
    }, 0);
  }, [processRows]);

  // ── Handlers ──────────────────────────────────────────────────

  // Raw Materials
  const handleAddRawMaterialRow = () => {
    setRawMaterialsRows((prev) => [
      ...prev,
      { materialId: "", quantity: "", unitName: "—" },
    ]);
  };

  const handleRemoveRawMaterialRow = (idx) => {
    setRawMaterialsRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleRawMaterialChange = (idx, field, value) => {
    setRawMaterialsRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;

        if (field === "materialId") {
          const selectedMat = materials.find((m) => String(m.id) === value);
          return {
            ...row,
            materialId: value,
            unitName: selectedMat?.unit_name || "—",
          };
        }

        return { ...row, [field]: value };
      })
    );
  };

  // Processes
  const handleAddProcessRow = () => {
    setProcessRows((prev) => [...prev, { processId: "", standardCycleTime: "" }]);
  };

  const handleRemoveProcessRow = (idx) => {
    setProcessRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleProcessChange = (idx, field, value) => {
    setProcessRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
    );
  };

  // Save BOM
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!targetMaterialId) {
      toast.error("Please select a Finished or Semi Finished Product.");
      return;
    }

    // Validate raw materials
    const validRawMaterials = [];
    for (let i = 0; i < rawMaterialsRows.length; i++) {
      const rm = rawMaterialsRows[i];
      if (!rm.materialId) {
        toast.error(`Please select a material in Raw Materials row ${i + 1}.`);
        return;
      }
      const qty = parseFloat(rm.quantity);
      if (isNaN(qty) || qty <= 0) {
        toast.error(`Please enter a valid quantity in Raw Materials row ${i + 1}.`);
        return;
      }
      validRawMaterials.push({
        materialId: Number(rm.materialId),
        quantity: qty,
      });
    }

    // Validate processes
    const validProcesses = [];
    for (let i = 0; i < processRows.length; i++) {
      const p = processRows[i];
      if (!p.processId) {
        toast.error(`Please select a process in Processes row ${i + 1}.`);
        return;
      }
      const cycleTime = parseInt(p.standardCycleTime, 10);
      if (isNaN(cycleTime) || cycleTime < 0) {
        toast.error(`Please enter a standard cycle time (>= 0) in Processes row ${i + 1}.`);
        return;
      }
      validProcesses.push({
        processId: Number(p.processId),
        standardCycleTime: cycleTime,
      });
    }

    setSaving(true);
    try {
      if (isEditMode) {
        await updateBOM(editId, {
          rawMaterials: validRawMaterials,
          processes: validProcesses,
        });
        toast.success("Bill of Material updated successfully!");
      } else {
        await createBOM({
          materialId: Number(targetMaterialId),
          rawMaterials: validRawMaterials,
          processes: validProcesses,
        });
        toast.success("Bill of Material created successfully!");
      }
      setTimeout(() => navigate("/admin/production/bom"), 800);
    } catch (err) {
      console.error("Failed to save BOM", err);
      toast.error(err?.response?.data?.message || "Failed to save Bill of Material.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#043464] focus:border-[#043464] transition-colors text-slate-800 bg-white text-sm disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed";
  const labelCls = "block text-sm font-semibold text-slate-700 mb-1.5";

  if (loading) {
    return (
      <div className="flex-1 bg-slate-50 font-sans text-slate-900">
        <Navbar title="ERP Admin" />
        <div className="flex items-center justify-center h-64 text-slate-400 text-sm font-semibold">
          Loading BOM config...
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 font-sans text-slate-900 min-h-screen pb-12">
      <Navbar title="ERP Admin" />

      <main className="mx-auto py-8 px-4 sm:px-6 lg:px-8 ">
        {/* Page header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isEditMode ? "Edit Bill of Material" : "Create Bill of Material"}
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Define the raw material composition and manufacturing steps for products.
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/production/bom")}
            className="text-[#043464] hover:text-[#03274b] font-medium text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to BOM List
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Name */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            {/* <h2 className="text-base font-bold text-[#043464] border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-indigo-700 text-xs font-bold">1</span>
              Finished / Semi-Finished Product
            </h2> */}
            <div className="max-w-md">
              <label className={labelCls}>
                Product Name <span className="text-rose-500">*</span>
              </label>
              <select
                value={targetMaterialId}
                onChange={(e) => setTargetMaterialId(e.target.value)}
                disabled={isEditMode}
                className={inputCls}
                required
              >
                <option value="">— Select Target Product —</option>
                {targetMaterialsList.map((m) => (
                  <option key={m.id} value={m.id}>
                    [{m.material_code}] {m.material_name} ({m.material_type})
                  </option>
                ))}
              </select>
              {isEditMode && (
                <p className="text-xs text-slate-400 mt-1.5 italic">
                  Note: Target product cannot be altered during edit mode to preserve structural integrity.
                </p>
              )}
            </div>
          </div>

          {/* Section 2: Raw Material Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-base font-bold text-[#043464] flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-indigo-700 text-xs font-bold">2</span>
                Raw Material Composition
              </h2>
              <button
                type="button"
                onClick={handleAddRawMaterialRow}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#bcccdc] bg-[#f0f4f8] text-[#043464] hover:bg-[#e6ebf0] text-xs font-semibold transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Raw Material
              </button>
            </div>

            {rawMaterialsRows.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg text-slate-400 text-sm">
                No raw materials added yet. Click "Add Raw Material" to define components.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                      <th className="py-2.5 px-3 text-sm font-semibold text-slate-700 w-1/2">
                        Raw Material Name
                      </th>
                      <th className="py-2.5 px-3 text-sm font-semibold text-slate-700 w-1/4">
                        Quantity
                      </th>
                      <th className="py-2.5 px-3 text-sm font-semibold text-slate-700 w-1/6">
                        Unit
                      </th>
                      <th className="py-2.5 px-3 text-sm font-semibold text-slate-700 w-12 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rawMaterialsRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/30">
                        <td className="py-2 px-1">
                          <select
                            value={row.materialId}
                            onChange={(e) => handleRawMaterialChange(idx, "materialId", e.target.value)}
                            className={inputCls}
                            required
                          >
                            <option value="">— Select Material —</option>
                            {rawMaterialsList.map((m) => (
                              <option key={m.id} value={m.id}>
                                [{m.material_code}] {m.material_name} ({m.material_type})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-1">
                          <input
                            type="number"
                            step="0.0001"
                            placeholder="0.0000"
                            value={row.quantity}
                            onChange={(e) => handleRawMaterialChange(idx, "quantity", e.target.value)}
                            className={inputCls}
                            required
                          />
                        </td>
                        <td className="py-2 px-1">
                          <div className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-semibold text-sm w-full text-center">
                            {row.unitName}
                          </div>
                        </td>
                        <td className="py-2 px-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveRawMaterialRow(idx)}
                            className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg border border-transparent hover:border-rose-100 transition-all cursor-pointer"
                            title="Remove row"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 3: Process Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h2 className="text-base font-bold text-[#043464] flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 text-indigo-700 text-xs font-bold">3</span>
                Manufacturing Process Steps
              </h2>
              <button
                type="button"
                onClick={handleAddProcessRow}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#bcccdc] bg-[#f0f4f8] text-[#043464] hover:bg-[#e6ebf0] text-xs font-semibold transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Process Step
              </button>
            </div>

            {processRows.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg text-slate-400 text-sm">
                No process steps added yet. Click "Add Process Step" or "+" to define routing steps.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/50">
                      <th className="py-2.5 px-3 text-sm font-semibold text-slate-700 w-3/5">
                        Process Name
                      </th>
                      <th className="py-2.5 px-3 text-sm font-semibold text-slate-700 w-1/3">
                        Std Cycle Time (sec)
                      </th>
                      <th className="py-2.5 px-3 text-sm font-semibold text-slate-700 w-12 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {processRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/30">
                        <td className="py-2 px-1">
                          <select
                            value={row.processId}
                            onChange={(e) => handleProcessChange(idx, "processId", e.target.value)}
                            className={inputCls}
                            required
                          >
                            <option value="">— Select Process —</option>
                            {processes.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.process_name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-1">
                          <input
                            type="number"
                            min="0"
                            placeholder="e.g. 15"
                            value={row.standardCycleTime}
                            onChange={(e) => handleProcessChange(idx, "standardCycleTime", e.target.value)}
                            className={inputCls}
                            required
                          />
                        </td>
                        <td className="py-2 px-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveProcessRow(idx)}
                            className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg border border-transparent hover:border-rose-100 transition-all cursor-pointer"
                            title="Remove row"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              className="w-4 h-4"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}

                    {/* SUM TOTAL ROW */}
                    {processRows.length > 0 && (
                      <tr className="bg-indigo-50/50 font-bold border-t border-slate-300">
                        <td className="py-3 px-3 text-indigo-900 font-bold text-sm text-left">
                          Total Cycle Time
                        </td>
                        <td className="py-3 px-3 text-indigo-700 text-sm text-left">
                          {totalCycleTime} seconds
                        </td>
                        <td className="py-3 px-1"></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => navigate("/admin/production/bom")}
              className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#043464] text-white px-8 py-2.5 rounded-lg font-medium hover:bg-[#03274b] transition-colors duration-200 disabled:cursor-not-allowed disabled:bg-slate-400 shadow-sm cursor-pointer"
            >
              {saving ? "Saving..." : isEditMode ? "Update BOM" : "Create BOM"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
