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
import VideoAgreement from "./components/videoAgreement";
import "react-circular-progressbar/dist/styles.css";
import ESignature from "./components/signature";
import DocumentUploadFlow from "./components/documentUpload";
import FaceCapture from "./components/faceCapture";

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
      <div className=" kyc-bg-white  kyc-text-gray-900 kyc-rounded-2xl kyc-shadow-lg kyc-w-full kyc-max-w-md kyc-max-h-[740px] kyc-h-[740px] kyc-overflow-scroll">
        {/* <FaceCapture /> */}
      </div>
    </ReactModal>
  );
};

export default Modal;

// import React, { useState } from "react";
// import ReactModal from "react-modal";
// import "./styles.css";
// import RequiredVerifications from "./components/requiredVerification";
// import DefaultLoader from "./components/loading/defaultLoader";
// import AudioPermission from "./components/audioVerification/permission";
// import RecordAudio from "./components/audioVerification/record";
// import AudioVerification from "./components/audioVerification";
// import ImageCapture from "./components/photoVerification";
// import EmailVerification from "./components/emailVerification";
// import PhoneVerification from "./components/phoneVerification";
// import SolanaWalletConnectorWithProvider from "./components/walletVerifcation";
// import VideoAgreement from "./components/videoAgreement";
// import "react-circular-progressbar/dist/styles.css";
// import ESignature from "./components/signature";
// import DocumentUploadFlow from "./components/documentUpload";

// interface ModalProps {
//   isOpen: boolean;
//   onRequestClose: () => void;
//   token: string;
//   verificationToken: string;
// }

// const Modal: React.FC<ModalProps> = ({
//   isOpen,
//   onRequestClose,
//   token,
//   verificationToken,
// }) => {
//   const [currentComponent, setCurrentComponent] = useState(0);

//   const components = [
//     <RequiredVerifications
//       isOpen={true}
//       onRequestClose={onRequestClose}
//       token={token}
//       verificationToken={verificationToken}
//     />,
//     // <DefaultLoader />,
//     <SolanaWalletConnectorWithProvider />,
//     <ESignature />,
//     <ImageCapture />,
//     <DocumentUploadFlow />,
//     <AudioVerification />,
//     <VideoAgreement />,
//     // <EmailVerification />,
//     // <PhoneVerification />,

//     <AudioPermission />,
//     <RecordAudio />,
//   ];

//   const nextComponent = () => {
//     setCurrentComponent((prev) => (prev + 1) % components.length);
//   };

//   return (
//     <ReactModal
//       isOpen={isOpen}
//       onRequestClose={onRequestClose}
//       contentLabel="KYC Verification"
//       className="kyc-modal kyc-fixed kyc-inset-0 kyc-flex kyc-items-center kyc-justify-center"
//       overlayClassName="kyc-overlay kyc-fixed kyc-inset-0 kyc-bg-gray-800 kyc-bg-opacity-75"
//     >
//       <div className="kyc-bg-white kyc-text-gray-900 kyc-rounded-2xl kyc-shadow-lg kyc-w-full kyc-max-w-md kyc-max-h-[740px] kyc-h-[740px] kyc-overflow-scroll kyc-flex kyc-flex-col">
//         <div className="kyc-flex-grow kyc-overflow-auto">
//           {components[currentComponent]}
//         </div>
//         <div className="kyc-p-4 kyc-border-t kyc-border-gray-200">
//           <button
//             onClick={nextComponent}
//             className="kyc-w-full kyc-bg-blue-500 kyc-text-white kyc-py-2 kyc-px-4 kyc-rounded kyc-hover:bg-blue-600 kyc-transition kyc-duration-200"
//           >
//             Next Component
//           </button>
//         </div>
//       </div>
//     </ReactModal>
//   );
// };

// export default Modal;
