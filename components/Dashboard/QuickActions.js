import Link from "next/link";
import {
  FiFileText,
  FiCreditCard,
  FiShield,
  FiZap,
  FiArrowRight,
} from "react-icons/fi";

const QuickActions = () => {
  const actions = [
    {
      name: "Buy Insurance",
      href: "/plans",
      icon: FiShield,
      description: "Purchase new insurance plans",
      color: "bg-indigo-600",
      hover: "hover:bg-indigo-700",
    },
    {
      name: "Submit Claim",
      href: "/claims",
      icon: FiFileText,
      description: "File a new insurance claim",
      color: "bg-emerald-600",
      hover: "hover:bg-emerald-700",
    },
    {
      name: "Pay Premium",
      href: "/policies",
      icon: FiCreditCard,
      description: "Pay for your active policies",
      color: "bg-purple-600",
      hover: "hover:bg-purple-700",
    },
    {
      name: "Manage Policies",
      href: "/policies",
      icon: FiZap,
      description: "View and update your policies",
      color: "bg-cyan-600",
      hover: "hover:bg-cyan-700",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div className="p-6">
        {/* Title */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800">Quick Actions</h3>
          <p className="text-sm text-gray-500">Fast access to key features</p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {actions.map((action) => (
            <Link key={action.name} href={action.href}>
              <div className={`p-5 rounded-xl ${action.color} ${action.hover} text-white transition-all cursor-pointer group shadow-sm`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <action.icon size={24} />
                  </div>
                  <FiArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <h4 className="font-bold text-base mb-1">{action.name}</h4>
                <p className="text-xs text-white/80">{action.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Status Bar */}
        <div className="mt-6 flex items-center gap-2 text-xs text-gray-400 border-t pt-4">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Blockchain Network: Active</span>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;