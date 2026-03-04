(function() {
  // Get API key from script tag
  var apiKey = document.currentScript.getAttribute('data-apiKey') || document.currentScript.dataset.apiKey;
  var API = document.currentScript.getAttribute('data-baseUrl') || "http://localhost:3000/api";

  // Validate API key
  if (!apiKey) {
    console.error("❌ Chat Error: Missing API key. Widget not properly configured.");
    return;
  }

  console.log("🔄 Loading chat widget...");

  // Find all elements
  var button = document.querySelector('.ngb-chat-button');
  var box = document.querySelector('.ngb-chat-box');
  var close = document.querySelector('.ngb-close');
  var input = document.querySelector('.ngb-input');
  var send = document.querySelector('.ngb-send');
  var messages = document.querySelector('.ngb-messages');
  var emojiBtn = document.querySelector('.ngb-emoji');
  var emojiPicker = document.querySelector('.ngb-emoji-picker');
  var darkToggle = document.querySelector('.ngb-dark-toggle');
  var fileInput = document.querySelector('.ngb-attach input');
  var leadBtn = document.querySelector('.ngb-lead');

  console.log("📋 Elements found:", {
    button: !!button,
    box: !!box,
    input: !!input,
    emojiBtn: !!emojiBtn,
    emojiPicker: !!emojiPicker
  });

  if (!button || !box || !input) {
    console.error("❌ Required elements not found!");
    return;
  }

  // Open chat box
  button.onclick = function() {
    console.log("📂 Opening chat box");
    box.classList.add('open');
  };

  // Close chat box
  if (close) {
    close.onclick = function() {
      console.log("📂 Closing chat box");
      box.classList.remove('open');
    };
  }

  // Dark mode toggle
  if (darkToggle) {
    darkToggle.onclick = function() {
      console.log("🌙 Dark mode clicked");
      box.classList.toggle('dark');
      var icon = darkToggle.querySelector('i');
      if (box.classList.contains('dark')) {
        icon.className = 'fa-solid fa-sun';
      } else {
        icon.className = 'fa-solid fa-moon';
      }
    };
  }

  // Emoji picker toggle
  if (emojiBtn && emojiPicker) {
    console.log("😊 Setting up emoji picker");
    
    emojiBtn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log("👹 Emoji button clicked!");
      emojiPicker.classList.toggle('show');
    };
    
    // Handle emoji clicks
    var spans = emojiPicker.querySelectorAll('span');
    for (var i = 0; i < spans.length; i++) {
      spans[i].onclick = function(e) {
        e.stopPropagation();
        var emoji = this.textContent;
        console.log("😀 Selected emoji:", emoji);
        input.value = input.value + emoji;
        emojiPicker.classList.remove('show');
      };
    }
    
    console.log("✅ Emoji picker initialized!");
  } else {
    console.log("⚠️ Emoji elements not found");
  }

  // Get time
  function getTime() {
    var now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Add message to chat
  function addMessage(content, type, isImage) {
    isImage = isImage || false;
    var wrapper = document.createElement('div');
    wrapper.className = 'ngb-message ' + type;

    if (isImage) {
      wrapper.innerHTML = 
        '<div class="msg-text">' +
          '<img src="' + content + '" class="chat-image"/>' +
        '</div>' +
        '<div class="msg-meta">' + getTime() + '</div>';
    } else {
      wrapper.innerHTML = 
        '<div class="msg-text">' + content + '</div>' +
        '<div class="msg-meta">' + getTime() + '</div>';
    }

    messages.appendChild(wrapper);
    messages.scrollTop = messages.scrollHeight;
  }

  // Show typing indicator
  function showTyping() {
    var typing = document.createElement('div');
    typing.className = 'ngb-message bot typing';
    typing.innerHTML = '<div class="dots"><span></span><span></span><span></span></div>';
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
    return typing;
  }

  // Conversation history
  var conversation = [];

  // Send text message
  function sendTextMessage(text) {
    addMessage(text, 'user');
    conversation.push({ role: 'user', content: text });

    var typing = showTyping();

    fetch(API + '/chat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        type: 'text',
        messages: conversation
      })
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
      typing.remove();
      
      // We can't access res.ok here, so check for error properties
      if (data && data.message) {
        console.error("Server error:", data);
        addMessage('[Error: ' + (data.message || 'Unknown error') + ']', 'bot');
      } else if (data && data.error) {
        addMessage('[Error: ' + data.error + ']', 'bot');
      } else if (data && data.reply) {
        addMessage(data.reply, 'bot');
        conversation.push({ role: 'assistant', content: data.reply });
      } else {
        addMessage('[Error: No response from server]', 'bot');
      }
    })
    .catch(function(err) {
      typing.remove();
      console.error("Network error:", err);
      addMessage('[Error: Network failed. Please try again.]', 'bot');
    });
  }

  // Send button click
  send.onclick = function() {
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    sendTextMessage(text);
  };

  // Enter key to send
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') send.onclick();
  });

  // Lead button
  if (leadBtn) {
    leadBtn.onclick = function() {
      var name = prompt('Please enter your full name:');
      if (!name) return;
      var email = prompt('Please enter your email address:');
      if (!email) return;
      var message = prompt('Any additional message?');

      fetch(API + '/lead', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({ name: name, email: email, message: message })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        alert('Thank you! Your information has been submitted.');
        addMessage('Thanks for reaching out! Your details have been sent.', 'bot');
      })
      .catch(function(err) {
        console.error('Lead error:', err);
        alert('Sorry, there was a problem submitting your information.');
      });
    };
  }

  // Image upload
  if (fileInput) {
    fileInput.onchange = function() {
      var file = this.files[0];
      if (!file) return;

      var reader = new FileReader();
      reader.onload = function(e) {
        var base64Image = e.target.result;
        
        addMessage(base64Image, 'user', true);
        conversation.push({ role: 'user', content: '[image]' });

        var typing = showTyping();

        fetch(API + '/chat', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey
          },
          body: JSON.stringify({
            type: 'image',
            image: base64Image,
            messages: conversation
          })
        })
        .then(function(response) { return response.json(); })
        .then(function(data) {
          typing.remove();
          if (data && data.reply) {
            addMessage(data.reply, 'bot');
            conversation.push({ role: 'assistant', content: data.reply });
          } else {
            addMessage('[Error: No response from server]', 'bot');
          }
        })
        .catch(function(err) {
          typing.remove();
          console.error('Image error:', err);
          addMessage('[Error: Network failed]', 'bot');
        });
      };
      reader.readAsDataURL(file);
    };
  }

  console.log("✅ NexGenByte Chat Widget loaded successfully!");
})();

