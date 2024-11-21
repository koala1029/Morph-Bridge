import axios from "axios";

export const getTokens = async (chainId: number) => {
  const optionalFilter = [chainId]; // Both numeric and mnemonic can be used
  /// chainTypes can be of type SVM and EVM. By default, only EVM tokens will be returned
  const optionalChainTypes = "EVM";
  const result = await axios.get("https://li.quest/v1/tokens", {
    params: {
      chains: optionalFilter.join(","),
      chainTypes: optionalChainTypes,
    },
  });
  return result.data;
};
