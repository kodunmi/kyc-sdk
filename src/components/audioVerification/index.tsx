import { Languages, X, Mic, RotateCcw, CheckCircle } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import Img from "../../assets/svgs/undraw_audio_player_re_cl20.svg";
import RecordingSvg from "../../assets/svgs/undraw_podcast_re_wr88.svg";
import RecordingSvgTwo from "../../assets/svgs/undraw_recording_re_5xyq.svg";
import RecordingSvgOne from "../../assets/svgs/undraw_audio_conversation_re_3t38.svg";
import { LiveAudioVisualizer } from "react-audio-visualize";

const AudioVerification = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isReadyToRecord, setIsReadyToRecord] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isRecorded, setIsRecorded] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string>("");
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [visualizerKey, setVisualizerKey] = useState<number>(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const askForAudioPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (stream) {
        setPermissionGranted(true);
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (error) {
      console.error("Permission denied:", error);
      setPermissionGranted(false);
    }
  };

  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else if (!isRecording && isReadyToRecord) {
      stopRecording();
    }
    console.log("isRecording:", isRecording);
    console.log("isRecorded:", isRecorded);
    console.log("audioURL:", audioURL);
    console.log("setIsReadyToRecord:", isReadyToRecord);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording, audioURL, isRecorded, isReadyToRecord]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContextRef.current = new (window.AudioContext ||
      window.AudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(analyserRef.current);

    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = (e) => {
      setAudioBlob(e.data);
      setAudioURL(URL.createObjectURL(e.data));
      setIsRecorded(true);
      setIsReadyToRecord(false);
    };

    mediaRecorderRef.current.start();

    setVisualizerKey((prevKey) => prevKey + 1);

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

    const updateLevel = () => {
      analyserRef?.current?.getByteFrequencyData(dataArray);
      const level =
        dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
      setAudioLevel(level / 256); // Normalizing level to be between 0 and 1
      if (isRecording) {
        requestAnimationFrame(updateLevel);
      }
    };

    updateLevel();

    setTimeout(() => {
      setIsRecording(false);
    }, 5000); // Stop recording after 5 seconds
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const handleReRecord = () => {
    setAudioBlob(null);
    setAudioURL("");
    setIsRecorded(false);
    setAudioLevel(0);
    setIsReadyToRecord(false);
    setIsRecording(false);
  };

  return (
    <div className="kyc-p-2 kyc-flex kyc-flex-col kyc-h-full">
      <div className="kyc-flex kyc-justify-between kyc-items-center">
        <div className="kyc-rounded-full kyc-p-2 kyc-bg-gray-100">
          <Languages />
        </div>
        <h2 className="kyc-text-2xl kyc-font-bold">IDen3fy</h2>
        <div
          onClick={() => {}}
          className="kyc-rounded-full kyc-p-2 kyc-bg-gray-100 kyc-cursor-pointer"
        >
          <X />
        </div>
      </div>

      <div className="kyc-flex-1 kyc-overflow-y-auto">
        {!permissionGranted ? (
          <div className="kyc-text-center">
            <div className="kyc-flex kyc-justify-center kyc-items-center kyc-w-full kyc-mt-16 kyc-mb-9">
              <img width={150} src={Img} alt="" />
            </div>
            <p className="kyc-text-2xl kyc-font-bold kyc-mb-3">
              Audio Permission
            </p>
            <p>To record your voice please give audio permission.</p>
          </div>
        ) : (
          <div className="kyc-text-center">
            {isRecorded && (
              <div>
                <div>
                  <div className="kyc-flex kyc-justify-center kyc-items-center kyc-w-full kyc-mt-16 kyc-mb-9">
                    <img width={150} src={RecordingSvgTwo} alt="" />
                  </div>
                  <p className="kyc-text-2xl kyc-font-bold">
                    Click Re-record or Continue
                  </p>
                  <p>Click continue to complete verification process</p>
                </div>
              </div>
            )}
            {!isRecorded && !isRecording && !isReadyToRecord && (
              <div>
                <div>
                  <div className="kyc-flex kyc-justify-center kyc-items-center kyc-w-full kyc-mt-16 kyc-mb-9">
                    <img width={150} src={RecordingSvg} alt="" />
                  </div>
                  <p className="kyc-text-2xl kyc-font-bold">
                    Click Record to start
                  </p>
                  <p>Audio will record for 5 seconds</p>
                </div>
              </div>
            )}

            {isRecording && (
              <div>
                <div className="kyc-flex kyc-justify-center kyc-items-center kyc-w-full kyc-mt-16 kyc-mb-9">
                  <img width={300} src={RecordingSvgOne} alt="" />
                </div>
                <p className="kyc-text-2xl kyc-font-bold">Recording...</p>
                <p>Please speak to the mic</p>

                <div className="kyc-mt-8 kyc-w-full kyc-flex kyc-justify-center">
                  {mediaRecorderRef.current && (
                    <LiveAudioVisualizer
                      key={visualizerKey}
                      mediaRecorder={mediaRecorderRef.current}
                      height={75}
                      width={300}
                      barColor={"#000000"}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div>
        {!permissionGranted ? (
          <button
            onClick={askForAudioPermission}
            className="kyc-bg-black kyc-text-white kyc-w-full kyc-px-4 kyc-py-3 kyc-rounded-xl hover:kyc-bg-gray-900 kyc-transition kyc-duration-200"
          >
            I will give permission
          </button>
        ) : (
          <div>
            {!isRecorded ? (
              <div className="kyc-flex kyc-flex-col kyc-gap-4">
                <button
                  onClick={() => {
                    setIsReadyToRecord(true);
                    setIsRecording(true);
                  }}
                  disabled={isRecording}
                  className="kyc-bg-black kyc-text-white kyc-w-full kyc-px-4 kyc-py-3 kyc-rounded-xl hover:kyc-bg-gray-900 kyc-transition kyc-duration-200"
                >
                  {isRecording ? "Recording..." : "Start Recording"}
                </button>
                {/* )} */}
              </div>
            ) : (
              <div className="kyc-flex kyc-flex-col kyc-items-center kyc-gap-4">
                <audio controls src={audioURL} className="kyc-w-full"></audio>
                <div className="kyc-grid kyc-grid-cols-3 kyc-gap-4 kyc-w-full">
                  <button
                    onClick={handleReRecord}
                    className="kyc-flex kyc-col-span-1 kyc-items-center kyc-gap-2 kyc-bg-transparent kyc-border kyc-text-nowrap kyc-text-black kyc-px-4 kyc-py-3 kyc-rounded-xl hover:kyc-bg-black hover:kyc-text-white kyc-transition kyc-duration-200"
                  >
                    <RotateCcw size={20} /> Re-record
                  </button>
                  <button
                    onClick={() => alert("Continue to verification")}
                    className="kyc-flex kyc-col-span-2 kyc-items-center kyc-gap-2  kyc-bg-black kyc-text-white kyc-px-4 kyc-py-3 kyc-rounded-xl hover:kyc-bg-gray-900 kyc-transition kyc-duration-200"
                  >
                    <CheckCircle size={20} /> Continue Verification
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioVerification;
