import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useEthersProvider } from "../provider/hooks";
import PlanCard from "../components/Plans/PlanCard";
import PurchaseModal from "../components/Plans/PurchaseModal";
import { contractService, PLAN_TYPES } from "../services/contract";
import {
  FiShield,
  FiZap,
  FiGlobe,
  FiLock,
  FiCheck,
  FiStar,
  FiInfo,
} from "react-icons/fi";

export default function InsurancePlans() {
  const { isConnected } = useAccount();
  const provider = useEthersProvider();

  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);

  useEffect(() => {
    if (provider) loadPlans();
  }, [provider]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const insurancePlans = await contractService.getAllInsurancePlans(provider);
      setPlans(insurancePlans);
    } catch (error) {
      console.error("Error loading plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (plan) => {
    if (!isConnected) {
      alert("Please connect your wallet first");
      return;
    }
    setSelectedPlan(plan);
    setPurchaseModalOpen(true);
  };

  const planFeatures = {
    [PLAN_TYPES.BASIC]: ["Emergency services", "Preventive care", "24/7 helpline support"],
    [PLAN_TYPES.PREMIUM]: ["Specialist consultations", "Dental and vision care", "Mental health services", "Priority support"],
    [PLAN_TYPES.PLATINUM]: ["Global coverage", "Concierge medical services", "Alternative medicine", "All medications covered"],
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Hero Section */}
      <section className="text-center py-10 bg-gradient-to-b from-blue-50/50 to-transparent rounded-3xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
          <FiStar /> Decentralized Protection
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
          CHOOSE YOUR <span className="text-blue-600">COVERAGE</span>
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg">
          Secure your health with blockchain-powered insurance. Instant claims, transparent pricing, and 100% ownership of your data.
        </p>
      </section>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-96 bg-gray-100 animate-pulse rounded-2xl border border-gray-200" />
          ))
        ) : (
          plans.map((plan, index) => (
            <PlanCard
              key={plan.planType}
              plan={plan}
              features={planFeatures[plan.planType] || []}
              popular={index === 1}
              onPurchase={() => handlePurchase(plan)}
            />
          ))
        )}
      </div>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-10 border-t border-gray-100">
        <FeatureItem 
          icon={<FiZap className="text-amber-500" />} 
          title="Instant Claims" 
          desc="Smart contracts process payouts in seconds." 
        />
        <FeatureItem 
          icon={<FiShield className="text-emerald-500" />} 
          title="On-Chain Security" 
          desc="Policy terms are immutable and transparent." 
        />
        <FeatureItem 
          icon={<FiGlobe className="text-blue-500" />} 
          title="Global Access" 
          desc="Manage your health plan from anywhere." 
        />
        <FeatureItem 
          icon={<FiLock className="text-purple-500" />} 
          title="Privacy First" 
          desc="Your medical data stays encrypted on IPFS." 
        />
      </section>

      {/* Simple FAQ / Info */}
      <div className="bg-gray-900 rounded-2xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold italic">Need help selecting a plan?</h2>
            <p className="text-gray-400 max-w-md">Our blockchain experts are available 24/7 to help you understand smart-contract insurance.</p>
          </div>
          <button className="px-8 py-3 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors">
            Contact Support
          </button>
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>
      </div>

      {/* Modals */}
      {selectedPlan && (
        <PurchaseModal
          isOpen={purchaseModalOpen}
          onClose={() => setPurchaseModalOpen(false)}
          plan={selectedPlan}
          onSuccess={() => setPurchaseModalOpen(false)}
        />
      )}
    </div>
  );
}

// Sub-component for clean code
function FeatureItem({ icon, title, desc }) {
  return (
    <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-xl mb-4">
        {icon}
      </div>
      <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}
