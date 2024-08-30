import { Languages, X } from "lucide-react";
import React, { useState } from "react";
import Img from "../../assets/svgs/undraw_opened_re_i38e.svg";
import { Input } from "../ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import PhoneInputWithCountrySelect from "react-phone-number-input";
import "react-phone-number-input/style.css";

const PhoneVerification = () => {
  const [sent, setSent] = useState(false);

  const handleSub = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("kkd");

    setSent(true);
  };
  return (
    <form
      onSubmit={(e) => handleSub(e)}
      className="kyc-p-2 kyc-flex kyc-flex-col kyc-h-full kyc-justify-center"
    >
      <div className="kyc-flex kyc-justify-between kyc-items-center">
        <div className="kyc-rounded-full kyc-p-2 kyc-bg-gray-100">
          <Languages />
        </div>
        <h2 className="kyc-text-2xl kyc-font-bold">Vesona</h2>
        <div
          onClick={() => {}}
          className="kyc-rounded-full kyc-p-2 kyc-bg-gray-100 kyc-cursor-pointer"
        >
          <X />
        </div>
      </div>
      <div className="kyc-flex-1 kyc-overflow-y-auto">
        {sent ? (
          <div className="kyc-text-center">
            <div className="kyc-flex kyc-justify-center kyc-items-center kyc-w-full kyc-mt-16 kyc-mb-9">
              <img width={150} src={Img} alt="" />
            </div>

            <p className="kyc-text-2xl kyc-font-bold kyc-mb-3">Verify Phone</p>
            <p>Enter the token sent to your phone</p>
            <div className="kyc-w-full kyc-flex kyc-justify-center kyc-mt-8">
              <InputOTP maxLength={5}>
                <InputOTPGroup>
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>
        ) : (
          <div className="kyc-text-center">
            <div className="kyc-flex kyc-justify-center kyc-items-center kyc-w-full kyc-mt-16 kyc-mb-9">
              <img width={150} src={Img} alt="" />
            </div>

            <p className="kyc-text-2xl kyc-font-bold kyc-mb-3">
              Phone Verification
            </p>
            <p>Enter your phone number to get an OTP</p>
            {/* <Input
              type="text"
              required
              placeholder="enter you remail"
              className="kyc-border-2 !kyc-border-black !kyc-w-5/6 kyc-rounded-lg kyc-mt-8 kyc-py-0 kyc-px-2 kyc-mx-auto"
            /> */}
            <div className="kyc-border-2 !kyc-border-black !kyc-w-5/6 kyc-rounded-lg kyc-mt-8 kyc-py-1  kyc-mx-auto">
              <PhoneInputWithCountrySelect
                className="kyc-py-1"
                onChange={(e) => {
                  console.log(e);
                }}
                international
                defaultCountry="RU"
              />
            </div>
          </div>
        )}
      </div>

      <div>
        {sent ? (
          <button
            type="submit"
            className="kyc-bg-black kyc-text-white kyc-w-full kyc-px-4 kyc-py-3 kyc-rounded-xl hover:kyc-bg-gray-900 kyc-transition kyc-duration-200"
          >
            Verify phone
          </button>
        ) : (
          <button
            type="submit"
            className="kyc-bg-black kyc-text-white kyc-w-full kyc-px-4 kyc-py-3 kyc-rounded-xl hover:kyc-bg-gray-900 kyc-transition kyc-duration-200"
          >
            Send phone verification
          </button>
        )}
      </div>
    </form>
  );
};

export default PhoneVerification;
