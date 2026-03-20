import {
  FiShield,
  FiFileText,
  FiDollarSign,
  FiTrendingUp,
  FiPercent,
  FiTarget,
  FiArrowUp,
  FiArrowDown,
  FiMinus,
} from "react-icons/fi";

const StatsOverview = ({ data = {}, loading }) => {
  // 1. DATA MAPPING: Centralized logic for the "Result" stage
  const stats = [
    {
      name: "Total Policies",
      value: loading ? "..." : data.totalPolicies?.toString() || "0",
      subValue: `${data.activePolicies || 0} active`,
      icon: FiShield,
      color: "indigo",
      change: "+12%",
      status: "positive",
    },
    {
      name: "Total Claims",
      value: loading ? "..." : data.totalClaims?.toString() || "0",
      subValue: `${data.approvedClaims || 0} approved`,
      icon: FiFileText,
      color: "blue",
      change: "+8%",
      status: "positive",
    },
    {
      name: "Total Premiums",
      value: loading ? "..." : `${(data.totalPremiumsPaid || 0).toFixed(4)} ETH`,
      subValue: "Revenue collected",
      icon: FiDollarSign,
      color: "green",
      change: "+23%",
      status: "positive",
    },
    {
      name: "Claims Paid",
      value: loading ? "..." : `${(data.totalApprovedAmount || 0).toFixed(4)} ETH`,
      subValue: "Total payouts",
      icon: FiTrendingUp,
      color: "purple",
      change: "+15%",
      status: "positive",
    },
    {
      name: "Approval Rate",
      value: loading ? "..." : `${(data.claimApprovalRate || 0).toFixed(1)}%`,
      subValue: "Efficiency metric",
      icon: FiPercent,
      color: "emerald",
      change: "+2.1%",
      status: "positive",
    },
    {
      name: "Loss Ratio",
      value: loading ? "..." : `${(data.lossRatio || 0).toFixed(1)}%`,
      subValue: "Claims vs premiums",
      icon: FiTarget,
      color: data.lossRatio > 80 ? "red" : data.lossRatio > 60 ? "yellow" : "green",
      change: data.lossRatio > 80 ? "High risk" : data.lossRatio > 60 ? "Moderate" : "Healthy",
      status: data.lossRatio > 80 ? "negative" : data.lossRatio > 60 ? "neutral" : "positive",
    },
  ];

  // 2. STYLING CONFIGURATION: Refined color palette for professional UI
  const colorMap = {
    indigo: { bg: "from-indigo-50 to-purple-100", text: "text-indigo-600", border: "border-indigo-200", glow: "indigo-500/10" },
    blue: { bg: "from-blue-50 to-cyan-100", text: "text-blue-600", border: "border-blue-200", glow: "blue-500/10" },
    green: { bg: "from-emerald-50 to-green-100", text: "text-emerald-600", border: "border-emerald-200", glow: "emerald-500/10" },
    purple: { bg: "from-purple-50 to-pink-100", text: "text-purple-600", border: "border-purple-200", glow: "purple-500/10" },
    emerald: { bg: "from-emerald-50 to-teal-100", text: "text-emerald-600", border: "border-emerald-200", glow: "emerald-500/10" },
    red: { bg: "from-red-50 to-pink-100", text: "text-red-600", border: "border-red-200", glow: "red-500/10" },
    yellow: { bg: "from-yellow-50 to-orange-100", text: "text-yellow-600", border: "border-yellow-200", glow: "yellow-500/10" },
  };

  const statusMap = {
    positive: { icon: FiArrowUp, style: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    negative: { icon: FiArrowDown, style: "bg-red-50 text-red-700 border-red-200" },
    neutral: { icon: FiMinus, style: "bg-gray-50 text-gray-700 border-gray-200" },
  };

  // 3. SKELETON UI: Consistent with Revenue Analytics loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 bg-white/60 border border-gray-100 rounded-3xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {stats.map((stat, index) => {
        const theme = colorMap[stat.color] || colorMap.indigo;
        const status = statusMap[stat.status];

        return (
          <div
            key={stat.name}
            className="group relative bg-white/90 backdrop-blur-xl border border-white/60 shadow-xl rounded-3xl p-6 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
          >
            {/* Background Glow Overlay */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-${theme.glow} to-transparent rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700`} />

            <div className="relative z-10">
              {/* Header: Icon & Category */}
              <div className="flex items-center space-x-3 mb-5">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${theme.bg} border ${theme.border} ${theme.text} shadow-sm group-hover:scale-110 transition-transform`}>
                  <stat.icon size={20} />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">{stat.name}</h4>
                  <p className="text-[10px] font-medium text-gray-500 mt-1">{stat.subValue}</p>
                </div>
              </div>

              {/* Body: Main Result Metric */}
              <div className="mb-4">
                <span className="text-2xl font-black text-gray-900 tracking-tight">
                  {stat.value}
                </span>
              </div>

              {/* Footer: Trend Analysis */}
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${status.style}`}>
                <status.icon size={12} />
                <span>{stat.change}</span>
              </div>

              {/* Visual Performance Bar (Rates & Ratios) */}
              {(stat.name.includes("Rate") || stat.name.includes("Ratio")) && (
                <div className="mt-4 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${theme.bg.replace('50', '500').replace('100', '600')} transition-all duration-1000 ease-out`}
                    style={{ width: `${Math.min(parseFloat(stat.value) || 0, 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsOverview;