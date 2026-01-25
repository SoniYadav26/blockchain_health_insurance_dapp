import { useEffect, useState } from "react";

export default function Dashboard() {
  const [address, setAddress] = useState("");

  useEffect(() => {
    const wallet = localStorage.getItem("walletAddress");
    if (!wallet) {
      window.location.href = "/";
    } else {
      setAddress(wallet);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="mb-4">Connected Wallet:</p>
      <p className="font-mono bg-gray-100 px-4 py-2 rounded">
        {address}
      </p>

      <button
        className="mt-6 bg-red-500 text-white px-4 py-2 rounded"
        onClick={() => {
          localStorage.removeItem("walletAddress");
          window.location.href = "/";
        }}
      >
        Disconnect Wallet
      </button>
    </div>
  );
}
