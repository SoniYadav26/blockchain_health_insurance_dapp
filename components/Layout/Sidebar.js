import {
  FiHome,
  FiShield,
  FiFileText,
  FiActivity,
  FiUsers,
  FiBox,
  FiX,
} from "react-icons/fi";

// Sidebar menu items
const navigation = [
  { name: "Dashboard", href: "/", icon: FiHome },
  { name: "Insurance Plans", href: "/plans", icon: FiShield },
  { name: "My Policies", href: "/policies", icon: FiFileText },
  { name: "Claims", href: "/claims", icon: FiBox },
  { name: "Analytics", href: "/analytics", icon: FiActivity },
  { name: "Admin", href: "/admin", icon: FiUsers },
];

const Sidebar = ({ open, setOpen }) => {
  return (
    <>
      {/*  MOBILE SIDEBAR */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-gray-900/80"
            onClick={() => setOpen(false)}
          ></div>

          {/* Sidebar */}
          <div className="relative w-72 h-full bg-slate-900 flex flex-col pb-4">
            {/* Header */}
            <div className="flex h-16 items-center justify-between px-6 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <FiShield className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">
                  ArogyaBlock
                </span>
              </div>
              <FiX
                className="h-6 w-6 text-white cursor-pointer"
                onClick={() => setOpen(false)}
              />
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-6 mt-4">
              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6
                                 text-gray-300 hover:text-white hover:bg-slate-800 transition-all"
                    >
                      <item.icon className="h-6 w-6 shrink-0" />
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* ================= DESKTOP SIDEBAR ================= */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-slate-900 px-6 pb-4">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b border-white/10">
            <div className="bg-blue-600 p-2 rounded-lg">
              <FiShield className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              ArogyaBlock
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul className="space-y-1 -mx-2">
              {navigation.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    className="group flex gap-x-3 rounded-md p-2 text-sm font-semibold
                     text-gray-400 hover:text-white hover:bg-slate-800 transition-all"
                  >
                  <item.icon className="h-6 w-6 shrink-0" />
                  {item.name}
                  </a>
                </li>
             ))}
            </ul>

           {/* STATUS BOX  */}
            <div className="mt-auto mb-4">
              <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-400">
                      Blockchain Status
                    </span>
                  </div>
                  <p className="text-sm text-white font-medium mt-1">
                    Connected & Secure
                  </p>
                </div>
              </div>
          </nav>

        </div>
      </div>
    </>
  );
};

export default Sidebar;







