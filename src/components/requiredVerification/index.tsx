import React from "react";
import {
  AtSign,
  AudioWaveform,
  ChartPie,
  CloudUpload,
  Fullscreen,
  HeadphonesIcon,
  Key,
  Languages,
  Lock,
  ScanFace,
  Unplug,
  X,
} from "lucide-react";
import Img from "../../assets/a.png";

interface RequiredVerificationsProps {
  isOpen: boolean;
  onRequestClose: () => void;
  token: string;
  verificationToken: string;
}

const RequiredVerifications = ({
  isOpen,
  onRequestClose,
  token,
  verificationToken,
}: RequiredVerificationsProps) => {
  return (
    <div className="kyc-p-2 kyc-flex kyc-flex-col kyc-h-full">
      <div className="kyc-flex kyc-justify-between kyc-items-center">
        <div className="kyc-rounded-full kyc-p-2 kyc-bg-gray-100">
          <Languages />
        </div>
        <h2 className="kyc-text-2xl kyc-font-bold">Vesona</h2>
        <div
          onClick={onRequestClose}
          className="kyc-rounded-full kyc-p-2 kyc-bg-gray-100 kyc-cursor-pointer"
        >
          <X />
        </div>
      </div>
      <div className="kyc-flex-1 kyc-overflow-y-auto">
        <img className="kyc-mx-auto" height={20} width={300} src={Img}></img>
        <div className="kyc-text-center">
          <p className="kyc-text-2xl kyc-font-bold">Verify Your Identify</p>
          <p>
            You will be asked to submit the following to verify your identity
          </p>
        </div>
        <div className="kyc-px-8 kyc-mt-16">
          <div className="kyc-flex kyc-items-center kyc-mb-7">
            <AudioWaveform />
            <div className="kyc-ml-3">
              <p className="kyc-font-bold">Record Your Voice</p>
              <p className="kyc-text-xs">
                To match your voice with a pre-recorded voice record
              </p>
            </div>
          </div>
          <div className="kyc-flex kyc-items-center kyc-mb-7">
            <AtSign />
            <div className="kyc-ml-3">
              <p className="kyc-font-bold">Verify your email</p>
              <p className="kyc-text-xs">
                To match your voice with a pre-recorded voice record
              </p>
            </div>
          </div>
          <div className="kyc-flex kyc-items-center kyc-mb-7">
            <HeadphonesIcon />
            <div className="kyc-ml-3">
              <p className="kyc-font-bold">Verify your phone</p>
              <p className="kyc-text-xs">
                To match your voice with a pre-recorded voice record
              </p>
            </div>
          </div>
          <div className="kyc-flex kyc-items-center kyc-mb-7">
            <ScanFace />
            <div className="kyc-ml-3">
              <p className="kyc-font-bold">Take a selfie</p>
              <p className="kyc-text-xs">
                To match your voice with a pre-recorded voice record
              </p>
            </div>
          </div>
          <div className="kyc-flex kyc-items-center kyc-mb-7">
            <CloudUpload />
            <div className="kyc-ml-3">
              <p className="kyc-font-bold">Upload document</p>
              <p className="kyc-text-xs">
                To match your voice with a pre-recorded voice record
              </p>
            </div>
          </div>
          <div className="kyc-flex kyc-items-center kyc-mb-7">
            <Unplug />
            <div className="kyc-ml-3">
              <p className="kyc-font-bold">Connect your Solana wallet</p>
              <p className="kyc-text-xs">
                This will require you to connect you Solana wallet
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* <p className="kyc-mb-4">Token: {token}</p>
        <p className="kyc-mb-4">Verification Token: {verificationToken}</p> */}
      <div>
        <hr />
        <div className="kyc-flex kyc-items-center kyc-text-gray-500 kyc-p-1 kyc-text-center kyc-w-full kyc-justify-center">
          <Lock size={12} />
          <p className="kyc-text-xs kyc-ml-2">
            All your information are secured and encrypted
          </p>
        </div>

        <button
          onClick={onRequestClose}
          className="kyc-bg-black kyc-text-white kyc-w-full kyc-px-4 kyc-py-3 kyc-rounded-xl hover:kyc-bg-gray-900 kyc-transition kyc-duration-200"
        >
          Agree and Continue
        </button>
      </div>
    </div>
  );
};

export default RequiredVerifications;
