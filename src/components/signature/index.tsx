import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import {
  X,
  RefreshCcw,
  Upload,
  Languages,
  ArrowLeft,
  CloudDownload,
  ScrollText,
  Signature,
} from "lucide-react";
import img from "../../assets/svgs/system-uicons--document-stack.svg";

type Step = "signature" | "review";

const SignatureCapture: React.FC = () => {
  const [step, setStep] = useState<Step>("signature");
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const sigCanvasRef = useRef<SignatureCanvas | null>(null);

  const clearCanvas = () => {
    sigCanvasRef.current?.clear();
  };

  const saveSignature = () => {
    if (sigCanvasRef.current) {
      const url = sigCanvasRef.current
        .getTrimmedCanvas()
        .toDataURL("image/png");
      setSignatureUrl(url);
      setStep("review");
    }
  };

  const retakeSignature = () => {
    setSignatureUrl(null);
    setStep("signature");
  };

  const uploadSignature = () => {
    if (signatureUrl) {
      // Implement the logic to upload the signature
      console.log("Uploading signature:", signatureUrl);
    }
  };

  return (
    <div className="kyc-p-4 kyc-h-full kyc-flex kyc-flex-col">
      {step === "signature" && (
        <>
          <div className="kyc-flex kyc-justify-between kyc-items-center kyc-mb-8">
            <div
              onClick={clearCanvas}
              className="kyc-rounded-full kyc-p-2 kyc-bg-gray-100"
            >
              <ArrowLeft />
            </div>
            <h2 className="kyc-text-2xl kyc-font-bold">IDen3fy</h2>
            <div
              onClick={() => {}}
              className="kyc-rounded-full kyc-p-2 kyc-bg-gray-100 kyc-cursor-pointer"
            >
              <X size={24} />
            </div>
          </div>
          <div className="kyc-relative kyc-w-full kyc-py-2 kyc-flex kyc-justify-between kyc-px-2 kyc-border-2 kyc-mb-5 kyc-rounded-lg kyc-bg-gray-100">
            <div className="kyc-flex kyc-items-end">
              <ScrollText />
              <p className="kyc-ml-2">Stage one document for you to sign...</p>
            </div>
            <div>
              <CloudDownload />
            </div>
          </div>
          <div className="kyc-flex kyc-items-center kyc-mb-2">
            <Signature />
            <p className="kyc-ml-2 ">Please sign below to continue</p>
          </div>
          <div className="kyc-relative kyc-w-full kyc-h-64 kyc-border-2 kyc-border-dashed kyc-rounded-lg kyc-bg-gray-100">
            <SignatureCanvas
              ref={sigCanvasRef}
              penColor="black"
              canvasProps={{
                className: "kyc-w-full kyc-h-full kyc-cursor-crosshair",
              }}
            />
          </div>
          <div className="kyc-grid kyc-grid-cols-3 kyc-mt-auto kyc-space-x-4 kyc-w-full">
            <button
              onClick={clearCanvas}
              className="kyc-bg-gray-500 kyc-col-span-1 kyc-flex-nowrap kyc-text-white kyc-px-4 kyc-py-2 kyc-rounded-lg hover:kyc-bg-gray-700"
            >
              <RefreshCcw size={24} className="kyc-inline-block kyc-mr-2" />
              Clear
            </button>
            <button
              onClick={saveSignature}
              className="kyc-bg-black kyc-col-span-2 kyc-text-white kyc-px-4 kyc-py-2 kyc-rounded-lg hover:kyc-bg-gray-900"
            >
              <Upload size={24} className="kyc-inline-block kyc-mr-2" />
              Save Signature
            </button>
          </div>
        </>
      )}
      {step === "review" && signatureUrl && (
        <>
          <div className="kyc-flex kyc-justify-between kyc-items-center kyc-mb-8">
            <div
              onClick={retakeSignature}
              className="kyc-rounded-full kyc-p-2 kyc-bg-gray-100"
            >
              <ArrowLeft />
            </div>
            <h2 className="kyc-text-2xl kyc-font-bold">IDen3fy</h2>
            <div
              onClick={() => {}}
              className="kyc-rounded-full kyc-p-2 kyc-bg-gray-100 kyc-cursor-pointer"
            >
              <X size={24} />
            </div>
          </div>
          <img
            src={signatureUrl}
            alt="Signature"
            className="kyc-w-full kyc-h-64 kyc-border-2 kyc-border-dashed kyc-rounded-lg kyc-bg-white"
          />
          <div className="kyc-grid kyc-grid-cols-3  kyc-space-x-4 kyc-mt-auto">
            <button
              onClick={retakeSignature}
              className="kyc-bg-gray-500 kyc-col-span-1 kyc-text-white kyc-px-4 kyc-py-2 kyc-rounded-lg hover:kyc-bg-gray-700"
            >
              <RefreshCcw size={24} className="kyc-inline-block kyc-mr-2" />
              Retake
            </button>
            <button
              onClick={uploadSignature}
              className="kyc-bg-black kyc-col-span-2 kyc-text-white kyc-px-4 kyc-py-2 kyc-rounded-lg hover:kyc-bg-gray-900"
            >
              <Upload size={24} className="kyc-inline-block kyc-mr-2" />
              Upload Signature
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SignatureCapture;
