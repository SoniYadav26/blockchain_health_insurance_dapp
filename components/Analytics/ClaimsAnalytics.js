import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  FiTrendingUp,
  FiPieChart,
  FiBarChart,
  FiActivity,
  FiDollarSign,
  FiClock,
  FiTarget,
  FiX,
} from "react-icons/fi";

// Colors Constant - maintain consistency across components
const COLORS = {
  Pending: "#f59e0b",
  Approved: "#10b981",
  Rejected: "#ef4444",
  Paid: "#06b6d4",
  Fallback: "#6b7280",
};

const STATUS_ICONS = {
  Pending: FiClock,
  Approved: FiTarget,
  Rejected: FiX,
  Paid: FiActivity,
};

const ClaimsAnalytics = ({ data = {}, loading }) => {
  // Memoized Status Distribution for Performance
  const statusData = useMemo(() => {
    return Object.entries(data.statusDistribution || {}).map(([status, count]) => ({
      name: status,
      value: count,
    }));
  }, [data.statusDistribution]);

  const monthlyData = data.monthlyClaimsData || [];

  const getColorForStatus = (status) => COLORS[status] || COLORS.Fallback;

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-xl border border-white/50 shadow-2xl rounded-xl p-4">
          <p className="font-bold text-gray-900 mb-2">{label}</p>
          {payload.map((pld, index) => (
            <p key={index} style={{ color: pld.color }} className="text-sm font-semibold">
              {`${pld.dataKey}: ${pld.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-8 animate-pulse">
        <div className="h-12 w-48 bg-gray-200 rounded-lg mb-8"></div>
        <div className="space-y-6">
          <div className="h-64 bg-gray-100 rounded-2xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-32 bg-gray-100 rounded-2xl"></div>
            <div className="h-32 bg-gray-100 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-8">
      {/* Dynamic Background Blurs */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl"></div>
      </div>

      <div className="relative">
        {/* Header Section */}
        <div className="flex items-center space-x-4 mb-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-200 flex items-center justify-center text-white">
            <FiBarChart className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Claims Analytics</h3>
            <p className="text-gray-500 font-medium">Real-time breakdown of insurance settlements</p>
          </div>
        </div>

        <div className="space-y-10">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pie Chart: Status Distribution */}
            <div className="bg-white/40 border border-white/60 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <FiPieChart className="text-purple-600" />
                <h4 className="font-bold text-gray-800">Status Distribution</h4>
              </div>
              <div className="h-72">
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getColorForStatus(entry.name)} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState text="No Status Data" />
                )}
              </div>
            </div>

            {/* Line Chart: Monthly Trends */}
            <div className="bg-white/40 border border-white/60 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <FiTrendingUp className="text-emerald-600" />
                <h4 className="font-bold text-gray-800">Monthly Claims Trend</h4>
              </div>
              <div className="h-72">
                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} dy={10} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#6366f1"
                        strokeWidth={4}
                        dot={{ r: 6, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState text="No trend data available" />
                )}
              </div>
            </div>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              icon={FiDollarSign}
              label="Avg Claim Amount"
              value={`${(data.averageClaimAmount || 0).toFixed(4)} ETH`}
              color="blue"
            />
            <MetricCard
              icon={FiClock}
              label="Avg Processing Time"
              value={`${(data.averageProcessingTime || 0).toFixed(1)} Days`}
              color="emerald"
            />
             <MetricCard
              icon={FiTarget}
              label="Total Claims Value"
              value={`${(data.totalClaimsValue || 0).toFixed(2)} ETH`}
              color="purple"
            />
          </div>

          {/* Status Chips Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(data.statusDistribution || {}).map(([status, count]) => {
              const Icon = STATUS_ICONS[status] || FiActivity;
              const color = getColorForStatus(status);
              return (
                <div key={status} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:border-gray-300 transition-colors">
                  <div 
                    className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center"
                    style={{ backgroundColor: `${color}15`, color: color }}
                  >
                    <Icon size={20} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{status}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Sub-components for cleaner code
const MetricCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: "from-blue-50 to-indigo-50 text-blue-700 border-blue-100 icon-bg-blue-200",
    emerald: "from-emerald-50 to-teal-50 text-emerald-700 border-emerald-100 icon-bg-emerald-200",
    purple: "from-purple-50 to-pink-50 text-purple-700 border-purple-100 icon-bg-purple-200",
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-6 transition-transform hover:-translate-y-1`}>
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-white/80 rounded-xl shadow-sm">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <div className="text-xl font-black">{value}</div>
          <div className="text-sm font-medium opacity-80">{label}</div>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ text }) => (
  <div className="h-full flex flex-col items-center justify-center opacity-40">
    <FiActivity size={48} />
    <p className="mt-2 font-medium">{text}</p>
  </div>
);

export default ClaimsAnalytics;