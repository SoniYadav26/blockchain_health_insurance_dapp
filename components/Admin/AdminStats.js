import {
  FiRefreshCw,
  FiUsers,
  FiFileText,
  FiDollarSign,
  FiShield,
  FiActivity,
  FiZap,
  FiSettings,
} from "react-icons/fi";

const AdminStats = ({ data, loading, onRefresh }) => {
  // Simple stats array based on Contract Data
  const stats = [
    {
      name: "Contract Balance",
      value: loading ? "..." : `${parseFloat(data?.contractBalance || 0).toFixed(4)} ETH`,
      description: "Available funds in Smart Contract",
      icon: FiDollarSign,
      color: "blue",
    },
    {
      name: "Total Policies",
      value: loading ? "..." : data?.totalPolicies || "0",
      description: "Total policies issued to users",
      icon: FiShield,
      color: "green",
    },
    {
      name: "Total Claims",
      value: loading ? "..." : data?.totalClaims || "0",
      description: "Total claims submitted so far",
      icon: FiFileText,
      color: "purple",
    },
    {
      name: "Total Plans",
      value: loading ? "..." : data?.plans?.length || "0",
      description: "Insurance plans offered",
      icon: FiActivity,
      color: "orange",
    },
  ];

  // Simple color mapping for Tailwind
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
  };

  if (loading) {
    return <div className="p-8 text-center animate-pulse text-gray-500 font-medium">Loading Contract Stats...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
          <p className="text-sm text-gray-500">Overview of Insurance Smart Contract</p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${colorMap[stat.color]}`}>
              <stat.icon size={20} />
            </div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{stat.name}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
            <p className="text-gray-400 text-xs mt-2">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Quick Info Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contract Health */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4 text-emerald-600">
            <FiZap />
            <h3 className="font-bold">System Status</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Contract Status</span>
              <span className="text-emerald-600 font-bold">Active</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Network</span>
              <span className="text-blue-600 font-bold">Local/Testnet</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4 text-blue-600">
            <FiSettings />
            <h3 className="font-bold">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-2 text-xs bg-gray-50 hover:bg-blue-50 border border-gray-100 rounded-lg transition-colors font-medium">Add New Doctor</button>
            <button className="p-2 text-xs bg-gray-50 hover:bg-blue-50 border border-gray-100 rounded-lg transition-colors font-medium">Update Pricing</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;