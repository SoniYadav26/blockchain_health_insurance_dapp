import { useState } from "react";
import { useEthersSigner } from "../../provider/hooks";
import { contractService } from "../../services/contract";
import { ethers } from "ethers"; // Added for utility functions
import {
  FiPause,
  FiPlay,
  FiDollarSign,
  FiSettings,
  FiAlertTriangle,
  FiDownload,
  FiShield,
  FiZap,
  FiActivity,
  FiLock,
} from "react-icons/fi";
import toast from "react-hot-toast";

const ContractControls = ({ contractBalance, loading, onRefresh }) => {
  const signer = useEthersSigner();
  const [isPaused, setIsPaused] = useState(false);
  const [pausing, setPausing] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // Logic to handle emergency pause/unpause
  const handlePauseContract = async () => {
    try {
      setPausing(true);
      const contract = contractService.initContract(signer, true);
      if (!contract) throw new Error("Failed to initialize contract");

      // Dynamic transaction based on state
      const tx = isPaused ? await contract.unpause() : await contract.pause();

      toast.loading(isPaused ? "Unpausing..." : "Pausing...", { id: "pause" });
      await tx.wait();

      setIsPaused(!isPaused);
      toast.success(isPaused ? "Contract Active" : "Contract Paused", { id: "pause" });
      onRefresh();
    } catch (error) {
      toast.error(error.reason || "Transaction failed", { id: "pause" });
    } finally {
      setPausing(false);
    }
  };

  // Logic for partial withdrawal
  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    try {
      setWithdrawing(true);
      // Passing specific amount to the service
      const result = await contractService.withdraw(signer, withdrawAmount);

      if (result.success) {
        toast.success(`${withdrawAmount} ETH withdrawn!`);
        setWithdrawAmount("");
        onRefresh();
      }
    } catch (error) {
      toast.error("Withdrawal failed");
    } finally {
      setWithdrawing(false);
    }
  };

  // Logic for full emergency withdrawal
  const handleWithdrawAll = async () => {
    if (parseFloat(contractBalance) <= 0) {
      toast.error("No funds to withdraw");
      return;
    }

    if (!confirm("Are you sure? This will empty the contract.")) return;

    try {
      setWithdrawing(true);
      // Logic for full withdrawal (passing the total balance)
      const result = await contractService.withdraw(signer, contractBalance);

      if (result.success) {
        toast.success("Total balance cleared!");
        onRefresh();
      }
    } catch (error) {
      toast.error("Full withdrawal failed");
    } finally {
      setWithdrawing(false);
    }
  };

  const exportContractData = () => {
    const contractData = {
      contractBalance,
      timestamp: new Date().toISOString(),
      status: isPaused ? "Paused" : "Active",
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(contractData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "contract_audit.json");
    downloadAnchorNode.click();
    toast.success("Audit data exported");
  };

  return (
    <div className="space-y-8">
      {/* UI implementation remains same with your professional styling */}
      {/* ... (Your existing JSX structure here) ... */}
    </div>
  );
};

export default ContractControls;