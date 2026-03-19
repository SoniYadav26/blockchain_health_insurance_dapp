import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { FiLock, FiActivity, FiRefreshCw } from "react-icons/fi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { useEthersProvider } from "../provider/hooks";
import StatsCards from "../components/Dashboard/StatsCards";
import RecentActivity from "../components/Dashboard/RecentActivity";
import QuickActions from "../components/Dashboard/QuickActions";
import PolicyOverview from "../components/Dashboard/PolicyOverview";
import { contractService } from "../services/contract";

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const provider = useEthersProvider();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    userPolicies: [],
    userClaims: [],
    contractStats: { totalPolicies: "0", totalClaims: "0", contractBalance: "0" },
  });

  useEffect(() => {
    if (isConnected && provider && address) {
      loadDashboardData();
    } else {
      setLoading(false);
    }
  }, [isConnected, provider, address]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const userPolicies = await contractService.getUserPolicies(address, provider);
      
      let userClaims = [];
      for (const policy of userPolicies) {
        const policyClaims = await contractService.getPolicyClaims(policy.policyId, provider);
        userClaims = [...userClaims, ...policyClaims];
      }

      const contractStats = await contractService.getContractStats(provider);

      setDashboardData({
        userPolicies,
        userClaims,
        contractStats,
      });
    } catch (error) {
      console.error("Dashboard Load Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // 1. Wallet Not Connected State (Simple & Clean)
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
          <FiLock size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Wallet Disconnected</h2>
        <p className="text-gray-500 max-w-sm mb-8">
          Please connect your Web3 wallet to access your insurance policies and claims history.
        </p>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">DASHBOARD</h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <FiActivity className="text-green-500" /> Welcome back, {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
        <button 
          onClick={loadDashboardData}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh Data
        </button>
      </div>

      {/* Stats Section */}
      <StatsCards
        userPolicies={dashboardData.userPolicies}
        userClaims={dashboardData.userClaims}
        loading={loading}
      />

      {/* Quick Actions Grid */}
      <QuickActions />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Policy Table - Takes 2/3 of space */}
        <div className="lg:col-span-2">
          <PolicyOverview
            policies={dashboardData.userPolicies}
            loading={loading}
            onRefresh={loadDashboardData}
          />
        </div>

        {/* Recent Activity - Takes 1/3 of space */}
        <div className="lg:col-span-1">
          <RecentActivity
            policies={dashboardData.userPolicies}
            claims={dashboardData.userClaims}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
