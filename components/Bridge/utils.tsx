import axios from "axios";
import { ethers } from "ethers";
import { arbitrum, base, mainnet, optimism } from "wagmi/chains";

const convertChainDataFormat = (chainData: any) => {
  const { id, name, nativeCurrency, rpcUrls, blockExplorers } = chainData;

  return {
    chainId: `0x${id.toString(16)}`, // Convert decimal ID to hexadecimal string
    chainName: name, // Use the provided name
    nativeCurrency: {
      name: nativeCurrency.name,
      symbol: nativeCurrency.symbol,
      decimals: nativeCurrency.decimals,
    },
    rpcUrls: rpcUrls.default?.http || [], // Use default RPC URL (array)
    blockExplorerUrls: blockExplorers.etherscan ? [blockExplorers.etherscan.url] : [blockExplorers.default?.url], // Use Etherscan URL or fallback to default
  };
};
export const chainDatas: { [key: string]: any } = {
  [mainnet.id]: convertChainDataFormat(mainnet),
  [arbitrum.id]: convertChainDataFormat(arbitrum),
  [optimism.id]: convertChainDataFormat(optimism),
  [base.id]: convertChainDataFormat(base),
};
// const bsc = "https://raw.githubusercontent.com/sushiswap/list/master/logos/network-logos/bsc.jpg";
// const polygon = "https://raw.githubusercontent.com/sushiswap/list/master/logos/network-logos/polygon.jpg";
const eth_icon = "https://raw.githubusercontent.com/sushiswap/list/master/logos/network-logos/ethereum.jpg";
const morph_icon = "https://bridge.morphl2.io/images/logo/morph2.svg";
const arbitrum_icon = "https://static.debank.com/image/coin/logo_url/arbitrum/854f629937ce94bebeb2cd38fb336de7.png";
const base_icon = "https://avatars.githubusercontent.com/u/108554348?s=48&v=4";
const optimism_icon = "https://cryptologos.cc/logos/optimism-ethereum-op-logo.png?v=035";

//TYPES
export type tokenType = "Ether" | "Wrapped Ether" | "All";
export type actionType = "Wrap" | "Unwrap";

// UTILS

export const NUMBER_REGEX = /^\.?\d+\.?\d*$/;
export const stripWeth = (token: bigint | undefined) => {
  let weth = 0;
  if (token !== undefined) {
    const _weth = Number(token) / 1e18;
    _weth === 0 ? (weth = 0) : (weth = _weth).toFixed(4);
  }
  return weth;
};

export const bridge_chains_data = [
  {
    chainName: "Ethereum",
    id: 1,
    url: eth_icon,
  },
  // {
  //   chainName: "BSC",
  //   id: 56,
  //   url: bsc_icon,
  // },
  // {
  //   chainName: "Polygon",
  //   id: 137,
  //   url: polygon_icon,
  // },
  {
    chainName: "Morph",
    id: 2818,
    url: morph_icon,
  },
  {
    chainName: "Arbitrum",
    id: 42161,
    url: arbitrum_icon,
  },
  {
    chainName: "Base",
    id: 8453,
    url: base_icon,
  },
  {
    chainName: "Optimism",
    id: 10,
    url: optimism_icon,
  },
];

export interface ImageMap {
  1: string;
  // 56: string;
  // 137: string;
  2818: string;
  42161: string;
  8453: string;
  10: string;
}

export const image_map: ImageMap = {
  1: eth_icon,
  // 56: bsc_icon,
  // 137: polygon_icon,
  2818: morph_icon,
  42161: arbitrum_icon,
  8453: base_icon,
  10: optimism_icon,
};

export const networkname_map: ImageMap = {
  1: "Ethereum",
  // 56: "Binance Smart Chain",
  // 137: "Polgon",
  2818: "Morph Chain",
  42161: "Arbitrum",
  8453: "Base",
  10: "Optimism",
};

export const ETH = "0x0000000000000000000000000000000000000000";
export const ROUTER_CONTRACT = "0x7497756ada7e656ae9f00781af49fc0fd08f8a8a"; // ETH Mainnet
export const ROUTER_ABI = ["function depositETH(address _address, uint _amount, uint256 _gas_limit) external payable"];
// const TOKEN_ABI = ["function approve(address _address, uint _amount) external"];
export const gas_limit = 500000;
export const generateTransaction = async (to: string, amount: string, gas_limit: string, value: string) => {
  const TransferTx = await new ethers.Contract(ROUTER_CONTRACT, ROUTER_ABI).populateTransaction.depositETH(
    to,
    amount,
    gas_limit,
    { value: value },
  );
  return TransferTx;
};

export const getQuote = async (fromchainId: number, fromToken: string, fromAddress: string, amount: string) => {
  try {
    const endpoint = "https://li.quest/v1/quote/contractCalls";

    const quoteRequest = {
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

    const transferTx = await generateTransaction(
      fromAddress,
      deposit_amount.toString(),
      gas_limit.toString(),
      estimated_amount.toString(),
    );
    console.log("estimateAmount -> ", estimated_amount);

    const contractQuoteRequest = {
      fromChain: fromchainId,
      fromToken: fromToken,
      toChain: "ETH",
      toToken: ETH,
      fromAddress: fromAddress,
      toAmount: estimated_amount,
      contractCalls: [
        {
          fromTokenAddress: ETH,
          fromAmount: estimated_amount,
          toContractAddress: transferTx.to,
          toContractCallData: transferTx.data,
          toContractGasLimit: "500000",
        },
      ],
    };

    const response = await axios.post(endpoint, contractQuoteRequest);
    console.log(Number(response.data.transactionRequest.value) / 10 ** 18);
    return response.data;
  } catch (error) {
    console.log(error);
    return;
  }
};

const estimateAmount = async (quoteRequest: any): Promise<number> => {
  const route_endpoint = "https://li.quest/v1/quote/";

  try {
    const response = await axios.get(route_endpoint, {
      params: quoteRequest,
    });
    console.log(Number(response.data.transactionRequest.value) / 10 ** 18);
    const estimate = response.data.estimate;
    return estimate.toAmountMin as number;
  } catch (error) {
    console.log(error);
    return 0;
  }
};
