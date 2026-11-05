import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FiMenu } from "react-icons/fi";

const Header = ({ setSidebarOpen }) => {
  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200/50 bg-white/80 backdrop-blur-xl px-4 shadow-lg shadow-blue-500/5 sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button with enhanced styling */}
      <button
        type="button"
        className="relative -m-2.5 p-2.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 lg:hidden group"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <FiMenu
          className="h-6 w-6 group-hover:scale-110 transition-transform"
          aria-hidden="true"
        />
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </button>

      {/* Enhanced separator with gradient */}
      <div
        className="h-6 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent lg:hidden"
        aria-hidden="true"
      />

      <div className="relative flex flex-1 items-center justify-end">
        <div className="flex items-center gap-3">
          {/* Wallet address and connection control */}
          <ConnectButton
            chainStatus="icon"
            accountStatus={{
              smallScreen: "avatar",
              largeScreen: "full",
            }}
            showBalance={{
              smallScreen: false,
              largeScreen: true,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
