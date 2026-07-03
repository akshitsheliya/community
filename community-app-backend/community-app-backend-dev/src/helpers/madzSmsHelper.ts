import axios from "axios";
import logger from "../utils/logger";
import moment from "moment";
import { dbPool } from "../config/db";
import { insertQuery } from "./queryHelper";

const saveSmsLog = async (
  phone_number: string,
  sms_request_url: string,
  sms_api_response: string
) => {
  try {
    const query = `
      INSERT INTO tbl_sms_logs (
        phone_number,
        sms_request_url,
        sms_api_response,
        added_on
      ) VALUES (?, ?, ?, ?)
    `;

    await insertQuery(dbPool, query, [
      phone_number,
      sms_request_url,
      sms_api_response,
      moment().format(),
    ]);
  } catch (error) {
    logger.error("Failed to store SMS log in tbl_sms_logs", {
      phone_number,
      error,
    });
  }
};

/**
 * Sends OTP using MADZ SMS API URL template from env.
 * Env format example:
 * MADZ_SMS_API_URL=https://example.com/send?mobile=[MOBILE]&text=[SMS_TEXT]
 */
export const sendOtpViaMadzApi = async (
  phoneNumber: string,
  otp: string | number
) => {
  const apiTemplate = process.env.MADZ_SMS_API_URL;

  if (!apiTemplate) {
    throw new Error("MADZ_SMS_API_URL is not configured");
  }

  const mobile = (phoneNumber || "").replace(/\D/g, "").slice(-10);
  if (!mobile || mobile.length !== 10) {
    throw new Error("Invalid phone number for MADZ SMS API");
  }

  const smsText = `Your OTP for UMRALAAPP is ${otp}. This password would be valid for 5 minutes only. FLASHB`;

  const finalUrl = apiTemplate
    .replace("[MOBILE]", mobile)
    .replace("[SMS_TEXT]", encodeURIComponent(smsText));
  console.log(finalUrl);
  try {
    const response = await axios.get(finalUrl);
    const madzResponse = response.data;

    const status = madzResponse?.status;
    const isErrorStatus =
      status === 0 ||
      status === false ||
      status === "0" ||
      String(status).toUpperCase() === "ERROR" ||
      String(status).toUpperCase() === "FAILED" ||
      String(status).toUpperCase() === "FAIL";

    if (isErrorStatus) {
      const madzErrorMessage =
        madzResponse?.description?.desc ||
        madzResponse?.description ||
        madzResponse?.message ||
        "MADZ SMS API returned an error";

      await saveSmsLog(mobile, finalUrl, JSON.stringify(madzResponse));
      throw new Error(String(madzErrorMessage));
    }

    logger.info("MADZ SMS API response", {
      mobile,
      response: madzResponse,
    });
    await saveSmsLog(mobile, finalUrl, JSON.stringify(madzResponse));
    return madzResponse;
  } catch (error: any) {
    const apiError =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.response?.data ||
      error?.message ||
      "MADZ SMS API request failed";

    logger.error("MADZ SMS API error response", {
      mobile,
      error: apiError,
    });
    await saveSmsLog(
      mobile,
      finalUrl,
      typeof apiError === "string" ? apiError : JSON.stringify(apiError)
    );

    throw new Error(typeof apiError === "string" ? apiError : JSON.stringify(apiError));
  }
};
