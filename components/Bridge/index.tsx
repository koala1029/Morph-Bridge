import { useEffect, useState } from "react";
import AlertModal from "../alertModal";
import { InputBase } from "../scaffold-eth";
import BridgeButton from "./BridgeButton";
import NetworksSelectBoxIn from "./NetworkSelectBoxIn";
import NetworksSelectBoxOut from "./NetworkSelectBoxOut";
import TokenSelectBoxIn from "./TokenSelectBoxIn";
import TokenSelectBoxOut from "./TokenSelectBoxOut";
import { NUMBER_REGEX, chainDatas } from "./utils";
import { ethers } from "ethers";
import { useNetwork } from "wagmi";
import { enabledChains } from "~~/services/web3/wagmiConnectors";

export interface TokenInfo {
  chainId: number;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  priceUSD: number;
  coinKey: string;
  logoURI: string;
}
export interface Appstate {
  networkIn: number;
  networkOut: number;
  tokenAmount: string;
  token: TokenInfo | null;
}

const Bridge2 = () => {
  const { chain: connectedChain } = useNetwork();
  const [value, setValue] = useState<Appstate>({
    networkIn: connectedChain?.id ?? 1,
    networkOut: 2818,
    tokenAmount: "",
    token: null,
  });

  useEffect(() => {
    if (connectedChain) {
      setValue(prevState => ({
        ...prevState,
        networkIn: connectedChain?.id,
      }));
    }
  }, [connectedChain]);

  const handleTokenAmountChange = (amount: string) => {
    setValue(prevState => ({
      ...prevState,
      tokenAmount: Number(amount) < 0 ? "0" : amount,
    }));
  };

  const handleTokenChange = (token: TokenInfo) => {
    setValue(prevState => ({
      ...prevState,
      token: token,
    }));
  };

  const handleSetNetwork = async (networkId: number, isnetWorkIn: boolean) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    const current_network = await provider.getNetwork();
    if (isnetWorkIn == true && networkId != current_network.chainId) {
      try {
        const targetChainId = "0x" + networkId.toString(16);
        await (window.ethereum as any).request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: targetChainId }],
        });
        console.log("Successfully switched to the target chain.");
      } catch (switchError) {
        //   // If the chain is not added, add it
        if ((switchError as any).code === 4902) {
          console.log("Chain not found in the wallet. Adding the chain...");
          try {
            await (window.ethereum as any).request({
              method: "wallet_addEthereumChain",
              params: [chainDatas[networkId.toString()]],
            });
            console.log("Chain added and switched successfully.");
          } catch (addError) {
            console.error("Failed to add the chain:", addError);
          }
        } else {
          console.error("Failed to switch chain:", switchError);
        }
      }
      console.log("chain changed");
    }

    if (isnetWorkIn && networkId == value.networkOut) {
      const prevNetworkIn = value.networkIn;
      setValue(prevState => ({
        ...prevState,
        networkIn: networkId,
        networkOut: prevNetworkIn,
        token: null,
      }));
      return;
    }

    isnetWorkIn
      ? setValue(prevState => ({
          ...prevState,
          networkIn: networkId,
          // token: null,
        }))
      : setValue(prevState => ({
          ...prevState,
          networkOut: networkId,
          // token: null,
        }));
  };

  useEffect(() => {
    const handleChainChanged = (chainId: any) => {
      console.log("Switched to chain:", chainId);
      setValue(prevState => ({
        ...prevState,
        networkIn: Number(chainId),
        token: null,
      }));
    };

    (window.ethereum as any).on("chainChanged", handleChainChanged);

    return () => {
      (window.ethereum as any).removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  return (
    <section className="min-h-[400px] flex flex-col gap-8 rounded-lg bg-base-100 border border-gray-400 dark:border-gray-700 p-2 lg:w-[480px] max-w-full">
      <div className="flex justify-center items-center gap-4 max-w-[600px] mx-auto">
        <div className="w-1/2 min-w-[225px]">
          <NetworksSelectBoxIn
            setterFun={handleSetNetwork}
            networkIn={value.networkIn}
            networkOut={value.networkOut}
            token={value.token}
          />
        </div>
        <div className="w-1/2 min-w-[225px]">
          <TokenSelectBoxIn
            setterFun={handleTokenChange}
            networkIn={value.networkIn}
            networkOut={value.networkOut}
            token={value.token}
          />
        </div>
      </div>
      <div className="flex justify-center items-center gap-4 max-w-[600px] mx-auto">
        <div className="w-1/2 min-w-[225px]">
          <NetworksSelectBoxOut
            setterFun={handleSetNetwork}
            networkIn={value.networkIn}
            networkOut={value.networkOut}
            token={null}
          />
        </div>
        <div className="w-1/2 min-w-[225px]">
          <TokenSelectBoxOut
            setterFun={handleTokenChange}
            networkIn={value.networkIn}
            networkOut={value.networkOut}
            token={value.token}
          />
        </div>
      </div>

      <div className="px-2 py-4 bg-primary/30 rounded-2xl">
        <InputBase
          placeholder="0.00"
          darkText
          value={value.tokenAmount}
          onChange={e => handleTokenAmountChange(e)}
          error={
            Boolean(value.tokenAmount) &&
            !NUMBER_REGEX.test(value.tokenAmount?.toString() ? value.tokenAmount?.toString() : "")
          }
        />
      </div>

      <BridgeButton
        tokenAmount={value.tokenAmount}
        networkIn={value.networkIn}
        networkOut={value.networkOut}
        token={value.token}
      />
    </section>
  );
};

export default Bridge2;
