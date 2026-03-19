import { FiShield, FiFileText, FiCreditCard, FiActivity, FiCheck, FiClock, FiX } from "react-icons/fi";
import { CLAIM_STATUS } from "../../services/contract";

const RecentActivity = ({ policies = [], claims = [], loading = false }) => {
  
  // Sabhi activities ko ek list mein merge aur sort karne ka function
  const getActivities = () => {
    let activities = [];

    // Policy purchased activities
    policies.forEach((p) => {
      activities.push({
        id: `pol-${p.policyId}`,
        icon: FiShield,
        title: "Policy Purchased",
        desc: `Plan #${p.policyId} is now active`,
        time: parseInt(p.startDate || Date.now() / 1000),
        color: "text-blue-600 bg-blue-50",
        amount: `${parseFloat(p.premium || 0).toFixed(3)} ETH`
      });
    });

    // Claim activities
    claims.forEach((c) => {
      activities.push({
        id: `clm-${c.claimId}`,
        icon: c.status === CLAIM_STATUS.APPROVED ? FiCheck : (c.status === CLAIM_STATUS.REJECTED ? FiX : FiClock),
        title: c.status === CLAIM_STATUS.PENDING ? "Claim Submitted" : "Claim Processed",
        desc: `Claim request for #${c.claimId}`,
        time: parseInt(c.submissionDate || Date.now() / 1000),
        color: c.status === CLAIM_STATUS.APPROVED ? "text-green-600 bg-green-50" : "text-amber-600 bg-amber-50",
        amount: `${parseFloat(c.claimAmount || 0).toFixed(3)} ETH`
      });
    });

    // Sort: Newest first
    return activities.sort((a, b) => b.time - a.time).slice(0, 6);
  };

  const activities = getActivities();

  const formatTime = (ts) => {
    const date = new Date(ts * 1000);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 h-full overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <FiActivity className="text-blue-500" /> Recent Activity
        </h3>
      </div>

      <div className="p-6">
        {loading ? (
          <p className="text-center text-gray-400 py-10">Fetching history...</p>
        ) : activities.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 text-sm">No recent transactions found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {activities.map((act, index) => (
              <div key={index} className="flex items-start gap-4">
                {/* Icon Column */}
                <div className={`p-2 rounded-lg shrink-0 ${act.color}`}>
                  <act.icon size={18} />
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-bold text-gray-900">{act.title}</h4>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {act.amount}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{act.desc}</p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">
                    {formatTime(act.time)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {activities.length > 0 && (
          <button className="w-full mt-6 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 border border-gray-100 rounded-lg transition-colors">
            View All History
          </button>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;