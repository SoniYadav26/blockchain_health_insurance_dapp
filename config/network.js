import { polygon, localhost, sepolia } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

// WalletConnect Project ID (Local testing ke liye dummy string bhi chalegi agar .env khali hai)
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "YOUR_PROJECT_ID";

export const config = getDefaultConfig({
  appName: "Student Health Insurance DApp",
  projectId: projectId,
  // Student level par 'sepolia' (testnet) aur 'localhost' sabse best hain
  chains: [localhost, sepolia], 
  ssr: true, // Server Side Rendering support for Next.js
});

// Contract Address ko export kar rahe hain
// Localhost par kaam kar rahe ho toh ye address tab milega jab aap contract deploy karoge
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_LOCALHOST || "0x0000000000000000000000000000000000000000";