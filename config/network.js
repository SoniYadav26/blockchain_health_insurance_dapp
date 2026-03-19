// config/network.js
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains';
import { http } from 'wagmi';

export const config = getDefaultConfig({
  appName: 'Health Insurance DApp',
  projectId: 'YOUR_PROJECT_ID', // Yahan koi bhi string daal dein agar projectId nahi hai
  chains: [mainnet, sepolia],
  ssr: true, // NEXT.JS KE LIYE YE ZAROORI HAI
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});
