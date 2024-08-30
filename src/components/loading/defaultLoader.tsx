import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const DefaultLoader = () => {
  return (
    <div className="kyc-p-2 kyc-flex kyc-flex-col kyc-h-full">
      <div>
        <div className="kyc-flex kyc-justify-between kyc-items-center">
          <Skeleton circle height={40} width={40} />
          <Skeleton borderRadius={10} width={200} height={40} />
          <Skeleton circle height={40} width={40} />
        </div>
      </div>

      <div className="kyc-mt-20">
        <Skeleton height={200} borderRadius={30} />
      </div>
      <div className="kyc-mt-20">
        <Skeleton height={40} count={5} />
      </div>

      <div className="kyc-mt-auto">
        <Skeleton borderRadius={20} height={50} />
      </div>
    </div>
  );
};

export default DefaultLoader;
