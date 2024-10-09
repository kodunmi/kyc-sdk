import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Video,
  StopCircle,
  RefreshCcw,
  Upload,
  Languages,
  Pause,
  Play,
} from "lucide-react";
import { CircularProgressbar } from "react-circular-progressbar";
import RecordingSvgOne from "../../assets/svgs/undraw_video_files_fu10.svg";
import * as faceapi from "face-api.js";

type Step = "agreement" | "permission" | "capture" | "review";

const VIDEO_DURATION = 120; // 2 minutes in seconds

const VideoAgreement: React.FC = () => {
  const [step, setStep] = useState<Step>("agreement");
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(VIDEO_DURATION);
  const [faceDetected, setFaceDetected] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoRefTwo = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [faceDetectionInterval, setFaceDetectionInterval] =
    useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (permissionGranted && step === "capture") {
      startVideoStream();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [permissionGranted, step]);

  useEffect(() => {
    const videoElement = videoRefTwo.current;
    if (videoElement) {
      const updateProgress = () => {
        if (videoElement.duration > 0) {
          const calculatedProgress =
            (videoElement.currentTime / videoElement.duration) * 100;
          setProgress(calculatedProgress);
        }
      };

      videoElement.addEventListener("timeupdate", updateProgress);
      videoElement.addEventListener("ended", () => setIsPlaying(false));

      return () => {
        videoElement.removeEventListener("timeupdate", updateProgress);
        videoElement.removeEventListener("ended", () => setIsPlaying(false));
      };
    }
  }, [videoBlob]);

  const startVideoStream = async () => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const startRecording = () => {
    if (stream) {
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = handleDataAvailable;
      mediaRecorderRef.current.onstop = handleStop;
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setTimeLeft(VIDEO_DURATION);
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            stopRecording();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const togglePlayPause = () => {
    if (videoRefTwo.current) {
      if (isPlaying) {
        videoRefTwo.current.pause();
      } else {
        if (videoRefTwo.current.readyState >= 3) {
          console.log("readyState");
          // The video is ready to play
          videoRefTwo.current.play().catch((error) => {
            console.error("Error playing video:", error);
          });
          setIsPlaying(true);
        } else {
          console.log(" videoRefTwo.current.addEventListener(");

          videoRefTwo.current.addEventListener(
            "canplay",
            () => {
              videoRefTwo.current?.play().catch((error) => {
                console.error("Error playing video:", error);
              });
              setIsPlaying(true);
            },
            { once: true }
          );
        }
      }
    }
  };

  const handleDataAvailable = (event: BlobEvent) => {
    if (event.data.size > 0) {
      chunksRef.current.push(event.data);
    }
  };

  const handleStop = () => {
    const blob = new Blob(chunksRef.current, { type: "video/webm" });
    setVideoBlob(blob);
    chunksRef.current = [];
    setStep("review");
  };

  const retakeVideo = () => {
    setVideoBlob(null);
    setStep("capture");
    setTimeLeft(VIDEO_DURATION);
  };

  const uploadVideo = () => {
    // Implement video upload logic here
    console.log("Uploading video:", videoBlob);
    // After successful upload, you might want to reset the component or move to a success state
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
          if (context && overlayCanvasRef.current) {
            faceapi.draw.drawDetections(overlayCanvasRef.current, [detections]);
            faceapi.draw.drawFaceLandmarks(overlayCanvasRef.current, [
              detections,
            ]);
          }
        } else {
          setFaceDetected(false);
        }
      }
    };

    const interval = setInterval(detectFace, 100);
    setFaceDetectionInterval(interval);
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

  useEffect(() => {
    if (step === "capture") {
      loadFaceDetectionModel();
    }
    return () => {
      if (faceDetectionInterval) {
        clearInterval(faceDetectionInterval);
      }
    };
  }, [step]);

  const renderAgreementStep = () => (
    <div className="kyc-p-4 kyc-flex kyc-flex-col kyc-h-full">
      <h2 className="kyc-text-2xl kyc-font-bold kyc-mb-4">Video Agreement</h2>
      <div className="kyc-flex-1 kyc-overflow-y-auto kyc-mb-4">
        <p>
          [Insert your agreement text here. Make sure to include all necessary
          information about the video capture process, data usage, and user
          rights.]
        </p>
      </div>
      <button
        onClick={() => setStep("permission")}
        className="kyc-bg-black kyc-text-white kyc-w-full kyc-px-4 kyc-py-3 kyc-rounded-xl hover:kyc-bg-gray-900 kyc-transition kyc-duration-200"
      >
        I Agree
      </button>
    </div>
  );

  const renderPermissionStep = () => (
    <div className="kyc-p-4 kyc-flex kyc-flex-col kyc-h-full">
      <div className="kyc-flex kyc-justify-between kyc-items-center kyc-mb-8">
        <div className="kyc-rounded-full kyc-p-2 kyc-bg-gray-100">
          <Languages size={24} />
        </div>
        <h2 className="kyc-text-2xl kyc-font-bold">IDen3fy</h2>
        <div
          onClick={() => setStep("agreement")}
          className="kyc-rounded-full kyc-p-2 kyc-bg-gray-100 kyc-cursor-pointer"
        >
          <X size={24} />
        </div>
      </div>
      <div className="kyc-flex-1 kyc-flex kyc-flex-col kyc-items-center">
        <div className="kyc-flex kyc-justify-center kyc-items-center kyc-w-full kyc-mt-16 kyc-mb-9">
          <img
            width={300}
            src={RecordingSvgOne}
            alt="Camera permission illustration"
          />
        </div>
        <p className="kyc-text-2xl kyc-font-bold kyc-mb-3">Video Permission</p>
        <p className="kyc-text-center kyc-mb-8">
          To capture your video, please give camera and microphone permission.
        </p>
      </div>
      <button
        onClick={() => {
          setPermissionGranted(true);
          setStep("capture");
        }}
        className="kyc-bg-black kyc-text-white kyc-w-full kyc-px-4 kyc-py-3 kyc-rounded-xl hover:kyc-bg-gray-900 kyc-transition kyc-duration-200"
      >
        Allow Camera and Microphone Access
      </button>
    </div>
  );

  const renderCaptureStep = () => {
    const progress = ((VIDEO_DURATION - timeLeft) / VIDEO_DURATION) * 100;

    return (
      <div className="kyc-relative kyc-h-full kyc-flex kyc-items-center kyc-justify-center">
        <div className="kyc-relative kyc-w-full kyc-h-full kyc-overflow-hidden">
          <video
            ref={videoRef}
            className="kyc-h-full kyc-w-full kyc-object-cover kyc-rounded-lg"
            autoPlay
            muted
            playsInline
          />
          <canvas
            ref={overlayCanvasRef}
            className="kyc-absolute kyc-top-0 kyc-left-0 kyc-w-full kyc-h-full kyc-pointer-events-none"
          />
          <div className="kyc-absolute kyc-top-2 kyc-left-2 kyc-bg-black/50 kyc-text-white kyc-px-2 kyc-py-1 kyc-rounded-lg">
            {Math.floor(timeLeft / 60)}:
            {(timeLeft % 60).toString().padStart(2, "0")}
          </div>
          <div className="kyc-absolute kyc-max-h-52 kyc-overflow-y-auto kyc-bottom-14 kyc-w-5/6 kyc-left-1/2 kyc-transform -kyc-translate-x-1/2 kyc-bg-black/50 kyc-text-white kyc-px-2 kyc-py-1 kyc-rounded-lg">
            [Insert your agreement text here. Make sure to include all necessary
            information about the video capture process, data usage, and user
            rights., Insert your agreement text here. Make sure to include all
            necessary information about the video capture process, data usage,
            and user rights.Insert your agreement text here. Make sure to
            include all necessary information about the video capture process,
            data usage, and user rights.Insert your agreement text here. Make
            sure to include all necessary information about the video capture
            process, data usage, and user rights., Insert your agreement text
            here. Make sure to include all necessary information about the video
            capture process, data usage, and user rights.Insert your agreement
            text here. Make sure to include all necessary information about the
            video capture process, data usage, and user rights.]
          </div>
          <div className="kyc-absolute kyc-top-4 kyc-left-1/2 kyc-transform -kyc-translate-x-1/2 kyc-text-white kyc-bg-black/50 kyc-px-4 kyc-py-2 kyc-text-nowrap kyc-rounded-full">
            {faceDetected ? "Start recording" : "No Face Detected"}
          </div>
          <div className="kyc-absolute kyc-bottom-4 kyc-left-1/2 kyc-transform -kyc-translate-x-1/2">
            <div className="kyc-flex kyc-items-center kyc-space-x-5">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="kyc-bg-red-500 kyc-text-white kyc-rounded-full kyc-p-6"
                >
                  <Video size={24} />
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="kyc-bg-red-500 kyc-relative kyc-text-white kyc-rounded-full kyc-p-6"
                >
                  <CircularProgressbar
                    className="kyc-absolute kyc-top-0 kyc-left-0"
                    value={progress}
                  />
                  <StopCircle size={24} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderReviewStep = () => (
    <div className="kyc-relative kyc-h-full kyc-flex kyc-items-center kyc-justify-center">
      <div className="kyc-relative kyc-w-full kyc-h-full  kyc-overflow-hidden">
        {videoBlob && (
          <>
            <video
              ref={videoRefTwo}
              src={URL.createObjectURL(videoBlob)}
              className="kyc-h-full kyc-w-full kyc-object-cover"
              playsInline
            />
            <div className="kyc-absolute kyc-inset-0 kyc-flex kyc-items-center kyc-justify-center">
              <div className="kyc-relative">
                <svg className="kyc-w-20 kyc-h-20">
                  <circle
                    cx="40"
                    cy="40"
                    r="38"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                    strokeDasharray="239.56"
                    strokeDashoffset={
                      239.56 -
                      (Math.max(0, Math.min(100, progress)) / 100) * 239.56
                    }
                    transform="rotate(-90 40 40)"
                  />
                </svg>
                <button
                  onClick={togglePlayPause}
                  className="kyc-absolute kyc-inset-0 kyc-flex kyc-items-center kyc-justify-center kyc-text-white kyc-bg-black/50 kyc-rounded-full"
                >
                  {isPlaying ? <Pause size={32} /> : <Play size={32} />}
                </button>
              </div>
            </div>
          </>
        )}
        <div className="kyc-absolute kyc-bottom-4 kyc-left-0 kyc-right-0 kyc-flex kyc-justify-center kyc-space-x-4">
          <button
            onClick={retakeVideo}
            className="kyc-bg-black/40 kyc-backdrop-blur-md kyc-rounded-full kyc-px-4 kyc-py-2 kyc-text-white kyc-flex kyc-items-center"
          >
            <RefreshCcw size={16} className="kyc-mr-2" />
            Retake
          </button>
          <button
            onClick={uploadVideo}
            className="kyc-bg-black/40 kyc-backdrop-blur-md kyc-rounded-full kyc-px-4 kyc-py-2 kyc-text-white kyc-flex kyc-items-center"
          >
            <Upload size={16} className="kyc-mr-2" />
            Upload
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="kyc-h-full kyc-flex kyc-flex-col">
      {step === "agreement" && renderAgreementStep()}
      {step === "permission" && renderPermissionStep()}
      {step === "capture" && renderCaptureStep()}
      {step === "review" && renderReviewStep()}
    </div>
  );
};

export default VideoAgreement;
