import { useState, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { FiX, FiCreditCard, FiCalendar, FiDollarSign, FiAlertCircle } from "react-icons/fi";
import { useEthersSigner } from "../../provider/hooks";
import { contractService, PLAN_TYPES } from "../../services/contract";
import toast from "react-hot-toast";

const PayPremiumModal = ({ isOpen, onClose, policy, onSuccess }) => {
  const signer = useEthersSigner();
  const [loading, setLoading] = useState(false);

  // Memoized values for performance and clarity
  const policyDetails = useMemo(() => {
    if (!policy) return null;

    const names = {
      [PLAN_TYPES.BASIC]: "Basic",
      [PLAN_TYPES.PREMIUM]: "Premium",
      [PLAN_TYPES.PLATINUM]: "Platinum",
    };

    const expiryDate = new Date(parseInt(policy.endDate) * 1000);
    const now = new Date();
    const isDue = now > expiryDate;

    return {
      name: names[policy.planType] || "Unknown",
      formattedDate: expiryDate.toLocaleDateString(),
      isDue,
      amount: parseFloat(policy.premium).toFixed(4)
    };
  }, [policy]);

  const handlePayPremium = async () => {
    if (!signer || !policy) return;

    try {
      setLoading(true);
      const tx = await contractService.payPremium(signer, policy.id);
      
      toast.promise(tx.wait(), {
        loading: "Processing payment...",
        success: "Premium paid successfully! 🎉",
        error: "Payment verification failed.",
      });

      await tx.wait();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Payment Error:", error);
      toast.error(error.reason || "Failed to process payment");
    } finally {
      setLoading(false);
    }
  };

  if (!policy) return null;

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <FiCreditCard className="text-indigo-600" />
                    Pay Premium
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <FiX size={24} />
                  </button>
                </div>

                {/* Policy Info Card */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Policy Plan</span>
                      <span className="font-semibold text-indigo-600">{policyDetails.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <FiCalendar /> Expiry Date
                      </span>
                      <span className="text-sm font-medium">{policyDetails.formattedDate}</span>
                    </div>
                    <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-700">Total Due</span>
                      <span className="text-lg font-bold text-gray-900 flex items-center gap-1">
                        <FiDollarSign className="text-green-600" />
                        {policyDetails.amount} ETH
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Warning */}
                {!policyDetails.isDue && (
                  <div className="flex items-center gap-2 p-3 mb-6 bg-blue-50 text-blue-700 rounded-lg text-sm">
                    <FiAlertCircle />
                    <span>Payment is not due yet, but you can pay in advance.</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-3 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePayPremium}
                    disabled={loading}
                    className="flex-[2] px-4 py-3 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
                  >
                    {loading ? "Processing..." : `Pay ${policyDetails.amount} ETH`}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PayPremiumModal;