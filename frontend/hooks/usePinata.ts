import { PinJsonToPinataRequest, PinToPinataResponse } from "@/types";
import axios from "axios";

const usePinata = () => {
  const pinFileToIPFS = async (file: File): Promise<PinToPinataResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post<PinToPinataResponse>(
      "/api/pinFileToPinata",
      formData,
      {}
    );

    if (!response || response.status !== 200) {
      throw new Error("Error uploading file");
    }

    return response.data;
  };

  const pinJsonToIPFS = async (
    request: PinJsonToPinataRequest
  ): Promise<PinToPinataResponse> => {
    const response = await axios.post<PinToPinataResponse>(
      "/api/pinJsonToPinata",
      request,
      {}
    );

    if (!response || response.status !== 200) {
      throw new Error("Error uploading json");
    }

    return response.data;
  };

  return { pinFileToIPFS, pinJsonToIPFS };
};

export default usePinata;
