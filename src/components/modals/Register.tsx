import React, { useState } from "react";
import ReactModal from "react-modal";
import "../../styles.css";
import "react-circular-progressbar/dist/styles.css"; // Fixed the path
import FaceCapture from "../../components/faceCapture";
import axios from "axios"; // Assuming you're using axios for API calls

interface ModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  token: string;
}

const RegisterModal: React.FC<ModalProps> = ({
  isOpen,
  onRequestClose,
  token,
}) => {
  const [images, setImages] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

  const [loading, setLoading] = useState({
    state: false,
    message: "",
  });

  const [error, setError] = useState({
    state: false,
    message: "",
  });

  const register = async (imageOne: string, imageTwo: string) => {
    // Ensure there are images captured
    if (images.length === 0) {
      setError({
        state: true,
        message: "Please capture your face before registering.",
      });
      return;
    }

    setLoading({
      state: true,
      message: "Crafting account",
    });
    setError({
      state: false,
      message: "",
    });
    setSuccess(null);

    try {
      const response = await axios.post(
        "http://localhost:4000/api/v1/customer",

        {
          imageOne,
          imageTwo,
        },
        {
          headers: {
            "Content-Type": "application/json", // Optional, but ensures the server knows to expect JSON
          },
        }
      );

      // Handle success response
      setSuccess("Registration successful!");
      console.log("Registration Response:", response.data);

      // Optionally, you can clear the images after successful registration
      setImages([]);
    } catch (err) {
      // Handle error
      setError({
        message: "Failed to register. Please try again.",
        state: true,
      });
      console.error("Registration Error:", err);
    } finally {
      //   setLoading({
      //     state: false,
      //     message: "",
      //   });
    }
  };

  const handleSubmit = (imageOne: string, imageTwo: string) => {
    register(imageOne, imageTwo);
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="KYC Verification"
      className="kyc-modal kyc-fixed kyc-inset-0 kyc-flex kyc-items-center kyc-justify-center"
      overlayClassName="kyc-overlay kyc-fixed kyc-inset-0 kyc-bg-gray-800 kyc-bg-opacity-75"
    >
      <div className="kyc-bg-white kyc-text-gray-900 kyc-rounded-2xl kyc-shadow-lg kyc-w-full kyc-max-w-md kyc-max-h-[740px] kyc-h-[740px] kyc-overflow-scroll">
        <FaceCapture
          setImagesFromOutside={setImages}
          imagesFromOutside={images}
          loading={loading}
          error={error}
          success={success}
          setLoading={setLoading}
          setError={setError}
          handleSubmit={handleSubmit}
        />

        {/* Loading, Success, and Error Messages */}
        {/* {loading && <p>Loading...</p>} */}
        {/* {success && <p className="text-green-500">{success}</p>} */}
        {/* {error && <p className="text-red-500">{error.message}</p>} */}

        {/* Button to trigger registration */}
        {/* <button onClick={handleSubmit} className="kyc-register-button">
          Register
        </button> */}
      </div>
    </ReactModal>
  );
};

export default RegisterModal;
