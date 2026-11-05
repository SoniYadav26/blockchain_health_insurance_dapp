import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useEthersProvider } from "../provider/hooks";
import Layout from "../components/Layout/Layout";
import StatsOverview from "../components/Analytics/StatsOverview";
import PolicyAnalytics from "../components/Analytics/PolicyAnalytics";
import ClaimsAnalytics from "../components/Analytics/ClaimsAnalytics";
import RevenueAnalytics from "../components/Analytics/RevenueAnalytics";
import TrendAnalytics from "../components/Analytics/TrendAnalytics";
import { contractService } from "../services/contract";
import {
  FiRefreshCw,
  FiTrendingUp,
  FiDownload,
  FiLock,
  FiShield,
  FiZap,
  FiActivity,
  FiBarChart,
} from "react-icons/fi";

export default function Analytics() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const provider = useEthersProvider();
  const effectiveAddress = address;

  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d"); // 7d, 30d, 90d, 1y
  const [analyticsData, setAnalyticsData] = useState({
    overview: {},
    policies: [],
    claims: [],
    revenue: {},
    trends: {},
  });

  useEffect(() => {
    if (provider && effectiveAddress && isConnected) {
      loadAnalyticsData();
    }
  }, [isConnected, provider, effectiveAddress, timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      // Load user's policies and claims data
      const [userPolicies, contractStats] = await Promise.all([
        contractService.getUserPolicies(effectiveAddress, provider),
        contractService.getContractStats(provider),
      ]);

      // Load claims for all user policies
      let allClaims = [];
      for (const policy of userPolicies) {
        const policyClaims = await contractService.getPolicyClaims(
          policy.policyId,
          provider
        );
        allClaims = [...allClaims, ...policyClaims];
      }

      // Process and analyze the data
      const processedData = processAnalyticsData(
        userPolicies,
        allClaims,
        contractStats,
        timeRange
      );

      setAnalyticsData(processedData);
    } catch (error) {
      console.error("Error loading analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (policies, claims, contractStats, range) => {
    const now = new Date();
    const timeRangeMs = getTimeRangeMs(range);
    const startDate = new Date(now.getTime() - timeRangeMs);

    // Filter data by time range
    const filteredPolicies = policies.filter((policy) => {
      const policyDate = new Date(parseInt(policy.startDate) * 1000);
      return policyDate >= startDate;
    });

    const filteredClaims = claims.filter((claim) => {
      const claimDate = new Date(parseInt(claim.submissionDate) * 1000);
      return claimDate >= startDate;
    });

    // Calculate overview stats
    const overview = calculateOverviewStats(policies, claims, contractStats);

    // Calculate policy analytics
    const policyAnalytics = calculatePolicyAnalytics(filteredPolicies);

    // Calculate claims analytics
    const claimsAnalytics = calculateClaimsAnalytics(filteredClaims);

    // Calculate revenue analytics
    const revenueAnalytics = calculateRevenueAnalytics(filteredPolicies, range);

    // Calculate trend analytics
    const trendAnalytics = calculateTrendAnalytics(
      filteredPolicies,
      filteredClaims,
      range
    );

    return {
      overview,
      policies: policyAnalytics,
      claims: claimsAnalytics,
      revenue: revenueAnalytics,
      trends: trendAnalytics,
    };
  };

  const getTimeRangeMs = (range) => {
    switch (range) {
      case "7d":
        return 7 * 24 * 60 * 60 * 1000;
      case "30d":
        return 30 * 24 * 60 * 60 * 1000;
      case "90d":
        return 90 * 24 * 60 * 60 * 1000;
      case "1y":
        return 365 * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  };

  const calculateOverviewStats = (policies, claims, contractStats) => {
    const totalPolicies = policies.length;
    const activePolicies = policies.filter((p) => p.status === 0).length;
    const totalClaims = claims.length;
    const approvedClaims = claims.filter(
      (c) => c.status === 1 || c.status === 3
    ).length;
    const totalPremiumsPaid = policies.reduce(
      (sum, p) => sum + parseFloat(p.totalPaid),
      0
    );
    const totalClaimsAmount = claims.reduce(
      (sum, c) => sum + parseFloat(c.claimAmount),
      0
    );
    const totalApprovedAmount = claims.reduce((sum, c) => {
      if (c.status === 1 || c.status === 3) {
        return sum + parseFloat(c.approvedAmount);
      }
      return sum;
    }, 0);

    return {
      totalPolicies,
      activePolicies,
      totalClaims,
      approvedClaims,
      totalPremiumsPaid,
      totalClaimsAmount,
      totalApprovedAmount,
      claimApprovalRate:
        totalClaims > 0 ? (approvedClaims / totalClaims) * 100 : 0,
      lossRatio:
        totalPremiumsPaid > 0
          ? (totalApprovedAmount / totalPremiumsPaid) * 100
          : 0,
    };
  };

  const calculatePolicyAnalytics = (policies) => {
    const planDistribution = policies.reduce((acc, policy) => {
      const planName =
        ["Basic", "Premium", "Platinum"][policy.planType] || "Unknown";
      acc[planName] = (acc[planName] || 0) + 1;
      return acc;
    }, {});

    const paymentTypeDistribution = policies.reduce((acc, policy) => {
      const paymentType = policy.paymentType === 0 ? "One-time" : "Monthly";
      acc[paymentType] = (acc[paymentType] || 0) + 1;
      return acc;
    }, {});

    const coverageDistribution = policies.map((policy) => ({
      policyId: policy.policyId,
      coverage: parseFloat(policy.coverageAmount),
      used: parseFloat(policy.claimsUsed),
      remaining:
        parseFloat(policy.coverageAmount) - parseFloat(policy.claimsUsed),
    }));

    return {
      planDistribution,
      paymentTypeDistribution,
      coverageDistribution,
      totalCoverage: policies.reduce(
        (sum, p) => sum + parseFloat(p.coverageAmount),
        0
      ),
      totalUsedCoverage: policies.reduce(
        (sum, p) => sum + parseFloat(p.claimsUsed),
        0
      ),
    };
  };

  const calculateClaimsAnalytics = (claims) => {
    const statusDistribution = claims.reduce((acc, claim) => {
      const status =
        ["Pending", "Approved", "Rejected", "Paid"][claim.status] || "Unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const monthlyClaimsData = generateMonthlyData(claims, "submissionDate");

    const averageClaimAmount =
      claims.length > 0
        ? claims.reduce((sum, c) => sum + parseFloat(c.claimAmount), 0) /
          claims.length
        : 0;

    const averageProcessingTime = claims
      .filter((c) => c.processedDate && c.processedDate !== "0")
      .reduce((sum, c, _, arr) => {
        const processingTime =
          parseInt(c.processedDate) - parseInt(c.submissionDate);
        return sum + processingTime / arr.length;
      }, 0);

    return {
      statusDistribution,
      monthlyClaimsData,
      averageClaimAmount,
      averageProcessingTime: averageProcessingTime / (24 * 60 * 60), // Convert to days
      totalClaimsValue: claims.reduce(
        (sum, c) => sum + parseFloat(c.claimAmount),
        0
      ),
    };
  };

  const calculateRevenueAnalytics = (policies, range) => {
    const monthlyRevenueData = generateMonthlyData(
      policies,
      "startDate",
      "totalPaid"
    );

    const revenueByPlan = policies.reduce((acc, policy) => {
      const planName =
        ["Basic", "Premium", "Platinum"][policy.planType] || "Unknown";
      acc[planName] = (acc[planName] || 0) + parseFloat(policy.totalPaid);
      return acc;
    }, {});

    const totalRevenue = policies.reduce(
      (sum, p) => sum + parseFloat(p.totalPaid),
      0
    );
    const averageRevenuePerPolicy =
      policies.length > 0 ? totalRevenue / policies.length : 0;

    return {
      monthlyRevenueData,
      revenueByPlan,
      totalRevenue,
      averageRevenuePerPolicy,
    };
  };

  const calculateTrendAnalytics = (policies, claims, range) => {
    const policyTrend = generateTrendData(policies, "startDate", range);
    const claimsTrend = generateTrendData(claims, "submissionDate", range);

    return {
      policyTrend,
      claimsTrend,
    };
  };

  const generateMonthlyData = (data, dateField, valueField = null) => {
    const monthlyData = {};

    data.forEach((item) => {
      const date = new Date(parseInt(item[dateField]) * 1000);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { count: 0, value: 0 };
      }

      monthlyData[monthKey].count += 1;
      if (valueField) {
        monthlyData[monthKey].value += parseFloat(item[valueField] || 0);
      }
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        ...data,
      }));
  };

  const generateTrendData = (data, dateField, range) => {
    const periods =
      range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365;
    const trendData = [];

    for (let i = periods - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayData = data.filter((item) => {
        const itemDate = new Date(parseInt(item[dateField]) * 1000);
        return itemDate.toDateString() === date.toDateString();
      });

      trendData.push({
        date: date.toISOString().split("T")[0],
        count: dayData.length,
      });
    }

    return trendData;
  };

  const exportAnalytics = () => {
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `analytics-${timeRange}-${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  if (!isConnected) {
    return (
      <Layout>
        <div className="relative min-h-[600px] flex items-center justify-center">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div
              className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl animate-pulse"
              style={{ animationDelay: "2s" }}
            ></div>
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500/10 rounded-full blur-xl animate-pulse"
              style={{ animationDelay: "4s" }}
            ></div>
          </div>

          <div className="relative text-center max-w-md mx-auto">
            {/* Enhanced Icon */}
            <div className="relative mx-auto mb-8">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center shadow-2xl border border-white/50 backdrop-blur-sm">
                <FiBarChart className="h-16 w-16 text-blue-600" />
              </div>

              {/* Floating indicators */}
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <FiActivity className="h-4 w-4 text-white" />
              </div>

              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 opacity-20 blur-xl animate-pulse"></div>
            </div>

            {/* Enhanced Content */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/50">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Connect Your Wallet
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Secure access to your analytics dashboard. Connect your Web3
                wallet to view comprehensive insights and performance metrics.
              </p>

              {/* Features list */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3 text-sm text-gray-700">
                  <FiShield className="h-4 w-4 text-blue-600" />
                  <span>Advanced analytics & insights</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-700">
                  <FiZap className="h-4 w-4 text-emerald-600" />
                  <span>Real-time performance tracking</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-700">
                  <FiLock className="h-4 w-4 text-purple-600" />
                  <span>Secure data visualization</span>
                </div>
              </div>

              {/* Connect button */}
              <button
                type="button"
                onClick={() => openConnectModal?.()}
                className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <FiLock className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Connect Wallet</span>
                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Analytics & Insights
            </h1>
            <p className="mt-2 text-gray-600">
              Comprehensive analytics for your insurance portfolio
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-white/80 backdrop-blur-xl border border-white/50 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>

            {/* Action Buttons */}
            <button
              onClick={exportAnalytics}
              className="group inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg text-sm font-medium rounded-xl text-gray-700 hover:bg-white hover:shadow-xl transition-all duration-300"
            >
              <FiDownload className="-ml-1 mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              Export Data
            </button>

            <button
              onClick={loadAnalyticsData}
              disabled={loading}
              className="group inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            >
              <FiRefreshCw
                className={`-ml-1 mr-2 h-4 w-4 ${
                  loading ? "animate-spin" : "group-hover:scale-110"
                } transition-transform`}
              />
              Refresh
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <StatsOverview data={analyticsData.overview} loading={loading} />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Policy Analytics */}
          <PolicyAnalytics data={analyticsData.policies} loading={loading} />

          {/* Claims Analytics */}
          <ClaimsAnalytics data={analyticsData.claims} loading={loading} />
        </div>

        {/* Revenue Analytics */}
        <RevenueAnalytics
          data={analyticsData.revenue}
          loading={loading}
          timeRange={timeRange}
        />

        {/* Trend Analytics */}
        <TrendAnalytics
          data={analyticsData.trends}
          loading={loading}
          timeRange={timeRange}
        />
      </div>
    </Layout>
  );
}
