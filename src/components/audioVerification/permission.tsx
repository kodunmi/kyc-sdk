import { Languages, X } from "lucide-react";
import React, { useState } from "react";
import Img from "../../assets/svgs/undraw_audio_player_re_cl20.svg";

const AudioPermission = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);

  const askForAudioPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (stream) {
        setPermissionGranted(true);
        // Stop all tracks to avoid keeping the microphone open
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (error) {
      console.error("Permission denied:", error);
      setPermissionGranted(false);
    }
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
          <div className="kyc-flex kyc-justify-center kyc-items-center kyc-w-full kyc-mt-16 kyc-mb-9">
            <img width={150} src={Img} alt="" />
          </div>

          <p className="kyc-text-2xl kyc-font-bold kyc-mb-3">
            Audio Permission
          </p>
          <p>
            {permissionGranted
              ? "Audio permission granted. You can now record your voice."
              : "To record your voice please give audio permission."}
          </p>
        </div>
      </div>

      <div>
        <button
          onClick={askForAudioPermission}
          className="kyc-bg-black kyc-text-white kyc-w-full kyc-px-4 kyc-py-3 kyc-rounded-xl hover:kyc-bg-gray-900 kyc-transition kyc-duration-200"
        >
          {permissionGranted ? "Permission Granted" : "I will give permission"}
        </button>
      </div>
    </div>
  );
};

export default AudioPermission;
