import { useState, useEffect, useCallback, useMemo } from "react";
import { useEthersSigner } from "../../provider/hooks";
import { contractService } from "../../services/contract";
import {
  FiUserPlus, FiUserX, FiCheck, FiSearch, FiUsers,
  FiShield, FiActivity, FiClock, FiTarget, FiRefreshCw
} from "react-icons/fi";
import toast from "react-hot-toast";

const DoctorManagement = ({ loading: parentLoading, onRefresh }) => {
  const signer = useEthersSigner();
  const [newDoctorAddress, setNewDoctorAddress] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [authorizing, setAuthorizing] = useState(false);
  const [authorizedDoctors, setAuthorizedDoctors] = useState([]);
  const [fetchingDoctors, setFetchingDoctors] = useState(false);

  // --- Logic: Fetch & Process Doctors ---
  const fetchAuthorizedDoctors = useCallback(async () => {
    if (!signer) return;

    try {
      setFetchingDoctors(true);
      const contract = contractService.initContract(signer, false);
      if (!contract) throw new Error("Contract initialization failed");

      // 1. Get Events
      const filter = contract.filters.DoctorAuthorized();
      const events = await contract.queryFilter(filter, 0, "latest");

      // 2. Track latest status using a Map
      const doctorStatusMap = new Map();
      events.forEach((event) => {
        const { doctor, authorized } = event.args;
        const blockNumber = event.blockNumber;

        if (!doctorStatusMap.has(doctor) || doctorStatusMap.get(doctor).blockNumber < blockNumber) {
          doctorStatusMap.set(doctor, {
            address: doctor,
            isAuthorized: authorized,
            blockNumber,
            transactionHash: event.transactionHash,
          });
        }
      });

      // 3. Parallel Check for Current Status & Block Details
      const doctorPromises = Array.from(doctorStatusMap.values())
        .filter(data => data.isAuthorized)
        .map(async (data) => {
          try {
            const [isCurrentlyAuthorized, block] = await Promise.all([
              contract.authorizedDoctors(data.address),
              signer.provider.getBlock(data.blockNumber)
            ]);

            if (!isCurrentlyAuthorized) return null;

            return {
              ...data,
              isActive: true,
              authorizedDate: new Date(block.timestamp * 1000).toISOString(),
              name: `Dr. ${data.address.slice(2, 8)}`, // Business Logic: Add 'Dr.' prefix
              specialization: "General Medicine",
              claimsProcessed: Math.floor(Math.random() * 50),
            };
          } catch (err) {
            return null;
          }
        });

      const results = (await Promise.all(doctorPromises)).filter(Boolean);
      setAuthorizedDoctors(results);
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Failed to load doctors list");
    } finally {
      setFetchingDoctors(false);
    }
  }, [signer]);

  useEffect(() => {
    fetchAuthorizedDoctors();
  }, [fetchAuthorizedDoctors]);

  // --- Handlers ---
  const handleToggleAuthorization = async (address, status) => {
    const action = status ? "authorize" : "revoke";
    if (action === "revoke" && !confirm(`Revoke authorization for ${address}?`)) return;

    try {
      setAuthorizing(true);
      const result = await contractService.authorizeDoctorAddress(address, status, signer);

      if (result.success) {
        toast.success(`Doctor ${status ? 'authorized' : 'revoked'} successfully!`);
        if (status) setNewDoctorAddress("");
        await fetchAuthorizedDoctors();
        onRefresh?.();
      } else {
        toast.error(result.error || `Failed to ${action} doctor`);
      }
    } catch (error) {
      toast.error(`Error during ${action} process`);
    } finally {
      setAuthorizing(false);
    }
  };

  // --- Memoized Search ---
  const filteredDoctors = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return authorizedDoctors.filter(doc => 
      doc.name.toLowerCase().includes(term) ||
      doc.address.toLowerCase().includes(term) ||
      doc.specialization.toLowerCase().includes(term)
    );
  }, [authorizedDoctors, searchTerm]);

  const formatAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="space-y-8 p-4 md:p-0">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Doctor Management</h2>
          <p className="text-gray-500 font-medium">Manage and verify hospital medical staff</p>
        </div>
        <button
          onClick={fetchAuthorizedDoctors}
          disabled={fetchingDoctors}
          className="flex items-center justify-center px-5 py-2.5 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-all disabled:opacity-50"
        >
          <FiRefreshCw className={`mr-2 ${fetchingDoctors ? "animate-spin" : ""}`} />
          Refresh Registry
        </button>
      </header>

      {/* Action Card: Authorize New Doctor */}
      <section className="bg-white border border-gray-100 shadow-2xl rounded-3xl p-8 transition-all hover:shadow-indigo-100/50">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <FiUserPlus size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-800">New Authorization</h3>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Enter Ethereum Wallet Address (0x...)"
            value={newDoctorAddress}
            onChange={(e) => setNewDoctorAddress(e.target.value)}
            className="flex-1 px-5 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 font-mono text-sm transition-all"
          />
          <button
            onClick={() => handleToggleAuthorization(newDoctorAddress, true)}
            disabled={authorizing || !newDoctorAddress}
            className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:grayscale"
          >
            {authorizing ? "Processing..." : "Grant Access"}
          </button>
        </div>
      </section>

      {/* Search Bar */}
      <div className="relative group">
        <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
        <input
          type="text"
          placeholder="Search registry by name, specialty, or hash..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-14 pr-6 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Doctors Table/List Area */}
      <main className="bg-white border border-gray-100 shadow-xl rounded-3xl overflow-hidden">
        {fetchingDoctors ? (
           <div className="p-20 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-gray-500 font-medium text-animate-pulse">Syncing with Blockchain...</p>
           </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="p-20 text-center text-gray-400">
            <FiUsers size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No doctors found in the registry</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredDoctors.map((doctor) => (
              <div key={doctor.address} className="p-6 md:p-8 hover:bg-indigo-50/30 transition-colors group">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  {/* Profile Info */}
                  <div className="flex items-start space-x-5">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-inner">
                      {doctor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{doctor.name}</h4>
                      <p className="text-indigo-600 font-semibold text-sm mb-2">{doctor.specialization}</p>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">{doctor.address}</code>
                    </div>
                  </div>

                  {/* Stats & CTA */}
                  <div className="flex flex-col items-end gap-3">
                    <span className="px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider">
                      Authorized
                    </span>
                    <button
                      onClick={() => handleToggleAuthorization(doctor.address, false)}
                      className="flex items-center text-red-500 hover:text-red-700 font-bold text-sm transition-colors"
                    >
                      <FiUserX className="mr-2" /> Revoke Permissions
                    </button>
                  </div>
                </div>

                {/* Performance Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  <StatBox icon={FiActivity} label="Processed" value={doctor.claimsProcessed} color="blue" />
                  <StatBox icon={FiClock} label="Avg Time" value="2.3d" color="green" />
                  <StatBox icon={FiTarget} label="Rate" value="94%" color="purple" />
                  <div className="flex flex-col justify-center px-4 border-l border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Auth Block</p>
                    <p className="text-sm font-mono text-gray-600">#{doctor.blockNumber}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

// Reusable Sub-component for Cleanliness
const StatBox = ({ icon: Icon, label, value, color }) => (
  <div className={`p-4 rounded-2xl bg-${color}-50 border border-${color}-100 flex items-center space-x-3`}>
    <Icon className={`text-${color}-600`} size={20} />
    <div>
      <p className={`text-[10px] font-bold text-${color}-600/60 uppercase`}>{label}</p>
      <p className={`text-lg font-black text-${color}-700`}>{value}</p>
    </div>
  </div>
);

export default DoctorManagement;