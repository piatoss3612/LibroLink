import { PinToPinataResponse } from "@/types";
import axios from "axios";
import { NextRequest } from "next/server";

const PINATA_API_KEY = process.env.PINATA_API_KEY; // Set these in your .env.local file
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;
const PINATA_PIN_FILE_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";

// proxy to pinata
const POST = async (req: NextRequest) => {
  try {
    // TODO: validate user is authenticated

    const formData = await req.formData();

    const response = await axios.post<PinToPinataResponse>(
      PINATA_PIN_FILE_URL,
      formData,
      {
        headers: {
          "Content-Type": req.headers.get("Content-Type"),
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_SECRET_API_KEY,
        },
      }
    );

    if (!response) {
      return Response.json(
        {
          data: "failed to upload file to pinata",
        },
        { status: 500 }
      );
    }

    return Response.json(response.data, { status: response.status });
  } catch (e) {
    return Response.json(
      {
        data: "failed to upload file to pinata",
      },
      { status: 500 }
    );
  }
};

export { POST };
