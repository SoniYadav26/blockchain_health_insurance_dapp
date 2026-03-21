import { ethers } from "ethers";
import toast from "react-hot-toast";
import { CONTRACT_ADDRESS } from "../config/network";
import { HEALTH_INSURANCE_ABI } from "../contracts/HealthInsuranceABI";

// Plan Types
export const PLAN_TYPES = {
  BASIC: 0,
  PREMIUM: 1,
  PLATINUM: 2,
};

export const PAYMENT_TYPES = {
  ONE_TIME: 0,
  MONTHLY: 1,
};

export const POLICY_STATUS = {
  ACTIVE: 0,
  EXPIRED: 1,
  CANCELLED: 2,
  SUSPENDED: 3,
};

export const CLAIM_STATUS = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2,
  PAID: 3,
};

class ContractService {
  constructor() {
    this.contractAddress = null;
    this.contract = null;
  }

  // Initialize contract with signer or provider
  initContract(signerOrProvider, withSigner = false) {
    try {
      // Get contract address dynamically
      const contractAddress = CONTRACT_ADDRESS;

      if (!contractAddress) {
        console.error(
          "Contract address is not defined. Please check your .env.local file."
        );
        toast.error("Contract address not configured");
        return null;
      }

      if (!ethers.utils.isAddress(contractAddress)) {
        console.error("Invalid contract address:", contractAddress);
        toast.error("Invalid contract address");
        return null;
      }

      this.contractAddress = contractAddress;
      this.contract = new ethers.Contract(
        this.contractAddress,
        HEALTH_INSURANCE_ABI,
        withSigner ? signerOrProvider : signerOrProvider
      );

      console.log("Contract initialized successfully:", this.contractAddress);
      return this.contract;
    } catch (error) {
      console.error("Error initializing contract:", error);
      toast.error("Failed to initialize contract");
      return null;
    }
  }

  // Read Functions
  async getInsurancePlan(planType, provider) {
    try {
      const contract = this.initContract(provider);
      if (!contract) {
        throw new Error("Failed to initialize contract");
      }

      const plan = await contract.insurancePlans(planType);
      return {
        planType: plan.planType || plan[0],
        oneTimePrice: ethers.utils.formatEther(plan.oneTimePrice || plan[1]),
        monthlyPrice: ethers.utils.formatEther(plan.monthlyPrice || plan[2]),
        coverageAmount: ethers.utils.formatEther(
          plan.coverageAmount || plan[3]
        ),
        deductible: ethers.utils.formatEther(plan.deductible || plan[4]),
        ipfsHash: plan.ipfsHash || plan[5] || "",
        isActive:
          plan.isActive !== undefined
            ? plan.isActive
            : plan[6] !== undefined
            ? plan[6]
            : true,
      };
    } catch (error) {
      console.error("Error getting insurance plan:", error);
      // Return default plan structure to prevent crashes
      return {
        planType: planType,
        oneTimePrice: "0.1",
        monthlyPrice: "0.01",
        coverageAmount: "10",
        deductible: "0.5",
        ipfsHash: "",
        isActive: true,
      };
    }
  }

  async getAllInsurancePlans(provider) {
    try {
      if (!provider) {
        console.error("Provider not available");
        return this.getDefaultPlans();
      }

      const plans = await Promise.all([
        this.getInsurancePlan(PLAN_TYPES.BASIC, provider),
        this.getInsurancePlan(PLAN_TYPES.PREMIUM, provider),
        this.getInsurancePlan(PLAN_TYPES.PLATINUM, provider),
      ]);
      return plans.filter((plan) => plan !== null);
    } catch (error) {
      console.error("Error getting all insurance plans:", error);
      return this.getDefaultPlans();
    }
  }

  // Fallback default plans
  getDefaultPlans() {
    return [
      {
        planType: PLAN_TYPES.BASIC,
        oneTimePrice: "0.1",
        monthlyPrice: "0.01",
        coverageAmount: "10",
        deductible: "0.5",
        ipfsHash: "",
        isActive: true,
      },
      {
        planType: PLAN_TYPES.PREMIUM,
        oneTimePrice: "0.25",
        monthlyPrice: "0.025",
        coverageAmount: "25",
        deductible: "0.25",
        ipfsHash: "",
        isActive: true,
      },
      {
        planType: PLAN_TYPES.PLATINUM,
        oneTimePrice: "0.5",
        monthlyPrice: "0.05",
        coverageAmount: "50",
        deductible: "0.1",
        ipfsHash: "",
        isActive: true,
      },
    ];
  }

  async getPolicy(policyId, provider) {
    try {
      const contract = this.initContract(provider);
      const policy = await contract.policies(policyId);
      return {
        policyId: policy.policyId.toString(),
        policyholder: policy.policyholder,
        planType: policy.planType,
        paymentType: policy.paymentType,
        coverageAmount: ethers.utils.formatEther(policy.coverageAmount),
        deductible: ethers.utils.formatEther(policy.deductible),
        premium: ethers.utils.formatEther(policy.premium),
        startDate: policy.startDate.toString(),
        endDate: policy.endDate.toString(),
        lastPaymentDate: policy.lastPaymentDate.toString(),
        status: policy.status,
        ipfsMetadata: policy.ipfsMetadata,
        totalPaid: ethers.utils.formatEther(policy.totalPaid),
        claimsUsed: ethers.utils.formatEther(policy.claimsUsed),
      };
    } catch (error) {
      console.error("Error getting policy:", error);
      return null;
    }
  }

  async getUserPolicies(userAddress, provider) {
    try {
      const contract = this.initContract(provider);
      const policyIds = await contract.getUserPolicies(userAddress);
      const policies = await Promise.all(
        policyIds.map((id) => this.getPolicy(id.toString(), provider))
      );
      return policies.filter((policy) => policy !== null);
    } catch (error) {
      console.error("Error getting user policies:", error);
      return [];
    }
  }

  async getClaim(claimId, provider) {
    try {
      const contract = this.initContract(provider);
      const claim = await contract.claims(claimId);
      return {
        claimId: claim.claimId.toString(),
        policyId: claim.policyId.toString(),
        claimant: claim.claimant,
        claimAmount: ethers.utils.formatEther(claim.claimAmount),
        approvedAmount: ethers.utils.formatEther(claim.approvedAmount),
        status: claim.status,
        submissionDate: claim.submissionDate.toString(),
        processedDate: claim.processedDate.toString(),
        ipfsDocuments: claim.ipfsDocuments,
        description: claim.description,
      };
    } catch (error) {
      console.error("Error getting claim:", error);
      return null;
    }
  }

  async getPolicyClaims(policyId, provider) {
    try {
      const contract = this.initContract(provider);
      const claimIds = await contract.getPolicyClaims(policyId);
      const claims = await Promise.all(
        claimIds.map((id) => this.getClaim(id.toString(), provider))
      );
      return claims.filter((claim) => claim !== null);
    } catch (error) {
      console.error("Error getting policy claims:", error);
      return [];
    }
  }

  async isPolicyValid(policyId, provider) {
    try {
      const contract = this.initContract(provider);
      return await contract.isPolicyValid(policyId);
    } catch (error) {
      console.error("Error checking policy validity:", error);
      return false;
    }
  }

  async getRemainingCoverage(policyId, provider) {
    try {
      const contract = this.initContract(provider);
      const remaining = await contract.getRemainingCoverage(policyId);
      return ethers.utils.formatEther(remaining);
    } catch (error) {
      console.error("Error getting remaining coverage:", error);
      return "0";
    }
  }

  async getContractStats(provider) {
    try {
      const contract = this.initContract(provider);
      const [totalPolicies, totalClaims, contractBalance] = await Promise.all([
        contract.getTotalPolicies(),
        contract.getTotalClaims(),
        contract.getContractBalance(),
      ]);

      return {
        totalPolicies: totalPolicies.toString(),
        totalClaims: totalClaims.toString(),
        contractBalance: ethers.utils.formatEther(contractBalance),
      };
    } catch (error) {
      console.error("Error getting contract stats:", error);
      return {
        totalPolicies: "0",
        totalClaims: "0",
        contractBalance: "0",
      };
    }
  }

  // Write Functions
  async purchasePolicy(
    planType,
    paymentType,
    ipfsMetadata,
    paymentAmount,
    signer
  ) {
    try {
      const contract = this.initContract(signer, true);
      const tx = await contract.purchasePolicy(
        planType,
        paymentType,
        ipfsMetadata,
        {
          value: ethers.utils.parseEther(paymentAmount.toString()),
          gasLimit: 500000,
        }
      );

      toast.loading("Purchasing policy...", { id: "purchase" });
      const receipt = await tx.wait();
      toast.success("Policy purchased successfully!", { id: "purchase" });

      return { success: true, receipt, txHash: tx.hash };
    } catch (error) {
      console.error("Error purchasing policy:", error);
      toast.error(error.reason || "Failed to purchase policy", {
        id: "purchase",
      });
      return { success: false, error: error.message };
    }
  }

  async payMonthlyPremium(policyId, signer) {
    try {
      // Validate inputs
      if (!policyId || policyId <= 0) {
        throw new Error("Invalid policy ID");
      }

      const contract = this.initContract(signer, true);

      // First, get the current policy details
      const policy = await contract.policies(policyId);
      if (!policy || policy.policyholder === ethers.constants.AddressZero) {
        throw new Error("Policy not found");
      }

      // Check if it's a monthly payment policy
      if (policy.paymentType !== 1) {
        // 1 = PaymentType.MONTHLY
        throw new Error("This policy doesn't use monthly payments");
      }

      // Check if policy is active
      if (policy.status !== 0) {
        // 0 = PolicyStatus.ACTIVE
        throw new Error("Policy is not active");
      }

      // Get the insurance plan to get the monthly premium amount
      const plan = await contract.insurancePlans(policy.planType);
      const monthlyPremium = plan.monthlyPrice;

      console.log("Policy details:", {
        policyId: policyId.toString(),
        planType: policy.planType.toString(),
        paymentType: policy.paymentType.toString(),
        status: policy.status.toString(),
        endDate: new Date(policy.endDate.toNumber() * 1000).toISOString(),
        monthlyPremium: ethers.utils.formatEther(monthlyPremium),
      });

      // Check if premium is actually due
      const currentTime = Math.floor(Date.now() / 1000);
      const policyEndTime = policy.endDate.toNumber();

      if (currentTime <= policyEndTime) {
        throw new Error(
          "Premium payment is not due yet. Policy is still active."
        );
      }

      // Call the contract function with the correct premium amount
      const tx = await contract.payMonthlyPremium(policyId, {
        value: monthlyPremium, // Use the exact amount from the plan
        gasLimit: 300000,
      });

      toast.loading("Paying premium...", { id: "premium" });
      const receipt = await tx.wait();
      toast.success("Premium paid successfully!", { id: "premium" });

      return {
        success: true,
        receipt,
        txHash: tx.hash,
        paidAmount: ethers.utils.formatEther(monthlyPremium),
      };
    } catch (error) {
      console.error("Error paying premium:", error);

      let errorMessage = "Failed to pay premium";

      // Handle specific error cases
      if (error.message) {
        if (error.message.includes("Not the policyholder")) {
          errorMessage = "You are not the owner of this policy";
        } else if (error.message.includes("Policy not active")) {
          errorMessage = "Policy is not active";
        } else if (error.message.includes("Not a monthly payment policy")) {
          errorMessage = "This policy doesn't use monthly payments";
        } else if (error.message.includes("Premium not due yet")) {
          errorMessage = "Premium payment is not due yet";
        } else if (error.message.includes("Insufficient premium payment")) {
          errorMessage = "Insufficient payment amount";
        } else if (error.message.includes("user rejected")) {
          errorMessage = "Transaction was rejected by user";
        } else if (error.reason) {
          errorMessage = error.reason;
        } else if (error.message.includes("Premium payment is not due yet")) {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage, { id: "premium" });
      return { success: false, error: error.message };
    }
  }

  async submitClaim(policyId, claimAmount, ipfsDocuments, description, signer) {
    console.log(policyId, claimAmount, ipfsDocuments, description, signer);
    try {
      const contract = this.initContract(signer, true);
      const tx = await contract.submitClaim(
        policyId,
        ethers.utils.parseEther(claimAmount.toString()),
        ipfsDocuments,
        description,
        { gasLimit: 400000 }
      );

      toast.loading("Submitting claim...", { id: "claim" });
      const receipt = await tx.wait();
      toast.success("Claim submitted successfully!", { id: "claim" });

      return { success: true, receipt, txHash: tx.hash };
    } catch (error) {
      console.error("Error submitting claim:", error);
      toast.error(error.reason || "Failed to submit claim", { id: "claim" });
      return { success: false, error: error.message };
    }
  }

  async processClaim(claimId, status, approvedAmount, signer) {
    try {
      // Validate inputs before making the contract call
      if (!claimId || claimId <= 0) {
        throw new Error("Invalid claim ID");
      }

      if (status === undefined || status === null) {
        throw new Error("Invalid status");
      }

      const contract = this.initContract(signer, true);

      // Handle different cases for approvedAmount
      let amountInWei;

      if (status === CLAIM_STATUS.APPROVED) {
        // For approved claims, convert the amount to Wei
        if (!approvedAmount || parseFloat(approvedAmount) <= 0) {
          throw new Error("Approved amount must be greater than 0");
        }
        amountInWei = ethers.utils.parseEther(approvedAmount.toString());
      } else {
        // For rejected claims, use 0
        amountInWei = ethers.utils.parseEther("0");
      }

      console.log("Processing claim with params:", {
        claimId: claimId.toString(),
        status: status.toString(),
        approvedAmount: amountInWei.toString(),
      });

      // Call the contract function with proper parameters
      const tx = await contract.processClaim(
        claimId.toString(), // Ensure it's a string
        status, // Status as number
        amountInWei, // Amount in Wei
        {
          gasLimit: 500000,
          // Add some buffer for gas price if needed
          // gasPrice: ethers.utils.parseUnits("20", "gwei")
        }
      );

      toast.loading("Processing claim...", { id: "process" });
      const receipt = await tx.wait();
      toast.success("Claim processed successfully!", { id: "process" });

      return {
        success: true,
        receipt,
        txHash: tx.hash,
        claimId,
        status,
        approvedAmount: ethers.utils.formatEther(amountInWei),
      };
    } catch (error) {
      console.error("Error processing claim:", error);

      let errorMessage = "Failed to process claim";

      // Handle specific error cases
      if (error.message) {
        if (error.message.includes("Not authorized to process claims")) {
          errorMessage = "You are not authorized to process claims";
        } else if (error.message.includes("Claim already processed")) {
          errorMessage = "This claim has already been processed";
        } else if (error.message.includes("Invalid claim ID")) {
          errorMessage = "Invalid claim ID provided";
        } else if (error.message.includes("Approved amount exceeds claim")) {
          errorMessage = "Approved amount cannot exceed claim amount";
        } else if (
          error.message.includes("Approved amount must be greater than 0")
        ) {
          errorMessage = "Approved amount must be greater than 0";
        } else if (error.reason) {
          errorMessage = error.reason;
        } else if (error.message.includes("user rejected")) {
          errorMessage = "Transaction was rejected by user";
        } else if (error.message.includes("insufficient funds")) {
          errorMessage = "Insufficient funds for transaction";
        }
      }

      toast.error(errorMessage, { id: "process" });
      return { success: false, error: error.message };
    }
  }

  async cancelPolicy(policyId, signer) {
    try {
      const contract = this.initContract(signer, true);
      const tx = await contract.cancelPolicy(policyId, { gasLimit: 200000 });

      toast.loading("Cancelling policy...", { id: "cancel" });
      const receipt = await tx.wait();
      toast.success("Policy cancelled successfully!", { id: "cancel" });

      return { success: true, receipt, txHash: tx.hash };
    } catch (error) {
      console.error("Error cancelling policy:", error);
      toast.error(error.reason || "Failed to cancel policy", { id: "cancel" });
      return { success: false, error: error.message };
    }
  }

  async authorizeDoctorAddress(doctorAddress, authorized, signer) {
    try {
      // Validate doctor address format
      if (!doctorAddress || !ethers.utils.isAddress(doctorAddress)) {
        toast.error("Please enter a valid Ethereum address", {
          id: "doctor-auth",
        });
        return { success: false, error: "Invalid address format" };
      }

      const contract = this.initContract(signer, true);

      // Call the contract function
      const tx = await contract.authorizeDoctorAddress(
        doctorAddress,
        authorized,
        {
          gasLimit: 100000,
        }
      );

      const action = authorized ? "Authorizing" : "Revoking authorization for";
      toast.loading(`${action} doctor...`, { id: "doctor-auth" });

      const receipt = await tx.wait();

      const successMessage = authorized
        ? "Doctor authorized successfully!"
        : "Doctor authorization revoked successfully!";
      toast.success(successMessage, { id: "doctor-auth" });

      return {
        success: true,
        receipt,
        txHash: tx.hash,
        doctorAddress,
        authorized,
      };
    } catch (error) {
      console.error("Error updating doctor authorization:", error);

      let errorMessage = "Failed to update doctor authorization";

      // Handle specific error cases
      if (error.reason) {
        if (error.reason.includes("Ownable: caller is not the owner")) {
          errorMessage = "Only the contract owner can authorize doctors";
        } else {
          errorMessage = error.reason;
        }
      }

      toast.error(errorMessage, { id: "doctor-auth" });
      return { success: false, error: error.message };
    }
  }

  async withdraw(signer) {
    try {
      const contract = this.initContract(signer, true);

      // Optional: Check contract balance before attempting withdrawal
      const contractBalance = await signer.provider.getBalance(
        contract.address
      );

      if (contractBalance.isZero()) {
        toast.error("No funds available to withdraw", { id: "withdraw" });
        return { success: false, error: "Contract has no balance" };
      }

      // Format balance for display
      const balanceInEth = ethers.utils.formatEther(contractBalance);
      console.log(`Contract balance: ${balanceInEth} ETH`);

      const tx = await contract.withdraw({ gasLimit: 50000 });

      toast.loading(`Withdrawing ${balanceInEth} ETH...`, { id: "withdraw" });

      const receipt = await tx.wait();

      toast.success(`Successfully withdrew ${balanceInEth} ETH!`, {
        id: "withdraw",
      });

      return {
        success: true,
        receipt,
        txHash: tx.hash,
        withdrawnAmount: balanceInEth,
        withdrawnAmountWei: contractBalance,
      };
    } catch (error) {
      console.error("Error withdrawing funds:", error);

      let errorMessage = "Failed to withdraw funds";

      // Handle specific error cases
      if (error.reason) {
        if (error.reason.includes("Ownable: caller is not the owner")) {
          errorMessage = "Only the contract owner can withdraw funds";
        } else if (error.reason.includes("No funds to withdraw")) {
          errorMessage = "Contract has no funds to withdraw";
        } else if (error.reason.includes("transfer failed")) {
          errorMessage = "Transfer failed - please try again";
        } else {
          errorMessage = error.reason;
        }
      }

      toast.error(errorMessage, { id: "withdraw" });
      return { success: false, error: error.message };
    }
  }

  async fetchAllClaims(signer) {
    try {
      const contract = this.initContract(signer, false);
      const totalClaims = await contract.getTotalClaims();
      const claims = [];

      for (let i = 1; i <= totalClaims; i++) {
        try {
          const claim = await contract.claims(i);
          const policy = await contract.policies(claim.policyId);

          // Convert claim data to frontend format
          const formattedClaim = {
            claimId: claim.claimId.toString(),
            policyId: claim.policyId.toString(),
            claimant: claim.claimant,
            claimAmount: ethers.utils.formatEther(claim.claimAmount),
            approvedAmount: ethers.utils.formatEther(claim.approvedAmount),
            status: claim.status,
            submissionDate: claim.submissionDate.toNumber() * 1000, // Convert to milliseconds
            processedDate: claim.processedDate.toNumber() * 1000,
            ipfsDocuments: claim.ipfsDocuments,
            description: claim.description,
            // Add policy holder info
            policyholder: policy.policyholder,
            planType: policy.planType,
            // Add provider name (you might want to store this in contract or derive it)
            providerName: this.getPlanTypeName(policy.planType),
            // Derive claim type from description or add a field to contract
            claimType: this.deriveClaimType(claim.description),
          };

          claims.push(formattedClaim);
        } catch (error) {
          console.error(`Error fetching claim ${i}:`, error);
        }
      }

      return { success: true, claims };
    } catch (error) {
      console.error("Error fetching claims:", error);
      return { success: false, error: error.message, claims: [] };
    }
  }

  // Helper function to get plan type name
  getPlanTypeName(planType) {
    const planNames = {
      0: "Basic Plan",
      1: "Premium Plan",
      2: "Platinum Plan",
    };
    return planNames[planType] || "Unknown Plan";
  }

  // Helper function to derive claim type from description
  deriveClaimType(description) {
    const desc = description.toLowerCase();
    if (desc.includes("emergency") || desc.includes("urgent"))
      return "emergency";
    if (desc.includes("surgery") || desc.includes("operation"))
      return "surgery";
    if (
      desc.includes("pharmacy") ||
      desc.includes("medicine") ||
      desc.includes("drug")
    )
      return "pharmacy";
    if (desc.includes("dental") || desc.includes("tooth")) return "dental";
    if (
      desc.includes("vision") ||
      desc.includes("eye") ||
      desc.includes("glasses")
    )
      return "vision";
    return "general";
  }

  // Fetch claims with real-time updates using events
  async fetchClaimsWithEvents(signer, fromBlock = 0) {
    try {
      const contract = this.initContract(signer, false);

      // Get all claim submitted events
      const claimSubmittedFilter = contract.filters.ClaimSubmitted();
      const claimProcessedFilter = contract.filters.ClaimProcessed();

      const [submittedEvents, processedEvents] = await Promise.all([
        contract.queryFilter(claimSubmittedFilter, fromBlock),
        contract.queryFilter(claimProcessedFilter, fromBlock),
      ]);

      // Get unique claim IDs
      const claimIds = [
        ...new Set([
          ...submittedEvents.map((e) => e.args.claimId.toString()),
          ...processedEvents.map((e) => e.args.claimId.toString()),
        ]),
      ];

      const claims = [];

      for (const claimId of claimIds) {
        try {
          const claim = await contract.claims(claimId);
          const policy = await contract.policies(claim.policyId);

          const formattedClaim = {
            claimId: claim.claimId.toString(),
            policyId: claim.policyId.toString(),
            claimant: claim.claimant,
            claimAmount: ethers.utils.formatEther(claim.claimAmount),
            approvedAmount: ethers.utils.formatEther(claim.approvedAmount),
            status: claim.status,
            submissionDate: claim.submissionDate.toNumber() * 1000,
            processedDate: claim.processedDate.toNumber() * 1000,
            ipfsDocuments: claim.ipfsDocuments,
            description: claim.description,
            policyholder: policy.policyholder,
            planType: policy.planType,
            providerName: this.getPlanTypeName(policy.planType),
            claimType: this.deriveClaimType(claim.description),
          };

          claims.push(formattedClaim);
        } catch (error) {
          console.error(`Error fetching claim ${claimId}:`, error);
        }
      }

      return { success: true, claims };
    } catch (error) {
      console.error("Error fetching claims with events:", error);
      return { success: false, error: error.message, claims: [] };
    }
  }
}

export const contractService = new ContractService();
