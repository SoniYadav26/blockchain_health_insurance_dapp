import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { useEthersProvider, useEthersSigner } from "../provider/hooks";
import Layout from "../components/Layout/Layout";
import AdminStats from "../components/Admin/AdminStats";
import PlanManagement from "../components/Admin/PlanManagement";
import DoctorManagement from "../components/Admin/DoctorManagement";
import ClaimManagement from "../components/Admin/ClaimManagement";
import ContractControls from "../components/Admin/ContractControls";
import { contractService } from "../services/contract";
import {
  FiShield, FiSettings, FiUsers, FiFileText,
  FiAlertTriangle, FiLock, FiBarChart,
} from "react-icons/fi";

export default function Admin() {
  const { address, isConnected } = useAccount();
  const provider = useEthersProvider();
  const signer = useEthersSigner();

  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [adminData, setAdminData] = useState({
    contractStats: {},
    plans: [],
    pendingClaims: [],
    contractBalance: "0",
  });

  // 1. Unified Data Fetching: Ek hi baar mein sab data load karein
  const loadAdminDashboard = useCallback(async () => {
    if (!address || !provider) return;

    try {
      setLoading(true);
      const contract = contractService.initContract(provider);
      
      // Authorization Check
      const owner = await contract.owner();
      const isOwner = owner.toLowerCase() === address.toLowerCase();
      const isDoctor = await contract.authorizedDoctors(address);
      
      const hasAccess = isOwner || isDoctor;
      setIsAuthorized(hasAccess);

      if (hasAccess) {
        // Parallel data loading for speed
        const [stats, plans] = await Promise.all([
          contractService.getContractStats(provider),
          contractService.getAllInsurancePlans(provider)
        ]);

        setAdminData({
          contractStats: stats,
          plans: plans,
          pendingClaims: [], // Future logic for events
          contractBalance: stats.contractBalance || "0",
        });
      }
    } catch (error) {
      console.error("Admin Load Error:", error);
    } finally {
      setLoading(false);
    }
  }, [address, provider]);

  useEffect(() => {
    if (isConnected) {
      loadAdminDashboard();
    }
  }, [isConnected, loadAdminDashboard]);

  // Tab configuration for cleaner UI logic
  const tabs = [
    { id: "overview", name: "Overview", icon: FiBarChart, color: "blue" },
    { id: "plans", name: "Plans", icon: FiShield, color: "purple" },
    { id: "doctors", name: "Doctors", icon: FiUsers, color: "emerald" },
    { id: "claims", name: "Claims", icon: FiFileText, color: "orange" },
    { id: "controls", name: "Settings", icon: FiSettings, color: "red" },
  ];

  // --- Conditional Rendering for Security ---

  if (!isConnected) {
    return (
      <Layout>
        <div className="py-20 text-center">
          <FiLock className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold">Please Connect Wallet</h2>
          <p className="text-gray-500">Admin access requires a secure connection.</p>
        </div>
      </Layout>
    );
  }

  if (!loading && !isAuthorized) {
    return (
      <Layout>
        <div className="py-20 text-center max-w-md mx-auto">
          <div className="bg-red-50 p-8 rounded-3xl border border-red-100">
            <FiAlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-red-700">Access Denied</h2>
            <p className="text-red-600 mt-2 text-sm">Only Contract Owners or Authorized Doctors can view this page.</p>
            <div className="mt-4 p-2 bg-white rounded-lg text-xs font-mono text-gray-400 break-all">
              {address}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Portal</h1>
            <p className="text-gray-500">Contract & Network Management</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100 flex items-center">
               <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse" />
               Live Contract
             </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-5 py-3 rounded-2xl font-medium transition-all whitespace-nowrap
                  ${isActive 
                    ? "bg-gray-900 text-white shadow-lg shadow-gray-200 scale-105" 
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100"}`}
              >
                <Icon className={`mr-2 ${isActive ? "text-white" : "text-gray-400"}`} />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="bg-white min-h-[400px] rounded-3xl p-6 shadow-sm border border-gray-100 transition-all">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-gray-400 animate-pulse">
              Syncing with Blockchain...
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <AdminStats data={adminData} onRefresh={loadAdminDashboard} />
              )}
              {activeTab === "plans" && (
                <PlanManagement plans={adminData.plans} onRefresh={loadAdminDashboard} />
              )}
              {activeTab === "doctors" && (
                <DoctorManagement onRefresh={loadAdminDashboard} />
              )}
              {activeTab === "claims" && (
                <ClaimManagement claims={adminData.pendingClaims} onRefresh={loadAdminDashboard} />
              )}
              {activeTab === "controls" && (
                <ContractControls balance={adminData.contractBalance} onRefresh={loadAdminDashboard} />
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}