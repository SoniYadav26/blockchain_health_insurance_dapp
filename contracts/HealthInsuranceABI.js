// Simplified Standard Student Version for Health Insurance DApp
export const HEALTH_INSURANCE_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  // --- Events ---
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "policyId", "type": "uint256" },
      { "indexed": true, "name": "policyholder", "type": "address" },
      { "indexed": false, "name": "planType", "type": "uint8" }
    ],
    "name": "PolicyPurchased",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "claimId", "type": "uint256" },
      { "indexed": false, "name": "amount", "type": "uint256" },
      { "indexed": false, "name": "status", "type": "uint8" }
    ],
    "name": "ClaimProcessed",
    "type": "event"
  },
  // --- Core Functions ---
  {
    "inputs": [
      { "internalType": "uint8", "name": "_planType", "type": "uint8" }
    ],
    "name": "purchasePolicy",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_policyId", "type": "uint256" }
    ],
    "name": "payMonthlyPremium",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_policyId", "type": "uint256" },
      { "internalType": "uint256", "name": "_claimAmount", "type": "uint256" },
      { "internalType": "string", "name": "_description", "type": "string" }
    ],
    "name": "submitClaim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_claimId", "type": "uint256" },
      { "internalType": "uint8", "name": "_status", "type": "uint8" }
    ],
    "name": "processClaim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // --- View Functions ---
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "policies",
    "outputs": [
      { "name": "policyId", "type": "uint256" },
      { "name": "policyholder", "type": "address" },
      { "name": "planType", "type": "uint8" },
      { "name": "coverageAmount", "type": "uint256" },
      { "name": "status", "type": "uint8" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }],
    "name": "getUserPolicies",
    "outputs": [{ "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  }
];