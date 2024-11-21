import React, { useState } from "react";
import { TokenInfo } from ".";
import AlertModal from "../alertModal";
import { NUMBER_REGEX } from "./utils";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import axios from "axios";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

const ETH = "0x0000000000000000000000000000000000000000";
const ROUTER_CONTRACT = "0x7497756ada7e656ae9f00781af49fc0fd08f8a8a"; // ETH Mainnet
const ROUTER_ABI = ["function depositETH(address _address, uint _amount, uint256 _gas_limit) external payable"];
const TOKEN_ABI = ["function approve(address _address, uint _amount) external"];

const gas_limit: number = 350000;
const generateTransaction = async (to: string, amount: string, gas_limit: string, value: string) => {
  const TransferTx = await new ethers.Contract(ROUTER_CONTRACT, ROUTER_ABI).populateTransaction.depositETH(
    to,
    amount,
    gas_limit,
    { value: value },
  );
  return TransferTx;
};

const getQuote = async (fromchainId: number, fromToken: string, fromAddress: string, amount: string) => {
  try {
    const endpoint = "https://li.quest/v1/quote/contractCalls";

    let quoteRequest = {
      fromChain: fromchainId,
      fromToken: fromToken,
      toChain: "ETH",
      toToken: ETH,
      fromAddress: fromAddress,
      fromAmount: amount,
    };
    const estimated_amount = await estimateAmount(quoteRequest);
    if (estimated_amount == 0) return;
    const deposit_amount = estimated_amount - gas_limit * 10 ** 8;
    const gas = ethers.utils.parseUnits(gas_limit.toString(), 8);

    const transferTx = await generateTransaction(
      fromAddress,
      deposit_amount.toString(),
      gas.toString(),
      estimated_amount.toString(),
    );
    console.log("estimateAmount -> ", estimated_amount);
    const contractQuoteRequest = {
      ...quoteRequest,
      contractCalls: [
        {
          fromTokenAddress: ETH,
          fromAmount: estimated_amount,
          toContractAddress: transferTx.to,
          toContractCallData: transferTx.data,
          toContractGasLimit: "350000",
        },
      ],
    };

    console.log("contractQuoteRequest", contractQuoteRequest);

    const response = await axios.post(endpoint, contractQuoteRequest);
    return response.data;
  } catch (error) {
    console.log(error);
    return;
  }
};

const estimateAmount = async (quoteRequest: any): Promise<number> => {
  const route_endpoint = "https://li.quest/v1/quote/";
  console.log("quoteRequest", quoteRequest);

  try {
    const response = await axios.get(route_endpoint, {
      params: quoteRequest,
    });
    console.log("response.data", response.data);
    let estimate = response.data.estimate;
    return estimate.toAmountMin as number;
  } catch (error) {
    console.log("estimateAmount ERROR", error);
    return 0;
  }
};

type SwapButtonProps = {
  networkIn: number;
  networkOut: number;
  tokenAmount: string;
  token: TokenInfo | null;
};

const BridgeButton: React.FC<SwapButtonProps> = ({ tokenAmount, networkIn, token }) => {
  // networkIn, networkOut,
  const { isConnected, isConnecting, address } = useAccount();
  const [alertOpen, setAlertOpen] = useState(false);
  const { openConnectModal } = useConnectModal();
  const { data: cusTokenBalance } = useScaffoldContractRead({
    contractName: "customToken",
    functionName: "balanceOf",
    args: [address],
  });

  const inSufficientFunds = cusTokenBalance && cusTokenBalance < Number(tokenAmount);
  const [isLoading, setLoading] = useState(false);
  const handleBridge = async () => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum as any);
      const current_network = await provider.getNetwork();
      const signer = provider.getSigner();
      const signer_address = await signer.getAddress();
      if (networkIn == 1 && token?.address == ETH) {
        console.log("deposit ETH");
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
        console.log("quote:", quote);
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
