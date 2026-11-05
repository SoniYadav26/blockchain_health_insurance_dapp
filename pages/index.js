import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import {
  FiShield,
  FiHeart,
  FiZap,
  FiUsers,
  FiLock,
  FiTrendingUp,
  FiCheck,
  FiArrowRight,
  FiStar,
  FiGlobe,
  FiSmartphone,
  FiCreditCard,
  FiFileText,
  FiActivity,
  FiAward,
  FiChevronDown,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { GiHeartOrgan } from "react-icons/gi";
import EthAmount from "../components/Common/EthAmount";

export default function LandingPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const redirectAfterConnect = useRef(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  const handleLaunchApp = () => {
    if (isConnected) {
      void router.push("/dashboard");
      return;
    }
    redirectAfterConnect.current = true;
    openConnectModal?.();
  };

  useEffect(() => {
    if (isConnected && redirectAfterConnect.current) {
      redirectAfterConnect.current = false;
      void router.push("/dashboard");
    }
  }, [isConnected, router]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: FiShield,
      title: "Blockchain Security",
      description:
        "Your health data is secured by immutable blockchain technology, ensuring privacy and transparency.",
    },
    {
      icon: FiZap,
      title: "Instant Claims",
      description:
        "Smart contracts automate claim processing, reducing wait times from weeks to minutes.",
    },
    {
      icon: FiLock,
      title: "Decentralized",
      description:
        "No central authority controls your policy. You own your insurance on the blockchain.",
    },
    {
      icon: FiTrendingUp,
      title: "Lower Costs",
      description:
        "Eliminate middlemen and reduce administrative costs with automated smart contracts.",
    },
    {
      icon: FiUsers,
      title: "Global Access",
      description:
        "Access your insurance from anywhere in the world with just your wallet.",
    },
    {
      icon: FiHeart,
      title: "AI-Powered",
      description:
        "Machine learning algorithms help detect fraud and optimize claim processing.",
    },
  ];

  const plans = [
    {
      name: "Basic",
      price: "0.1",
      monthlyPrice: "0.01",
      coverage: "10",
      deductible: "0.5",
      features: [
        "Basic health coverage",
        "Emergency care",
        "Prescription drugs",
        "24/7 telehealth",
        "Mobile app access",
      ],
      popular: false,
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "Premium",
      price: "0.25",
      monthlyPrice: "0.025",
      coverage: "25",
      deductible: "0.25",
      features: [
        "All Basic features",
        "Specialist consultations",
        "Mental health coverage",
        "Dental & vision",
        "Wellness programs",
        "Priority claim processing",
      ],
      popular: true,
      color: "from-purple-500 to-pink-500",
    },
    {
      name: "Platinum",
      price: "0.5",
      monthlyPrice: "0.05",
      coverage: "50",
      deductible: "0.1",
      features: [
        "All Premium features",
        "International coverage",
        "Concierge medical services",
        "Alternative treatments",
        "Family coverage",
        "Zero waiting periods",
        "Premium support",
      ],
      popular: false,
      color: "from-yellow-500 to-orange-500",
    },
  ];

  const testimonials = [];

  const stats = [
    { number: "10,000+", label: "Active Policies" },
    { number: "99.9%", label: "Uptime" },
    { number: "< 5 min", label: "Avg Claim Time" },
    { number: "500+", label: "Healthcare Providers" },
  ];

  return (
    <>
      <Head>
        <title>InsurChain Health - Decentralized Health Insurance</title>
        <meta
          name="description"
          content="Revolutionary blockchain-based health insurance with instant claims, lower costs, and complete transparency."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        {/* Navigation */}
        <nav className="fixed w-full z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <GiHeartOrgan className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">
                  InsurChain Health
                </span>
              </div>

              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-8">
                  <a
                    href="#features"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Features
                  </a>
                  <a
                    href="#plans"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Plans
                  </a>
                  <a
                    href="#how-it-works"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    How it Works
                  </a>
                  <a
                    href="#testimonials"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Testimonials
                  </a>
                </div>
              </div>

              <div className="hidden md:flex items-center">
                <button
                  type="button"
                  onClick={handleLaunchApp}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Launch App
                </button>
              </div>

              <div className="md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-white p-2"
                >
                  {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-white/10 backdrop-blur-md border-t border-white/20">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <a
                  href="#features"
                  className="block px-3 py-2 text-white/80 hover:text-white"
                >
                  Features
                </a>
                <a
                  href="#plans"
                  className="block px-3 py-2 text-white/80 hover:text-white"
                >
                  Plans
                </a>
                <a
                  href="#how-it-works"
                  className="block px-3 py-2 text-white/80 hover:text-white"
                >
                  How it Works
                </a>
                <a
                  href="#testimonials"
                  className="block px-3 py-2 text-white/80 hover:text-white"
                >
                  Testimonials
                </a>
                <div className="pt-4 pb-3 border-t border-white/20">
                  <button
                    type="button"
                    onClick={handleLaunchApp}
                    className="mx-3 w-[calc(100%-1.5rem)] bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-xl font-semibold"
                  >
                    Launch App
                  </button>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
                The Future of
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  {" "}
                  Health Insurance
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-4xl mx-auto leading-relaxed">
                Experience instant claims, lower costs, and complete
                transparency with blockchain-powered health insurance. Your
                health, your data, your control.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <button
                  type="button"
                  onClick={handleLaunchApp}
                  className="group bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                >
                  <span>Get Started Now</span>
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="group bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-2xl font-bold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300 flex items-center space-x-2">
                  <FiFileText />
                  <span>Learn More</span>
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-white/60 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Why Choose InsurChain Health?
              </h2>
              <p className="text-xl text-white/70 max-w-3xl mx-auto">
                Revolutionary features that put you in control of your
                healthcare
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                How It Works
              </h2>
              <p className="text-xl text-white/70 max-w-3xl mx-auto">
                Simple steps to get covered with blockchain technology
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Connect Wallet",
                  description:
                    "Connect your Web3 wallet to get started with InsurChain Health",
                  icon: FiCreditCard,
                },
                {
                  step: "02",
                  title: "Choose Plan",
                  description:
                    "Select from our Basic, Premium, or Platinum coverage options",
                  icon: FiShield,
                },
                {
                  step: "03",
                  title: "Get Covered",
                  description:
                    "Your policy is instantly active on the blockchain. Submit claims anytime!",
                  icon: FiHeart,
                },
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <step.icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-gray-900">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {step.title}
                  </h3>
                  <p className="text-white/70">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Plans */}
        <section id="plans" className="py-20 bg-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Choose Your Plan
              </h2>
              <p className="text-xl text-white/70 max-w-3xl mx-auto">
                Transparent pricing with no hidden fees. Pay with
                cryptocurrency.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`relative bg-white/10 backdrop-blur-md rounded-2xl p-8 border transition-all duration-300 transform hover:scale-105 ${
                    plan.popular
                      ? "border-cyan-400 ring-2 ring-cyan-400/50"
                      : "border-white/20 hover:border-white/40"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {plan.name}
                    </h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-white">
                        {plan.price}
                      </span>
                      <span className="text-white/60 ml-2">ETH/year</span>
                    </div>
                    <div className="text-white/60">
                      or <EthAmount value={plan.monthlyPrice} />/month
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-white/80">
                      <span>Coverage Amount</span>
                      <span className="font-semibold"><EthAmount value={plan.coverage} /></span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Deductible</span>
                      <span className="font-semibold">
                        <EthAmount value={plan.deductible} />
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-white/80">
                        <FiCheck className="w-5 h-5 text-cyan-400 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link href="/dashboard">
                    <button
                      className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-105 ${
                        plan.popular
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg"
                          : "bg-white/20 hover:bg-white/30"
                      }`}
                    >
                      Get {plan.name} Plan
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                What Our Users Say
              </h2>
              <p className="text-xl text-white/70 max-w-3xl mx-auto">
                Real experiences from real people using InsurChain Health
              </p>
            </div>

            {testimonials.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300"
                  >
                    <div className="flex items-center mb-6">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div>
                        <h4 className="text-white font-semibold">
                          {testimonial.name}
                        </h4>
                        <p className="text-white/60 text-sm">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>

                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <FiStar
                          key={i}
                          className="w-5 h-5 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>

                    <p className="text-white/80 italic">
                      "{testimonial.content}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-white/70 text-lg">
                No user reviews yet. Be the first policyholder to share your
                experience!
              </p>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-cyan-600 to-blue-700">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Revolutionize Your Healthcare?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Join thousands of users who have already made the switch to
              decentralized health insurance. Experience the future today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link href="/dashboard">
                <button className="group bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
                  <span>Start Your Journey</span>
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <button className="group bg-transparent border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center space-x-2">
                <FiFileText />
                <span>View Documentation</span>
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-black/20 backdrop-blur-md border-t border-white/10 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="col-span-2">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                    <FiShield className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-white">
                    InsurChain Health
                  </span>
                </div>
                <p className="text-white/60 mb-6 max-w-md">
                  Revolutionizing healthcare with blockchain technology. Secure,
                  transparent, and accessible insurance for everyone.
                </p>
                <div className="flex space-x-4">
                  <a
                    href="#"
                    className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
                  >
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
                  >
                    <i className="fab fa-discord"></i>
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
                  >
                    <i className="fab fa-github"></i>
                  </a>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-white/60">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Security
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      API
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-white/60">
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Contact Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white transition-colors">
                      Status
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
              <p className="text-white/60 text-sm">
                © {new Date().getFullYear()} InsurChain Health. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a
                  href="#"
                  className="text-white/60 hover:text-white text-sm transition-colors"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-white/60 hover:text-white text-sm transition-colors"
                >
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="text-white/60 hover:text-white text-sm transition-colors"
                >
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
