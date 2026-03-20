import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  FiShield,
  FiPieChart,
  FiBarChart,
  FiCreditCard,
  FiTrendingUp,
  FiTarget,
  FiActivity,
} from "react-icons/fi";

const COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

// Reusable Metric Card for Student-level clarity
const MetricCard = ({ title, value, subtext, icon: Icon, bgColor, textColor }) => (
  <div className={`p-6 rounded-xl border ${bgColor} ${textColor} shadow-sm`}>
    <div className="flex items-center space-x-4">
      <div className="p-3 bg-white/50 rounded-lg">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm font-semibold opacity-80">{title}</div>
        <div className="text-xs opacity-70 mt-1">{subtext}</div>
      </div>
    </div>
  </div>
);

const PolicyAnalytics = ({ data = {}, loading }) => {
  
  // Preparing Data for Charts
  const planData = Object.entries(data.planDistribution || {}).map(([plan, count]) => ({
    name: plan,
    value: count,
  }));

  const coverageData = (data.coverageDistribution || []).map((item) => ({
    policy: `ID: ${item.policyId}`,
    used: item.used,
    remaining: item.remaining,
  }));

  // Simple Tooltip logic
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 shadow-lg rounded-lg p-3">
          <p className="font-bold text-gray-800 border-bottom mb-1">{label}</p>
          {payload.map((pld, index) => (
            <p key={index} style={{ color: pld.color }} className="text-sm">
              {`${pld.name}: ${pld.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-500 font-medium">Loading Policy Analytics...</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-6">
      {/* Header Section */}
      <div className="flex items-center space-x-4 mb-8 border-b pb-4">
        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
          <FiShield className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Policy Portfolio Analytics</h3>
          <p className="text-sm text-gray-500">Overview of active plans and coverage utilization</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Top Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Plan Distribution (Pie Chart) */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <div className="flex items-center space-x-2 mb-4">
              <FiPieChart className="text-purple-600" />
              <h4 className="font-bold text-gray-700">Plan Distribution</h4>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name }) => name}
                  >
                    {planData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Coverage Bar Chart */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <div className="flex items-center space-x-2 mb-4">
              <FiBarChart className="text-orange-600" />
              <h4 className="font-bold text-gray-700">Coverage per Policy</h4>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={coverageData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="policy" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="used" stackId="a" fill="#ef4444" name="Used Amount" />
                  <Bar dataKey="remaining" stackId="a" fill="#10b981" name="Remaining Amount" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Financial Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MetricCard
            title="Total Coverage"
            value={`${(data.totalCoverage || 0).toFixed(2)} ETH`}
            subtext="Total insured amount in the system"
            icon={FiTarget}
            bgColor="bg-blue-50"
            textColor="text-blue-700"
          />
          <MetricCard
            title="Total Claims Used"
            value={`${(data.totalUsedCoverage || 0).toFixed(2)} ETH`}
            subtext="Amount utilized through claims"
            icon={FiTrendingUp}
            bgColor="bg-red-50"
            textColor="text-red-700"
          />
        </div>

        {/* Payment Type Section */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
          <div className="flex items-center space-x-2 mb-6">
            <FiCreditCard className="text-emerald-600" />
            <h4 className="font-bold text-gray-700">Payment Type Statistics</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(data.paymentTypeDistribution || {}).map(([type, count], idx) => (
              <div key={type} className="bg-white p-4 rounded-lg border border-gray-200 text-center shadow-sm">
                <div className="text-xl font-bold" style={{ color: COLORS[idx % COLORS.length] }}>
                  {count}
                </div>
                <div className="text-xs uppercase font-bold text-gray-400 mt-1">{type}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Utilization Progress */}
        <div className="p-6 bg-purple-50 rounded-xl border border-purple-100 text-center">
          <FiActivity className="mx-auto h-8 w-8 text-purple-600 mb-2" />
          <div className="text-3xl font-black text-purple-700">
            {(((data.totalUsedCoverage || 0) / (data.totalCoverage || 1)) * 100).toFixed(1)}%
          </div>
          <div className="font-bold text-purple-600">Global Utilization Rate</div>
          <div className="mt-4 bg-gray-200 rounded-full h-2.5 max-w-md mx-auto">
            <div 
              className="bg-purple-600 h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(((data.totalUsedCoverage || 0) / (data.totalCoverage || 1)) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyAnalytics;