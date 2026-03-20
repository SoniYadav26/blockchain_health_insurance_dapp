import { useState, useMemo } from "react";
import {
  FiShield,
  FiCalendar,
  FiDollarSign,
  FiCreditCard,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiAlertTriangle,
  FiLock,
  FiCheckCircle,
  FiClock,
  FiZap,
} from "react-icons/fi";
import {
  PLAN_TYPES,
  PAYMENT_TYPES,
  POLICY_STATUS,
} from "../../services/contract";

const PolicyCard = ({ policy, onPayPremium, onCancel }) => {
  const [expanded, setExpanded] = useState(false);

  // Memoized policy details for better performance
  const details = useMemo(() => {
    if (!policy) return null;

    const planNames = {
      [PLAN_TYPES.BASIC]: { name: "Basic", color: "text-blue-600", bg: "bg-blue-50" },
      [PLAN_TYPES.PREMIUM]: { name: "Premium", color: "text-purple-600", bg: "bg-purple-50" },
      [PLAN_TYPES.PLATINUM]: { name: "Platinum", color: "text-indigo-600", bg: "bg-indigo-50" },
    };

    const statusConfig = {
      [POLICY_STATUS.ACTIVE]: { label: "Active", icon: <FiCheckCircle />, color: "text-green-600 bg-green-50 border-green-100" },
      [POLICY_STATUS.EXPIRED]: { label: "Expired", icon: <FiAlertTriangle />, color: "text-red-600 bg-red-50 border-red-100" },
      [POLICY_STATUS.CANCELLED]: { label: "Cancelled", icon: <FiX />, color: "text-gray-600 bg-gray-50 border-gray-100" },
    };

    const expiryDate = new Date(parseInt(policy.endDate) * 1000);
    const isExpiringSoon = (expiryDate - new Date()) / (1000 * 60 * 60 * 24) < 7;

    return {
      plan: planNames[policy.planType] || { name: "Unknown", color: "text-gray-600", bg: "bg-gray-50" },
      status: statusConfig[policy.status] || { label: "Unknown", icon: <FiClock />, color: "text-gray-600 bg-gray-50" },
      formattedDate: expiryDate.toLocaleDateString(),
      isExpiringSoon,
      premium: parseFloat(policy.premium).toFixed(4)
    };
  }, [policy]);

  if (!policy) return null;

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-200 p-5 transition-all duration-300 hover:shadow-xl hover:border-indigo-100 overflow-hidden">
      {/* Plan Badge & Status */}
      <div className="flex justify-between items-start mb-4">
        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${details.plan.bg} ${details.plan.color}`}>
          {details.plan.name} Plan
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${details.status.color}`}>
          {details.status.icon}
          {details.status.label}
        </div>
      </div>

      {/* Main Info */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <FiShield className="text-indigo-500" />
          Policy #{policy.id.toString().padStart(4, '0')}
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-gray-400">Premium</span>
            <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
              <FiDollarSign className="text-green-500" /> {details.premium} ETH
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-gray-400">Expiry Date</span>
            <span className={`text-sm font-semibold flex items-center gap-1 ${details.isExpiringSoon ? 'text-orange-500' : 'text-gray-700'}`}>
              <FiCalendar /> {details.formattedDate}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => onPayPremium(policy)}
          className="flex-1 min-w-[120px] inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95"
        >
          <FiCreditCard className="mr-2" /> Pay Premium
        </button>
        
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2.5 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 transition-colors"
        >
          {expanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
        </button>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-dashed border-gray-200 animate-in slide-in-from-top duration-300">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 text-sm">Payment Type:</span>
              <span className="font-medium text-sm">
                {policy.paymentType === PAYMENT_TYPES.MONTHLY ? "Monthly" : "One-Time"}
              </span>
            </div>
            {policy.status === POLICY_STATUS.ACTIVE && (
              <button
                onClick={() => onCancel(policy.id)}
                className="w-full mt-2 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <FiX /> Cancel Policy
              </button>
            )}
          </div>
        </div>
      )}

      {/* Footer Blockchain Status */}
      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between opacity-60">
        <div className="flex items-center gap-1 text-[10px] font-medium text-gray-500 uppercase tracking-tighter">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          On-Chain Verified
        </div>
        <FiLock className="text-gray-400" size={12} />
      </div>
    </div>
  );
};

export default PolicyCard;