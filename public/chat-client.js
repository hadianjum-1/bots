(function () {
  const apiKey = document.currentScript.dataset.apiKey;
  const API = document.currentScript.dataset.baseUrl || "https://yourdomain.com/api"; // Change to your domain

  // Validate API key
  if (!apiKey) {
    console.error("❌ Chat Error: Missing API key. Widget not properly configured.");
    return;
  }

  const button = document.querySelector(".ngb-chat-button");
  const box = document.querySelector(".ngb-chat-box");
  const close = document.querySelector(".ngb-close");
  const input = document.querySelector(".ngb-input");
  const send = document.querySelector(".ngb-send");
  const messages = document.querySelector(".ngb-messages");
  const fileInput = document.querySelector(".ngb-attach input");

  button.onclick = () => box.classList.add("open");
  close.onclick = () => box.classList.remove("open");

  function getTime() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function addMessage(content, type, isImage = false) {
    const wrapper = document.createElement("div");
    wrapper.className = `ngb-message ${type}`;

    if (isImage) {
      wrapper.innerHTML = `
        <div class="msg-text">
          <img src="${content}" class="chat-image"/>
        </div>
        <div class="msg-meta">${getTime()}</div>
      `;
    } else {
      wrapper.innerHTML = `
        <div class="msg-text">${content}</div>
        <div class="msg-meta">${getTime()}</div>
      `;
    }

    messages.appendChild(wrapper);
    messages.scrollTop = messages.scrollHeight;
  }

  function showTyping() {
    const typing = document.createElement("div");
    typing.className = "ngb-message bot typing";
    typing.innerHTML = `
      <div class="dots"><span></span><span></span><span></span></div>
    `;
    messages.appendChild(typing);
    return typing;
  }

  // maintain conversation history so the backend can receive the proper array
  const conversation = [];

  async function sendTextMessage(text) {
    addMessage(text, "user");
    // store minimal data for history
    conversation.push({ role: "user", content: text });

    const typing = showTyping();

    const res = await fetch(`${API}/chat`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        type: "text",
        messages: conversation
      })
    });

    const data = await res.json();
    typing.remove();
    if (!res.ok) {
      console.error("Server error:", data);
      addMessage("[Error: " + (data.message || data.error || "Unknown error") + "]", "bot");
    } else if (data.error) {
      console.error("Server error response:", data.error);
      addMessage("[Error from server: " + data.error + "]", "bot");
    } else {
      addMessage(data.reply, "bot");
      // keep the assistant reply in history as well
      conversation.push({ role: "assistant", content: data.reply });
    }
  }

  send.onclick = () => {
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    sendTextMessage(text);
  };

  // lead collection button behavior
  const leadBtn = document.querySelector('.ngb-lead');
  leadBtn.addEventListener('click', async () => {
    // gather basic info via prompts (could be replaced by a nicer form)
    const name = prompt('Please enter your full name:');
    if (!name) return;
    const email = prompt('Please enter your email address:');
    if (!email) return;
    const message = prompt('Any additional message or notes?');

    // send lead info to server
    try {
      const res = await fetch(`${API}/lead`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ name, email, message })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit lead');
      }
      alert('Thank you! Your information has been submitted.');
      // also show a message inside the chat widget
      addMessage('Thanks for reaching out! Your details have been sent.', 'bot');
    } catch (err) {
      console.error('Lead submission error', err);
      alert('Sorry, there was a problem submitting your information.');
    }
  });

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") send.onclick();
  });

  /* IMAGE UPLOAD */
  fileInput.addEventListener("change", async function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async function (e) {
      const base64Image = e.target.result;

      // Show image in chat
      addMessage(base64Image, "user", true);
      // store a placeholder rather than the full base64 string
      conversation.push({ role: "user", content: "[image]" });

      const typing = showTyping();

      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          type: "image",
          image: base64Image,
          messages: conversation
        })
      });

      let data;
      try {
        data = await res.json();
      } catch (e) {
        console.error('Failed to parse JSON response', e);
      }
      typing.remove();
      console.log('image request history sent:', conversation);
      if (!res.ok) {
        console.error('Server returned non-OK status', res.status, data);
        addMessage("[Error: server returned " + res.status + "]", "bot");
      } else if (data && data.error) {
        console.error("Server error response:", data.error);
        addMessage("[Error from server: " + data.error + "]", "bot");
      } else if (data) {
        addMessage(data.reply, "bot");
        conversation.push({ role: "assistant", content: data.reply });
      }
    };

    reader.readAsDataURL(file);
  });

})();