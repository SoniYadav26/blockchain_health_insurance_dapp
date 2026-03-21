// scripts/deploy.js
const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log(`\n🚀 Deploying Health Insurance DApp to ${network.name}...`);

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deploying contracts with account: ${deployer.address}`);

  // Check balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${ethers.formatEther(balance)} ETH`);

  // Deploy the contract
  console.log("\n⏳ Deploying HealthInsuranceDApp contract...");
  const HealthInsuranceDApp = await ethers.getContractFactory(
    "HealthInsuranceDApp"
  );

  const healthInsurance = await HealthInsuranceDApp.deploy();
  await healthInsurance.waitForDeployment();

  const contractAddress = await healthInsurance.getAddress();
  console.log(`✅ HealthInsuranceDApp deployed to: ${contractAddress}`);
  console.log(
    `🔍 Transaction hash: ${healthInsurance.deploymentTransaction().hash}`
  );

  // Wait for confirmations on testnet
  if (network.name !== "localhost" && network.name !== "hardhat") {
    console.log("⏳ Waiting for confirmations...");
    await healthInsurance.deploymentTransaction().wait(5);
    console.log("✅ Deployment confirmed!");
  }

  // Verify initial setup
  console.log("\n🔍 Verifying initial setup...");
  try {
    const basicPlan = await healthInsurance.insurancePlans(0); // PlanType.BASIC = 0
    const premiumPlan = await healthInsurance.insurancePlans(1); // PlanType.PREMIUM = 1
    const platinumPlan = await healthInsurance.insurancePlans(2); // PlanType.PLATINUM = 2

    console.log("📋 Insurance Plans initialized:");
    console.log(
      `   Basic Plan: ${ethers.formatEther(
        basicPlan.oneTimePrice
      )} ETH (annual) / ${ethers.formatEther(
        basicPlan.monthlyPrice
      )} ETH (monthly)`
    );
    console.log(
      `   Premium Plan: ${ethers.formatEther(
        premiumPlan.oneTimePrice
      )} ETH (annual) / ${ethers.formatEther(
        premiumPlan.monthlyPrice
      )} ETH (monthly)`
    );
    console.log(
      `   Platinum Plan: ${ethers.formatEther(
        platinumPlan.oneTimePrice
      )} ETH (annual) / ${ethers.formatEther(
        platinumPlan.monthlyPrice
      )} ETH (monthly)`
    );
  } catch (error) {
    console.log("⚠️  Could not verify initial setup:", error.message);
  }

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentHash: healthInsurance.deploymentTransaction().hash,
    blockNumber: healthInsurance.deploymentTransaction().blockNumber,
    gasUsed: healthInsurance.deploymentTransaction().gasLimit?.toString(),
    timestamp: new Date().toISOString(),
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentFile = path.join(deploymentsDir, `${network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`📄 Deployment info saved to: ${deploymentFile}`);

  // Contract verification instructions
  if (network.name === "holesky") {
    console.log("\n🔍 To verify the contract on Etherscan, run:");
    console.log(`npx hardhat verify --network holesky ${contractAddress}`);
  }

  console.log("\n✨ Deployment completed successfully!");
  console.log("\n📋 Next steps:");
  console.log("1. Update frontend with the new contract address");
  console.log("2. Upload plan metadata to IPFS and update contract");
  console.log("3. Authorize doctor addresses if needed");
  console.log("4. Test the contract functionality");

  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
