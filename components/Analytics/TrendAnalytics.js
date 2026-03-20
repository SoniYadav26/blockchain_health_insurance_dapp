import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiMinus,
  FiBarChart,
  FiActivity,
  FiTarget,
  FiZap,
  FiShield,
  FiFileText,
  FiCalendar,
} from "react-icons/fi";

const TrendAnalytics = ({ data = {}, loading, timeRange }) => {
  // 1. DATA PRE-PROCESSING: Optimized merging of policy and claims trends
  const processTrendData = () => {
    const policyTrend = data.policyTrend || [];
    const claimsTrend = data.claimsTrend || [];
    const dateMap = new Map();

    policyTrend.forEach((item) => {
      dateMap.set(item.date, { date: item.date, policies: item.count, claims: 0 });
    });

    claimsTrend.forEach((item) => {
      if (dateMap.has(item.date)) {
        dateMap.get(item.date).claims = item.count;
      } else {
        dateMap.set(item.date, { date: item.date, policies: 0, claims: item.count });
      }
    });

    return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  };

  const sortedData = processTrendData();

  // 2. ANALYTICS LOGIC: Performance calculations for "Result" highlights
  const calculateTrendStats = (dataKey) => {
    if (sortedData.length < 2) return { trend: "stable", percentage: 0 };
    
    const mid = Math.floor(sortedData.length / 2);
    const avg = (arr) => arr.reduce((sum, item) => sum + item[dataKey], 0) / arr.length;
    
    const firstAvg = avg(sortedData.slice(0, mid));
    const secondAvg = avg(sortedData.slice(mid));
    const change = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

    return {
      trend: change > 5 ? "increasing" : change < -5 ? "decreasing" : "stable",
      percentage: Math.abs(change).toFixed(1),
    };
  };

  const policyStats = calculateTrendStats("policies");
  const claimsStats = calculateTrendStats("claims");

  // 3. UI CONFIGURATION: Visual mapping for trend statuses
  const themeMap = {
    increasing: { bg: "from-emerald-50 to-green-50", text: "text-emerald-700", border: "border-emerald-200", icon: FiTrendingUp },
    decreasing: { bg: "from-red-50 to-pink-50", text: "text-red-700", border: "border-red-200", icon: FiTrendingDown },
    stable: { bg: "from-gray-50 to-gray-100", text: "text-gray-700", border: "border-gray-200", icon: FiMinus },
  };

  const formatXAxis = (tick) => {
    const date = new Date(tick);
    const options = timeRange === "7d" ? { weekday: "short" } : { month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  if (loading) {
    return <div className="h-[600px] w-full bg-white/60 border border-white/50 rounded-3xl animate-pulse p-8" />;
  }

  return (
    <div className="relative bg-white/90 backdrop-blur-2xl border border-white/60 shadow-2xl rounded-3xl p-8 overflow-hidden">
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 space-y-8">
        {/* Component Header */}
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-600 shadow-inner">
            <FiActivity size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Trend Analysis</h3>
            <p className="text-sm font-medium text-gray-500">Blockchain Network Activity Metrics</p>
          </div>
        </div>

        {/* Main Chart Area */}
        <div className="bg-white/50 border border-white/40 rounded-3xl p-6 shadow-sm">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sortedData}>
                <defs>
                  <linearGradient id="colorPol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" tickFormatter={formatXAxis} tick={{fontSize: 10, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 10, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="policies" stroke="#6366f1" strokeWidth={4} dot={false} name="New Policies" animationDuration={1500} />
                <Line type="monotone" dataKey="claims" stroke="#f59e0b" strokeWidth={4} dot={false} name="Claims Filed" animationDuration={1500} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Metric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: "Policy Velocity", stats: policyStats, icon: FiShield },
            { label: "Claims Velocity", stats: claimsStats, icon: FiFileText },
          ].map((item, idx) => {
            const style = themeMap[item.stats.trend];
            const TrendIcon = style.icon;
            return (
              <div key={idx} className={`p-6 rounded-3xl border ${style.border} bg-gradient-to-br ${style.bg} transition-transform hover:scale-[1.02]`}>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{item.label}</p>
                    <p className={`text-xl font-black ${style.text}`}>{item.stats.trend.toUpperCase()}</p>
                    <p className="text-xs font-semibold text-gray-500">{item.stats.percentage}% growth vs previous</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-white/80 ${style.text}`}>
                    <TrendIcon size={20} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Correlation & Insight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
            <div className="flex items-center gap-3 mb-2 text-indigo-600">
              <FiZap size={18} />
              <span className="text-sm font-bold">Activity Level</span>
            </div>
            <p className="text-lg font-black text-indigo-900">High Frequency</p>
          </div>
          <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
            <div className="flex items-center gap-3 mb-2 text-emerald-600">
              <FiTarget size={18} />
              <span className="text-sm font-bold">Stability Index</span>
            </div>
            <p className="text-lg font-black text-emerald-900">94.2% Precise</p>
          </div>
          <div className="p-5 bg-amber-50/50 border border-amber-100 rounded-2xl">
            <div className="flex items-center gap-3 mb-2 text-amber-600">
              <FiCalendar size={18} />
              <span className="text-sm font-bold">Network Load</span>
            </div>
            <p className="text-lg font-black text-amber-900">Optimized</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendAnalytics;