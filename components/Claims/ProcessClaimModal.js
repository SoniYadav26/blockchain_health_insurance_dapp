import { useState, useEffect, useMemo, useCallback } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  FiX, FiCheck, FiFileText, FiAlertTriangle, 
  FiEye, FiUser, FiCalendar, FiDollarSign, 
  FiShield, FiActivity 
} from "react-icons/fi";
import { useEthersSigner } from "../../provider/hooks";
import { contractService, CLAIM_STATUS } from "../../services/contract";
import { getFromIPFS } from "../../services/pinata";
import toast from "react-hot-toast";

/**
 * @component ProcessClaimModal
 * @description Professional Admin interface for reviewing and processing insurance claims on-chain.
 */
const ProcessClaimModal = ({ isOpen, onClose, claim, onSuccess }) => {
  const signer = useEthersSigner();
  
  // --- State Management ---
  const [uiState, setUiState] = useState({
    loading: false,
    loadingMetadata: false,
    decision: "", // 'approve' | 'reject'
    approvedAmount: "",
    notes: "",
    metadata: null
  }); 

  // --- Helpers ---
  const formatDate = (ts) => (!ts || ts === "0" ? "N/A" : new Date(parseInt(ts) * 1000).toLocaleDateString());
  const formatEth = (amt) => parseFloat(amt || 0).toFixed(4);

  // --- Data Fetching ---
  const loadClaimMetadata = useCallback(async () => {
    if (!claim?.ipfsDocuments) return;
    
    setUiState(prev => ({ ...prev, loadingMetadata: true }));
    try {
      const data = await getFromIPFS(claim.ipfsDocuments);
      setUiState(prev => ({ ...prev, metadata: data }));
    } catch (error) {
      toast.error("Failed to sync IPFS metadata");
    } finally {
      setUiState(prev => ({ ...prev, loadingMetadata: false }));
    }
  }, [claim]);

  useEffect(() => {
    if (isOpen && claim) {
      setUiState({
        loading: false,
        loadingMetadata: false,
        decision: "",
        approvedAmount: "",
        notes: "",
        metadata: null
      });
      loadClaimMetadata();
    }
  }, [isOpen, claim, loadClaimMetadata]);

  // --- Contract Interaction (Action) ---
  const handleProcessClaim = async () => {
    const { decision, approvedAmount } = uiState;
    if (!claim || !decision) return;

    setUiState(prev => ({ ...prev, loading: true }));
    try {
      const status = decision === "approve" ? CLAIM_STATUS.APPROVED : CLAIM_STATUS.REJECTED;
      const amount = decision === "approve" ? (approvedAmount || claim.claimAmount) : "0";

      const result = await contractService.processClaim(claim.claimId, status, amount, signer);

      if (result.success) {
        toast.success(`Claim ${decision}ed successfully!`);
        onSuccess?.();
        onClose();
      } else throw new Error(result.error);
    } catch (error) {
      toast.error(error.message || "Transaction failed");
    } finally {
      setUiState(prev => ({ ...prev, loading: false }));
    }
  };

  if (!claim) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden">
                
                {/* Header */}
                <header className="p-6 border-b flex justify-between items-center bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-lg text-blue-600"><FiFileText size={24}/></div>
                    <div>
                      <Dialog.Title className="text-xl font-bold">Process Claim #{claim.claimId}</Dialog.Title>
                      <p className="text-sm text-gray-500">Reviewing Policy #{claim.policyId}</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><FiX /></button>
                </header>

                <div className="p-8 space-y-6">
                  {/* Summary Grid */}
                  <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <DataCard icon={<FiUser/>} label="Claimant" value={claim.claimant} mono />
                    <DataCard icon={<FiDollarSign/>} label="Requested Amount" value={`${formatEth(claim.claimAmount)} ETH`} />
                    <DataCard icon={<FiCalendar/>} label="Submitted On" value={formatDate(claim.submissionDate)} />
                  </section>

                  {/* Metadata Section (IPFS) */}
                  <section className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-700">
                      <FiActivity className="text-blue-500"/> Investigation Details
                    </h4>
                    {uiState.loadingMetadata ? (
                      <div className="animate-pulse h-20 bg-gray-200 rounded-lg" />
                    ) : (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <p><strong>Diagnosis:</strong> {uiState.metadata?.diagnosis || "N/A"}</p>
                        <p><strong>Provider:</strong> {uiState.metadata?.providerName || "N/A"}</p>
                        <p className="col-span-2 text-gray-600 italic">"{claim.description}"</p>
                      </div>
                    )}
                  </section>

                  {/* Decision Logic */}
                  <section className="space-y-4 pt-4">
                    <h4 className="font-bold text-gray-900">Administrative Action</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <DecisionBtn 
                        type="approve" 
                        active={uiState.decision === 'approve'} 
                        onClick={() => setUiState(p => ({...p, decision: 'approve'}))} 
                      />
                      <DecisionBtn 
                        type="reject" 
                        active={uiState.decision === 'reject'} 
                        onClick={() => setUiState(p => ({...p, decision: 'reject'}))} 
                      />
                    </div>

                    {uiState.decision === "approve" && (
                      <div className="animate-in fade-in slide-in-from-top-2">
                        <label className="block text-sm font-medium mb-1">Modify Approved Amount (Optional)</label>
                        <input 
                          type="number" 
                          className="w-full p-3 border rounded-xl" 
                          placeholder={`Default: ${formatEth(claim.claimAmount)} ETH`}
                          value={uiState.approvedAmount}
                          onChange={(e) => setUiState(p => ({...p, approvedAmount: e.target.value}))}
                        />
                      </div>
                    )}
                  </section>
                </div>

                {/* Footer Actions */}
                <footer className="p-6 bg-gray-50 border-t flex justify-end gap-3">
                  <button onClick={onClose} className="px-6 py-2 text-gray-600 font-medium">Cancel</button>
                  <button 
                    disabled={!uiState.decision || uiState.loading}
                    onClick={handleProcessClaim}
                    className={`px-8 py-2 rounded-xl font-bold text-white shadow-lg transition-all ${
                      uiState.decision === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 
                      uiState.decision === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400'
                    }`}
                  >
                    {uiState.loading ? "Confirming..." : "Execute Decision"}
                  </button>
                </footer>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

// --- Sub-components for Cleanliness ---
const DataCard = ({ icon, label, value, mono }) => (
  <div className="p-4 bg-white border rounded-xl shadow-sm">
    <div className="flex items-center gap-2 text-gray-500 text-xs mb-1 uppercase tracking-wider font-bold">
      {icon} {label}
    </div>
    <div className={`text-gray-900 font-semibold truncate ${mono ? 'font-mono text-xs' : ''}`}>{value}</div>
  </div>
);

const DecisionBtn = ({ type, active, onClick }) => {
  const isApprove = type === "approve";
  return (
    <button 
      onClick={onClick}
      className={`p-4 border-2 rounded-2xl flex flex-col items-center gap-2 transition-all ${
        active 
          ? (isApprove ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-red-500 bg-red-50 text-red-700') 
          : 'border-gray-100 bg-gray-50 hover:border-gray-300'
      }`}
    >
      {isApprove ? <FiCheck size={24}/> : <FiX size={24}/>}
      <span className="font-bold uppercase text-xs tracking-widest">{type}</span>
    </button>
  );
};

export default ProcessClaimModal;