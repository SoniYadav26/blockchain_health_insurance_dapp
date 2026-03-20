import { useState, useEffect, useMemo, useCallback } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  FiX, FiUpload, FiCheck, FiFileText, FiShield, 
  FiLock, FiUser, FiCalendar, FiDollarSign, 
  FiActivity, FiCheckCircle, FiAlertTriangle
} from "react-icons/fi";
import { useEthersSigner } from "../../provider/hooks";
import { contractService, PLAN_TYPES } from "../../services/contract";
import { uploadToPinata, uploadJSONToPinata } from "../../services/pinata";
import toast from "react-hot-toast";

/**
 * @component SubmitClaimModal
 * @description Multi-step process for users to submit insurance claims with IPFS integration.
 */
const SubmitClaimModal = ({ isOpen, onClose, policies = [], onSuccess }) => {
  const signer = useEthersSigner();
  
  // --- State Management ---
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [formData, setFormData] = useState({
    policyId: "",
    claimAmount: "",
    description: "",
    claimType: "",
    dateOfService: "",
    providerName: "",
    providerAddress: "",
    diagnosis: "",
    treatmentDetails: "",
  });

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setDocuments([]);
      setFormData({
        policyId: "", claimAmount: "", description: "", claimType: "",
        dateOfService: "", providerName: "", providerAddress: "",
        diagnosis: "", treatmentDetails: "",
      });
    }
  }, [isOpen]);

  // --- Helpers ---
  const selectedPolicy = useMemo(() => 
    policies.find((p) => p.policyId === formData.policyId), 
    [policies, formData.policyId]
  );

  const getPlanName = (type) => {
    const names = { [PLAN_TYPES.BASIC]: "Basic", [PLAN_TYPES.PREMIUM]: "Premium", [PLAN_TYPES.PLATINUM]: "Platinum" };
    return names[type] || "Unknown";
  };

  const handleInputChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  // --- Logic: IPFS Upload (Action) ---
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    try {
      const uploads = await Promise.all(files.map(file => 
        uploadToPinata(file, { name: `claim-doc-${Date.now()}-${file.name}` })
      ));
      
      const newDocs = uploads.filter(r => r.success).map((r, i) => ({
        name: files[i].name,
        ipfsHash: r.ipfsHash,
        url: r.url,
        size: files[i].size
      }));

      setDocuments(prev => [...prev, ...newDocs]);
      toast.success(`${newDocs.length} files uploaded to IPFS`);
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // --- Logic: Blockchain Submission (Result) ---
  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Upload Full Metadata to IPFS
      const metadata = { ...formData, documents, submissionDate: new Date().toISOString() };
      const metaResult = await uploadJSONToPinata(metadata, `claim-meta-${Date.now()}.json`);

      if (!metaResult.success) throw new Error("Metadata sync failed");

      // 2. Execute Smart Contract Transaction
      const result = await contractService.submitClaim(
        formData.policyId,
        formData.claimAmount,
        metaResult.ipfsHash,
        formData.description,
        signer
      );

      if (result.success) {
        toast.success("Claim anchored to blockchain!");
        onSuccess?.();
        onClose();
      } else throw new Error(result.error);
    } catch (err) {
      toast.error(err.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  // --- Validation ---
  const isStepValid = () => {
    if (step === 1) return formData.policyId && formData.claimAmount && formData.claimType;
    if (step === 2) return formData.dateOfService && formData.providerName;
    return true;
  };

  if (!isOpen) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden relative border border-gray-100">
                
                {/* Header Section */}
                <header className="p-8 border-b bg-gray-50 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200"><FiFileText size={24}/></div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">New Insurance Claim</h3>
                      <p className="text-sm text-gray-500 font-medium">Step {step} of 3: {step === 1 ? 'Information' : step === 2 ? 'Medical' : 'Review'}</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><FiX size={20}/></button>
                </header>

                <main className="p-8 min-h-[450px]">
                  {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Active Policy</label>
                          <select 
                            className="w-full p-4 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                            value={formData.policyId}
                            onChange={(e) => handleInputChange("policyId", e.target.value)}
                          >
                            <option value="">Choose your policy...</option>
                            {policies.map(p => (
                              <option key={p.policyId} value={p.policyId}>
                                {getPlanName(p.planType)} Plan #{p.policyId} ({parseFloat(p.coverageAmount).toFixed(2)} ETH)
                              </option>
                            ))}
                          </select>
                        </div>
                        <InputGroup label="Claim Amount (ETH)" type="number" value={formData.claimAmount} onChange={(val) => handleInputChange("claimAmount", val)} placeholder="0.00" />
                        <div className="flex flex-col">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Claim Type</label>
                          <select 
                            className="w-full p-4 bg-gray-50 border rounded-xl outline-none font-medium"
                            value={formData.claimType}
                            onChange={(e) => handleInputChange("claimType", e.target.value)}
                          >
                            <option value="">Select Type...</option>
                            <option value="medical">Medical Treatment</option>
                            <option value="surgery">Surgery</option>
                            <option value="pharmacy">Pharmacy</option>
                          </select>
                        </div>
                      </div>
                      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3 text-blue-800 text-sm">
                        <FiShield size={20} className="shrink-0"/>
                        <div>
                          <p className="font-bold">Policy Protection Active</p>
                          <p>Claims are processed via smart contract. Ensure all details match your hospital bills.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputGroup label="Date of Service" type="date" value={formData.dateOfService} onChange={(val) => handleInputChange("dateOfService", val)} />
                        <InputGroup label="Provider Name" value={formData.providerName} onChange={(val) => handleInputChange("providerName", val)} placeholder="Hospital or Doctor Name" />
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Treatment Details</label>
                          <textarea 
                            rows="4" 
                            className="w-full p-4 bg-gray-50 border rounded-xl outline-none" 
                            placeholder="Describe the medical procedure..."
                            value={formData.treatmentDetails}
                            onChange={(e) => handleInputChange("treatmentDetails", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-blue-400 transition-colors">
                        <input type="file" multiple className="hidden" id="claim-files" onChange={handleFileUpload} />
                        <label htmlFor="claim-files" className="cursor-pointer flex flex-col items-center gap-2">
                          <div className="p-4 bg-blue-50 rounded-full text-blue-600 mb-2"><FiUpload size={32}/></div>
                          <p className="font-bold text-gray-900">Upload Supporting Documents</p>
                          <p className="text-sm text-gray-500">Add medical bills, prescriptions, or IDs (IPFS encrypted)</p>
                        </label>
                      </div>

                      {documents.length > 0 && (
                        <div className="space-y-2">
                          {documents.map((doc, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                              <span className="text-sm font-medium flex items-center gap-2"><FiCheckCircle className="text-emerald-500"/> {doc.name}</span>
                              <span className="text-xs text-gray-400">Synced to IPFS</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 text-amber-800 text-xs">
                        <FiAlertTriangle size={18} className="shrink-0"/>
                        <p>By clicking submit, your claim data will be permanently stored on the decentralized web. Please verify the amount: <b>{formData.claimAmount} ETH</b></p>
                      </div>
                    </div>
                  )}
                </main>

                <footer className="p-8 bg-gray-50 border-t flex justify-between">
                  <button 
                    onClick={() => step === 1 ? onClose() : setStep(s => s - 1)}
                    className="px-8 py-3 font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    {step === 1 ? 'Cancel' : 'Back'}
                  </button>
                  
                  {step < 3 ? (
                    <button 
                      disabled={!isStepValid()}
                      onClick={() => setStep(s => s + 1)}
                      className="px-10 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg disabled:opacity-50 hover:bg-blue-700 transition-all"
                    >
                      Continue
                    </button>
                  ) : (
                    <button 
                      disabled={loading || uploading}
                      onClick={handleSubmit}
                      className="px-10 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 hover:bg-emerald-700 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : <><FiLock/> Submit to Blockchain</>}
                    </button>
                  )}
                </footer>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// --- Reusable Sub-component ---
const InputGroup = ({ label, value, onChange, type = "text", placeholder }) => (
  <div className="flex flex-col">
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{label}</label>
    <input 
      type={type} 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full p-4 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium" 
    />
  </div>
);

export default SubmitClaimModal;