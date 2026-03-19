import {
  FiShield,
  FiFileText,
  FiDollarSign,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";
import { POLICY_STATUS, CLAIM_STATUS } from "../../services/contract";

const StatsCards = ({
  userPolicies = [],
  userClaims = [],
  loading = false,
}) => {
  // Logic: User stats calculate karna
  const activePolicies = userPolicies.filter(
    (p) => p.status === POLICY_STATUS.ACTIVE
  ).length;

  const pendingClaims = userClaims.filter(
    (c) => c.status === CLAIM_STATUS.PENDING
  ).length;

  const totalCoverage = userPolicies.reduce((sum, policy) => {
    return policy.status === POLICY_STATUS.ACTIVE 
      ? sum + parseFloat(policy.coverageAmount || 0) 
      : sum;
  }, 0);

  const totalPaid = userPolicies.reduce(
    (sum, policy) => sum + parseFloat(policy.totalPaid || 0),
    0
  );

  const stats = [
    {
      name: "Active Policies",
      value: activePolicies.toString(),
      icon: FiShield,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      name: "Total Coverage",
      value: `${totalCoverage.toFixed(2)} ETH`,
      icon: FiDollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      name: "Pending Claims",
      value: pendingClaims.toString(),
      icon: FiFileText,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      name: "Total Paid",
      value: `${totalPaid.toFixed(4)} ETH`,
      icon: FiTrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            {/* Live Indicator */}
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Live</span>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">{stat.name}</p>
            {loading ? (
              <div className="h-8 w-24 bg-gray-100 animate-pulse rounded mt-1"></div>
            ) : (
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </h3>
                <FiZap className="text-blue-400 size-3" />
              </div>
            )}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
             <span className="text-[11px] text-gray-400 font-medium italic">Verified On-Chain</span>
             <button className="text-xs font-bold text-blue-600 hover:underline">Details →</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;