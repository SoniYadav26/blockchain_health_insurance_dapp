const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HealthInsuranceDApp", function () {
  async function deployContract() {
    const [owner, policyholder] = await ethers.getSigners();
    const HealthInsuranceDApp = await ethers.getContractFactory(
      "HealthInsuranceDApp"
    );
    const insurance = await HealthInsuranceDApp.deploy();
    await insurance.waitForDeployment();
    return { insurance, owner, policyholder };
  }

  it("initializes the default insurance plans", async function () {
    const { insurance, owner } = await deployContract();
    const basicPlan = await insurance.insurancePlans(0);

    expect(await insurance.owner()).to.equal(owner.address);
    expect(basicPlan.oneTimePrice).to.equal(ethers.parseEther("0.1"));
    expect(basicPlan.monthlyPrice).to.equal(ethers.parseEther("0.01"));
    expect(basicPlan.isActive).to.equal(true);
  });

  it("allows a user to purchase a policy", async function () {
    const { insurance, policyholder } = await deployContract();
    const basicPlan = await insurance.insurancePlans(0);

    await expect(
      insurance.connect(policyholder).purchasePolicy(0, 0, "QmPolicy", {
        value: basicPlan.oneTimePrice,
      })
    )
      .to.emit(insurance, "PolicyPurchased")
      .withArgs(1, policyholder.address, 0, 0);

    const policy = await insurance.policies(1);
    expect(policy.policyholder).to.equal(policyholder.address);
    expect(policy.premium).to.equal(basicPlan.oneTimePrice);
    expect(await insurance.getTotalPolicies()).to.equal(1);
    expect(await insurance.isPolicyValid(1)).to.equal(true);
  });

  it("accepts and processes a claim for an active policy", async function () {
    const { insurance, owner, policyholder } = await deployContract();
    const basicPlan = await insurance.insurancePlans(0);

    await insurance.connect(policyholder).purchasePolicy(0, 0, "QmPolicy", {
      value: basicPlan.oneTimePrice,
    });
    await expect(
      insurance
        .connect(policyholder)
        .submitClaim(1, ethers.parseEther("0.6"), "QmDocuments", "Treatment")
    )
      .to.emit(insurance, "ClaimSubmitted")
      .withArgs(1, 1, policyholder.address, ethers.parseEther("0.6"));

    await expect(
      insurance
        .connect(owner)
        .processClaim(1, 1, ethers.parseEther("0.6"))
    ).to.emit(insurance, "ClaimProcessed");

    const claim = await insurance.claims(1);
    expect(claim.status).to.equal(3);
    expect(claim.approvedAmount).to.equal(ethers.parseEther("0.1"));
    expect(await insurance.getTotalClaims()).to.equal(1);
  });

  it("allows the policyholder to cancel an active policy", async function () {
    const { insurance, policyholder } = await deployContract();
    const basicPlan = await insurance.insurancePlans(0);

    await insurance.connect(policyholder).purchasePolicy(0, 0, "QmPolicy", {
      value: basicPlan.oneTimePrice,
    });
    await expect(insurance.connect(policyholder).cancelPolicy(1))
      .to.emit(insurance, "PolicyCancelled")
      .withArgs(1, policyholder.address);

    const policy = await insurance.policies(1);
    expect(policy.status).to.equal(2);
    expect(await insurance.isPolicyValid(1)).to.equal(false);
  });
});
