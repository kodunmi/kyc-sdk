import React, { useState, useRef, useEffect } from "react";
import { Languages, SwitchCamera, X, Zap } from "lucide-react";
import * as faceapi from "face-api.js";
import RecordingSvgOne from "../../assets/svgs/undraw_video_files_fu10.svg";

const ImageCapture: React.FC = () => {
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [imageCaptured, setImageCaptured] = useState<boolean>(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [faceDetected, setFaceDetected] = useState<boolean>(false);
  const [headPosition, setHeadPosition] = useState<string>("center");
  const [headRotationSequence, setHeadRotationSequence] = useState<string[]>(
    []
  );
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isAtCentre, setIsAtCentre] = useState(false);

  useEffect(() => {
    if (permissionGranted) {
      startVideoStream();
      loadFaceDetectionModel();
    }
  }, [permissionGranted]);

  useEffect(() => {
    console.log("imageCaptured", imageCaptured);

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
      }, 2000);
    } else if (headRotationSequence.length > 2 && isAtCentre) {
      setHeadRotationSequence([]);
    } else if (headRotationSequence.includes("center")) {
      console.log(
        "center",
        headRotationSequence.includes("center"),
        headRotationSequence
      );

      setHeadRotationSequence([]);
    }
  }, [headRotationSequence, headPosition, isAtCentre, imageCaptured]);

  const startVideoStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error("Error accessing the camera:", error);
    }
  };

  const loadFaceDetectionModel = async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      startFaceDetection();
    } catch (error) {
      console.error("Error loading face detection model:", error);
    }
  };

  const startFaceDetection = () => {
    if (!videoRef.current || !overlayCanvasRef.current) return;

    const detectFace = async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        const detections = await faceapi
          .detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          )
          .withFaceLandmarks();

        const context = overlayCanvasRef.current?.getContext("2d");
        if (context && overlayCanvasRef.current) {
          context.clearRect(
            0,
            0,
            overlayCanvasRef.current.width,
            overlayCanvasRef.current.height
          );
        }

        if (detections) {
          setFaceDetected(true);

          // Calculate the midpoint and threshold for head position detection
          const landmarks = detections.landmarks;
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
            // newPosition = "center";
            setIsAtCentre(true);
          }

          console.log(newPosition !== headPosition, newPosition, headPosition);

          if (newPosition && newPosition !== headPosition) {
            setHeadPosition(newPosition);
            setHeadRotationSequence((prev) => {
              const lastPosition = prev[prev.length - 1];

              // Only update the sequence if the new position is different from the last one
              if (newPosition !== lastPosition) {
                const updatedSequence = [...prev, newPosition].slice(-5);
                console.log("Updated sequence:", updatedSequence);
                return updatedSequence;
              }

              return prev;
            });
          }

          // Draw face landmarks and direction indicator
          if (context && overlayCanvasRef.current) {
            // Draw landmarks
            faceapi.draw.drawFaceLandmarks(
              overlayCanvasRef.current,
              detections
            );

            // Draw direction indicator
            const mirroredMidpoint = {
              x: overlayCanvasRef.current.width - midpoint.x,
              y: midpoint.y,
            };

            const mirroredNosePosition = {
              x: overlayCanvasRef.current.width - nosePosition.x,
              y: nosePosition.y,
            };

            context.beginPath();
            context.moveTo(mirroredMidpoint.x, mirroredMidpoint.y);
            context.lineTo(mirroredNosePosition.x, mirroredNosePosition.y);
            context.strokeStyle = "yellow";
            context.lineWidth = 2;
            context.stroke();

            // Draw text indicating direction
            context.font = "20px Arial";
            context.fillStyle = "white";

            if (newPosition) {
              context.fillText(newPosition, 10, 30);
            }
          }
        } else {
          setFaceDetected(false);
        }
      }
      requestAnimationFrame(detectFace);
    };

    detectFace();
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (canvas && video) {
      const aspectRatio = 3 / 5;
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
        setImageSrc(canvas.toDataURL("image/png"));
        setImageCaptured(true);
        console.log("here na him");
        setHeadRotationSequence([]);
        video.pause();
      }
    }
  };

  const retakeImage = () => {
    setImageCaptured(false);
    setImageSrc(null);
    setHeadRotationSequence([]);

    startVideoStream();
    loadFaceDetectionModel();

    console.log("Resume video playback", videoRef.current);

    if (videoRef.current) {
      // Resume video playback
      videoRef.current.play();
    }
  };

  const uploadImage = () => {
    if (imageSrc) {
      console.log("Image uploaded:", imageSrc);
      // Handle image upload logic here
    }
  };

  return (
    <div className="kyc-h-full kyc-flex kyc-flex-col">
      {!permissionGranted ? (
        <div className="kyc-p-4 kyc-flex kyc-flex-col kyc-h-full">
          <div className="kyc-flex kyc-justify-between kyc-items-center kyc-mb-8">
            <div className="kyc-rounded-full kyc-p-2 kyc-bg-gray-100">
              <Languages size={24} />
            </div>
            <h2 className="kyc-text-2xl kyc-font-bold">Vesona</h2>
            <div
              onClick={() => {}}
              className="kyc-rounded-full kyc-p-2 kyc-bg-gray-100 kyc-cursor-pointer"
            >
              <X size={24} />
            </div>
          </div>
          <div className="kyc-flex-1 kyc-flex kyc-flex-col kyc-items-center">
            <div className="kyc-flex kyc-justify-center kyc-items-center kyc-w-full kyc-mt-16 kyc-mb-9">
              <img width={300} src={RecordingSvgOne} alt="" />
            </div>
            <p className="kyc-text-2xl kyc-font-bold kyc-mb-3">
              Video Permission
            </p>
            <p className="kyc-text-center kyc-mb-8">
              To capture your image, please give camera permission.
            </p>
          </div>
          <button
            onClick={() => setPermissionGranted(true)}
            className="kyc-bg-black kyc-text-white kyc-w-full kyc-px-4 kyc-py-3 kyc-rounded-xl hover:kyc-bg-gray-900 kyc-transition kyc-duration-200"
          >
            Allow Camera Access
          </button>
        </div>
      ) : (
        <div className="kyc-relative kyc-h-full">
          {!imageCaptured ? (
            <div className="kyc-relative kyc-w-full kyc-h-full">
              <video
                ref={videoRef}
                className="kyc-h-full kyc-w-full kyc-object-cover kyc-scale-x-[-1]"
                autoPlay
                muted
                playsInline
              />
              <div className="kyc-absolute kyc-bottom-4 kyc-left-1/2 kyc-transform -kyc-translate-x-1/2">
                <div className="kyc-flex kyc-items-center kyc-space-x-5">
                  <button
                    onClick={() => {}}
                    className="kyc-bg-black/40 kyc-backdrop-blur-md kyc-rounded-full kyc-p-4"
                  >
                    <SwitchCamera color="white" size={22} />
                  </button>
                  <button
                    onClick={captureImage}
                    className="kyc-h-16 kyc-w-16 kyc-bg-white kyc-rounded-full kyc-p-2"
                  >
                    <div className="kyc-h-full kyc-w-full kyc-rounded-full kyc-border-2 kyc-border-black"></div>
                  </button>
                  <button
                    onClick={() => {}}
                    className="kyc-bg-black/40 kyc-backdrop-blur-md kyc-rounded-full kyc-p-4"
                  >
                    <Zap color="white" size={22} />
                  </button>
                </div>
              </div>
              <canvas
                ref={overlayCanvasRef}
                className="kyc-absolute kyc-top-0 kyc-left-0 kyc-w-full kyc-h-full kyc-pointer-events-none"
              />
              <div className="kyc-absolute kyc-inset-0 kyc-flex kyc-items-center kyc-justify-center">
                <div className="kyc-border-4 kyc-border-white kyc-w-3/4 kyc-h-3/4 kyc-max-w-sm kyc-max-h-[calc(16/9*100vw)] kyc-aspect-[3/5]"></div>
              </div>
              <div className="kyc-absolute kyc-top-4 kyc-left-1/2 kyc-transform -kyc-translate-x-1/2 kyc-text-white kyc-bg-black/50 kyc-px-4 kyc-py-2 kyc-text-nowrap kyc-rounded-full">
                {faceDetected
                  ? `Turn your head ${
                      headRotationSequence.length === 0
                        ? "right"
                        : headRotationSequence.length === 1 && !isAtCentre
                        ? "to center"
                        : headRotationSequence.length === 1 && isAtCentre
                        ? "left"
                        : headRotationSequence.length === 2 && !isAtCentre
                        ? "to center"
                        : "and hold still"
                    }`
                  : "No Face Detected"}
              </div>
            </div>
          ) : (
            <div className="kyc-relative">
              <img
                src={imageSrc || undefined}
                alt="Captured"
                className="kyc-h-full kyc-w-full kyc-object-contain"
              />
              <div className="kyc-absolute kyc-bottom-4 kyc-left-0 kyc-right-0 kyc-flex kyc-justify-center kyc-space-x-4">
                <button
                  onClick={retakeImage}
                  className="kyc-bg-black/40 kyc-backdrop-blur-md kyc-rounded-full kyc-px-4 kyc-py-2 kyc-text-white"
                >
                  Retake
                </button>
                <button
                  onClick={uploadImage}
                  className="kyc-bg-black/40 kyc-backdrop-blur-md kyc-rounded-full kyc-px-4 kyc-py-2 kyc-text-white"
                >
                  Upload
                </button>
              </div>
            </div>
          )}
          <canvas ref={canvasRef} className="kyc-hidden" />
        </div>
      )}
    </div>
  );
};

export default ImageCapture;
