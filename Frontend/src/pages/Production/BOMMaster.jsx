import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getBOMs, deleteBOM } from "../../api/bomApi";
import DataTable from "../../components/DataTable";
import toast from "react-hot-toast";
import { usePermission } from "../../context/PermissionContext";

export default function BOMMaster() {
  const [boms, setBoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { hasPermission } = usePermission();
  const navigate = useNavigate();

  // ── Data loader ───────────────────────────────────────────────
  const loadBOMs = async () => {
    setLoading(true);
    try {
      const res = await getBOMs();
      setBoms(res.data.data || []);
    } catch (err) {
      console.error("Failed to load BOMs", err);
      toast.error("Unable to load Bill of Materials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBOMs();
  }, []);

  // ── Delete ────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Bill of Material?")) return;

    setSaving(true);
    try {
      await deleteBOM(id);
      toast.success("Bill of Material deleted successfully");
      await loadBOMs();
    } catch (err) {
      console.error("Failed to delete BOM", err);
      toast.error(err?.response?.data?.message || "Unable to delete Bill of Material.");
    } finally {
      setSaving(false);
    }
  };

  // ── Columns ───────────────────────────────────────────────────
  const columns = useMemo(() => {
    const canUpdate = hasPermission("bill_of_material", "update");
    const canDelete = hasPermission("bill_of_material", "delete");

    const cols = [
      {
        key: "material_code",
        label: "Product Code",
        minWidth: "130px",
        render: (row) => (
          <span className="font-mono font-semibold text-[#043464]">
            {row.material_code || "—"}
          </span>
        ),
      },
      {
        key: "material_name",
        label: "Product Name",
        minWidth: "180px",
        render: (row) => (
          <span className="font-semibold text-slate-800">{row.material_name || "—"}</span>
        ),
      },
      {
        key: "material_type",
        label: "Material Type",
        minWidth: "150px",
        render: (row) => {
          if (!row.material_type)
            return <span className="text-slate-400 italic text-xs">—</span>;
          const colors = {
            "Finished Goods": "bg-emerald-50 text-emerald-700 border-emerald-200",
            "Semi Finished Goods": "bg-orange-50 text-orange-700 border-orange-200",
          };
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                colors[row.material_type] || "bg-slate-100 text-slate-600"
              }`}
            >
              {row.material_type}
            </span>
          );
        },
      },
      {
        key: "raw_materials_count",
        label: "Raw Materials",
        minWidth: "130px",
        render: (row) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200 font-mono">
            {row.raw_materials_count} items
          </span>
        ),
      },
      {
        key: "processes_count",
        label: "Processes",
        minWidth: "120px",
        render: (row) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 font-mono">
            {row.processes_count} steps
          </span>
        ),
      },
      {
        key: "total_cycle_time",
        label: "Total Cycle Time",
        minWidth: "150px",
        render: (row) => (
          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg text-sm">
            {row.total_cycle_time} sec
          </span>
        ),
      },
      {
        key: "added_by_name",
        label: "Created By",
        minWidth: "130px",
        render: (row) => <span className="text-slate-600 text-sm">{row.added_by_name}</span>,
      },
      {
        key: "created_at",
        label: "Date Created",
        minWidth: "150px",
        render: (row) => (
          <span className="text-slate-500 font-mono text-xs">
            {new Date(row.created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        ),
      },
    ];

    if (canUpdate || canDelete) {
      cols.push({
        key: "actions",
        label: "Actions",
        sortable: false,
        minWidth: "120px",
        render: (row) => {
          return (
            <div className="flex items-center gap-1.5">
              {/* Edit */}
              {canUpdate && (
                <button
                  onClick={() => navigate(`/admin/production/bom/create?id=${row.id}`)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#bcccdc] bg-[#f0f4f8] text-[#043464] hover:bg-[#e6ebf0] cursor-pointer"
                  title="Edit BOM"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931Z"
                    />
                  </svg>
                </button>
              )}

              {/* Delete */}
              {canDelete && (
                <button
                  onClick={() => handleDelete(row.id)}
                  disabled={saving}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 cursor-pointer disabled:opacity-50"
                  title="Delete BOM"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 7.5h12m-1.5 0-.563 12.375A2.25 2.25 0 0113.693 21H10.307a2.25 2.25 0 01-2.244-2.125L7.5 7.5m3-3h3A1.5 1.5 0 0115 6v1.5H9V6a1.5 1.5 0 011.5-1.5Z"
                    />
                  </svg>
                </button>
              )}
            </div>
          );
        },
      });
    }

    return cols;
  }, [hasPermission, saving, navigate]);

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col bg-slate-50 font-sans text-slate-900">
      <Navbar title="ERP Admin" />

      <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <DataTable
          tableId="bom_master"
          title="Bill of Materials (BOM)"
          data={boms}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search products or codes..."
          actionButton={
            hasPermission("bill_of_material", "write") && (
              <button
                onClick={() => navigate("/admin/production/bom/create")}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#043464] text-white hover:bg-[#03274b] transition-colors cursor-pointer shadow-sm hover:shadow"
                title="Add BOM"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </button>
            )
          }
        />
      </main>
    </div>
  );
}
