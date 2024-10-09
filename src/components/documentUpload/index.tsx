import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Upload,
  Eye,
  Trash2,
  ArrowLeft,
  CheckCircle,
  IdCard,
  IdCardIcon,
} from "lucide-react";
import kycDocuments from "../../assets/kycDocuments.json"; // Import the JSON file
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import Countries from "@/assets/json/countries/countries.json";
import Flags from "@/assets/json/countries/flags-16x16.json";
import DocImage from "@/assets/svgs/undraw_add_files.svg";
import { Button } from "../ui/button";

type Step =
  | "countrySelection"
  | "documentSelection"
  | "documentUpload"
  | "previewDocuments";

type CountryKeys = "USA" | "UK" | "Canada" | "India";

interface UploadStatus {
  [key: string]: "pending" | "success" | "error";
}

const DocumentUploadFlow: React.FC = () => {
  const [step, setStep] = useState<Step>("countrySelection");
  const [selectedCountry, setCountry] = useState<string>("");
  const [documents, setDocuments] = useState<{
    [key: string]: File | null | string;
  }>({});
  const [previews, setPreviews] = useState<{ [key: string]: string | null }>(
    {}
  );
  const [requiredDocuments, setRequiredDocuments] = useState<string[]>([]);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<string>("");
  const [uploadMode, setUploadMode] = useState<"camera" | "file">("camera"); // Toggle between camera and file upload
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const filteredCountries = Countries.filter((country) =>
    country.en.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (selectedCountry) {
      const countrySpecificDocs =
        kycDocuments.countries[selectedCountry as CountryKeys] || [];
      setRequiredDocuments([...kycDocuments.basic, ...countrySpecificDocs]);
      // Reset documents, previews, and upload status for the new country selection
      setDocuments({});
      setPreviews({});
      setUploadStatus({});
      setSelectedDocument(""); // Reset selected document on country change
    }
  }, [selectedCountry]);

  useEffect(() => {
    let mediaStream: MediaStream | null = null;

    const handleCamera = async () => {
      if (uploadMode === "camera" && isCameraOn) {
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        } catch (err) {
          console.error("Error accessing camera: ", err);
        }
      } else if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    };

    handleCamera();

    return () => {
      if (mediaStream) {
        const tracks = mediaStream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [uploadMode, isCameraOn]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountry(e.target.value);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    docName: string
  ) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setDocuments((prev) => ({ ...prev, [docName]: file }));
      setPreviews((prev) => ({
        ...prev,
        [docName]: URL.createObjectURL(file),
      }));
      setUploadStatus((prev) => ({ ...prev, [docName]: "pending" }));
      setStep("previewDocuments");
    }
  };

  const handleUploadClick = async (docName: string) => {
    const file = documents[docName];
    if (file) {
      try {
        // Simulate upload process
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Simulate a successful upload (Replace with actual upload logic)
        setUploadStatus((prev) => ({ ...prev, [docName]: "success" }));
      } catch (error) {
        // Handle upload error
        setUploadStatus((prev) => ({ ...prev, [docName]: "error" }));
      }
    }
  };

  const handleRemoveFile = (docName: string) => {
    setDocuments((prev) => ({ ...prev, [docName]: null }));
    setPreviews((prev) => ({ ...prev, [docName]: null }));
    setUploadStatus((prev) => ({ ...prev, [docName]: "pending" }));
  };

  const allDocumentsUploaded = Object.values(uploadStatus).every(
    (status) => status === "success"
  );

  const captureImage = (docName: string) => {
    console.log(docName);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (canvas && video) {
      const aspectRatio = 3 / 2;
      let captureWidth, captureHeight;

      if (video.videoWidth / video.videoHeight > aspectRatio) {
        captureHeight = video.videoHeight;
        captureWidth = video.videoHeight * aspectRatio;
      } else {
        captureWidth = video.videoWidth;
        captureHeight = video.videoWidth / aspectRatio;
      }

      const startX = (video.videoWidth - captureWidth) / 2;
      const startY = (video.videoHeight - captureHeight) / 2;

      canvas.width = captureWidth;
      canvas.height = captureHeight;

      const context = canvas.getContext("2d");
      if (context) {
        context.scale(-1, 1); // Mirror the image horizontally
        context.drawImage(
          video,
          startX,
          startY,
          captureWidth,
          captureHeight,
          -captureWidth, // Negative width to flip the image
          0,
          captureWidth,
          captureHeight
        );
        context.scale(-1, 1); // Reset the scaling

        setDocuments((prev) => ({
          ...prev,
          [docName]: canvas.toDataURL("image/png"),
        }));
        setPreviews((prev) => ({
          ...prev,
          [docName]: canvas.toDataURL("image/png"),
        }));
        setUploadStatus((prev) => ({ ...prev, [docName]: "pending" }));
        setStep("previewDocuments");

        video.pause();

        setIsCameraOn(false);
      }
    }
  };

  return (
    <div className="kyc-p-4 kyc-h-full kyc-flex kyc-flex-col">
      {step === "countrySelection" && (
        <>
          <div className="kyc-flex kyc-justify-between kyc-items-center kyc-mb-8">
            <div
              onClick={() => {
                setCountry("");
              }}
              className="kyc-rounded-full kyc-p-2 kyc-bg-gray-100 kyc-cursor-pointer"
            >
              <X size={24} />
            </div>
            <h2 className="kyc-text-2xl kyc-font-bold">Select Your Country</h2>
          </div>
          <Input
            placeholder="select your document country"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <ScrollArea className="h-72 w-48 rounded-md border kyc-flex-1">
            <div className=" kyc-py-4 ">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <div
                    key={country.id}
                    onClick={() => setCountry(country.alpha2)}
                    className={`text-sm kyc-py-3 kyc-flex kyc-justify-between kyc-items-center kyc-mb-2 kyc-cursor-pointer kyc-px-3 kyc-rounded-md ${
                      country.alpha2 == selectedCountry && "kyc-bg-gray-100"
                    } hover:kyc-bg-gray-100`}
                  >
                    <div>{country.en}</div>
                    <img
                      src={Flags[country.alpha2 as keyof typeof Flags]}
                      alt={country.en}
                    />
                  </div>
                ))
              ) : (
                <div className="text-center text-sm">No countries found</div>
              )}
            </div>
          </ScrollArea>

          <button
            onClick={() => setStep("documentSelection")}
            className="kyc-bg-black kyc-text-white kyc-px-4 kyc-py-2 kyc-rounded-lg hover:kyc-bg-gray-900"
            disabled={!selectedCountry}
          >
            {!selectedCountry ? "Select Country" : "Continue"}
          </button>
        </>
      )}

      {step === "documentSelection" && (
        <>
          <div className="kyc-flex kyc-justify-between kyc-items-center kyc-mb-8">
            <div
              onClick={() => {
                setStep("countrySelection");
                setCountry("");
              }}
              className="kyc-rounded-full kyc-p-2 kyc-bg-gray-100 kyc-cursor-pointer"
            >
              <ArrowLeft size={24} />
            </div>
            <h2 className="kyc-text-2xl kyc-font-bold">
              Select Document to Upload
            </h2>
          </div>
          <div className="kyc-px-2 kyc-py-2 kyc-rounded-lg kyc-border ">
            {requiredDocuments.map((doc) => (
              <div
                className={`kyc-cursor-pointer kyc-mb-4 kyc-flex kyc-py-4 kyc-px-3 kyc-rounded-md kyc-items-center kyc-justify-between hover:kyc-bg-gray-100 ${
                  selectedDocument == doc && "kyc-bg-gray-100"
                }`}
                key={doc}
                onClick={() => setSelectedDocument(doc)}
              >
                <p>{doc}</p>
                <IdCard />
              </div>
            ))}
          </div>
          <div className="kyc-flex-1"></div>

          {
            <button
              onClick={() => {
                setStep("documentUpload"), setIsCameraOn(true);
              }}
              className="kyc-bg-black kyc-text-white kyc-px-4 kyc-py-2 kyc-rounded-lg hover:kyc-bg-gray-900 mt-4"
              disabled={!selectedDocument}
            >
              {!selectedDocument
                ? "Select type"
                : ` Upload ${selectedDocument}`}
            </button>
          }
        </>
      )}

      {step === "documentUpload" && selectedDocument && (
        <>
          <div className="kyc-flex kyc-justify-between kyc-items-center kyc-mb-8">
            <div
              onClick={() => setStep("documentSelection")}
              className="kyc-rounded-full kyc-p-2 kyc-bg-gray-100 kyc-cursor-pointer"
            >
              <ArrowLeft size={24} />
            </div>
            <h2 className="kyc-text-2xl kyc-font-bold">
              Upload {selectedDocument}
            </h2>
          </div>

          {/* Toggle between Camera and File Upload */}
          <div className="kyc-mb-4">
            <div className="kyc-flex kyc-items-center kyc-mb-4 kyc-w-full">
              <button
                onClick={() => {
                  setUploadMode("file");
                  setIsCameraOn(false);
                }}
                className={`kyc-px-4 kyc-py-2 kyc-rounded-lg kyc-mr-2 kyc-w-full ${
                  uploadMode === "file" ? "kyc-bg-gray-300" : "kyc-bg-gray-100"
                }`}
              >
                Upload File
              </button>
              <button
                onClick={() => {
                  setUploadMode("camera");
                  setIsCameraOn(true);
                }}
                className={`kyc-px-4 kyc-py-2 kyc-rounded-lg kyc-w-full ${
                  uploadMode === "camera"
                    ? "kyc-bg-gray-300"
                    : "kyc-bg-gray-100"
                }`}
              >
                Use Camera
              </button>
            </div>

            {/* File Upload Mode */}
            {uploadMode === "file" && (
              <div className="kyc-mb-4">
                <div className="kyc-text-center kyc-flex kyc-flex-col kyc-items-center kyc-mt-3">
                  <p>Upload the main page of your {selectedDocument}</p>
                  <p>Max 5mb, pdf, jpeg, jpg, png</p>

                  <img src={DocImage} className="kyc-w-1/2 kyc-my-10" alt="" />
                </div>

                <Input
                  type="file"
                  onChange={(e) => handleFileChange(e, selectedDocument)}
                  className="kyc-w-full  kyc-border-2 kyc-rounded-lg kyc-border-dashed kyc-py-16 kyc-pb-24"
                  disabled={uploadStatus[selectedDocument] === "success"}
                  placeholder={`Choose ${selectedDocument}`}
                />
                {previews[selectedDocument] && (
                  <div className="kyc-flex kyc-items-center kyc-mt-2">
                    <button
                      onClick={() => handleRemoveFile(selectedDocument)}
                      className="kyc-bg-red-500 kyc-text-white kyc-px-2 kyc-py-1 kyc-rounded-lg hover:kyc-bg-red-700"
                      disabled={uploadStatus[selectedDocument] === "success"}
                    >
                      <Trash2 size={16} />
                    </button>
                    <a
                      href={previews[selectedDocument] as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="kyc-bg-blue-500 kyc-text-white kyc-px-2 kyc-py-1 kyc-ml-2 kyc-rounded-lg hover:kyc-bg-blue-700"
                    >
                      <Eye size={16} />
                    </a>
                    <button
                      onClick={() => handleUploadClick(selectedDocument)}
                      className="kyc-bg-green-500 kyc-text-white kyc-px-2 kyc-py-1 kyc-ml-2 kyc-rounded-lg hover:kyc-bg-green-700"
                      disabled={uploadStatus[selectedDocument] === "success"}
                    >
                      {uploadStatus[selectedDocument] === "pending"
                        ? "Upload"
                        : "Uploaded"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Camera Mode */}
            {uploadMode === "camera" && (
              <div className="kyc-text-center">
                <p className="kyc-font-semibold">
                  Capture the main page of your {selectedDocument}
                </p>
                <p className="kyc-my-3">
                  Position your document within the marked area and capture a
                  clear photo.
                </p>

                <div className="kyc-relative kyc-flex kyc-flex-col kyc-items-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    className="kyc-w-full kyc-h-full kyc-rounded-lg kyc-scale-x-[-1]"
                  ></video>

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="2 5 20 14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-id-card kyc-absolute kyc-opacity-50 kyc-top-[10px] kyc-w-[96%]"
                  >
                    <path d="M16 10h2" />
                    <path d="M16 14h2" />
                    <path d="M6.17 15a3 3 0 0 1 5.66 0" />
                    <circle cx="9" cy="11" r="2" />
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                  </svg>

                  <Button
                    onClick={() => captureImage(selectedDocument)}
                    className="kyc-rounded-lg kyc-mt-4"
                  >
                    Capture
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* <div className="kyc-flex kyc-justify-end kyc-mt-auto">
            <Button
              onClick={() => setStep("previewDocuments")}
              className="kyc-w-full"
              disabled={!allDocumentsUploaded}
            >
              Upload
            </Button>
          </div> */}
        </>
      )}

      {step === "previewDocuments" && previews[selectedDocument] && (
        <>
          <div className="kyc-flex kyc-justify-between kyc-items-center kyc-mb-8">
            <div
              onClick={() => {
                setStep("documentUpload");
                setPreviews({});
              }}
              className="kyc-rounded-full kyc-p-2 kyc-bg-gray-100 kyc-cursor-pointer"
            >
              <ArrowLeft size={24} />
            </div>
            <Button
              onClick={() => {
                setStep("documentUpload");
                setPreviews({});
                setIsCameraOn(true);
              }}
              className="kyc-text-sm kyc-rounded-3xl kyc-font-bold"
            >
              Retry
            </Button>
          </div>
          <img src={previews[selectedDocument]} alt="" />
          {/* <canvas ref={canvasRef} className="kyc-hidden" /> */}
          <Button className="kyc-mt-auto">Upload</Button>
        </>
      )}
      <canvas ref={canvasRef} className="kyc-hidden" />
    </div>
  );
};

export default DocumentUploadFlow;
