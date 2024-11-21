import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Appstate, TokenInfo } from ".";
import { ImageMap, bridge_chains_data, image_map, networkname_map } from "./utils";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { getTokens } from "~~/utils/lifi";

export interface extendprops {
  setterFun: (token: TokenInfo) => void;
}

const TokenSelectBoxOut: React.FC<Omit<Appstate, "tokenAmount"> & extendprops> = ({ networkIn, token, setterFun }) => {
  const [tokenlist, setTokenList] = useState<TokenInfo[]>([
    {
      chainId: 1,
      address: "0x0000000000000000000000000000000000000000",
      symbol: "ETH",
      name: "ETH",
      decimals: 18,
      priceUSD: 3114.01,
      coinKey: "ETH",
      logoURI:
        "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
    },
  ]);
  // const getData = async (network: number) => {
  //   const tokens = (await getTokens(network)).tokens[network.toString()];
  //   if (tokens.length > 10) {
  //     setTokenList(tokens.slice(0, 10));
  //   } else {
  //     setTokenList(tokens);
  //   }
  //   if (token == null) {
  //     setterFun(tokens[0]);
  //   }
  // };
  // useEffect(() => {
  //   getData(networkIn);
  // }, [networkIn, token]);
  return (
    <div>
      <p>Token</p>
      <div className="px-4 py-3 cursor-pointer rounded-2xl bg-primary/40">
        <div className="w-full dropdown dropdown-bottom">
          <div tabIndex={0} role="button" className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 overflow-hidden rounded-full">
                <Image
                  src={tokenlist.length > 0 ? tokenlist[0].logoURI : ""}
                  fill
                  objectFit="cover"
                  alt={`NetworkIcon`}
                />
              </div>
              <p>{tokenlist.length > 0 ? tokenlist[0].name : ""}</p>
            </div>
            {/* <ChevronDownIcon className="w-6 h-6" /> */}
          </div>
          {/* <ul tabIndex={0} className="dropdown-content gap-4 p-3 z-[1] menu p-2 shadow bg-base-100 rounded-box w-full">
            {tokenlist.map((item, i) => {
              return (
                <div
                  key={i}
                  className="flex items-center justify-between"
                  onClick={() => {
                    setterFun(item);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8 overflow-hidden rounded-full">
                      <Image src={item.logoURI} fill objectFit="cover" alt={`NetworkIcon`} />
                    </div>
                    <p>{item.symbol}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ChevronDownIcon className="w-6 h-6" />
                    {item.name == token?.name && <CheckIcon className="w-6 h-6" />}
                  </div>
                </div>
              );
            })}
          </ul> */}
        </div>
      </div>
    </div>
  );
};

export default TokenSelectBoxOut;
