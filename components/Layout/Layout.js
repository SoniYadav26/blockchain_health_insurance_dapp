import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden">
      {/* Static Background (Simple & Clean) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
    
        <div className="fixed inset-0 bg-slate-100"></div>

      </div>

      {/* Sidebar Component */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* sidebar k liye space */}
      <div className="lg:pl-72 relative">
        {/* Header Component */}
        <Header setSidebarOpen={setSidebarOpen} />

        {/* Main content section */}
        <main className="relative py-10">
          <div className="px-4 sm:px-6 lg:px-8 relative">
            <div className="relative z-10">
              {/* Is 'children' ke andar  saare pages (Dashboard, Plans etc.) dikhenge */}
              {children}
            </div>
          </div>

          {/* Floating Status Indicator (user ko dikhane ke liye ki system "Active" hai) */}
          <div className="fixed bottom-8 right-8 z-30">
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border border-green-200 shadow-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-gray-600">Network Active</span>
            </div>
          </div>

        </main>
      </div>

      {/* Basic Global Scrollbar Styling */}
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        ::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #2563eb;
        }
      `}</style>
    </div>
  );
};

export default Layout;

