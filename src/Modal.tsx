import React from "react";
import ReactModal from "react-modal";
import "./styles.css";
import RequiredVerifications from "./components/requiredVerification";
import DefaultLoader from "./components/loading/defaultLoader";
import AudioPermission from "./components/audioVerification/permission";
import RecordAudio from "./components/audioVerification/record";
import AudioVerification from "./components/audioVerification";
import ImageCapture from "./components/photoVerification";
import EmailVerification from "./components/emailVerification";
import PhoneVerification from "./components/phoneVerification";
import SolanaWalletConnectorWithProvider from "./components/walletVerifcation";

interface ModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  token: string;
  verificationToken: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onRequestClose,
  token,
  verificationToken,
}) => {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="KYC Verification"
      className="kyc-modal kyc-fixed kyc-inset-0 kyc-flex kyc-items-center kyc-justify-center "
      overlayClassName="kyc-overlay kyc-fixed kyc-inset-0 kyc-bg-gray-800 kyc-bg-opacity-75"
    >
      <div className=" kyc-bg-white  kyc-text-gray-900 kyc-rounded-2xl kyc-shadow-lg kyc-w-full kyc-max-w-md kyc-h-[740px] kyc-overflow-hidden">
        {/* <RequiredVerifications
          isOpen={true}
          onRequestClose={onRequestClose}
          token={token}
          verificationToken={verificationToken}
        /> */}

        {/* <DefaultLoader /> */}

        {/* <AudioVerification /> */}

        {/* <ImageCapture /> */}

        {/* <EmailVerification /> */}

        {/* <PhoneVerification /> */}

        <SolanaWalletConnectorWithProvider />

        {/* not in use */}
        {/* <AudioPermission /> */}
        {/* <RecordAudio /> */}
      </div>
    </ReactModal>
  );
};

export default Modal;
