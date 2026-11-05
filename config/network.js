import { localhost } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

export const config = getDefaultConfig({
  appName: process.env.NEXT_PUBLIC_APP_NAME || "HealthInsurance DApp",
  projectId: projectId,
  chains: [localhost],
  wallets: [{ groupName: "Wallet", wallets: [metaMaskWallet] }],
  ssr: true,
});

export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_LOCALHOST;
