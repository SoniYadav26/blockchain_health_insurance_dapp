import { FiMenu, FiBell, FiGlobe, FiShield, FiZap } from "react-icons/fi";


const Header = ({ setSidebarOpen }) => {
  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200/50 bg-white/80 backdrop-blur-xl px-4 shadow-lg shadow-blue-500/5 sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-white/50 to-cyan-50/30 pointer-events-none"></div>

      {/* Mobile menu button */}
      <button
        type="button"
        className="relative -m-2.5 p-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 lg:hidden group"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <FiMenu className="h-6 w-6 group-hover:scale-110 transition-transform" aria-hidden="true" />
      </button>

      <div className="h-6 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent lg:hidden" aria-hidden="true" />

      <div className="relative flex flex-1 items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Network status (Static for now) */}
          <div className="relative flex items-center space-x-2 rounded-full bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/50 px-4 py-2 shadow-sm">
            <div className="relative">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm"></div>
              <div className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping opacity-75"></div>
            </div>
            <FiGlobe className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-800 tracking-wide">
              Ethereum Mainnet
            </span>
          </div>

          {/* Blockchain indicators */}
          <div className="hidden sm:flex items-center space-x-3">
            <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-blue-50 border border-blue-200/50">
              <FiZap className="h-3 w-3 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Gas: 15</span>
            </div>
            <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-purple-50 border border-purple-200/50">
              <FiShield className="h-3 w-3 text-purple-600" />
              <span className="text-xs font-medium text-purple-700">Secure</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notification button */}
          <button type="button" className="relative group rounded-xl bg-white p-2.5 text-gray-500 hover:text-blue-600 border border-gray-200/50 transition-all duration-200">
            <FiBell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-bold">
              3
            </span>
          </button>

          {/* Static Connect Wallet Button (UI only) */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-200"></div>
            <button className="relative flex items-center bg-white px-4 py-2 rounded-xl text-sm font-bold text-blue-600 border border-blue-100 hover:bg-blue-50 transition-all duration-200">
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;

