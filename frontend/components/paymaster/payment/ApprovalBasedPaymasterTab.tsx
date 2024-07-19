import React from "react";
import { Divider, Highlight, TabPanel, Stack, Select } from "@chakra-ui/react";
import { Line } from "../common";
import usePaymaster from "@/hooks/usePaymaster";

const ApprovalBasedPaymasterTab = () => {
  const {
    requestName,
    fee,
    gasPrice,
    cost,
    errorMessage,
    selectedToken,
    setSelectedToken,
    supportedTokensList,
    tokenBalance,
    ethPriceInToken,
  } = usePaymaster();

  const tokenSymbol = selectedToken ? selectedToken.symbol : "";

  const handleTokenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedToken(supportedTokensList[Number(e.target.value)]);
  };

  return (
    <TabPanel>
      <Stack spacing={4} justify="center" align="center">
        {errorMessage && (
          <Highlight
            query={errorMessage}
            styles={{
              px: "2",
              py: "1",
              rounded: "full",
              bg: "red.500",
              fontWeight: "bold",
              fontSize: "lg",
              color: "white",
            }}
          >
            {errorMessage}
          </Highlight>
        )}
        <Line left="Transaction:" right={requestName} />
        <Line left="Transaction Fee:" right={`${fee} ETH`} />
        <Line left="Gas Price:" right={`${gasPrice} ETH`} />
        <Divider />
        <Select
          variant="flushed"
          placeholder="Select Supported Token"
          onChange={handleTokenChange}
        >
          {supportedTokensList.map((token, idx) => (
            <option key={idx} value={idx}>
              {token.name}
            </option>
          ))}
        </Select>
        <Line left="Token Balance:" right={`${tokenBalance} ${tokenSymbol}`} />
        <Divider />
        <Line left="Estimated Cost:" right={`${cost} ETH`} />
        <Divider />
        <Line left="Total Cost:" right={`${ethPriceInToken} ${tokenSymbol}`} />
      </Stack>
    </TabPanel>
  );
};

export default ApprovalBasedPaymasterTab;
