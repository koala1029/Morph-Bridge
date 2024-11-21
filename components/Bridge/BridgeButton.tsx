import React, { useState } from "react";
import { TokenInfo } from ".";
import AlertModal from "../alertModal";
import { ETH, NUMBER_REGEX, ROUTER_ABI, ROUTER_CONTRACT, gas_limit, getQuote } from "./utils";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";
import { useAccount } from "wagmi";

type SwapButtonProps = {
  networkIn: number;
  networkOut: number;
  tokenAmount: string;
  token: TokenInfo | null;
};

const BridgeButton: React.FC<SwapButtonProps> = ({ tokenAmount, networkIn, token }) => {
  const { isConnected, isConnecting } = useAccount();
  const [alertOpen, setAlertOpen] = useState(false);
  const { openConnectModal } = useConnectModal();

  const inSufficientFunds = false;
  const [isLoading, setLoading] = useState(false);
  const handleBridge = async () => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const signer = provider.getSigner();
      const signer_address = await signer.getAddress();
      if (networkIn == 1 && token?.address == ETH) {
        const amount = ethers.utils.parseEther(tokenAmount);
        const gas = ethers.utils.parseUnits(gas_limit.toString(), 8);
        const contract = new ethers.Contract(ROUTER_CONTRACT, ROUTER_ABI);
        await contract.connect(signer).depositETH(signer_address, amount, gas_limit, { value: amount.add(gas) });
      } else {
        const amount = ethers.utils.parseUnits(tokenAmount, token?.decimals);
        const quote = await getQuote(networkIn, (token as TokenInfo).address, signer_address, amount.toString());
        if (quote == undefined) {
          setAlertOpen(true);
          setLoading(false);
        }
        const tx = await signer.sendTransaction(quote.transactionRequest);
        await tx.wait();
      }
    } catch (error) {
      console.log("ERROR OCCURED:::", error);
    }
    setLoading(false);
  };
  return (
    <>
      {isConnected ? (
        <button
          className="w-full py-2 text-center rounded-lg cursor-pointer btn btn-secondary"
          // onClick={() => writeAsync?.()}
          onClick={() => {
            // isLoading = true;
            handleBridge();
          }}
          disabled={
            isLoading ||
            !NUMBER_REGEX.test(tokenAmount.toString()) ||
            inSufficientFunds ||
            tokenAmount.toString() === ""
          }
        >
          {isLoading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : !tokenAmount ? (
            <span>Enter Amount</span>
          ) : (
            <span>{inSufficientFunds ? "Insufficient Balance" : "Bridge Now"}</span>
          )}
        </button>
      ) : (
        <button
          onClick={openConnectModal}
          disabled={isConnecting}
          className="w-full py-2 text-center rounded-lg cursor-pointer btn btn-secondary"
        >
          {isConnecting && <span className="loading loading-spinner loading-sm"></span>}
          <span>Connect Wallet</span>
        </button>
      )}
      <AlertModal
        isOpen={alertOpen}
        onClose={() => {
          setAlertOpen(false);
        }}
        message={"ERROR"}
      />
    </>
  );
};

export default BridgeButton;
