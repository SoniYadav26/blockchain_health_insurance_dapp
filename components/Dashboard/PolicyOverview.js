import { FiRefreshCw, FiShield, FiCalendar, FiDollarSign, FiStar } from "react-icons/fi";
import { TfiCrown } from "react-icons/tfi";
import { POLICY_STATUS, PLAN_TYPES } from "../../services/contract";

const PolicyOverview = ({ policies = [], loading = false, onRefresh }) => {
  
  // Simple function to get Plan Details
  const getPlanDetails = (planType) => {
    switch (planType) {
      case PLAN_TYPES.BASIC:
        return { name: "Basic", icon: FiShield, color: "bg-blue-100 text-blue-600" };
      case PLAN_TYPES.PREMIUM:
        return { name: "Premium", icon: FiStar, color: "bg-purple-100 text-purple-600" };
      case PLAN_TYPES.PLATINUM:
        return { name: "Platinum", icon: TfiCrown, color: "bg-amber-100 text-amber-600" };
      default:
        return { name: "General", icon: FiShield, color: "bg-gray-100 text-gray-600" };
    }
  };

  // Simple function for Status
  const getStatusStyle = (status) => {
    switch (status) {
      case POLICY_STATUS.ACTIVE:
        return "bg-green-100 text-green-700 border-green-200";
      case POLICY_STATUS.EXPIRED:
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp || timestamp === "0") return "N/A";
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
        <div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FiShield className="text-purple-600" /> My Policies
          </h3>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FiRefreshCw className={`${loading ? "animate-spin" : ""} text-gray-600`} />
        </button>
      </div>

      <div className="p-6">
        {loading ? (
          <p className="text-center text-gray-500 py-10">Loading your policies...</p>
        ) : policies.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">No active policies found.</p>
            <button className="text-purple-600 font-semibold text-sm hover:underline">
              Browse Plans &rarr;
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {policies.slice(0, 3).map((policy, index) => {
              const plan = getPlanDetails(policy.planType);
              const PlanIcon = plan.icon;

              return (
                <div key={index} className="p-4 border border-gray-100 rounded-xl hover:shadow-sm transition-shadow bg-gray-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${plan.color}`}>
                        <PlanIcon size={18} />
                      </div>
                      <span className="font-bold text-gray-900">
                        {plan.name} Plan #{policy.policyId || "0"}
                      </span>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold border ${getStatusStyle(policy.status)}`}>
                      {policy.status === POLICY_STATUS.ACTIVE ? "ACTIVE" : "EXPIRED"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiDollarSign className="text-gray-400" />
                      <span>Coverage: <strong>{parseFloat(policy.coverageAmount || 0).toFixed(2)} ETH</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiCalendar className="text-gray-400" />
                      <span>Expires: <strong>{formatDate(policy.endDate)}</strong></span>
                    </div>
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

export default PolicyOverview;