// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title HealthInsuranceDApp
 * @dev A decentralized health insurance platform with multiple plans and payment options
 */
contract HealthInsuranceDApp is ReentrancyGuard, Ownable, Pausable {
    
    uint256 private _policyIdCounter;
    uint256 private _claimIdCounter;
    
    // Insurance Plan Types
    enum PlanType { BASIC, PREMIUM, PLATINUM }
    
    // Policy Status
    enum PolicyStatus { ACTIVE, EXPIRED, CANCELLED, SUSPENDED }
    
    // Claim Status
    enum ClaimStatus { PENDING, APPROVED, REJECTED, PAID }
    
    // Payment Type
    enum PaymentType { ONE_TIME, MONTHLY }
    
    // Insurance Plan Structure
    struct InsurancePlan {
        PlanType planType;
        uint256 oneTimePrice;      // Price for one-time payment (1 year coverage)
        uint256 monthlyPrice;      // Monthly payment price
        uint256 coverageAmount;    // Maximum coverage amount
        uint256 deductible;        // Deductible amount
        string ipfsHash;           // IPFS hash for plan metadata
        bool isActive;
    }
    
    // Policy Structure
    struct Policy {
        uint256 policyId;
        address policyholder;
        PlanType planType;
        PaymentType paymentType;
        uint256 coverageAmount;
        uint256 deductible;
        uint256 premium;
        uint256 startDate;
        uint256 endDate;
        uint256 lastPaymentDate;
        PolicyStatus status;
        string ipfsMetadata;       // IPFS hash for policy documents
        uint256 totalPaid;
        uint256 claimsUsed;
    }
    
    // Claim Structure
    struct Claim {
        uint256 claimId;
        uint256 policyId;
        address claimant;
        uint256 claimAmount;
        uint256 approvedAmount;
        ClaimStatus status;
        uint256 submissionDate;
        uint256 processedDate;
        string ipfsDocuments;      // IPFS hash for claim documents
        string description;
    }
    
    // Mappings
    mapping(PlanType => InsurancePlan) public insurancePlans;
    mapping(uint256 => Policy) public policies;
    mapping(address => uint256[]) public userPolicies;
    mapping(uint256 => Claim) public claims;
    mapping(uint256 => uint256[]) public policyClaims;
    mapping(address => bool) public authorizedDoctors;
    
    // Events
    event PlanCreated(PlanType planType, uint256 oneTimePrice, uint256 monthlyPrice, uint256 coverageAmount);
    event PolicyPurchased(uint256 indexed policyId, address indexed policyholder, PlanType planType, PaymentType paymentType);
    event PremiumPaid(uint256 indexed policyId, address indexed policyholder, uint256 amount, uint256 timestamp);
    event ClaimSubmitted(uint256 indexed claimId, uint256 indexed policyId, address indexed claimant, uint256 amount);
    event ClaimProcessed(uint256 indexed claimId, ClaimStatus status, uint256 approvedAmount);
    event PolicyCancelled(uint256 indexed policyId, address indexed policyholder);
    event DoctorAuthorized(address indexed doctor, bool authorized);
    
    // Modifiers
    modifier onlyPolicyholder(uint256 _policyId) {
        require(policies[_policyId].policyholder == msg.sender, "Not the policyholder");
        _;
    }
    
    modifier onlyAuthorizedDoctor() {
        require(authorizedDoctors[msg.sender], "Not an authorized doctor");
        _;
    }
    
    modifier validPolicy(uint256 _policyId) {
        require(_policyId > 0 && _policyId <= _policyIdCounter, "Invalid policy ID");
        require(policies[_policyId].status == PolicyStatus.ACTIVE, "Policy not active");
        _;
    }
    
    constructor() Ownable(msg.sender) {
        // Initialize default insurance plans
        _initializeDefaultPlans();
    }
    
    /**
     * @dev Initialize default insurance plans
     */
    function _initializeDefaultPlans() private {
        // Basic Plan
        insurancePlans[PlanType.BASIC] = InsurancePlan({
            planType: PlanType.BASIC,
            oneTimePrice: 0.1 ether,      // Annual premium
            monthlyPrice: 0.01 ether,     // Monthly premium
            coverageAmount: 10 ether,     // Max coverage
            deductible: 0.5 ether,        // Deductible
            ipfsHash: "",
            isActive: true
        });
        
        // Premium Plan
        insurancePlans[PlanType.PREMIUM] = InsurancePlan({
            planType: PlanType.PREMIUM,
            oneTimePrice: 0.25 ether,
            monthlyPrice: 0.025 ether,
            coverageAmount: 25 ether,
            deductible: 0.25 ether,
            ipfsHash: "",
            isActive: true
        });
        
        // Platinum Plan
        insurancePlans[PlanType.PLATINUM] = InsurancePlan({
            planType: PlanType.PLATINUM,
            oneTimePrice: 0.5 ether,
            monthlyPrice: 0.05 ether,
            coverageAmount: 50 ether,
            deductible: 0.1 ether,
            ipfsHash: "",
            isActive: true
        });
    }
    
    /**
     * @dev Purchase an insurance policy
     * @param _planType Type of insurance plan
     * @param _paymentType Payment type (one-time or monthly)
     * @param _ipfsMetadata IPFS hash for policy metadata
     */
    function purchasePolicy(
        PlanType _planType,
        PaymentType _paymentType,
        string memory _ipfsMetadata
    ) external payable nonReentrant whenNotPaused {
        InsurancePlan memory plan = insurancePlans[_planType];
        require(plan.isActive, "Plan not available");
        
        uint256 requiredPayment;
        uint256 policyDuration;
        
        if (_paymentType == PaymentType.ONE_TIME) {
            requiredPayment = plan.oneTimePrice;
            policyDuration = 365 days; // 1 year coverage
        } else {
            requiredPayment = plan.monthlyPrice;
            policyDuration = 30 days; // 1 month coverage
        }
        
        require(msg.value >= requiredPayment, "Insufficient payment");
        
        _policyIdCounter++;
        uint256 newPolicyId = _policyIdCounter;
        
        policies[newPolicyId] = Policy({
            policyId: newPolicyId,
            policyholder: msg.sender,
            planType: _planType,
            paymentType: _paymentType,
            coverageAmount: plan.coverageAmount,
            deductible: plan.deductible,
            premium: requiredPayment,
            startDate: block.timestamp,
            endDate: block.timestamp + policyDuration,
            lastPaymentDate: block.timestamp,
            status: PolicyStatus.ACTIVE,
            ipfsMetadata: _ipfsMetadata,
            totalPaid: msg.value,
            claimsUsed: 0
        });
        
        userPolicies[msg.sender].push(newPolicyId);
        
        // Refund excess payment
        if (msg.value > requiredPayment) {
            payable(msg.sender).transfer(msg.value - requiredPayment);
        }
        
        emit PolicyPurchased(newPolicyId, msg.sender, _planType, _paymentType);
        emit PremiumPaid(newPolicyId, msg.sender, requiredPayment, block.timestamp);
    }
    
    /**
     * @dev Pay monthly premium for existing policy
     * @param _policyId Policy ID
     */
    function payMonthlyPremium(uint256 _policyId) 
        external 
        payable 
        nonReentrant 
        onlyPolicyholder(_policyId) 
        validPolicy(_policyId) 
    {
        Policy storage policy = policies[_policyId];
        require(policy.paymentType == PaymentType.MONTHLY, "Not a monthly payment policy");
        require(block.timestamp > policy.endDate, "Premium not due yet");
        
        InsurancePlan memory plan = insurancePlans[policy.planType];
        require(msg.value >= plan.monthlyPrice, "Insufficient premium payment");
        
        // Extend policy for another month
        policy.endDate = block.timestamp + 30 days;
        policy.lastPaymentDate = block.timestamp;
        policy.totalPaid += msg.value;
        
        // Refund excess payment
        if (msg.value > plan.monthlyPrice) {
            payable(msg.sender).transfer(msg.value - plan.monthlyPrice);
        }
        
        emit PremiumPaid(_policyId, msg.sender, plan.monthlyPrice, block.timestamp);
    }
    
    /**
     * @dev Submit a claim
     * @param _policyId Policy ID
     * @param _claimAmount Claim amount
     * @param _ipfsDocuments IPFS hash for claim documents
     * @param _description Claim description
     */
    function submitClaim(
        uint256 _policyId,
        uint256 _claimAmount,
        string memory _ipfsDocuments,
        string memory _description
    ) external nonReentrant onlyPolicyholder(_policyId) validPolicy(_policyId) {
        require(_claimAmount > 0, "Claim amount must be greater than 0");
        require(block.timestamp <= policies[_policyId].endDate, "Policy expired");
        
        _claimIdCounter++;
        uint256 newClaimId = _claimIdCounter;
        
        claims[newClaimId] = Claim({
            claimId: newClaimId,
            policyId: _policyId,
            claimant: msg.sender,
            claimAmount: _claimAmount,
            approvedAmount: 0,
            status: ClaimStatus.PENDING,
            submissionDate: block.timestamp,
            processedDate: 0,
            ipfsDocuments: _ipfsDocuments,
            description: _description
        });
        
        policyClaims[_policyId].push(newClaimId);
        
        emit ClaimSubmitted(newClaimId, _policyId, msg.sender, _claimAmount);
    }
    
    /**
     * @dev Process a claim (only owner or authorized doctor)
     * @param _claimId Claim ID
     * @param _status New claim status
     * @param _approvedAmount Approved amount (if approved)
     */
    function processClaim(
        uint256 _claimId,
        ClaimStatus _status,
        uint256 _approvedAmount
    ) external nonReentrant {
        require(
            msg.sender == owner() || authorizedDoctors[msg.sender], 
            "Not authorized to process claims"
        );
        require(_claimId > 0 && _claimId <= _claimIdCounter, "Invalid claim ID");
        
        Claim storage claim = claims[_claimId];
        require(claim.status == ClaimStatus.PENDING, "Claim already processed");
        
        Policy storage policy = policies[claim.policyId];
        
        if (_status == ClaimStatus.APPROVED) {
            require(_approvedAmount > 0, "Approved amount must be greater than 0");
            require(_approvedAmount <= claim.claimAmount, "Approved amount exceeds claim");
            
            uint256 deductibleAmount = policy.deductible;
            uint256 maxCoverage = policy.coverageAmount - policy.claimsUsed;
            
            // Apply deductible and coverage limits
            uint256 payoutAmount = _approvedAmount > deductibleAmount ? 
                _approvedAmount - deductibleAmount : 0;
            
            if (payoutAmount > maxCoverage) {
                payoutAmount = maxCoverage;
            }
            
            claim.approvedAmount = payoutAmount;
            policy.claimsUsed += payoutAmount;
            
            if (payoutAmount > 0) {
                claim.status = ClaimStatus.APPROVED;
                // Note: In production, you'd want to implement a more sophisticated payout mechanism
                payable(claim.claimant).transfer(payoutAmount);
                claim.status = ClaimStatus.PAID;
            }
        } else {
            claim.status = _status;
        }
        
        claim.processedDate = block.timestamp;
        
        emit ClaimProcessed(_claimId, claim.status, claim.approvedAmount);
    }
    
    /**
     * @dev Cancel a policy
     * @param _policyId Policy ID
     */
    function cancelPolicy(uint256 _policyId) 
        external 
        nonReentrant 
        onlyPolicyholder(_policyId) 
    {
        Policy storage policy = policies[_policyId];
        require(policy.status == PolicyStatus.ACTIVE, "Policy not active");
        
        policy.status = PolicyStatus.CANCELLED;
        
        emit PolicyCancelled(_policyId, msg.sender);
    }
    
    /**
     * @dev Update plan metadata IPFS hash
     * @param _planType Plan type
     * @param _ipfsHash New IPFS hash
     */
    function updatePlanMetadata(PlanType _planType, string memory _ipfsHash) 
        external 
        onlyOwner 
    {
        insurancePlans[_planType].ipfsHash = _ipfsHash;
    }
    
    /**
     * @dev Authorize or deauthorize a doctor
     * @param _doctor Doctor address
     * @param _authorized Authorization status
     */
    function authorizeDoctorAddress(address _doctor, bool _authorized) 
        external 
        onlyOwner 
    {
        authorizedDoctors[_doctor] = _authorized;
        emit DoctorAuthorized(_doctor, _authorized);
    }
    
    /**
     * @dev Update insurance plan details
     * @param _planType Plan type
     * @param _oneTimePrice One-time payment price
     * @param _monthlyPrice Monthly payment price
     * @param _coverageAmount Coverage amount
     * @param _deductible Deductible amount
     */
    function updateInsurancePlan(
        PlanType _planType,
        uint256 _oneTimePrice,
        uint256 _monthlyPrice,
        uint256 _coverageAmount,
        uint256 _deductible
    ) external onlyOwner {
        InsurancePlan storage plan = insurancePlans[_planType];
        plan.oneTimePrice = _oneTimePrice;
        plan.monthlyPrice = _monthlyPrice;
        plan.coverageAmount = _coverageAmount;
        plan.deductible = _deductible;
        
        emit PlanCreated(_planType, _oneTimePrice, _monthlyPrice, _coverageAmount);
    }
    
    /**
     * @dev Get user's policies
     * @param _user User address
     * @return Array of policy IDs
     */
    function getUserPolicies(address _user) external view returns (uint256[] memory) {
        return userPolicies[_user];
    }
    
    /**
     * @dev Get policy claims
     * @param _policyId Policy ID
     * @return Array of claim IDs
     */
    function getPolicyClaims(uint256 _policyId) external view returns (uint256[] memory) {
        return policyClaims[_policyId];
    }
    
    /**
     * @dev Check if policy is active and valid
     * @param _policyId Policy ID
     * @return Boolean indicating if policy is valid
     */
    function isPolicyValid(uint256 _policyId) external view returns (bool) {
        if (_policyId == 0 || _policyId > _policyIdCounter) {
            return false;
        }
        
        Policy memory policy = policies[_policyId];
        return policy.status == PolicyStatus.ACTIVE && block.timestamp <= policy.endDate;
    }
    
    /**
     * @dev Get remaining coverage for a policy
     * @param _policyId Policy ID
     * @return Remaining coverage amount
     */
    function getRemainingCoverage(uint256 _policyId) external view returns (uint256) {
        Policy memory policy = policies[_policyId];
        return policy.coverageAmount > policy.claimsUsed ? 
            policy.coverageAmount - policy.claimsUsed : 0;
    }
    
    /**
     * @dev Emergency pause function
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause function
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Withdraw contract funds (only owner)
     */
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Get total policies count
     */
    function getTotalPolicies() external view returns (uint256) {
        return _policyIdCounter;
    }
    
    /**
     * @dev Get total claims count
     */
    function getTotalClaims() external view returns (uint256) {
        return _claimIdCounter;
    }
    
    // Fallback function to receive Ether
    receive() external payable {}
}