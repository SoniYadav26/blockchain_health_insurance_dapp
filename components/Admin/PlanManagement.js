import { useState } from "react";
import { useEthersSigner } from "../../provider/hooks";
import { contractService, PLAN_TYPES } from "../../services/contract";
import { uploadJSONToPinata } from "../../services/pinata";
import {
  FiEdit3, FiSave, FiX, FiUpload, FiShield,
  FiDollarSign, FiActivity, FiTarget, FiCheck, FiSettings,
} from "react-icons/fi";
import toast from "react-hot-toast";

const PlanManagement = ({ plans, loading, onRefresh }) => {
  const signer = useEthersSigner();
  const [editingPlan, setEditingPlan] = useState(null);
  const [planData, setPlanData] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingMetadata, setUploadingMetadata] = useState(false);

  // Configuration for consistent UI branding
  const PLAN_CONFIG = {
    [PLAN_TYPES.BASIC]: {
      name: "Basic",
      bg: "from-blue-100 to-cyan-100",
      text: "text-blue-600",
      border: "border-blue-200",
      glow: "from-blue-500/10 to-cyan-500/10",
      features: ["Basic medical coverage", "Emergency services", "Generic medications", "Preventive care"]
    },
    [PLAN_TYPES.PREMIUM]: {
      name: "Premium",
      bg: "from-purple-100 to-pink-100",
      text: "text-purple-600",
      border: "border-purple-200",
      glow: "from-purple-500/10 to-pink-500/10",
      features: ["Comprehensive medical", "Specialist consultations", "Brand medications", "Dental & Vision care", "Mental health"]
    },
    [PLAN_TYPES.PLATINUM]: {
      name: "Platinum",
      bg: "from-yellow-100 to-orange-100",
      text: "text-yellow-600",
      border: "border-yellow-200",
      glow: "from-yellow-500/10 to-orange-500/10",
      features: ["Premium medical", "All specialists", "Global coverage", "Alternative medicine", "Wellness & Mental Health"]
    }
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan.planType);
    setPlanData({ ...plan });
  };

  const handleSavePlan = async () => {
    if (!signer) return toast.error("Please connect your wallet");
    
    try {
      setSaving(true);
      const result = await contractService.updateInsurancePlan(
        editingPlan,
        planData.oneTimePrice,
        planData.monthlyPrice,
        planData.coverageAmount,
        planData.deductible,
        signer
      );

      if (result.success) {
        toast.success("Blockchain record updated!");
        setEditingPlan(null);
        onRefresh();
      }
    } catch (error) {
      toast.error("Smart contract transaction failed");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateMetadata = async (planType) => {
    try {
      setUploadingMetadata(true);
      const config = PLAN_CONFIG[planType];
      
      const metadata = {
        planType: config.name,
        description: `${config.name} strategic health plan`,
        features: config.features,
        lastUpdated: new Date().toISOString(),
      };

      const result = await uploadJSONToPinata(metadata, `plan-${config.name.toLowerCase()}.json`);

      if (result.success) {
        const updateResult = await contractService.updatePlanMetadata(planType, result.ipfsHash, signer);
        if (updateResult.success) {
          toast.success("IPFS Hash sync complete!");
          onRefresh();
        }
      }
    } catch (error) {
      toast.error("Metadata sync failed");
    } finally {
      setUploadingMetadata(false);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse text-gray-500 font-bold">Fetching Blockchain Data...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Plan Governance</h2>
        <p className="text-gray-500">Manage protocol-wide insurance parameters and decentralized metadata.</p>
      </header>

      <div className="grid gap-8">
        {plans.map((plan) => {
          const config = PLAN_CONFIG[plan.planType] || PLAN_CONFIG[PLAN_TYPES.BASIC];
          const isEditing = editingPlan === plan.planType;

          return (
            <div key={plan.planType} className="group relative bg-white border border-gray-100 shadow-2xl rounded-3xl overflow-hidden transition-all hover:border-blue-300">
              <div className="p-8 relative z-10">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${config.bg} ${config.text}`}>
                      <FiShield size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{config.name} Tier</h3>
                      <p className="text-xs font-mono text-gray-400">ID: {plan.planType}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    {isEditing ? (
                      <>
                        <button onClick={handleSavePlan} disabled={saving} className="flex items-center px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition">
                          <FiSave className="mr-2" /> {saving ? "Syncing..." : "Commit"}
                        </button>
                        <button onClick={() => setEditingPlan(null)} className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200"><FiX /></button>
                      </>
                    ) : (
                      <button onClick={() => handleEditPlan(plan)} className="flex items-center px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black transition shadow-lg">
                        <FiEdit3 className="mr-2" /> Adjust Plan
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Pricing and Coverage Fields */}
                  {[
                    { label: "Monthly Premium", key: "monthlyPrice", icon: FiDollarSign, color: "blue" },
                    { label: "Coverage Limit", key: "coverageAmount", icon: FiShield, color: "emerald" },
                    { label: "Annual Deductible", key: "deductible", icon: FiTarget, color: "purple" }
                  ].map((field) => (
                    <div key={field.key} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 transition-colors group-hover:bg-white">
                      <div className={`flex items-center gap-2 mb-2 text-${field.color}-600`}>
                        <field.icon size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{field.label}</span>
                      </div>
                      {isEditing ? (
                        <input 
                          type="number" 
                          className="w-full bg-transparent text-lg font-bold outline-none border-b-2 border-blue-500"
                          value={planData[field.key]}
                          onChange={(e) => setPlanData({...planData, [field.key]: e.target.value})}
                        />
                      ) : (
                        <div className="text-2xl font-black text-gray-900">{plan[field.key]} <span className="text-sm font-normal text-gray-400">ETH</span></div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Metadata Section */}
                <div className="mt-8 pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg text-gray-500"><FiSettings size={18} /></div>
                    <span className="text-sm font-mono text-gray-500">IPFS: {plan.ipfsHash ? `${plan.ipfsHash.slice(0, 12)}...` : "Not Linked"}</span>
                  </div>
                  <button 
                    onClick={() => handleUpdateMetadata(plan.planType)}
                    disabled={uploadingMetadata}
                    className="w-full md:w-auto flex items-center justify-center px-6 py-3 bg-blue-50 text-blue-700 font-bold rounded-2xl hover:bg-blue-100 transition"
                  >
                    <FiUpload className="mr-2" /> {uploadingMetadata ? "Uploading..." : "Sync Metadata"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlanManagement;