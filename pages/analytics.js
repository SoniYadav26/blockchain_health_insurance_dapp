import { useState, useEffect, useCallback, useMemo } from "react";
import { useAccount } from "wagmi";
import { useEthersProvider } from "../provider/hooks";
import Layout from "../components/Layout/Layout";
import StatsOverview from "../components/Analytics/StatsOverview";
import PolicyAnalytics from "../components/Analytics/PolicyAnalytics";
import ClaimsAnalytics from "../components/Analytics/ClaimsAnalytics";
import RevenueAnalytics from "../components/Analytics/RevenueAnalytics";
import TrendAnalytics from "../components/Analytics/TrendAnalytics";
import { contractService } from "../services/contract";
import { FiRefreshCw, FiDownload, FiLock, FiBarChart } from "react-icons/fi";

export default function Analytics() {
  const { address, isConnected } = useAccount();
  const provider = useEthersProvider();

  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [analyticsData, setAnalyticsData] = useState(null);

  // 1. Optimized Data Fetching
  const fetchAnalytics = useCallback(async () => {
    if (!address || !provider) return;
    
    try {
      setLoading(true);
      // Parallel fetching for better speed
      const [policies, stats] = await Promise.all([
        contractService.getUserPolicies(address, provider),
        contractService.getContractStats(provider),
      ]);

      // Fetch claims for all policies in parallel (much faster than a for-loop)
      const claimsPromises = policies.map(p => 
        contractService.getPolicyClaims(p.policyId, provider)
      );
      const allClaimsNested = await Promise.all(claimsPromises);
      const allClaims = allClaimsNested.flat();

      // Simple processing logic
      const processed = processData(policies, allClaims, stats, timeRange);
      setAnalyticsData(processed);
    } catch (error) {
      console.error("Analytics Load Error:", error);
    } finally {
      setLoading(false);
    }
  }, [address, provider, timeRange]);

  useEffect(() => {
    if (isConnected) fetchAnalytics();
  }, [isConnected, fetchAnalytics]);

  // 2. Simplified Helper Logic (Student Friendly)
  function processData(policies, claims, stats, range) {
    // Basic Calculations
    const totalPremiums = policies.reduce((s, p) => s + parseFloat(p.totalPaid || 0), 0);
    const approvedClaims = claims.filter(c => c.status === 1 || c.status === 3);
    const totalClaimsPaid = approvedClaims.reduce((s, c) => s + parseFloat(c.approvedAmount || 0), 0);

    return {
      overview: {
        totalPolicies: policies.length,
        activePolicies: policies.filter(p => p.status === 0).length,
        totalClaims: claims.length,
        totalPremiumsPaid: totalPremiums,
        lossRatio: totalPremiums > 0 ? (totalClaimsPaid / totalPremiums) * 100 : 0,
      },
      policies: {
        planDistribution: {
          Basic: policies.filter(p => p.planType === 0).length,
          Premium: policies.filter(p => p.planType === 1).length,
          Platinum: policies.filter(p => p.planType === 2).length,
        }
      },
      claims: {
        statusDistribution: {
          Pending: claims.filter(c => c.status === 0).length,
          Approved: claims.filter(c => c.status === 1 || c.status === 3).length,
          Rejected: claims.filter(c => c.status === 2).length,
        }
      },
      // Simplified trends for student level visualization
      trends: { 
        policyTrend: [], // Can be populated based on requirement
        claimsTrend: [] 
      }
    };
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify(analyticsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${timeRange}.json`;
    a.click();
  };

  // --- UI Renders ---

  if (!isConnected) {
    return (
      <Layout>
        <div className="py-20 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
          <FiLock className="mx-auto h-12 w-12 text-blue-500 mb-4" />
          <h2 className="text-xl font-bold">Connect Wallet to View Insights</h2>
          <p className="text-gray-500 mt-2">Personalized portfolio analytics require a wallet connection.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header section with minimal clean look */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Portfolio Analytics</h1>
            <p className="text-gray-500">Track your insurance performance and coverage</p>
          </div>

          <div className="flex items-center gap-3">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white border border-gray-200 text-sm font-medium px-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="1y">Full Year</option>
            </select>

            <button 
              onClick={exportData}
              className="p-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 border border-gray-200 transition-colors"
              title="Export JSON"
            >
              <FiDownload size={18} />
            </button>

            <button 
              onClick={fetchAnalytics}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} />
              {loading ? "Syncing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Content with conditional skeleton or data */}
        {loading || !analyticsData ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl" />)}
          </div>
        ) : (
          <div className="space-y-8">
            <StatsOverview data={analyticsData.overview} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="font-bold mb-4 flex items-center gap-2"><FiBarChart /> Plan Distribution</h3>
                <PolicyAnalytics data={analyticsData.policies} />
              </div>
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="font-bold mb-4 flex items-center gap-2"><FiBarChart /> Claims Status</h3>
                <ClaimsAnalytics data={analyticsData.claims} />
              </div>
            </div>

            {/* Other analytics components... */}
            <RevenueAnalytics data={analyticsData.revenue} loading={loading} />
          </div>
        )}
      </div>
    </Layout>
  );
}