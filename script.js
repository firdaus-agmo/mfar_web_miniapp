// Wait for the HTML document to be fully loaded
document.addEventListener("DOMContentLoaded", (event) => {
  // Find the button and status message elements
  const button = document.getElementById("locationButton");
  const statusMessageDiv = document.getElementById("statusMessage");

  // Check if the required elements exist and the bridge channel is available
  if (button && statusMessageDiv) {
    // Add a click event listener to the button
    button.addEventListener("click", () => {
      console.log("Button clicked in web miniapp.");
      // Prepare the message to send to the SuperApp
      // Following a structure similar to the reference code
      const message = {
        class: "superAppLocation", // Bridge class name (matching enum)
        method: "getLocation", // Method name (matching enum)
        params: {}, // Parameters (empty for this request)
      };

      // Check if the SuperApp bridge channel is available (injected by WebView)
      // Replace 'SuperAppChannel' with the name you'll use in Flutter if different
      if (window.SuperAppChannel) {
        try {
          // Send the message as a JSON string through the channel
          window.SuperAppChannel.postMessage(JSON.stringify(message));
          console.log("Message sent to SuperApp:", message);
          // Update UI to show request sent
          statusMessageDiv.textContent = "Request sent to SuperApp...";
          statusMessageDiv.className = ""; // Clear previous status classes
        } catch (error) {
          console.error("Error sending message to SuperApp:", error);
          showStatus("Error sending request.", "error");
        }
      } else {
        console.error(
          "SuperAppChannel is not available. Ensure the WebView is set up correctly."
        );
        showStatus("Bridge not available. Check SuperApp setup.", "error");
      }
    });
  } else {
    console.error("Required HTML elements not found.");
  }

  // --- Function to receive messages FROM the SuperApp ---
  // Define a global function that the SuperApp can call via runJavaScript
  // The name 'receiveMessageFromSuperApp' should match what you call from Flutter
  window.receiveMessageFromSuperApp = function (messageString) {
    console.log("Received message from SuperApp:", messageString);
    try {
      // Parse the JSON string sent from Flutter
      const response = JSON.parse(messageString);

      // Basic validation - check if it looks like a response
      if (response && typeof response === "object") {
        // Example: Expecting a structure like { status: 'granted' } or { error: 'Permission denied' }
        if (response.status) {
          showStatus(`Location Status: ${response.status}`, response.status); // Use status as class hint
        } else if (response.error) {
          showStatus(`Error: ${response.error}`, "error");
        } else {
          // Handle other potential response structures if needed
          showStatus(`Received: ${JSON.stringify(response)}`, "info");
        }
      } else {
        showStatus(`Received unexpected data: ${messageString}`, "error");
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

  // --- Helper function to display status messages ---
  function showStatus(message, type) {
    if (statusMessageDiv) {
      statusMessageDiv.textContent = message;
      // Clear previous status classes
      statusMessageDiv.className = "";
      // Add a class based on the type for styling
      if (type) {
        statusMessageDiv.classList.add(`status-${type.toLowerCase()}`);
      }
    }
  }

  // --- Optional: Notify SuperApp that the miniapp is initialized ---
  // This mimics the 'initialized' method in your reference code
  // It can be useful for the SuperApp to know the WebView content is ready
  function sendInitializedEvent() {
    const initMessage = {
      class: "superAppBase", // Bridge class name
      method: "initialized", // Method name
      params: {}, // Parameters
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

  // Send the initialized event shortly after the page loads
  setTimeout(sendInitializedEvent, 100); // Small delay to ensure channel is ready
});
