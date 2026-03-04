(function () {
  const scriptTag = document.currentScript;
  const apiKey = scriptTag.dataset.apiKey;
  const BASE_URL = scriptTag.dataset.baseUrl || "https://yourdomain.com/api";

  // Validate API key exists
  if (!apiKey) {
    console.error("❌ Bot Widget Error: Missing API key. Add data-api-key attribute to script tag.");
    return;
  }

  // Create isolated container
  const container = document.createElement("div");
  container.id = "ngb-widget-container";
  container.style.cssText = "position:fixed;bottom:0;right:0;z-index:2147483647;pointer-events:none;font-family:inherit;";
  document.body.appendChild(container);

  // Load CSS with isolation
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `${BASE_URL}/chat.css`;
  document.head.appendChild(link);

  // Load HTML into container
  fetch(`${BASE_URL}/chat.html`)
    .then(res => res.text())
    .then(html => {
      container.innerHTML = html;

      // Move chat elements to container (if not already there)
      const chatButton = container.querySelector(".ngb-chat-button");
      const chatBox = container.querySelector(".ngb-chat-box");
      const emojiPicker = container.querySelector(".ngb-emoji-picker");
      
      if (chatButton) {
        chatButton.style.pointerEvents = "auto";
      }
      if (chatBox) {
        chatBox.style.pointerEvents = "auto";
      }

      // Load chat client JS with proper data attributes
      const script = document.createElement("script");
      script.src = `${BASE_URL}/chat-client.js`;
      script.dataset.apiKey = apiKey;
      script.dataset.baseUrl = BASE_URL;
      container.appendChild(script);
    })
    .catch(err => {
      console.error("Failed to load chatbot widget:", err);
      container.innerHTML = "<p style='color: red; padding: 20px;'>Unable to load chatbot. Please contact support.</p>";
    });
})();
