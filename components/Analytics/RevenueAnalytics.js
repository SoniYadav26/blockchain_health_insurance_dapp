import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  FiDollarSign,
  FiTrendingUp,
  FiBarChart,
  FiTarget,
  FiActivity,
  FiPieChart,
  FiShield,
  FiZap,
} from "react-icons/fi";

const RevenueAnalytics = ({ data = {}, loading, timeRange }) => {
  // 1. LOADING STATE: Skeleton UI with Pulsing Effects
  if (loading) {
    return (
      <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 shadow-xl rounded-2xl p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-12 w-1/4 bg-gray-200 rounded-lg"></div>
          <div className="h-96 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
          <div className="grid grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 2. DATA PREPARATION: Ensuring stability for the Result metrics
  const monthlyData = data?.monthlyRevenueData || [];
  const revenueByPlan = data?.revenueByPlan || {};
  const totalRevenue = data?.totalRevenue || 0;

  const revenueByPlanData = Object.entries(revenueByPlan).map(([plan, revenue]) => ({
    plan,
    revenue: parseFloat(revenue),
  }));

  // 3. CUSTOM TOOLTIP: Enhanced Visibility
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-xl border border-emerald-500/30 shadow-2xl rounded-xl p-4">
          <p className="font-bold text-gray-900 mb-2">{label}</p>
          {payload.map((pld, index) => (
            <p key={index} style={{ color: pld.color }} className="text-sm font-bold">
              {`${pld.name}: ${parseFloat(pld.value).toFixed(4)} ETH`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative bg-white/90 backdrop-blur-2xl border border-white/60 shadow-2xl rounded-3xl p-8 transition-all duration-500">
      {/* Dynamic Background Accents */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl -z-10">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative">
        {/* HEADER SECTION */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center space-x-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
              <FiDollarSign className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Revenue Analytics
              </h3>
              <p className="text-gray-500 font-medium">Real-time Performance Metrics</p>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          {/* ACTION: Revenue Trend Visualization */}
          <div className="bg-white/50 backdrop-blur-md border border-white/40 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center space-x-3 mb-8">
              <FiTrendingUp className="text-emerald-500 h-6 w-6" />
              <h4 className="text-xl font-bold text-gray-800">Growth Trajectory</h4>
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} tickFormatter={(v) => `${v} ETH`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RESULT: Key Performance Indicators (KPIs) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Total Revenue Card */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-700 rounded-3xl p-7 text-white shadow-xl hover:scale-[1.02] transition-transform">
              <div className="flex justify-between items-start">
                <div>
                  <p className="opacity-80 text-sm font-semibold uppercase tracking-wider">Total Revenue</p>
                  <h4 className="text-3xl font-bold mt-2">{totalRevenue.toFixed(4)} ETH</h4>
                </div>
                <FiZap className="h-8 w-8 opacity-50" />
              </div>
              <div className="mt-4 pt-4 border-t border-white/20 text-xs font-medium">
                Confirmed Blockchain Transactions
              </div>
            </div>

            {/* Average Revenue Card */}
            <div className="bg-white border border-gray-100 rounded-3xl p-7 shadow-xl hover:shadow-2xl transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Avg / Policy</p>
                  <h4 className="text-3xl font-bold text-gray-900 mt-2">
                    {(data.averageRevenuePerPolicy || 0).toFixed(4)} ETH
                  </h4>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                  <FiTarget size={24} />
                </div>
              </div>
            </div>

            {/* Growth Rate Card */}
            <div className="bg-white border border-gray-100 rounded-3xl p-7 shadow-xl hover:shadow-2xl transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Growth Rate</p>
                  <h4 className="text-3xl font-bold text-emerald-600 mt-2">+23.5%</h4>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                  <FiTrendingUp size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* PLAN BREAKDOWN: Progress Analysis */}
          <div className="bg-gray-50/50 rounded-3xl p-8 border border-gray-100">
            <h4 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FiPieChart className="text-purple-500" /> Revenue Distribution
            </h4>
            <div className="space-y-5">
              {Object.entries(revenueByPlan).map(([plan, revenue]) => {
                const percentage = totalRevenue > 0 ? (parseFloat(revenue) / totalRevenue) * 100 : 0;
                return (
                  <div key={plan} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-gray-700">{plan} Plan</span>
                      <span className="font-mono font-bold text-emerald-600">{parseFloat(revenue).toFixed(4)} ETH</span>
                    </div>
                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueAnalytics;