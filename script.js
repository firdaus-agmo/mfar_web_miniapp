document.addEventListener("DOMContentLoaded", (event) => {
  const button = document.getElementById("locationButton");
  const statusMessageDiv = document.getElementById("statusMessage");

  if (button && statusMessageDiv) {
    button.addEventListener("click", () => {
      console.log("Button clicked in web miniapp.");
      const message = {
        class: "superAppLocation",
        method: "getLocation",
        params: {},
      };

      if (window.SuperAppChannel) {
        try {
          window.SuperAppChannel.postMessage(JSON.stringify(message));
          console.log("Location request sent to SuperApp:", message);
        } catch (error) {
          console.error("Error sending location request:", error);
          showStatus("Error sending request.", "error");
        }
      } else {
        console.error("SuperAppChannel is not available.");
        showStatus("Bridge not available.", "error");
      }
    });
  } else {
    console.error("Required HTML elements not found.");
  }

  // --- Function to receive messages FROM the SuperApp ---
  window.receiveMessageFromSuperApp = function (messageString) {
    console.log("Received message from SuperApp:", messageString);
    try {
      const response = JSON.parse(messageString);

      if (response && typeof response === "object") {
        if (response.status !== undefined) {
          let dialogMessageText = `Location Status: ${response.status}`;

          if (
            response.latitude !== undefined &&
            response.longitude !== undefined
          ) {
            dialogMessageText += `\nLatitude: ${response.latitude.toFixed(
              6
            )}\nLongitude: ${response.longitude.toFixed(6)}`;
            if (response.timestamp) {
              dialogMessageText += `\nTime: ${new Date(
                response.timestamp
              ).toLocaleString()}`;
            }
          } else if (response.error) {
            dialogMessageText += `\nError getting location: ${response.error}`;
          } else if (response.status === "granted") {
            dialogMessageText += `\nPermission granted, but location data unavailable.`;
          }

          const dialogMessage = {
            class: "superAppBase",
            method: "showDialog",
            params: {
              title: "Location Information",
              message: dialogMessageText,
            },
          };

          if (window.SuperAppChannel) {
            try {
              window.SuperAppChannel.postMessage(JSON.stringify(dialogMessage));
              console.log("Dialog request sent to SuperApp:", dialogMessage);
              showStatus("Dialog requested from SuperApp.", "info");
            } catch (dialogError) {
              console.error(
                "Error requesting dialog from SuperApp:",
                dialogError
              );
              showStatus(
                `Failed to request dialog. Details: ${dialogMessageText}`,
                "error"
              );
            }
          } else {
            console.error("SuperAppChannel not available for dialog request.");
            showStatus(`Bridge error. Details: ${dialogMessageText}`, "error");
          }
        } else if (response.success !== undefined) {
          if (response.shown === true) {
            console.log("SuperApp confirmed dialog was shown.");
          } else {
            console.warn("SuperApp failed to show dialog:", response.error);
            showStatus(
              `SuperApp could not show dialog: ${response.error}`,
              "error"
            );
          }
        } else {
          showStatus(`Received: ${JSON.stringify(response)}`, "info");
        }
      } else {
        showStatus(`Received unexpected ${messageString}`, "error");
      }
    } catch (e) {
      console.error(
        "Error processing message from SuperApp:",
        e,
        messageString
      );
      showStatus(`Error processing response: ${e.message}`, "error");
    }
  };

  // --- Helper function to display status messages locally ---
  function showStatus(message, type) {
    if (statusMessageDiv) {
      statusMessageDiv.textContent = message;
      statusMessageDiv.className = "";
      if (type) {
        statusMessageDiv.classList.add(`status-${type.toLowerCase()}`);
      }
    }
  }

  // --- Optional: Notify SuperApp that the miniapp is initialized ---
  function sendInitializedEvent() {
    const initMessage = {
      class: "superAppBase",
      method: "initialized",
      params: {},
    };

    if (window.SuperAppChannel) {
      try {
        window.SuperAppChannel.postMessage(JSON.stringify(initMessage));
        console.log("Initialization message sent to SuperApp.");
      } catch (error) {
        console.error("Error sending initialization message:", error);
      }
    } else {
      console.warn("SuperAppChannel not available for initialization message.");
    }
  }

  setTimeout(sendInitializedEvent, 100);
});
