import React from "react";
import ReactDOM from "react-dom";
import Modal from "./Modal";
import { createRoot } from "react-dom/client";

class KYC {
  private token: string;
  private portalRoot: HTMLElement | null = null;

  constructor(token: string) {
    this.token = token;
  }

  private createPortalRoot() {
    const portalRoot = document.createElement("div");
    portalRoot.id = "kyc-sdk-root";
    document.body.appendChild(portalRoot);
    return portalRoot;
  }

  verify(verificationToken: string): void {
    this.portalRoot = this.createPortalRoot();
    const root = createRoot(this.portalRoot);

    const closeModal = () => {
      if (this.portalRoot) {
        root.unmount();
        this.portalRoot;
        document.body.removeChild(this.portalRoot);
        this.portalRoot = null;
      }
    };

    root.render(
      <Modal
        isOpen={true}
        onRequestClose={closeModal}
        token={this.token}
        verificationToken={verificationToken}
      />
    );
  }
}

export default KYC;
