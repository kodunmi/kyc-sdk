import React, { useState, useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import { Button } from "../ui/button";
import { AngryIcon, Check, Lock, X } from "lucide-react";
import QRCode from "react-qr-code";
import { InfinitySpin, TailSpin } from "react-loader-spinner";

const FaceCapture = ({
  loading,
  error,
  success,
  setImagesFromOutside,
  handleSubmit,
  imagesFromOutside,
  setLoading,
  setError,
}: {
  loading: {
    state: boolean;
    message: string;
  };
  error: {
    state: boolean;
    message: string;
  };
  success: string | null;
  setImagesFromOutside: React.Dispatch<React.SetStateAction<string[]>>;
  handleSubmit: (imageOne: string, imageTwo: string) => void;
  imagesFromOutside: string[];
  setLoading: React.Dispatch<
    React.SetStateAction<{
      state: boolean;
      message: string;
    }>
  >;
  setError: React.Dispatch<
    React.SetStateAction<{
      state: boolean;
      message: string;
    }>
  >;
}) => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [multipleFaces, setMultipleFaces] = useState(false);
  const [faceWithinSvg, setFaceWithinSvg] = useState(false);
  const [captureStage, setCaptureStage] = useState(0); // 0: setup, 1: blink, 2: nod
  const [blinkDetected, setBlinkDetected] = useState(false);
  const [nodDetected, setNodDetected] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [facePosition, setFacePosition] = useState<
    "ok" | "too far" | "too close" | "off center"
  >("ok");
  const [headPosition, setHeadPosition] = useState<string>("center");
  const [headRotationSequence, setHeadRotationSequence] = useState<string[]>(
    []
  );
  const [isAtCentre, setIsAtCentre] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const detectionRef = useRef<number | null>(null);
  const [rotationStage, setRotationStage] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (permissionGranted) {
      startVideoStream();
      loadFaceDetectionModel();
    }

    return () => {
      if (detectionRef.current) {
        cancelAnimationFrame(detectionRef.current); // Only cancel face detection
      }
      // Stop video stream only when unmounting
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [permissionGranted]);

  const startVideoStream = async () => {
    try {
      if (videoRef.current && !videoRef.current.srcObject) {
        // Only start if not already running
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const loadFaceDetectionModel = async () => {
    await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
    await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
    await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
    await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
    await faceapi.nets.faceExpressionNet.loadFromUri("/models");
    setIsDetecting(true);
  };

  const startFaceDetection = async () => {
    if (!isDetecting || !videoRef.current) return;

    const detections = await faceapi
      .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    setFaceDetected(detections.length > 0);
    setMultipleFaces(detections.length > 1);

    if (detections.length === 1) {
      const detection = detections[0];
      checkFaceWithinSvg(detection);

      if (captureStage === 1) {
        checkHeadRotation(detection);
      } else if (captureStage === 2) {
        checkHeadRotation(detection);
      }
    }

    detectionRef.current = requestAnimationFrame(startFaceDetection);
  };

  useEffect(() => {
    if (isDetecting) {
      detectionRef.current = requestAnimationFrame(startFaceDetection);
    }
    return () => {
      if (detectionRef.current) {
        cancelAnimationFrame(detectionRef.current);
      }
    };
  }, [isDetecting, captureStage]);

  const checkFaceWithinSvg = (
    detection: faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>
  ) => {
    if (videoRef.current && svgRef.current) {
      const videoRect = videoRef.current.getBoundingClientRect();
      const svgRect = svgRef.current.getBoundingClientRect();
      const faceBox = detection.detection.box;

      // Convert face coordinates to be relative to the video element
      const relativeX =
        (faceBox.x / videoRef.current.videoWidth) * videoRect.width;
      const relativeY =
        (faceBox.y / videoRef.current.videoHeight) * videoRect.height;
      const relativeWidth =
        (faceBox.width / videoRef.current.videoWidth) * videoRect.width;
      const relativeHeight =
        (faceBox.height / videoRef.current.videoHeight) * videoRect.height;

      // Calculate the center of the face

      // Calculate the center of the SVG

      // Calculate the distance between face center and SVG center

      // Set tolerance levels (adjust these values as needed)
      const maxSizeRatio = 0.6; // Face can occupy at most 60% of SVG size

      // Check face position and size
      if (
        relativeWidth < svgRect.width * 0.3 ||
        relativeHeight < svgRect.height * 0.3
      ) {
        setFacePosition("too far");
        setFaceWithinSvg(false);
      } else if (
        relativeWidth > svgRect.width * maxSizeRatio ||
        relativeHeight > svgRect.height * maxSizeRatio
      ) {
        setFacePosition("too close");
        setFaceWithinSvg(false);
      } else {
        setFacePosition("ok");
        setFaceWithinSvg(true);
      }
    }
  };

  const getFacePositionMessage = () => {
    if (!faceDetected) {
      return "No face detected";
    }
    if (multipleFaces) {
      return "Multiple faces detected";
    }
    if (!faceWithinSvg) {
      return "Position your face within the circle";
    }

    if (headRotationSequence.length === 0) {
      return "Turn your head right";
    }
    if (headRotationSequence.length === 1 && !isAtCentre) {
      return "Turn your head to center";
    }
    if (headRotationSequence.length === 1 && isAtCentre) {
      return "Turn your head left";
    }
    if (headRotationSequence.length === 2 && !isAtCentre) {
      return "Turn your head to center";
    }
    if (headRotationSequence.length === 2 && isAtCentre) {
      return "Great! Hold";
    }
    if (headRotationSequence.length === 3) {
      return "Turn your head right";
    }
    if (headRotationSequence.length === 4 && !isAtCentre) {
      return "Turn your head to center";
    }
    if (headRotationSequence.length === 4 && isAtCentre) {
      return "Turn your head left";
    }
    if (headRotationSequence.length === 5 && !isAtCentre) {
      return "Turn your head to center";
    }
    if (headRotationSequence.length === 5 && isAtCentre) {
      return "Head rotation complete!";
    }

    return "Continue rotating your head";
  };

  const checkHeadRotation = (
    detection: faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }>
  ) => {
    const landmarks = detection.landmarks;
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    const nose = landmarks.getNose();
    const nosePosition = nose[3];

    const midpoint = {
      x: (leftEye[0].x + rightEye[3].x) / 2,
      y: (leftEye[0].y + rightEye[3].y) / 2,
    };

    const eyeDistance = faceapi.euclideanDistance(
      [leftEye[0].x, leftEye[0].y],
      [rightEye[3].x, rightEye[3].y]
    );

    const threshold = eyeDistance * 0.1;
    const thresholdCentre = eyeDistance * 0.05;

    let newPosition;
    if (nosePosition.x < midpoint.x - threshold) {
      newPosition = "left";
      setIsAtCentre(false);
    } else if (nosePosition.x > midpoint.x + threshold) {
      newPosition = "right";
      setIsAtCentre(false);
    } else if (
      nosePosition.x > midpoint.x - thresholdCentre &&
      nosePosition.x < midpoint.x + thresholdCentre
    ) {
      setIsAtCentre(true);
    }

    if (newPosition && newPosition !== headPosition) {
      setHeadPosition(newPosition);
      setHeadRotationSequence((prev) => {
        const lastPosition = prev[prev.length - 1];
        if (newPosition !== lastPosition) {
          return [...prev, newPosition].slice(-5);
        }
        return prev;
      });
    }

    checkRotationCompletion();
  };

  const checkRotationCompletion = () => {
    if (
      headRotationSequence.length >= 3 &&
      headRotationSequence.includes("left") &&
      headRotationSequence.includes("right") &&
      isAtCentre
    ) {
      if (rotationStage === 0) {
        setRotationStage(1);
        setHeadRotationSequence([]);
      } else if (rotationStage === 1) {
        setRotationStage(2);
        setCaptureStage(2);

        console.log("stage two");

        // handleSubmit();
      }
    }
  };

  const compareFaces = async (image1Url: string, image2Url: string) => {
    setLoading({
      state: true,
      message: "Comparing faces",
    });

    const img1 = await faceapi.fetchImage(image1Url);
    const img2 = await faceapi.fetchImage(image2Url);

    const detections1 = await faceapi
      .detectSingleFace(img1)
      .withFaceLandmarks()
      .withFaceDescriptor();
    const detections2 = await faceapi
      .detectSingleFace(img2)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (detections1 && detections2) {
      const distance = faceapi.euclideanDistance(
        detections1.descriptor,
        detections2.descriptor
      );
      // Set a threshold for distance (adjust based on your requirements)
      const threshold = 0.6; // Example threshold

      if (distance < threshold) {
        setLoading({
          state: true,
          message: "Comparing faces",
        });
        handleSubmit(image1Url, image2Url);
      } else {
        setError({
          state: true,
          message: "Faces do not match, try again.",
        });

        setImagesFromOutside([]);

        // Clear the error message after 3 seconds
        setTimeout(() => {
          setError({ state: false, message: "" }); // Reset the error state
          setCaptureStage(0);
        }, 3000); // 3000 milliseconds = 3 seconds
      }

      console.log(distance < threshold, distance, threshold);

      //   setFaceComparisonResult(distance < threshold);
    } else {
      setError({
        state: true,
        message: "Faces do not match, try again.",
      });

      setImagesFromOutside([]);

      // Clear the error message after 3 seconds
      setTimeout(() => {
        setError({ state: false, message: "" }); // Reset the error state
        setCaptureStage(0);
      }, 3000); // 3000 milliseconds = 3 seconds
    }

    setLoading({
      state: false,
      message: "Comparing faces",
    });
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        // Draw the current frame from the video stream to the canvas
        context.drawImage(
          videoRef.current,
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );

        // Get the image data from the canvas
        const imageDataUrl = canvasRef.current.toDataURL("image/png");
        setImagesFromOutside((prev) => [...prev, imageDataUrl]);

        // Clear the canvas immediately after capturing the image
        context.clearRect(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );

        // Update the capture stage
        if (captureStage === 1) {
          setCaptureStage(2);
        } else if (captureStage === 2) {
          console.log(imagesFromOutside[0], imageDataUrl);

          setCaptureStage(3);

          compareFaces(imagesFromOutside[0], imageDataUrl);
        }
      }
    }
  };

  const startCapture = () => {
    setCaptureStage(1);
    setBlinkDetected(false);
    setNodDetected(false);
    setImagesFromOutside([]);
    setError({
      state: false,
      message: "",
    });
  };

  useEffect(() => {
    if (headRotationSequence.length > 0 && headRotationSequence[0] !== "left") {
      setHeadRotationSequence([]);
      return;
    }

    if (
      headRotationSequence.length === 2 &&
      isAtCentre &&
      headRotationSequence[1] === "right" &&
      headRotationSequence[0] === "left"
    ) {
      setTimeout(() => {
        captureImage();
      }, 1000);
    } else if (headRotationSequence.length > 2 && isAtCentre) {
      setHeadRotationSequence([]);
    } else if (headRotationSequence.includes("center")) {
      setHeadRotationSequence([]);
    }
  }, [headRotationSequence, headPosition, isAtCentre]);

  //   useEffect(() => {
  //     if (imagesFromOutside.length == 2) {
  //       console.log("they are two");

  //       compareFaces(imagesFromOutside[0], imagesFromOutside[1]);
  //     }
  //   }, [imagesFromOutside]);
  return (
    <div className="kyc-h-full kyc-bg-gray-100 dark:kyc-bg-slate-800">
      {!permissionGranted ? (
        <div className="kyc-h-full kyc-flex kyc-flex-col kyc-p-2">
          <div className="kyc-flex kyc-justify-between kyc-items-center kyc-p-2">
            <img className="kyc-w-32" src="/assets/logo.png" alt="" />
            <X className="kyc-cursor-pointer" />
          </div>

          <div className="kyc-flex-grow kyc-flex kyc-flex-col kyc-justify-center kyc-items-center">
            <p className="kyc-mb-2">Scan to continue on mobile</p>
            <QRCode value="hey" />
          </div>

          <Button
            onClick={() => setPermissionGranted(true)}
            className="kyc-w-full"
          >
            Continue
          </Button>
        </div>
      ) : (
        <div className="kyc-h-full kyc-flex kyc-flex-col ">
          <div className="kyc-relative">
            <video
              ref={videoRef}
              className="kyc-w-full kyc-h-auto kyc-scale-x-[-1] kyc-overflow-hidden kyc-rounded-b-2xl"
              autoPlay
              muted
              playsInline
            />
            <canvas
              ref={canvasRef}
              className="kyc-absolute kyc-top-0 kyc-left-0 kyc-w-full kyc-h-full"
            />

            <div className="kyc-absolute kyc-top-0 kyc-left-0 kyc-w-full kyc-h-full kyc-rounded-b-2xl kyc-overflow-hidden kyc-transform kyc-z-10">
              <svg
                className="kyc-w-full kyc-h-full"
                preserveAspectRatio="xMidYMid slice" // Ensure it covers the whole area
                viewBox="0 0 100 100" // Keep the viewBox square
              >
                <defs>
                  <mask id="face-mask">
                    <rect width="100%" height="100%" fill="white" />
                    <circle cx="50%" cy="50%" r="30%" fill="black" />{" "}
                    {/* Adjusted Inner circle size */}
                  </mask>
                </defs>
                <rect
                  width="100%"
                  height="100%"
                  fill="rgba(0, 0, 0, 0.8)"
                  mask="url(#face-mask)"
                />
              </svg>
            </div>

            <svg
              ref={svgRef}
              viewBox="0 0 100 100"
              className="kyc-absolute kyc-top-1/2 kyc-left-1/2 kyc-transform -kyc-translate-x-1/2 -kyc-translate-y-1/2 kyc-w-full kyc-h-full kyc-max-w-sm kyc-max-h-[calc(16/9*100vw)] kyc-aspect-[3/5]"
            >
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="white"
                strokeWidth="4"
              />
              <circle cx="35" cy="40" r="5" fill="white" />
              <circle cx="65" cy="40" r="5" fill="white" />
              <path
                d="M35 60 Q50 70 65 60"
                fill="none"
                stroke="white"
                strokeWidth="4"
              />
            </svg>

            <div className="kyc-absolute kyc-top-0 kyc-left-1/2 kyc-transform -kyc-translate-x-1/2 kyc-text-white  kyc-px-4 kyc-py-2 kyc-rounded-full kyc-z-30">
              {captureStage == 0 ? "Get Set" : getFacePositionMessage()}
            </div>

            <div className="kyc-absolute kyc-top-1 kyc-cursor-pointer kyc-right-2 kyc-text-white  kyc-px-4 kyc-py-2 kyc-rounded-full kyc-z-30">
              <X />
            </div>
            <div className="kyc-absolute kyc-top-1 kyc-left-2 kyc-text-white  kyc-px-4 kyc-py-2 kyc-rounded-full kyc-z-30">
              30
            </div>
          </div>
          <div className="kyc-flex-grow">
            {error.state ? (
              <div className="kyc-w-full kyc-flex kyc-flex-col kyc-items-center kyc-justify-center kyc-mt-4 kyc-h-full">
                <AngryIcon size={200} color="red" />
                <p>{error.message}</p>
                <div className="kyc-mt-4 kyc-p-2">
                  <Button
                    onClick={startCapture}
                    className="4 kyc-w-full kyc-rounded"
                  >
                    Try again
                  </Button>
                </div>
              </div>
            ) : loading.state ? (
              <div className="kyc-w-full kyc-flex kyc-items-center kyc-justify-center kyc-mt-4 kyc-h-full">
                {/* <InfinitySpin width="80" color="#000000" />
                 */}
                <TailSpin
                  visible={true}
                  height="200"
                  width="200"
                  color="#000000"
                  ariaLabel="tail-spin-loading"
                  radius="1"
                  wrapperStyle={{}}
                  wrapperClass=""
                />
              </div>
            ) : (
              captureStage > 0 && (
                <div className="kyc-flex kyc-justify-center kyc-items-center kyc-mt-10 kyc-space-x-5">
                  <div
                    className={`kyc-text-white kyc-rounded-full kyc-p-2 kyc-flex kyc-justify-center kyc-items-center ${
                      imagesFromOutside.length >= 1
                        ? "kyc-bg-green-800"
                        : "kyc-bg-gray-500"
                    }`}
                  >
                    {imagesFromOutside.length >= 1 ? (
                      <Check size={30} />
                    ) : (
                      <p className="kyc-w-7 kyc-text-center">1</p>
                    )}
                  </div>
                  <div
                    className={`kyc-text-white kyc-rounded-full  kyc-p-2 kyc-flex kyc-justify-center kyc-items-center ${
                      imagesFromOutside.length >= 2
                        ? "kyc-bg-green-800"
                        : "kyc-bg-gray-500"
                    }`}
                  >
                    {imagesFromOutside.length >= 2 ? (
                      <Check size={30} />
                    ) : (
                      <p className="kyc-w-7 kyc-text-center">2</p>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
          {captureStage === 0 && (
            <div className="kyc-mt-auto kyc-p-2">
              <div className="kyc-flex kyc-items-center">
                <Lock size={12} />
                <p className="kyc-ml-2 kyc-text-xs">
                  securely generate solona account, powered by iden3fy
                </p>
              </div>

              <Button
                onClick={startCapture}
                className="kyc-bottom-4 kyc-w-full  kyc-px-4 kyc-py-2 kyc-rounded"
              >
                Start Process
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FaceCapture;
