import { PaymasterContext } from "@/context/Paymaster";
import { useContext } from "react";

const usePaymaster = () => {
  return useContext(PaymasterContext);
};

export default usePaymaster;
