import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";
import { useEthersProvider, useEthersSigner } from "../provider/hooks";
import Layout from "../components/Layout/Layout";
import PolicyCard from "../components/Policies/PolicyCard";
import PayPremiumModal from "../components/Policies/PayPremiumModal";
import { contractService } from "../services/contract";
import { 
  FiRefreshCw, FiShield, FiLock, FiZap, 
  FiBarChart, FiActivity, FiCheckCircle, FiTrendingUp, FiGlobe 
} from "react-icons/fi";

export default function Policies() {
  const { address, isConnected } = useAccount();
  const provider = useEthersProvider();
  const signer = useEthersSigner();

  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [payPremiumModalOpen, setPayPremiumModalOpen] = useState(false);

  // 1. useCallback ka use karein taaki unnecessary re-renders na ho
  const loadPolicies = useCallback(async () => {
    if (!address || !provider) return;
    
    try {
      setLoading(true);
      const userPolicies = await contractService.getUserPolicies(address, provider);

      // 2. Parallel fetching for better speed
      const enrichedPolicies = await Promise.all(
        userPolicies.map(async (policy) => {
          try {
            const [isValid, remainingCoverage, claims] = await Promise.all([
              contractService.isPolicyValid(policy.policyId, provider),
              contractService.getRemainingCoverage(policy.policyId, provider),
              contractService.getPolicyClaims(policy.policyId, provider),
            ]);

            return {
              ...policy,
              isValid,
              remainingCoverage,
              claims,
              claimsCount: claims?.length || 0,
            };
          } catch (err) {
            console.error(`Error enriching policy ${policy.policyId}:`, err);
            return policy; // Fallback to basic policy data
          }
        })
      );

      setPolicies(enrichedPolicies);
    } catch (error) {
      console.error("Error loading policies:", error);
    } finally {
      setLoading(false);
    }
  }, [address, provider]);

  useEffect(() => {
    if (isConnected) {
      loadPolicies();
    }
  }, [isConnected, loadPolicies]);

  const handleCancelPolicy = async (policyId) => {
    // Better UX: window.confirm ke bajaye custom modal use karna chahiye, 
    // par filhal functionality check karte hain
    if (!confirm("Are you sure? This action cannot be undone.")) return;

    try {
      const result = await contractService.cancelPolicy(policyId, signer);
      if (result?.success) {
        await loadPolicies();
      }
    } catch (error) {
      console.error("Cancellation failed:", error);
    }
  };

  // --- UI RENDERING ---

  if (!isConnected) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
          <div className="relative mb-6">
            <div className="p-6 bg-blue-50 rounded-full animate-pulse">
              <FiShield className="h-16 w-16 text-blue-600" />
            </div>
            <FiLock className="absolute bottom-0 right-0 h-6 w-6 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Wallet Not Connected</h2>
          <p className="text-gray-500 max-w-sm mb-6">Please connect your Web3 wallet to manage your insurance policies and claims.</p>
          {/* Note: Ensure your ConnectButton component is integrated here */}
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-orange-700 text-sm">
            Check if your wallet is on the correct network.
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
              My Policies <span className="text-sm font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{policies.length}</span>
            </h1>
            <p className="text-gray-500">Securely managed on the blockchain.</p>
          </div>
          <button 
            onClick={loadPolicies}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            Refresh Data
          </button>
        </header>

        {/* Policies Display */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <PolicySkeleton key={i} />)}
          </div>
        ) : policies.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
             <FiShield className="mx-auto h-12 w-12 text-gray-300 mb-4" />
             <h3 className="text-xl font-semibold text-gray-700">No active protection found</h3>
             <button className="mt-4 text-blue-600 font-medium hover:underline">Browse Plans &rarr;</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {policies.map((policy) => (
              <PolicyCard 
                key={policy.policyId} 
                policy={policy}
                onPayPremium={() => { setSelectedPolicy(policy); setPayPremiumModalOpen(true); }}
                onCancel={() => handleCancelPolicy(policy.policyId)}
              />
            ))}
          </div>
        )}

        {/* Stats Summary Table */}
        {!loading && policies.length > 0 && <StatsSection policies={policies} />}
      </div>

      <PayPremiumModal 
        isOpen={payPremiumModalOpen} 
        onClose={() => setPayPremiumModalOpen(false)} 
        policy={selectedPolicy}
        onSuccess={loadPolicies}
      />
    </Layout>
  );
}

// --- Sub-components for better organization ---

function PolicySkeleton() {
  return (
    <div className="bg-gray-100 animate-pulse h-64 rounded-2xl w-full"></div>
  );
}

function StatsSection({ policies }) {
  const totalCoverage = policies.reduce((acc, p) => acc + parseFloat(p.coverageAmount || 0), 0);
  
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
      <StatCard icon={<FiShield />} label="Total" value={policies.length} color="blue" />
      <StatCard icon={<FiCheckCircle />} label="Active" value={policies.filter(p => p.status === 0).underline} color="green" />
      <StatCard icon={<FiTrendingUp />} label="Coverage" value={`${totalCoverage.toFixed(3)} ETH`} color="purple" />
      <StatCard icon={<FiActivity />} label="Claims" value={policies.reduce((a, b) => a + (b.claimsCount || 0), 0)} color="orange" />
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
      <div className={`text-${color}-500 mb-2 text-xl`}>{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-gray-400 text-xs uppercase tracking-wider font-semibold">{label}</div>
    </div>
  );
}
