import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { useEthersProvider } from "../provider/hooks";
import ClaimCard from "../components/Claims/ClaimCard";
import SubmitClaimModal from "../components/Claims/SubmitClaimModal";
import ProcessClaimModal from "../components/Claims/ProcessClaimModal";
import { contractService, CLAIM_STATUS } from "../services/contract";
import {
  FiRefreshCw,
  FiFileText,
  FiPlus,
  FiFilter,
  FiCheckCircle,
  FiClock,
  FiXCircle,
} from "react-icons/fi";

export default function Claims() {
  const router = useRouter();
  const { policyId } = router.query;
  const { address, isConnected } = useAccount();
  const provider = useEthersProvider();

  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [submitClaimModalOpen, setSubmitClaimModalOpen] = useState(false);
  const [processClaimModalOpen, setProcessClaimModalOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);

  useEffect(() => {
    if (isConnected && provider && address) {
      loadData();
    }
  }, [isConnected, provider, address]);

  useEffect(() => {
    if (policyId && policies.length > 0) setSelectedPolicy(policyId);
  }, [policyId, policies]);

  useEffect(() => {
    applyFilters();
  }, [claims, selectedPolicy, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const userPolicies = await contractService.getUserPolicies(address, provider);
      setPolicies(userPolicies);

      let allClaims = [];
      for (const policy of userPolicies) {
        const policyClaims = await contractService.getPolicyClaims(policy.policyId, provider);
        allClaims = [...allClaims, ...policyClaims];
      }
      setClaims(allClaims);
    } catch (error) {
      console.error("Error loading claims:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...claims];
    if (selectedPolicy) filtered = filtered.filter(c => c.policyId === selectedPolicy);
    if (statusFilter) filtered = filtered.filter(c => c.status.toString() === statusFilter);
    
    filtered.sort((a, b) => parseInt(b.submissionDate) - parseInt(a.submissionDate));
    setFilteredClaims(filtered);
  };

  const stats = {
    total: claims.length,
    pending: claims.filter(c => c.status === CLAIM_STATUS.PENDING).length,
    approved: claims.filter(c => c.status === CLAIM_STATUS.APPROVED || c.status === CLAIM_STATUS.PAID).length,
    totalPaid: claims.reduce((sum, c) => sum + (c.status === CLAIM_STATUS.PAID ? parseFloat(c.approvedAmount) : 0), 0)
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="p-6 bg-blue-50 text-blue-600 rounded-full mb-4">
          <FiFileText size={48} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Connect Wallet to View Claims</h2>
        <p className="text-gray-500 mt-2">Please connect your wallet to track or submit insurance claims.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">CLAIMS MANAGEMENT</h1>
          <p className="text-sm text-gray-500">Submit, track and manage your insurance claims on-chain.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={loadData} className="p-2.5 text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm">
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setSubmitClaimModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md transition-all active:scale-95"
          >
            <FiPlus /> New Claim
          </button>
        </div>
      </div>

      {/* Simplified Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Claims" value={stats.total} icon={<FiFileText />} color="text-gray-600" bg="bg-gray-50" />
        <StatCard label="Pending" value={stats.pending} icon={<FiClock />} color="text-amber-600" bg="bg-amber-50" />
        <StatCard label="Approved" value={stats.approved} icon={<FiCheckCircle />} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard label="Total Paid" value={`${stats.totalPaid.toFixed(3)} ETH`} icon={<FiXCircle />} color="text-blue-600" bg="bg-blue-50" />
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-gray-400 mr-2">
          <FiFilter /> <span className="text-xs font-bold uppercase tracking-wider">Filters:</span>
        </div>
        <select 
          value={selectedPolicy} 
          onChange={(e) => setSelectedPolicy(e.target.value)}
          className="bg-gray-50 border-none text-sm rounded-lg focus:ring-2 focus:ring-blue-500 p-2.5"
        >
          <option value="">All Policies</option>
          {policies.map(p => <option key={p.policyId} value={p.policyId}>Policy #{p.policyId}</option>)}
        </select>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-50 border-none text-sm rounded-lg focus:ring-2 focus:ring-blue-500 p-2.5"
        >
          <option value="">All Statuses</option>
          <option value={CLAIM_STATUS.PENDING}>Pending</option>
          <option value={CLAIM_STATUS.APPROVED}>Approved</option>
          <option value={CLAIM_STATUS.REJECTED}>Rejected</option>
          <option value={CLAIM_STATUS.PAID}>Paid</option>
        </select>
      </div>

      {/* Claims Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1,2,3,4].map(i => <div key={i} className="h-48 bg-gray-100 rounded-2xl"></div>)}
        </div>
      ) : filteredClaims.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-100 p-20 text-center">
          <FiFileText size={40} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900">No claims found</h3>
          <p className="text-gray-500">Try changing your filters or submit a new claim.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredClaims.map((claim) => (
            <ClaimCard 
              key={claim.claimId} 
              claim={claim} 
              onProcess={() => { setSelectedClaim(claim); setProcessClaimModalOpen(true); }}
              onRefresh={loadData}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <SubmitClaimModal 
        isOpen={submitClaimModalOpen} 
        onClose={() => setSubmitClaimModalOpen(false)} 
        policies={policies.filter(p => p.status === 0)} 
        onSuccess={loadData} 
      />
      <ProcessClaimModal 
        isOpen={processClaimModalOpen} 
        onClose={() => setProcessClaimModalOpen(false)} 
        claim={selectedClaim} 
        onSuccess={loadData} 
      />
    </div>
  );
}

// Small helper component for Stats
function StatCard({ label, value, icon, color, bg }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
      <div className={`${bg} ${color} p-3 rounded-lg text-xl`}>{icon}</div>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-tight">{label}</p>
        <p className="text-lg font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
