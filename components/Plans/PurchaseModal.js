import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  FiX,
  FiCheck,
  FiShield,
  FiCreditCard,
  FiUser,
  FiFileText,
  FiDollarSign,
  FiCalendar,
  FiPhone,
  FiMail,
  FiMapPin,
} from "react-icons/fi";
import { useEthersSigner } from "../../provider/hooks";
import {
  contractService,
  PAYMENT_TYPES,
  PLAN_TYPES,
} from "../../services/contract";
import { uploadJSONToPinata } from "../../services/pinata";
import toast from "react-hot-toast";

const PurchaseModal = ({ isOpen, onClose, plan, onSuccess }) => {
  const signer = useEthersSigner();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    paymentType: PAYMENT_TYPES.ONE_TIME,
    personalInfo: {
      fullName: "",
      dateOfBirth: "",
      phoneNumber: "",
      email: "",
      address: "",
      emergencyContact: "",
      medicalHistory: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData((prev) => ({
        ...prev,
        paymentType: PAYMENT_TYPES.ONE_TIME,
      }));
    }
  }, [isOpen]);

  const getPlanName = (planType) => {
    const names = {
      [PLAN_TYPES.BASIC]: "Basic",
      [PLAN_TYPES.PREMIUM]: "Premium",
      [PLAN_TYPES.PLATINUM]: "Platinum",
    };
    return names[planType] || "Unknown";
  };

  const getPaymentAmount = () => {
    if (!plan) return 0;
    return formData.paymentType === PAYMENT_TYPES.ONE_TIME
      ? parseFloat(plan.oneTimePrice)
      : parseFloat(plan.monthlyPrice);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  const isPersonalInfoValid = () => {
    const { fullName, dateOfBirth, phoneNumber, email, address } = formData.personalInfo;
    return fullName && dateOfBirth && phoneNumber && email && address;
  };

  const handleNext = () => {
    if (step === 2 && !isPersonalInfoValid()) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handlePurchase = async () => {
    try {
      setLoading(true);
      const metadata = {
        planType: plan.planType,
        paymentType: formData.paymentType,
        personalInfo: formData.personalInfo,
        purchaseDate: new Date().toISOString(),
        version: "1.0",
      };

      const ipfsResult = await uploadJSONToPinata(
        metadata,
        `policy-metadata-${Date.now()}.json`
      );

      if (!ipfsResult.success) throw new Error("IPFS upload failed");

      const result = await contractService.purchasePolicy(
        plan.planType,
        formData.paymentType,
        ipfsResult.ipfsHash,
        getPaymentAmount(),
        signer
      );

      if (result.success) {
        toast.success("Policy purchased successfully!");
        onSuccess?.();
        onClose();
      } else {
        throw new Error(result.error || "Transaction failed");
      }
    } catch (error) {
      console.error("Purchase Error:", error);
      toast.error(error.message || "Failed to purchase policy");
    } finally {
      setLoading(false);
    }
  };

  if (!plan) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
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
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
                {/* Header */}
                <div className="relative px-8 pt-8 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                        <FiShield className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900 leading-none">
                          {getPlanName(plan.planType)} Plan
                        </Dialog.Title>
                        <p className="text-gray-500 mt-1">Complete your secure purchase</p>
                      </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                      <FiX className="h-6 w-6 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="px-12 py-6">
                  <div className="flex items-center justify-between relative">
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-100 -z-0">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${((step - 1) / 2) * 100}%` }}
                      />
                    </div>
                    {[
                      { s: 1, icon: FiCreditCard, label: "Payment" },
                      { s: 2, icon: FiUser, label: "Details" },
                      { s: 3, icon: FiCheck, label: "Review" }
                    ].map((item) => (
                      <div key={item.s} className="relative z-10 flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                          step >= item.s ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border-2 border-gray-200 text-gray-400'
                        }`}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        <span className={`text-xs font-bold mt-2 uppercase tracking-wider ${step >= item.s ? 'text-blue-600' : 'text-gray-400'}`}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content Area */}
                <div className="px-8 pb-8">
                  {step === 1 && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
                      {[
                        { id: PAYMENT_TYPES.ONE_TIME, label: "Annual Payment", price: plan.oneTimePrice, desc: "Best value per year", color: "blue" },
                        { id: PAYMENT_TYPES.MONTHLY, label: "Monthly Payment", price: plan.monthlyPrice, desc: "Flexible monthly plan", color: "purple" }
                      ].map((opt) => (
                        <div
                          key={opt.id}
                          onClick={() => setFormData(p => ({ ...p, paymentType: opt.id }))}
                          className={`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300 ${
                            formData.paymentType === opt.id 
                            ? `border-${opt.color}-500 bg-${opt.color}-50/50 shadow-md` 
                            : 'border-gray-100 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <span className={`font-bold text-${opt.color}-600 uppercase text-xs tracking-widest`}>{opt.label}</span>
                            {formData.paymentType === opt.id && <FiCheck className={`text-${opt.color}-600`} />}
                          </div>
                          <div className="text-2xl font-black text-gray-900">{parseFloat(opt.price).toFixed(4)} <span className="text-sm font-medium">ETH</span></div>
                          <p className="text-sm text-gray-500 mt-1">{opt.desc}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {step === 2 && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Full Name *</label>
                        <input
                          type="text"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                          placeholder="John Doe"
                          value={formData.personalInfo.fullName}
                          onChange={(e) => handleInputChange("fullName", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Email *</label>
                        <input
                          type="email"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                          placeholder="john@example.com"
                          value={formData.personalInfo.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Address *</label>
                        <textarea
                          rows="2"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none"
                          placeholder="Full residential address"
                          value={formData.personalInfo.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Phone *</label>
                        <input
                          type="tel"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                          placeholder="+1 234 567 890"
                          value={formData.personalInfo.phoneNumber}
                          onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-700 ml-1">DOB *</label>
                        <input
                          type="date"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                          value={formData.personalInfo.dateOfBirth}
                          onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="mt-4 space-y-4">
                      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
                          <span className="text-gray-600 font-medium">Selected Plan</span>
                          <span className="font-bold text-gray-900">{getPlanName(plan.planType)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Payment Schedule</span>
                          <span className="font-semibold text-gray-900">
                            {formData.paymentType === PAYMENT_TYPES.ONE_TIME ? "Annual" : "Monthly"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                          <span className="text-lg font-bold text-gray-900">Total Due</span>
                          <div className="text-right">
                            <div className="text-2xl font-black text-blue-600">{getPaymentAmount().toFixed(4)} ETH</div>
                            <p className="text-xs text-gray-400 font-medium italic">Secure Blockchain Transaction</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <FiFileText className="text-amber-600 mt-1 mr-3 flex-shrink-0" />
                        <p className="text-xs text-amber-800 leading-relaxed">
                          By proceeding, you agree to the <strong>Policy Terms</strong>. Your encrypted data will be stored on IPFS for decentralized verification.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Footer Buttons */}
                  <div className="flex items-center gap-3 mt-8">
                    <button
                      type="button"
                      onClick={step === 1 ? onClose : handleBack}
                      className="flex-1 px-6 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                    >
                      {step === 1 ? "Cancel" : "Back"}
                    </button>
                    {step < 3 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="flex-[2] px-6 py-3.5 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                      >
                        Continue
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handlePurchase}
                        disabled={loading}
                        className="flex-[2] px-6 py-3.5 bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-200 hover:bg-green-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <FiDollarSign className="w-5 h-5" />
                        )}
                        {loading ? "Processing..." : "Confirm & Pay"}
                      </button>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default PurchaseModal;