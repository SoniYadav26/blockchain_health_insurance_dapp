import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const DEFAULT_ETH_INR_RATE = 236500;
const RATE_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=inr";
const CACHE_KEY = "healthcare-chain:eth-inr-rate";
const CACHE_TTL = 60 * 1000;

const EthCurrencyContext = createContext({
  rate: DEFAULT_ETH_INR_RATE,
  loading: true,
  lastUpdated: null,
});

function readCachedRate() {
  if (typeof window === "undefined") return null;

  try {
    const cached = JSON.parse(window.localStorage.getItem(CACHE_KEY));
    if (cached?.rate > 0 && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached;
    }
  } catch (error) {
    window.localStorage.removeItem(CACHE_KEY);
  }

  return null;
}

async function fetchEthInrRate() {
  const response = await fetch(RATE_URL);
  if (!response.ok) throw new Error(`Rate request failed: ${response.status}`);

  const rate = Number((await response.json())?.ethereum?.inr);
  if (!Number.isFinite(rate) || rate <= 0) throw new Error("Invalid ETH/INR rate");

  const cached = { rate, timestamp: Date.now() };
  window.localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
  return cached;
}

export function EthCurrencyProvider({ children }) {
  const [rate, setRate] = useState(DEFAULT_ETH_INR_RATE);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const updateRate = async () => {
      try {
        const cached = readCachedRate();
        if (cached && active) {
          setRate(cached.rate);
          setLastUpdated(cached.timestamp);
          setLoading(false);
        }
        const next = await fetchEthInrRate();
        if (active) {
          setRate(next.rate);
          setLastUpdated(next.timestamp);
        }
      } catch (error) {
        // Keep the cached or default rate so UI values remain usable offline.
        console.warn("Unable to refresh ETH/INR rate; using fallback rate.", error);
      } finally {
        if (active) setLoading(false);
      }
    };

    updateRate();
    const interval = window.setInterval(updateRate, CACHE_TTL);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const value = useMemo(
    () => ({ rate, loading, lastUpdated }),
    [rate, loading, lastUpdated]
  );

  return (
    <EthCurrencyContext.Provider value={value}>
      {children}
    </EthCurrencyContext.Provider>
  );
}

export function useEthToInr() {
  return useContext(EthCurrencyContext);
}

export function formatInr(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export function formatEth(value, decimals = 4) {
  return `${(Number(value) || 0).toFixed(decimals)} ETH`;
}

export function formatEthInr(ethValue, rate = DEFAULT_ETH_INR_RATE) {
  return formatInr((Number(ethValue) || 0) * rate);
}
