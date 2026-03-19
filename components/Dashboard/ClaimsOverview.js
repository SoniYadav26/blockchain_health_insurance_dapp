import { FiRefreshCw, FiFileText, FiClock, FiCheck, FiX } from "react-icons/fi";
import { CLAIM_STATUS } from "../../services/contract";

const ClaimsOverview = ({ claims = [], loading = false, onRefresh }) => {
  
  // Simple function to get status label and color
  const getStatusDetails = (status) => {
    switch (status) {
      case CLAIM_STATUS.PENDING:
        return { text: "Pending", color: "text-yellow-600 bg-yellow-100", Icon: FiClock };
      case CLAIM_STATUS.APPROVED:
        return { text: "Approved", color: "text-green-600 bg-green-100", Icon: FiCheck };
      case CLAIM_STATUS.REJECTED:
        return { text: "Rejected", color: "text-red-600 bg-red-100", Icon: FiX };
      case CLAIM_STATUS.PAID:
        return { text: "Paid", color: "text-blue-600 bg-blue-100", Icon: FiCheck };
      default:
        return { text: "Unknown", color: "text-gray-600 bg-gray-100", Icon: FiClock };
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp || timestamp === "0") return "N/A";
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <FiFileText className="text-blue-600" /> Recent Claims
        </h3>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
        >
          <FiRefreshCw className={`${loading ? "animate-spin" : ""} text-gray-600`} />
        </button>
      </div>

      <div className="p-6">
        {loading ? (
          <p className="text-center text-gray-500">Loading claims...</p>
        ) : claims.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">No claims found.</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Submit Your First Claim
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.slice(0, 3).map((claim, index) => {
              const { text, color, Icon } = getStatusDetails(claim.status);
              return (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${color}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Claim #{claim.claimId || "N/A"}</p>
                      <p className="text-xs text-gray-500 italic truncate w-40">
                        {claim.description || "No description"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-blue-700">{parseFloat(claim.claimAmount || 0).toFixed(4)} ETH</p>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${color}`}>
                      {text}
                    </span>
                    <p className="text-[10px] text-gray-400 mt-1">{formatDate(claim.submissionDate)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimsOverview;