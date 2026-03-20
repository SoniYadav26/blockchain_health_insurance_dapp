import { 
  FiCheck, FiStar, FiShield, FiZap, FiCrown, 
  FiLock, FiTrendingUp, FiAward 
} from "react-icons/fi";
import { PLAN_TYPES } from "../../services/contract";

/**
 * Configuration for Plan Visuals
 * Separating data from logic to keep the component clean.
 */
const PLAN_CONFIG = {
  [PLAN_TYPES.BASIC]: {
    name: "Basic",
    icon: FiShield,
    color: "indigo",
    desc: "Essential blockchain-secured coverage for basic healthcare needs.",
    styles: {
      border: "border-gray-200/50 hover:border-indigo-300/50 hover:shadow-indigo-500/10",
      gradient: "from-indigo-500 to-blue-600",
      bgGradient: "from-indigo-50 to-blue-50",
      button: "from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700",
      accent: "text-indigo-600",
    }
  },
  [PLAN_TYPES.PREMIUM]: {
    name: "Premium",
    icon: FiAward,
    color: "purple",
    desc: "Comprehensive smart contract protection with enhanced benefits.",
    styles: {
      border: "border-purple-400/50 ring-2 ring-purple-500/30 shadow-purple-500/20",
      gradient: "from-purple-500 to-violet-600",
      bgGradient: "from-purple-50 to-violet-50",
      button: "from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700",
      accent: "text-purple-600",
    }
  },
  [PLAN_TYPES.PLATINUM]: {
    name: "Platinum",
    icon: FiCrown,
    color: "gold",
    desc: "Ultimate decentralized coverage with premium blockchain features.",
    styles: {
      border: "border-gray-200/50 hover:border-amber-300/50 hover:shadow-amber-500/10",
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-50 to-orange-50",
      button: "from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
      accent: "text-amber-600",
    }
  }
};

const PlanCard = ({ plan, features = [], popular = false, onPurchase }) => {
  const type = plan?.planType ?? PLAN_TYPES.BASIC;
  const config = PLAN_CONFIG[type] || PLAN_CONFIG[PLAN_TYPES.BASIC];
  const PlanIcon = config.icon;

  // Formatting values
  const oneTimePrice = parseFloat(plan?.oneTimePrice || "0.5").toFixed(2);
  const monthlyPrice = parseFloat(plan?.monthlyPrice || "0.045").toFixed(3);
  const coverage = parseFloat(plan?.coverageAmount || "10").toFixed(0);
  const deductible = parseFloat(plan?.deductible || "0.1").toFixed(2);

  const displayFeatures = features.length > 0 ? features : [
    "24/7 Emergency Coverage",
    "Preventive Care Included",
    "Prescription Drug Coverage",
    config.name === "Basic" ? "Regional Coverage" : "Global Coverage",
    config.name === "Platinum" ? "Priority Claim Processing" : "Standard Processing"
  ];

  return (
    <div className="group relative">
      {/* Background Glow Effect */}
      <div className={`absolute -inset-1 bg-gradient-to-r ${config.styles.gradient} rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300`} />

      <div className={`relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl ${config.styles.border} border p-8 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] overflow-hidden`}>
        
        {/* Visual Polish */}
        <div className={`absolute inset-0 bg-gradient-to-br ${config.styles.bgGradient} opacity-30`} />
        
        {popular && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${config.styles.gradient} shadow-lg border-2 border-white`}>
              <FiStar className="w-4 h-4 mr-1 animate-pulse" /> Most Popular
            </div>
          </div>
        )}

        <div className="relative text-center">
          {/* Header */}
          <header className="flex flex-col items-center mb-6">
            <div className={`w-16 h-16 bg-gradient-to-br ${config.styles.gradient} rounded-2xl flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <PlanIcon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">
              {config.name} {config.name === "Platinum" && "✨"}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed px-4">{config.desc}</p>
          </header>

          {/* Pricing Tier */}
          <section className="mb-8 p-6 bg-white/50 backdrop-blur-sm rounded-xl border border-white/50">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-4xl font-bold text-gray-900">{oneTimePrice}</span>
              <div className="flex flex-col items-start">
                <span className="text-lg font-semibold text-gray-600">ETH</span>
                <span className="text-xs text-gray-500 font-bold uppercase">Annual</span>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500 font-medium">
              or <span className="text-gray-900 font-bold">{monthlyPrice} ETH</span>/month
            </div>
          </section>

          {/* Core Metrics */}
          <section className="mb-8 grid grid-cols-2 gap-4">
            <MetricCard label="Coverage" value={`${coverage} ETH`} icon={<FiShield/>} color={config.styles.accent} />
            <MetricCard label="Deductible" value={`${deductible} ETH`} icon={<FiTrendingUp/>} />
          </section>

          {/* Feature List */}
          <section className="mb-8 text-left space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-4">On-Chain Benefits</p>
            {displayFeatures.map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-gray-700 text-sm group/item">
                <div className={`shrink-0 w-5 h-5 rounded-full bg-gradient-to-r ${config.styles.gradient} flex items-center justify-center`}>
                  <FiCheck className="text-white w-3 h-3" />
                </div>
                <span className="group-hover/item:text-black transition-colors">{f}</span>
              </div>
            ))}
          </section>

          {/* CTA Action */}
          <button
            onClick={onPurchase}
            className={`relative w-full py-4 rounded-xl font-bold text-white text-lg bg-gradient-to-r ${config.styles.button} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.03] overflow-hidden group/btn`}
          >
            <div className="relative z-10 flex items-center justify-center gap-2">
              <FiLock className="w-5 h-5" /> 
              <span>Select {config.name}</span>
            </div>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
          </button>

          {/* Trust Badge */}
          <footer className="mt-6 flex items-center justify-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
            <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/> Verified Contract</span>
            <span className="flex items-center gap-1"><FiZap/> Gas Optimized</span>
          </footer>
        </div>
      </div>
    </div>
  );
};

// Sub-component for Metrics
const MetricCard = ({ label, value, icon, color }) => (
  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
    <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-gray-400 uppercase mb-1">
      {icon} {label}
    </div>
    <div className={`text-lg font-bold ${color || 'text-gray-900'}`}>{value}</div>
  </div>
);

export default PlanCard;