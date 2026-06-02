import { useNavigate, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { logoutUser } from "../api/authApi";
import { usePermission } from "../context/PermissionContext";
import { getOrganizationDetails } from "../api/organizationApi";
import logo from "../assets/Logo1.png";

export default function Navbar({ title }) {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const [isOpen, setIsOpen] = useState(false);
    const [isProductionOpen, setIsProductionOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [orgLogo, setOrgLogo] = useState("");
    const { hasPermission } = usePermission();

    useEffect(() => {
        const fetchLogo = async () => {
            try {
                const res = await getOrganizationDetails();
                if (res.data?.data?.logo) {
                    setOrgLogo(res.data.data.logo);
                }
            } catch (err) {
                console.error("Failed to load organization logo in navbar:", err);
            }
        };
        fetchLogo();
    }, []);

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (isOpen && !e.target.closest("#custom-nav-dropdown")) {
                setIsOpen(false);
            }
            if (isProductionOpen && !e.target.closest("#production-nav-dropdown")) {
                setIsProductionOpen(false);
            }
            if (isProfileOpen && !e.target.closest("#profile-dropdown")) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("click", handleOutsideClick);
        return () => document.removeEventListener("click", handleOutsideClick);
    }, [isOpen, isProductionOpen, isProfileOpen]);

    const handleLogout = async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error("Logout failed", error);
        }
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        sessionStorage.removeItem("loginTime");
        window.dispatchEvent(new Event("auth-change"));
        navigate("/");
    };

    const userModules = user.modules || [];
    const isAdmin = user.role === "admin";

    const allMasters = [
        // {
        //     name: "User Dashboard",
        //     path: "/user/home",
        //     icon: "fa-solid fa-house",
        //     color: "bg-blue-50 text-blue-600 border border-blue-100/50",
        //     activeColor: "bg-blue-100 text-blue-700",
        //     desc: "Overview of your personal workspace"
        // },
        {
            name: "User Master",
            path: "/admin/dashboard",
            adminOnly: true,
            icon: "fa-solid fa-users-gear",
            color: "bg-emerald-50 text-emerald-600 border border-emerald-100/50",
            activeColor: "bg-emerald-100 text-emerald-700",
            desc: "Manage user profiles & account statuses"
        },
        {
            name: "User Types Master",
            path: "/admin/user-types",
            masterKey: "user_type",
            icon: "fa-solid fa-user-shield",
            color: "bg-violet-50 text-violet-600 border border-violet-100/50",
            activeColor: "bg-violet-100 text-violet-700",
            desc: "Configure access roles & permissions"
        },
        {
            name: "Location Types Master",
            path: "/admin/location-types",
            masterKey: "location_type",
            icon: "fa-solid fa-layer-group",
            color: "bg-amber-50 text-amber-600 border border-amber-100/50",
            activeColor: "bg-amber-100 text-amber-700",
            desc: "Define hierarchical levels & categories"
        },
        {
            name: "Location Master",
            path: "/admin/locations",
            masterKey: "location",
            icon: "fa-solid fa-location-dot",
            color: "bg-rose-50 text-rose-600 border border-rose-100/50",
            activeColor: "bg-rose-100 text-rose-700",
            desc: "Track physical sites & addresses"
        },

        {
            name: "Material Group Master",
            path: "/admin/material-groups",
            masterKey: "material_group",
            icon: "fa-solid fa-boxes-stacked",
            color: "bg-teal-50 text-teal-600 border border-teal-100/50",
            activeColor: "bg-teal-100 text-teal-700",
            desc: "Manage material group names and details"
        },
        {
            name: "Unit Master",
            path: "/admin/units",
            masterKey: "unit",
            icon: "fa-solid fa-ruler",
            color: "bg-sky-50 text-sky-600 border border-sky-100/50",
            activeColor: "bg-sky-100 text-sky-700",
            desc: "Manage measurement units and specifications"
        },
        {
            name: "Material Master",
            path: "/admin/materials",
            masterKey: "material",
            icon: "fa-solid fa-box-archive",
            color: "bg-indigo-50 text-indigo-600 border border-indigo-100/50",
            activeColor: "bg-indigo-100 text-indigo-700",
            desc: "Manage material codes, groups, units, types & valuation"
        },
        {
            name: "Document Master",
            path: "/admin/documents",
            masterKey: "document",
            icon: "fa-solid fa-file-contract",
            color: "bg-teal-50 text-teal-600 border border-teal-100/50",
            activeColor: "bg-teal-100 text-teal-700",
            desc: "Manage organization and personal documents"
        },
        {
            name: "Vendor Master",
            path: "/admin/vendors",
            masterKey: "vendor",
            icon: "fa-solid fa-building-user",
            color: "bg-blue-50 text-blue-600 border border-blue-100/50",
            activeColor: "bg-blue-100 text-blue-700",
            desc: "Manage vendor details and related documents"
        },
        {
            name: "Customer Master",
            path: "/admin/customers",
            masterKey: "customer",
            icon: "fa-solid fa-users",
            color: "bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-100/50",
            activeColor: "bg-fuchsia-100 text-fuchsia-700",
            desc: "Manage customer details and related documents"
        },
        {
            name: "Operator Type Master",
            path: "/admin/operator-types",
            masterKey: "operator_type",
            icon: "fa-solid fa-id-badge",
            color: "bg-indigo-50 text-indigo-600 border border-indigo-100/50",
            activeColor: "bg-indigo-100 text-indigo-700",
            desc: "Configure operator types and categories"
        },
        {
            name: "Operator Master",
            path: "/admin/operators",
            masterKey: "operator",
            icon: "fa-solid fa-user-gear",
            color: "bg-cyan-50 text-cyan-600 border border-cyan-100/50",
            activeColor: "bg-cyan-100 text-cyan-700",
            desc: "Manage operator details and active status"
        },
        {
            name: "Process Master",
            path: "/admin/processes",
            masterKey: "process_master",
            icon: "fa-solid fa-gears",
            color: "bg-orange-50 text-orange-600 border border-orange-100/50",
            activeColor: "bg-orange-100 text-orange-700",
            desc: "Manage process names and active logs"
        },
        {
            name: "Organization Details Master",
            path: "/admin/organization-details",
            masterKey: "organization_details",
            icon: "fa-solid fa-building",
            color: "bg-indigo-50 text-indigo-600 border border-indigo-100/50",
            activeColor: "bg-indigo-100 text-indigo-700",
            desc: "Manage organization profile, logo, address & GST details"
        }
    ];

    const availableMasters = allMasters.filter(m => {
        if (m.adminOnly) return isAdmin;
        if (m.masterKey) return hasPermission(m.masterKey, "read");
        if (m.module) return isAdmin || userModules.includes(m.module);
        return true;
    });

    const currentMaster = availableMasters.find(m => m.path === location.pathname) || availableMasters[0];

    return (
        <nav className="bg-white shadow-sm border-b border-slate-200 flex flex-col">
            {/* First Row */}
            <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img src={orgLogo || logo} alt="Elcen Logo" className="h-24 w-auto" />
                </div>

                <div className="flex items-center gap-6">
                    {/* Notification Icon (Dummy) */}
                    <button className="text-slate-500 hover:text-indigo-600 transition-colors relative cursor-not-allowed" title="Notifications">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                        </svg>
                        <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                    </button>

                    {/* Profile Dropdown */}
                    <div className="relative" id="profile-dropdown">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2.5 px-3 py-1.5 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all duration-200 cursor-pointer focus:outline-none"
                            title="User menu"
                        >
                            {/* Profile Avatar Icon */}
                            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shadow-sm">
                                {user.name ? user.name[0].toUpperCase() : "U"}
                            </div>
                            <span className="hidden sm:inline text-sm font-semibold text-slate-700">{user.name || "User"}</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2.5}
                                stroke="currentColor"
                                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                        </button>

                        {isProfileOpen && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50 origin-top-right animate-in fade-in slide-in-from-top-2 duration-150">
                                {/* User Info Header */}
                                <div className="px-4 py-2.5 border-b border-slate-100">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Signed in as</p>
                                    <p className="text-sm font-bold text-slate-800 truncate mt-0.5">{user.name || "User"}</p>
                                    {user.email && (
                                        <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
                                    )}
                                </div>

                                {/* Menu Items */}
                                <div className="px-1.5 py-1">
                                    <button
                                        onClick={() => {
                                            navigate("/profile");
                                            setIsProfileOpen(false);
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-all duration-150 cursor-pointer text-left"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-slate-400">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        </svg>
                                        Your Profile
                                    </button>
                                </div>

                                <div className="border-t border-slate-100 my-1"></div>

                                <div className="px-1.5 py-1">
                                    <button
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            handleLogout();
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 text-sm font-semibold transition-all duration-150 cursor-pointer text-left"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4 text-red-500">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 6.75 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                                        </svg>
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Second Row: Custom Master Dropdown */}
            {availableMasters.length > 0 && (
                <div className="bg-[#043464] border-t border-slate-200 px-4 sm:px-6 lg:px-8 py-0 flex flex-wrap items-center gap-4">
                    <div className="flex items-center relative z-50" id="custom-nav-dropdown">
                        <div className="relative">
                            <button
                                onClick={() => {
                                    navigate("/user/home");
                                }}
                                className="flex items-center justify-between w-40 px-4 py-2.5 text-sm bg-[#043464] border border-white/10 rounded-none hover:bg-white/5 focus:outline-none focus:ring-4 focus:ring-white/5 transition-all duration-200 font-semibold text-white cursor-pointer"
                            >
                                <span className="flex items-center gap-2.5 truncate">
                                    <span className="font-semibold text-white truncate">User Dashboard</span>
                                </span>
                            </button>
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="flex items-center justify-between w-40 px-4 py-2.5 text-sm bg-[#043464] border border-white/10 rounded-none hover:bg-white/5 focus:outline-none focus:ring-4 focus:ring-white/5 transition-all duration-200 font-semibold text-white cursor-pointer"
                            >
                                <span className="flex items-center gap-2.5 truncate">
                                    {/* <span className={`flex items-center justify-center w-6 h-6 rounded-lg ${currentMaster?.color || 'bg-white/10 text-slate-300'}`}>
                                        <i className={`${currentMaster?.icon || "fa-solid fa-folder"} text-[11px]`}></i>
                                    </span> */}
                                    <span className="font-semibold text-white truncate">Masters</span>
                                </span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2.5}
                                    stroke="currentColor"
                                    className={`w-3.5 h-3.5 text-slate-300 transition-transform duration-200 ${isOpen ? "rotate-180 text-white" : ""}`}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                </svg>
                            </button>

                            {isOpen && (
                                <div className="absolute left-0 top-full mt-1.5 w-[960px] max-w-[95vw] bg-white border border-slate-200 rounded-2xl shadow-xl p-3.5 z-50 origin-top animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-1.5 max-h-[75vh] overflow-y-auto lg:overflow-visible pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                                        {availableMasters.map((m, idx) => {
                                            const isActive = location.pathname === m.path;
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        navigate(m.path);
                                                        setIsOpen(false);
                                                    }}
                                                    className={`relative group flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer text-left border border-transparent ${isActive
                                                        ? "bg-indigo-50/70 text-indigo-700 font-semibold border-indigo-100/50"
                                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-100"
                                                        }`}
                                                >
                                                    {/* Side Highlight Bar */}
                                                    <span className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-md transition-all duration-200 ${isActive ? "bg-indigo-600 scale-y-100" : "bg-transparent scale-y-0 group-hover:scale-y-50 group-hover:bg-slate-300"
                                                        }`} />

                                                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm shrink-0 ${isActive ? "bg-indigo-100/80 text-indigo-700" : "bg-slate-100/80 text-slate-500 group-hover:scale-105"
                                                        }`}>
                                                        <i className={`${m.icon || "fa-solid fa-folder"} text-xs`}></i>
                                                    </div>

                                                    <div className="flex-1">
                                                        <p className={`text-sm font-semibold leading-snug py-0.5 transition-colors whitespace-normal break-words ${isActive ? "text-indigo-900 font-bold" : "text-slate-800 group-hover:text-slate-950"
                                                            }`}>
                                                            {m.name}
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Production Dropdown Megamenu */}
                        <div className="relative" id="production-nav-dropdown">
                            <button
                                onClick={() => setIsProductionOpen(!isProductionOpen)}
                                className="flex items-center justify-between w-40 px-4 py-2.5 text-sm bg-[#043464] border border-white/10 rounded-none hover:bg-white/5 focus:outline-none focus:ring-4 focus:ring-white/5 transition-all duration-200 font-semibold text-white cursor-pointer"
                            >
                                <span className="font-semibold text-white truncate">Production</span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2.5}
                                    stroke="currentColor"
                                    className={`w-3.5 h-3.5 text-slate-300 transition-transform duration-200 ${isProductionOpen ? "rotate-180 text-white" : ""}`}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                </svg>
                            </button>

                            {isProductionOpen && (
                                <div className="absolute left-0 top-full mt-1.5 w-[320px] bg-white border border-slate-200 rounded-2xl shadow-xl p-3.5 z-50 origin-top animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="flex flex-col gap-1.5">
                                        <button
                                            onClick={() => {
                                                navigate("/admin/production/bom");
                                                setIsProductionOpen(false);
                                            }}
                                            className={`relative group flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all cursor-pointer text-left border border-transparent ${
                                                location.pathname.startsWith("/admin/production/bom")
                                                    ? "bg-indigo-50/70 text-indigo-700 font-semibold border-indigo-100/50"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-100"
                                            }`}
                                        >
                                            <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all shadow-sm shrink-0 ${
                                                location.pathname.startsWith("/admin/production/bom") ? "bg-indigo-100/80 text-indigo-700" : "bg-slate-100/80 text-slate-500 group-hover:scale-105"
                                            }`}>
                                                <i className="fa-solid fa-file-invoice text-xs"></i>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold leading-snug text-slate-800 group-hover:text-slate-950">
                                                    Bill of Material
                                                </p>
                                                <p className="text-xs text-slate-400 mt-0.5 leading-normal">
                                                    Manage BOM definitions
                                                </p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Reports button — after Masters */}
                        <div className="relative">
                            <button
                                onClick={() => navigate("/reports")}
                                className={`flex items-center justify-between w-40 px-4 py-2.5 text-sm border border-white/10 rounded-none hover:bg-white/5 focus:outline-none transition-all duration-200 font-semibold text-white cursor-pointer ${location.pathname === "/reports" ? "bg-white/10" : "bg-[#043464]"}`}
                            >
                                <span className="font-semibold text-white truncate">Reports</span>
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </nav>
    );
}
