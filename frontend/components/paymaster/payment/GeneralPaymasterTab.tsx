import {
  Divider,
  Highlight,
  ModalBody,
  TabPanel,
  Stack,
  Tooltip,
} from "@chakra-ui/react";
import { CheckCircleIcon, SmallCloseIcon } from "@chakra-ui/icons";
import { Line } from "../common";
import usePaymaster from "@/hooks/usePaymaster";
import React from "react";

const GeneralPaymasterTab = () => {
  const {
    requestName,
    fee,
    gasPrice,
    dailyTxCount,
    dailyLimit,
    cost,
    canResetDailyTxCount,
    paymasterAvailable,
    errorMessage,
    paymasterType,
    selectedToken,
    setSelectedToken,
    supportedTokensList,
  } = usePaymaster();

  return (
    <TabPanel>
      <Stack m={4} spacing={4} justify="center" align="center">
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
        <Line left="Daily Limit:" right={`${dailyTxCount}/${dailyLimit}`} />
        <Line
          left="Reset Daily Limit:"
          right={
            <Tooltip label="Reset on UTC 6:00 AM" aria-label="A tooltip">
              {canResetDailyTxCount ? (
                <CheckCircleIcon color="green" />
              ) : (
                <SmallCloseIcon color="red" />
              )}
            </Tooltip>
          }
        />
        <Divider />
        <Line left="Estimated Cost:" right={`${cost} ETH`} />
        {paymasterAvailable && (
          <Line
            left="Paymaster Discount:"
            right={
              <Highlight
                query={"-100%"}
                styles={{
                  px: "2",
                  py: "1",
                  rounded: "full",
                  bg: "green.100",
                  fontWeight: "bold",
                }}
              >
                -100%
              </Highlight>
            }
          />
        )}
        <Divider />
        <Line
          left="Total Cost:"
          right={`${paymasterAvailable ? "FREE" : `${cost} ETH`}`}
        />
      </Stack>
    </TabPanel>
  );
};

export default GeneralPaymasterTab;
