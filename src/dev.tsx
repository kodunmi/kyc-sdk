// src/dev.tsx
import React from "react";
import ReactDOM from "react-dom";
import KYC from "./KYC";

const DevApp: React.FC = () => {
  const handleVerify = () => {
    const kyc = new KYC("test-token");
    kyc.register();
  };

  return (
    <div className="kyc-bg-gray-100 kyc-h-screen kyc-text-center">
      <h1 className="kyc-text-[250px] kyc-text-center">iDen3fy Verification</h1>
      <button
        className="kyc-text-[100px] kyc-text-center"
        onClick={handleVerify}
      >
        Start Verification
      </button>
    </div>
  );
};

ReactDOM.render(<DevApp />, document.getElementById("root"));
