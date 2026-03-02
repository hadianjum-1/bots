(function () {
  const scriptTag = document.currentScript;
  const apiKey = scriptTag.dataset.apiKey;
  const BASE_URL = scriptTag.dataset.baseUrl || "https://yourdomain.com/api"; // Change to your domain

  // Validate API key exists
  if (!apiKey) {
    console.error("❌ Bot Widget Error: Missing API key. Add data-api-key attribute to script tag.");
    return;
  }

  // Create container
  const container = document.createElement("div");
  container.id = "ngb-widget-container";
  document.body.appendChild(container);

  // Load CSS
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `${BASE_URL}/chat.css`;
  document.head.appendChild(link);

  // Load HTML
  fetch(`${BASE_URL}/chat.html`)
    .then(res => res.text())
    .then(html => {
      container.innerHTML = html;

      // Load JS and pass API key and base URL
      const script = document.createElement("script");
      script.src = `${BASE_URL}/chat-client.js`;
      script.dataset.apiKey = apiKey;
      script.dataset.baseUrl = BASE_URL;
      document.body.appendChild(script);
    })
    .catch(err => {
      console.error("Failed to load chatbot widget:", err);
      container.innerHTML = "<p style='color: red;'>Unable to load chatbot. Please contact support.</p>";
    });
})();