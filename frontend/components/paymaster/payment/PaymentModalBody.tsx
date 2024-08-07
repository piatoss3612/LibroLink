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
    <ModalBody>
      <Tabs isFitted onChange={handleTabChange} variant="soft-rounded">
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
