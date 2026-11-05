import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useEthersProvider, useEthersSigner } from "../provider/hooks";
import Layout from "../components/Layout/Layout";
import ClaimCard from "../components/Claims/ClaimCard";
import SubmitClaimModal from "../components/Claims/SubmitClaimModal";
import ProcessClaimModal from "../components/Claims/ProcessClaimModal";
import EthAmount from "../components/Common/EthAmount";
import { contractService, CLAIM_STATUS } from "../services/contract";
import {
  FiRefreshCw,
  FiFileText,
  FiPlus,
  FiFilter,
  FiLock,
  FiShield,
  FiZap,
  FiActivity,
  FiTrendingUp,
} from "react-icons/fi";

export default function Claims() {
  const router = useRouter();
  const { policyId } = router.query;
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const effectiveAddress = address;
  const provider = useEthersProvider();
  const signer = useEthersSigner();

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
    if (provider && effectiveAddress && isConnected) {
      loadData();
    }
  }, [isConnected, provider, effectiveAddress]);

  useEffect(() => {
    if (policyId && policies.length > 0) {
      setSelectedPolicy(policyId);
    }
  }, [policyId, policies]);

  useEffect(() => {
    applyFilters();
  }, [claims, selectedPolicy, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load user policies
      const userPolicies = await contractService.getUserPolicies(
        effectiveAddress,
        provider
      );
      setPolicies(userPolicies);

      // Load all claims for user's policies
      let allClaims = [];
      for (const policy of userPolicies) {
        const policyClaims = await contractService.getPolicyClaims(
          policy.policyId,
          provider
        );
        allClaims = [...allClaims, ...policyClaims];
      }

      setClaims(allClaims);
    } catch (error) {
      console.error("Error loading claims data:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...claims];

    if (selectedPolicy) {
      filtered = filtered.filter((claim) => claim.policyId === selectedPolicy);
    }

    if (statusFilter) {
      filtered = filtered.filter(
        (claim) => claim.status.toString() === statusFilter
      );
    }

    // Sort by submission date (newest first)
    filtered.sort(
      (a, b) => parseInt(b.submissionDate) - parseInt(a.submissionDate)
    );

    setFilteredClaims(filtered);
  };

  const handleProcessClaim = (claim) => {
    setSelectedClaim(claim);
    setProcessClaimModalOpen(true);
  };

  const getStatusText = (status) => {
    const texts = {
      [CLAIM_STATUS.PENDING]: "Pending",
      [CLAIM_STATUS.APPROVED]: "Approved",
      [CLAIM_STATUS.REJECTED]: "Rejected",
      [CLAIM_STATUS.PAID]: "Paid",
    };
    return texts[status] || "Unknown";
  };

  const getClaimStats = () => {
    return {
      total: claims.length,
      pending: claims.filter((c) => c.status === CLAIM_STATUS.PENDING).length,
      approved: claims.filter(
        (c) =>
          c.status === CLAIM_STATUS.APPROVED || c.status === CLAIM_STATUS.PAID
      ).length,
      rejected: claims.filter((c) => c.status === CLAIM_STATUS.REJECTED).length,
      totalAmount: claims.reduce(
        (sum, claim) => sum + parseFloat(claim.claimAmount),
        0
      ),
      approvedAmount: claims.reduce((sum, claim) => {
        if (
          claim.status === CLAIM_STATUS.APPROVED ||
          claim.status === CLAIM_STATUS.PAID
        ) {
          return sum + parseFloat(claim.approvedAmount);
        }
        return sum;
      }, 0),
    };
  };

  const stats = getClaimStats();

  if (!isConnected) {
    return (
      <Layout>
        <div className="relative min-h-[600px] flex items-center justify-center">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div
              className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"
              style={{ animationDelay: "4s" }}
            ></div>
          </div>

          <div className="relative text-center max-w-md mx-auto">
            {/* Enhanced Icon */}
            <div className="relative mx-auto mb-8">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center shadow-2xl border border-white/50 backdrop-blur-sm">
                <FiFileText className="h-16 w-16 text-blue-600" />
              </div>

              {/* Floating indicators */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <FiActivity className="h-4 w-4 text-white" />
              </div>

              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 opacity-20 blur-xl animate-pulse"></div>
            </div>

            {/* Enhanced Content */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/50">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Connect Your Wallet
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Secure access to your insurance claims dashboard. Connect your
                Web3 wallet to view and submit insurance claims.
              </p>

              {/* Features list */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3 text-sm text-gray-700">
                  <FiShield className="h-4 w-4 text-blue-600" />
                  <span>Secure claim submission</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-700">
                  <FiZap className="h-4 w-4 text-emerald-600" />
                  <span>Real-time claim tracking</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-700">
                  <FiLock className="h-4 w-4 text-purple-600" />
                  <span>Blockchain-verified processing</span>
                </div>
              </div>

              {/* Connect button */}
              <button
                type="button"
                onClick={() => openConnectModal?.()}
                className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <FiLock className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Connect Wallet</span>
                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Insurance Claims
            </h1>
            <p className="mt-2 text-gray-600">
              Submit and track your insurance claims
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="group inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg text-sm font-medium rounded-xl text-gray-700 hover:bg-white hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-300"
            >
              <FiRefreshCw
                className={`-ml-1 mr-2 h-4 w-4 ${
                  loading ? "animate-spin" : ""
                } group-hover:scale-110 transition-transform`}
              />
              Refresh
            </button>
            <button
              onClick={() => setSubmitClaimModalOpen(true)}
              className="group inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <FiPlus className="-ml-1 mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              Submit Claim
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5"></div>
            <div className="relative p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FiFileText className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Claims
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {stats.total}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5"></div>
            <div className="relative p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 animate-pulse"></div>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Pending
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {stats.pending}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5"></div>
            <div className="relative p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-500 to-green-500"></div>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Approved
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      {stats.approved}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
            <div className="relative p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FiTrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Approved Amount
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900">
                      <EthAmount value={stats.approvedAmount} />
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl">
          <div className="px-6 py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <FiFilter className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex flex-wrap gap-6">
                <div>
                  <label
                    htmlFor="policy-filter"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Filter by Policy
                  </label>
                  <select
                    id="policy-filter"
                    value={selectedPolicy}
                    onChange={(e) => setSelectedPolicy(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base bg-white/50 backdrop-blur-sm border border-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl shadow-sm transition-all duration-300"
                  >
                    <option value="">All Policies</option>
                    {policies.map((policy) => (
                      <option key={policy.policyId} value={policy.policyId}>
                        Policy #{policy.policyId}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="status-filter"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Filter by Status
                  </label>
                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base bg-white/50 backdrop-blur-sm border border-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-xl shadow-sm transition-all duration-300"
                  >
                    <option value="">All Statuses</option>
                    <option value={CLAIM_STATUS.PENDING}>Pending</option>
                    <option value={CLAIM_STATUS.APPROVED}>Approved</option>
                    <option value={CLAIM_STATUS.REJECTED}>Rejected</option>
                    <option value={CLAIM_STATUS.PAID}>Paid</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Claims List */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-6">
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-1/2 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4"></div>
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/2"></div>
                  </div>
                  <div className="mt-6 flex space-x-3">
                    <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl flex-1"></div>
                    <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl flex-1"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredClaims.length === 0 ? (
          <div className="relative">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl animate-pulse"></div>
              <div
                className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl animate-pulse"
                style={{ animationDelay: "2s" }}
              ></div>
            </div>

            <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-12 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6">
                <FiFileText className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {claims.length === 0
                  ? "No claims submitted"
                  : "No claims match your filters"}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                {claims.length === 0
                  ? "You haven't submitted any insurance claims yet. Submit your first claim to get started."
                  : "Try adjusting your filters to see more claims."}
              </p>
              {claims.length === 0 && (
                <button
                  onClick={() => setSubmitClaimModalOpen(true)}
                  className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <FiFileText className="-ml-1 mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Submit Your First Claim
                  <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredClaims.map((claim) => (
              <ClaimCard
                key={claim.claimId}
                claim={claim}
                onProcess={() => handleProcessClaim(claim)}
                onRefresh={loadData}
              />
            ))}
          </div>
        )}
      </div>

      {/* Submit Claim Modal */}
      <SubmitClaimModal
        isOpen={submitClaimModalOpen}
        onClose={() => setSubmitClaimModalOpen(false)}
        policies={policies.filter((p) => p.status === 0)} // Only active policies
        onSuccess={() => {
          setSubmitClaimModalOpen(false);
          loadData();
        }}
      />

      {/* Process Claim Modal */}
      <ProcessClaimModal
        isOpen={processClaimModalOpen}
        onClose={() => setProcessClaimModalOpen(false)}
        claim={selectedClaim}
        onSuccess={() => {
          setProcessClaimModalOpen(false);
          loadData();
        }}
      />
    </Layout>
  );
}
