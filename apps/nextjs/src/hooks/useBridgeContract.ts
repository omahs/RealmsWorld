"use client";

import { useEffect, useMemo, useState } from "react";
import { StarknetBridgeLords as L1_BRIDGE_ABI } from "@/abi/L1/StarknetBridgeLords";
import { ChainType, tokens } from "@/constants/tokens";
import { useContractWrite as useL2ContractWrite } from "@starknet-react/core";
import { parseEther } from "viem";
import {
  useAccount as useL1Account,
  useContractWrite as useL1ContractWrite,
  useWaitForTransaction,
} from "wagmi";

export const useBridgeContract = () => {
  const { address: addressL1 } = useL1Account();

  const network =
    process.env.NEXT_PUBLIC_IS_TESTNET === "true" ? "GOERLI" : "MAIN";

  const l1BridgeAddress =
    tokens.L1.LORDS.bridgeAddress?.[ChainType.L1[network]];
  const l2BridgeAddress =
    tokens.L2.LORDS.bridgeAddress?.[ChainType.L2[network]];

  const {
    writeAsync: deposit,
    data: depositData,
    error: depositError,
  } = useL1ContractWrite({
    address: l1BridgeAddress as `0x${string}`,
    abi: L1_BRIDGE_ABI,
    functionName: "deposit",
  });
  const {
    data: depositReceipt,
    isLoading,
    status: depositTxStatus,
    isSuccess: depositIsSuccess,
    isError: depostTxError,
  } = useWaitForTransaction({
    hash: depositData?.hash,
  });

  const { writeAsync: withdraw, error: withdrawError } = useL1ContractWrite({
    address: l1BridgeAddress as `0x${string}`,
    abi: L1_BRIDGE_ABI,
    functionName: "withdraw",
  });
  const {
    data: withdrawReceipt,
    isSuccess: withdrawIsSuccess,
    isError: withdrawTxError,
  } = useWaitForTransaction({
    hash: depositData?.hash,
  });

  const [amount, setAmount] = useState<string | null>();

  const calls = useMemo(() => {
    if (amount) {
      console.log(amount);
      const tx = {
        contractAddress: l2BridgeAddress as `0x${string}`,
        entrypoint: "initiate_withdrawal",
        calldata: [addressL1, parseEther(amount).toString(), 0],
      };
      return [tx];
    }
  }, [amount]);

  const { write, data: withdrawHash } = useL2ContractWrite({ calls });

  const initiateWithdraw = (amount: string) => {
    setAmount(amount);
  };
  useEffect(() => {
    if (calls?.length) {
      write();
      setAmount(null);
    }
  }, [calls]);

  return {
    calls,
    deposit,
    depositData,
    depositIsSuccess,
    error: depositError || depostTxError,
    depositTxStatus,
    depositReceipt,
    //depositEth,
    withdraw,
    withdrawError,
    withdrawReceipt,
    withdrawIsSuccess,
    initiateWithdraw,
    withdrawHash,
  };
};
