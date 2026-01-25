import Head from "next/head";
import Link from "next/link";
import { 
  FiShield, FiZap, FiCheck, FiArrowRight, FiActivity, FiUsers 
} from "react-icons/fi";

export default function LandingPage() {

    const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        localStorage.setItem("walletAddress", accounts[0]);
        window.location.href = "/dashboard";
      } catch (err) {
        alert("Wallet connection failed");
      }
    } else {
      alert("MetaMask not installed");
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <Head>
        <title>HealthChain | Blockchain Insurance</title>
      </Head>

      {/* --- Navbar --- */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <FiShield className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">ArogyaBlock</span>
        </div>
        <div className="hidden md:flex gap-8 font-medium text-slate-600">
          <a href="#features" className="hover:text-blue-600 transition">Features</a>
          <a href="#plans" className="hover:text-blue-600 transition">Plans</a>
        </div>
          <Link href="/dashboard">
            <button
            onClick={connectWallet}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-blue-700 transition"
          >
            Connect Wallet
          </button>
          </Link>

      </nav>

      
      <section className="px-8 pt-20 pb-32 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-slate-900">
          Insurance on the <span className="text-blue-600">Blockchain.</span>
        </h1>
        <p className="text-lg text-slate-600 mb-10 leading-relaxed">
          Duniya ka sabse secure aur fast health insurance system. Smart contracts se instant claims pay karein aur apna data khud control karein.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/dashboard">
            <button
              onClick={connectWallet}
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-xl transition"
              >
              Connect Wallet
            </button>

          </Link>
        </div>
      </section>

     
      <section id="features" className="bg-slate-50 py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Kyun HealthChain Best Hai?</h2>
            <div className="h-1 w-20 bg-blue-600 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<FiZap />} 
              title="Instant Claims" 
              desc="Weeks nahi, minutes mein claim approval payein smart contracts ke zariye."
            />
            <FeatureCard 
              icon={<FiShield />} 
              title="Full Security" 
              desc="Aapka data encrypted hai aur blockchain par kabhi delete nahi ho sakta."
            />
            <FeatureCard 
              icon={<FiUsers />} 
              title="Transparent" 
              desc="Koi hidden fees nahi. Sab kuch ledger par publicly check kiya ja sakta hai."
            />
          </div>
        </div>
      </section>

      {/* --- Simple Pricing --- */}
      <section id="plans" className="py-24 px-8 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12">Chose Your Plan</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Basic Plan */}
          <div className="border border-slate-200 p-8 rounded-3xl hover:border-blue-500 transition">
            <h3 className="text-xl font-bold mb-2">Basic</h3>
            <button className="w-full py-3 rounded-xl border-2 border-slate-900 font-bold hover:bg-slate-900 hover:text-white transition">Choose Basic</button>
          </div>

          {/* Pro Plan */}
          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl transform md:scale-105">
            <h3 className="text-xl font-bold mb-2">Premium Pro</h3>
          
            <button className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition">Get Started Now</button>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-12 border-t border-slate-100 text-center text-slate-400 text-sm">
        <p>© 2024 HealthChain Frontend Demo. All rights reserved.</p>
      </footer>
    </div>
  );
}

// Reusable Feature Component
function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition group text-left">
      <div className="text-blue-600 text-3xl mb-4 group-hover:scale-110 transition duration-300">
        {icon}
      </div>
      <h4 className="text-xl font-bold mb-2">{title}</h4>
      <p className="text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}


