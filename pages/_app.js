import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { useState, useEffect } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { Toaster } from "react-hot-toast";

// Import config
import { config } from "../config/network";
import Layout from "../components/Layout/Layout";

// Client create karte waqt ye dhyan rakhein ki ye render ke bahar ho
const queryClient = new QueryClient();

export default function App({ Component, pageProps }) {
  // Hydration fix: Next.js server aur client ke mismatch ko rokne ke liye
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Jab tak component mount na ho (client-side), tab tak khali return karein 
  // Isse '_internal' undefined wala error solve ho jayega
  if (!mounted) return null;

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          modalSize="compact" 
          theme={lightTheme({
            accentColor: '#2563eb', 
            borderRadius: 'medium',
          })}
        >
          <Toaster position="top-center" reverseOrder={false} />
          
          <Layout>
            <Component {...pageProps} />
          </Layout>
          
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

