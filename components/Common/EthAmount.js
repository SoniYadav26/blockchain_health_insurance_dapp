import { useEffect, useState } from "react";
import {
  DEFAULT_ETH_INR_RATE,
  formatEth,
  formatEthInr,
  useEthToInr,
} from "../../utils/ethCurrency";

export default function EthAmount({ value, decimals = 4, className = "" }) {
  const { rate } = useEthToInr();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const displayRate = isMounted ? rate : DEFAULT_ETH_INR_RATE;

  return (
    <span className={className} title={`${formatEth(value, decimals)} at the live ETH/INR rate`}>
      <span className="font-semibold" suppressHydrationWarning>
        {formatEthInr(value, displayRate)}
      </span>
      <span className="ml-1 text-xs font-normal text-gray-500">
        ({formatEth(value, decimals)})
      </span>
    </span>
  );
}
