import { Languages, X, Mic, RotateCcw, CheckCircle } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

const RecordAudio = () => {
  const [isReadyToRecord, setIsReadyToRecord] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isRecorded, setIsRecorded] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string>("");
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else if (isRecording === false && isReadyToRecord) {
      stopRecording();
    }

    console.log("isRecording:", isRecording);
    console.log("isRecorded:", isRecorded);
    console.log("audioURL:", audioURL);
    console.log("setIsReadyToRecord:", isReadyToRecord);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

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
        <h2 className="kyc-text-2xl kyc-font-bold">Vesona</h2>
        <div
          onClick={() => {}}
          className="kyc-rounded-full kyc-p-2 kyc-bg-gray-100 kyc-cursor-pointer"
        >
          <X />
        </div>
      </div>
      <div className="kyc-flex-1 kyc-overflow-y-auto">
        <div className="kyc-text-center">
          <p className="kyc-text-2xl kyc-font-bold">
            {isRecording ? "Recording..." : "Click Record to start"}
          </p>
          <p>Audio will record for 5 seconds</p>
          {isRecording && (
            <div className="kyc-mt-4">
              <Mic
                size={50}
                className="kyc-text-red-500"
                style={{
                  transform: `scale(${2 + audioLevel})`,
                  transition: "transform 0.1s",
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div>
        {!isRecorded ? (
          <div className="kyc-flex kyc-flex-col kyc-gap-4">
            {!isReadyToRecord ? (
              <button
                onClick={() => setIsReadyToRecord(true)}
                disabled={isRecording}
                className="kyc-bg-black kyc-text-white kyc-w-full kyc-px-4 kyc-py-3 kyc-rounded-xl hover:kyc-bg-gray-900 kyc-transition kyc-duration-200"
              >
                I'm ready
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsRecording(true);
                }}
                disabled={isRecording}
                className="kyc-bg-black kyc-text-white kyc-w-full kyc-px-4 kyc-py-3 kyc-rounded-xl hover:kyc-bg-gray-900 kyc-transition kyc-duration-200"
              >
                {isRecording ? "Recording..." : "Start Recording"}
              </button>
            )}
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
    </div>
  );
};

export default RecordAudio;
