import React, { useState, useEffect, useRef } from "react";
import { Button } from "../components/ui/button";

function Settings() {
  useEffect(() => {
    let deferredPrompt;

    window.addEventListener("beforeinstallprompt", (event) => {
      event.preventDefault();

      deferredPrompt = event;

      const installButton = document.getElementById("install-btn");
      installButton.style.display = "block";

      installButton.addEventListener("click", () => {
        deferredPrompt.prompt();

        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === "accepted") {
            console.log("User accepted the install prompt");
          } else {
            console.log("User dismissed the install prompt");
          }
          deferredPrompt = null;
        });
      });
    });

    window.addEventListener("appinstalled", () => {
      const installButton = document.getElementById("install-btn");
      installButton.style.display = "none";
      console.log("PWA was installed");
    });
  });
  const [currentValue, setCurrentValue] = React.useState(
    localStorage.getItem("sortItems") || "true"
  );
  return (
    <div className="settings-page px-6">
      <Button id="install-btn" style={{ display: "none" }}>
        Install Noisefill
      </Button>
      <br />
      <br />
    </div>
  );
}

export default Settings;
