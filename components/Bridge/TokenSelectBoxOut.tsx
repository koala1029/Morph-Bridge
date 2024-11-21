import React from "react";
import Image from "next/image";
import { Appstate, TokenInfo } from ".";

export interface extendprops {
  setterFun: (token: TokenInfo) => void;
}

const TokenSelectBoxOut: React.FC<Omit<Appstate, "tokenAmount"> & extendprops> = ({}) => {
  const token: TokenInfo = {
    chainId: 1,
    address: "0x0000000000000000000000000000000000000000",
    symbol: "ETH",
    name: "ETH",
    decimals: 18,
    priceUSD: 3114.01,
    coinKey: "ETH",
    logoURI:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
  };
  return (
    <div>
      <p>Token</p>
      <div className="px-4 py-3 cursor-pointer rounded-2xl bg-primary/40">
        <div className="w-full dropdown dropdown-bottom">
          <div tabIndex={0} role="button" className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 overflow-hidden rounded-full">
                <Image src={token.logoURI} fill objectFit="cover" alt={`NetworkIcon`} />
              </div>
              <p>{token.name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenSelectBoxOut;
