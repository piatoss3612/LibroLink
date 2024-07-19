import {
  ModalBody,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import usePaymaster from "@/hooks/usePaymaster";
import GeneralPaymasterTab from "./GeneralPaymasterTab";
import ApprovalBasedPaymasterTab from "./ApprovalBasedPaymasterTab";
import { PaymasterType } from "@/types";

const PaymentModalBody = () => {
  const { paymasterType, setPaymasterType } = usePaymaster();

  console.log("paymasterType", paymasterType);

  const tabs = [
    {
      name: "General",
      paymasterType: "general" as PaymasterType,
      component: <GeneralPaymasterTab />,
    },
    {
      name: "Approval",
      paymasterType: "approval" as PaymasterType,
      component: <ApprovalBasedPaymasterTab />,
    },
  ];

  const handleTabChange = (index: number) => {
    setPaymasterType(tabs[index].paymasterType);
  };

  return (
    <ModalBody bg={"gray.100"} mx={6} rounded={"md"}>
      <Tabs isFitted onChange={handleTabChange}>
        <TabList>
          {tabs.map((tab, index) => (
            <Tab key={index}>{tab.name}</Tab>
          ))}
        </TabList>
        <TabPanels>
          {tabs.map((tab, index) => (
            <TabPanel key={index}>{tab.component}</TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </ModalBody>
  );
};

export default PaymentModalBody;
