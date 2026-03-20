import { useState } from "react";
import {
  FiFileText,
  FiCalendar,
  FiDollarSign,
  FiUser,
  FiExternalLink,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiCheck,
  FiX,
  FiEye,
  FiShield,
  FiLock,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import {
  CLAIM_STATUS,
} from "../../services/contract";

const ClaimCard = ({ claim, onProcess }) => {
  const [expanded, setExpanded] = useState(false);
  const [viewingDocuments, setViewingDocuments] = useState(false);

  // Helper: Status ke hisab se colors set karna
  const getStatusStyles = (status) => {
    switch (status) {
      case CLAIM_STATUS.PENDING:
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          icon: FiClock,
          gradient: "from-amber-500 to-yellow-500",
          text: "Pending Review"
        };
      case CLAIM_STATUS.APPROVED:
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: FiCheck,
          gradient: "from-emerald-500 to-green-500",
          text: "Approved"
        };
      case CLAIM_STATUS.REJECTED:
        return {
          bg: "bg-red-50 text-red-700 border-red-200",
          icon: FiX,
          gradient: "from-red-500 to-rose-500",
          text: "Rejected"
        };
      case CLAIM_STATUS.PAID:
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          icon: FiCheckCircle,
          gradient: "from-blue-500 to-cyan-500",
          text: "Paid"
        };
      default:
        return {
          bg: "bg-gray-50 text-gray-700 border-gray-200",
          icon: FiClock,
          gradient: "from-gray-500 to-gray-600",
          text: "Unknown"
        };
    }
  };

  const statusStyle = getStatusStyles(claim?.status);
  const StatusIcon = statusStyle.icon;

  // Date format karne ke liye helper
  const formatDate = (timestamp) => {
    if (!timestamp || timestamp === "0") return "N/A";
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
  };

  // IPFS Document handle karne ke liye
  const handleViewDocuments = () => {
    if (claim?.ipfsDocuments) {
      window.open(`https://gateway.pinata.cloud/ipfs/${claim.ipfsDocuments}`, "_blank");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
      
      {/* Header Section */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 bg-gradient-to-br ${statusStyle.gradient} rounded-lg flex items-center justify-center text-white shadow-sm`}>
              <StatusIcon size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">Claim #{claim?.claimId || "---"}</h3>
              <p className="text-xs text-gray-500 flex items-center">
                <FiShield className="mr-1 text-green-500" /> Policy: {claim?.policyId || "N/A"}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusStyle.bg}`}>
            {statusStyle.text}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-5">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Requested Amount</p>
            <p className="text-lg font-bold text-blue-600">{claim?.claimAmount || "0"} ETH</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Date Submitted</p>
            <p className="text-sm font-semibold">{formatDate(claim?.submissionDate)}</p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="text-[10px] uppercase text-gray-500 font-bold">Reason/Description</label>
          <p className="text-sm text-gray-700 italic mt-1 line-clamp-2">
            "{claim?.description || "No description provided."}"
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {expanded ? <><FiChevronUp className="mr-1" /> Less</> : <><FiChevronDown className="mr-1" /> Details</>}
          </button>

          {claim?.ipfsDocuments && (
            <button
              onClick={handleViewDocuments}
              className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <FiEye className="mr-1" /> Docs
            </button>
          )}

          {claim?.status === CLAIM_STATUS.PENDING && (
            <button
              onClick={onProcess}
              className="flex items-center px-3 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors ml-auto"
            >
              Review Claim
            </button>
          )}
        </div>
      </div>

      {/* Expandable Section */}
      {expanded && (
        <div className="px-5 pb-5 pt-2 bg-gray-50 border-t border-gray-100">
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Claimant Wallet</p>
              <p className="text-xs font-mono break-all text-gray-600">{claim?.claimant}</p>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2">
              <span className="text-xs text-gray-500">Processed Date:</span>
              <span className="text-xs font-semibold">{claim?.processedDate ? formatDate(claim.processedDate) : "Pending"}</span>
            </div>
            <a 
              href={`https://etherscan.io/address/${claim?.claimant}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center text-[10px] text-blue-500 hover:underline"
            >
              <FiExternalLink className="mr-1" /> View Wallet on Explorer
            </a>
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <div className="bg-gray-50 px-5 py-2 flex justify-between items-center border-t border-gray-100">
        <div className="flex items-center text-[10px] text-gray-400">
          <FiLock className="mr-1" /> Secure IPFS
        </div>
        <div className="text-[10px] text-green-500 font-bold">
          Verified Contract
        </div>
      </div>
    </div>
  );
};

export default ClaimCard;