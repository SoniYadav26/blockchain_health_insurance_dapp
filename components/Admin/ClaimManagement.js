import { useState, useEffect } from "react";
import { useEthersSigner } from "../../provider/hooks";
import {
  contractService,
  CLAIM_STATUS,
} from "../../services/contract";
import {
  FiFileText,
  FiCheck,
  FiX,
  FiEye,
  FiClock,
  FiDollarSign,
  FiFilter,
  FiRefreshCw,
  FiActivity,
} from "react-icons/fi";
import toast from "react-hot-toast";

const ClaimManagement = () => {
  const signer = useEthersSigner();
  const [processingClaim, setProcessingClaim] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [approvedAmount, setApprovedAmount] = useState("");

  const [allClaims, setAllClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (signer) {
      fetchClaims();
    }
  }, [signer]);

  const fetchClaims = async () => {
    if (!signer) return;
    setLoading(true);
    try {
      const result = await contractService.fetchClaimsWithEvents(signer);
      if (result.success) {
        setAllClaims(result.claims);
      } else {
        toast.error("Failed to fetch claims from blockchain");
      }
    } catch (error) {
      console.error("Error fetching claims:", error);
      toast.error("Blockchain connection error");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchClaims();
    setRefreshing(false);
    toast.success("Data Refreshed");
  };

  const handleProcessClaim = async (claimId, newStatus, amount = "0") => {
    try {
      setProcessingClaim(claimId);

      let finalAmount = "0";
      if (newStatus === CLAIM_STATUS.APPROVED) {
        if (!amount || parseFloat(amount) <= 0) {
          toast.error("Please enter a valid amount");
          return;
        }
        finalAmount = amount.toString();
      }

      const result = await contractService.processClaim(
        claimId,
        newStatus,
        finalAmount,
        signer
      );

      if (result.success) {
        toast.success(`Claim ${newStatus === CLAIM_STATUS.APPROVED ? "Approved" : "Rejected"}`);
        await fetchClaims();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Transaction failed");
    } finally {
      setProcessingClaim(null);
      setSelectedClaim(null);
      setApprovedAmount("");
    }
  };

  // Helper functions
  const formatDate = (ts) => ts ? new Date(ts).toLocaleDateString() : "N/A";
  const formatAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const filteredClaims = allClaims.filter((c) => {
    if (statusFilter === "all") return true;
    return statusFilter === "pending" ? c.status === CLAIM_STATUS.PENDING : c.status !== CLAIM_STATUS.PENDING;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
          <p className="text-gray-500 text-sm">Review and Process Insurance Claims</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
          Refresh Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg"><FiClock size={24}/></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pending Review</p>
            <p className="text-xl font-bold">{allClaims.filter(c => c.status === CLAIM_STATUS.PENDING).length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg"><FiCheck size={24}/></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Claims</p>
            <p className="text-xl font-bold">{allClaims.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><FiDollarSign size={24}/></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Filter View</p>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm font-bold bg-transparent outline-none cursor-pointer"
            >
              <option value="pending">Pending Only</option>
              <option value="processed">Processed</option>
              <option value="all">View All</option>
            </select>
          </div>
        </div>
      </div>

      {/* Claims List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Claim ID</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Claimant</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Amount</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-400">Loading blockchain data...</td></tr>
              ) : filteredClaims.map((claim) => (
                <tr key={claim.claimId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium">#{claim.claimId}</td>
                  <td className="px-6 py-4 text-gray-600 font-mono text-xs">{formatAddress(claim.claimant)}</td>
                  <td className="px-6 py-4 font-bold text-gray-800">{claim.claimAmount} ETH</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      claim.status === CLAIM_STATUS.PENDING ? "bg-yellow-50 text-yellow-600 border-yellow-100" :
                      claim.status === CLAIM_STATUS.APPROVED ? "bg-green-50 text-green-600 border-green-100" :
                      "bg-gray-50 text-gray-600 border-gray-100"
                    }`}>
                      {claim.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {claim.status === CLAIM_STATUS.PENDING ? (
                        <>
                          <button 
                            onClick={() => { setSelectedClaim(claim); setApprovedAmount(claim.claimAmount); }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <FiCheck />
                          </button>
                          <button 
                            onClick={() => handleProcessClaim(claim.claimId, CLAIM_STATUS.REJECTED)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <FiX />
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No actions</span>
                      )}
                      {claim.ipfsDocuments && (
                        <button 
                          onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${claim.ipfsDocuments}`, "_blank")}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Docs"
                        >
                          <FiEye />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simplified Approval Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Process Approval</h3>
            <p className="text-gray-500 text-sm mb-4">Confirm final payout for Claim #{selectedClaim.claimId}</p>
            
            <label className="block text-sm font-semibold text-gray-700 mb-1">Approved Amount (ETH)</label>
            <input
              type="number"
              value={approvedAmount}
              onChange={(e) => setApprovedAmount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => handleProcessClaim(selectedClaim.claimId, CLAIM_STATUS.APPROVED, approvedAmount)}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Confirm Payout
              </button>
              <button
                onClick={() => setSelectedClaim(null)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClaimManagement;