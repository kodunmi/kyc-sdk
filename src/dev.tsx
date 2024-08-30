// src/dev.tsx
import React from "react";
import ReactDOM from "react-dom";
import KYC from "./KYC";

const DevApp: React.FC = () => {
  const handleVerify = () => {
    const kyc = new KYC("test-token");
    kyc.verify("test-verification-token");
  };

  return (
    <div>
      <h1>KYC SDK Dev Environment</h1>
      <button onClick={handleVerify}>Test Verify</button>
    </div>
  );
};

ReactDOM.render(<DevApp />, document.getElementById("root"));
