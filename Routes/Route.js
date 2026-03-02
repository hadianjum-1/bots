const express = require("express");
const Router = express.Router();
const OpenAI = require("openai");
const crypto = require("crypto");
require("dotenv").config();

const Client = require("../Models/Clients");
const Lead = require("../Models/Lead");
const Message = require("../Models/Message");
const nodemailer = require("nodemailer");
const { validateApiKey } = require("../middleware/authMiddleware");

// configure mailer using environment variables
const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// verify connection configuration immediately so startup shows any errors
mailer.verify()
  .then(() => console.log("✅ SMTP connection successful"))
  .catch(err => console.error("❌ SMTP connection failed", err));

// helper to send email
async function sendMail(options) {
  return mailer.sendMail(options);
}

/* ================= GROQ CONFIG ================= */
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

/* =========================================================
   POST /api/chat
   Protected: Requires API key
   Supports:
   - Text messages
   - Image upload (AI Vision)
========================================================= */
Router.post("/chat", validateApiKey, async (req, res) => {
  try {
    let { messages, type, image, message } = req.body;
    const client = req.client; // From middleware

    console.log("/chat payload for client:", client.businessName, { messages, type, image, message });

    // support legacy clients that send a single `message` field
    if (!Array.isArray(messages) && message) {
      messages = [{ role: "user", content: message }];
    }

    /* =====================================================
       IMAGE MESSAGE (AI Vision)
    ===================================================== */
    if (type === "image" && image) {

      // Save user image message (base64 or URL)
      await Message.create({
        clientId: client.clientId,
        role: "user",
        content: image,
        messageType: "image"
      });

      // remove any extra properties from stored messages (e.g. messageType) so the API only sees role+content
      let sanitizedHistory = [];
      if (Array.isArray(messages)) {
        sanitizedHistory = messages
          .filter(m => {
            // drop anything that's not a plain string (including our "[image]" placeholder)
            const ok = typeof m.content === 'string' && !m.content.startsWith('data:image') && m.content !== '[image]';
            if (!ok) console.log('dropping history entry', m);
            return ok;
          })
          .map(m => ({ role: m.role, content: m.content }));
      }

      // prepare messages array, preserving any prior history
      const promptMessages = [
        {
          role: "system",
          content: `You are an AI assistant for ${client.businessName}.
${client.businessData}`
        },
        ...sanitizedHistory,
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this image in detail and respond helpfully." },
            {
              type: "image_url",
              image_url: { url: image }
            }
          ]
        }
      ];

      // debug logs to inspect structure
      console.log('sanitizedHistory:', sanitizedHistory);
      console.log('final user message:', JSON.stringify(promptMessages[promptMessages.length - 1], null, 2));
      console.log('first block of final message:', promptMessages[promptMessages.length - 1].content[0]);
      console.log('Sending prompt to Groq (vision):', JSON.stringify(promptMessages).slice(0,2000));
      const response = await groq.chat.completions.create({
        model: "llama-3.2-90b-vision-preview",
        temperature: 0.7,
        messages: promptMessages
      });

      const reply = response.choices[0].message.content;

      // Save AI reply
      await Message.create({
        clientId: client.clientId,
        role: "assistant",
        content: reply,
        messageType: "text"
      });

      return res.json({ reply });
    }

    /* =====================================================
       TEXT MESSAGE
    ===================================================== */
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ reply: "Invalid messages format." });
    }

    const lastUserMessage = messages[messages.length - 1];

    // Save user message
    await Message.create({
      clientId: client.clientId,
      role: "user",
      content: lastUserMessage.content,
      messageType: "text"
    });

    const promptMessages = [
      {
        role: "system",
        content: `You are an AI assistant for ${client.businessName}.
${client.businessData}`
      },
      ...messages
    ];
    console.log('Sending prompt to Groq (text):', JSON.stringify(promptMessages).slice(0,1000));
    const response = await groq.chat.completions.create({
      model: client.model || "llama-3.1-8b-instant",
      temperature: 0.7,
      messages: promptMessages
    });

    const reply = response.choices[0].message.content;

    // Save assistant reply
    await Message.create({
      clientId: client.clientId,
      role: "assistant",
      content: reply,
      messageType: "text"
    });

    return res.json({ reply });

  } catch (error) {
    console.error("Chat Error:", error);
    // include message for debugging (can remove in production)
    return res.status(500).json({
      reply: "Server error. Please try again later.",
      error: error.message || error.toString()
    });
  }
});

/* =========================================================
   CREATE LEAD (collect user info and notify via email)
   Protected: Requires API key
========================================================= */
Router.post("/lead", validateApiKey, async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const client = req.client; // From middleware

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required." });
    }

    // save to database
    const lead = await Lead.create({ clientId: client.clientId, name, email, message });

    // send notification to business owner
    const businessEmail = client.businessEmail;
    if (businessEmail) {
      await sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: businessEmail,
        subject: `New lead from ${name}`,
        text: `You received a new lead from your chatbot:\n\nName: ${name}\nEmail: ${email}\n${message ? `Message: ${message}\n` : ""}\n\n---\nClient: ${client.businessName}`
      });
    }

    // follow-up email to user
    try {
      await sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: `Thanks for contacting ${client.businessName || "us"}`,
        text: `Hi ${name},\n\nThank you for reaching out! We've sent your information to the owner and will be in touch shortly.\n\nBest regards,\n${client.businessName || "The Team"}`
      });
    } catch (err) {
      console.warn("Failed to send follow-up to lead", err);
    }

    res.json({ lead });
  } catch (error) {
    console.error("Lead Error:", error);
    res.status(500).json({ message: "Failed to create lead." });
  }
});

/* =========================================================
   TEST EMAIL ENDPOINT (for verifying SMTP settings)
========================================================= */
Router.get("/test-email", async (req, res) => {
  try {
    const businessEmail = process.env.BUSINESS_EMAIL;
    if (!businessEmail) {
      return res.status(400).json({ message: "BUSINESS_EMAIL not configured" });
    }
    await sendMail({
      from: process.env.SMTP_FROM || businessEmail,
      to: businessEmail,
      subject: "SMTP configuration test",
      text: "This is a test message from your chatbot SMTP configuration. If you receive this, email is working!"
    });
    res.json({ message: "Test email sent (check inbox)" });
  } catch (err) {
    console.error("Test email error:", err);
    res.status(500).json({ message: "Failed to send test email", error: err.message });
  }
});

/* =========================================================
   CREATE/REGISTER NEW CLIENT
   Public endpoint: For onboarding new clients
========================================================= */
Router.post("/clients/register", async (req, res) => {
  try {
    const { clientId, businessName, businessEmail, businessData } = req.body;

    // Validate required fields
    if (!clientId || !businessName || !businessEmail) {
      return res.status(400).json({ 
        message: "Missing required fields: clientId, businessName, businessEmail" 
      });
    }

    // Check if client already exists
    const existingClient = await Client.findOne({ clientId });
    if (existingClient) {
      return res.status(409).json({ 
        message: "Client ID already exists. Please choose a unique ID." 
      });
    }

    // Create new client
    const client = await Client.create({
      clientId,
      apiKey: crypto.randomBytes(32).toString('hex'),
      businessName,
      businessEmail,
      businessData: businessData || "Your business information will be used in AI responses.",
      model: "llama-3.1-8b-instant",
      plan: "starter",
      active: true
    });

    // Return client data with API key (only shown once!)
    res.status(201).json({
      message: "Client registered successfully! Save your API key - it will only be shown once.",
      client: {
        clientId: client.clientId,
        businessName: client.businessName,
        businessEmail: client.businessEmail,
        apiKey: client.apiKey,
        createdAt: client.createdAt
      }
    });
  } catch (error) {
    console.error("Client registration error:", error);
    res.status(500).json({ message: "Failed to register client.", error: error.message });
  }
});

/* =========================================================
   UPDATE CLIENT (Protected with API key)
   Update business data, email, model, etc.
========================================================= */
Router.put("/clients/update", validateApiKey, async (req, res) => {
  try {
    const { businessName, businessEmail, businessData, model, plan } = req.body;
    const client = req.client;

    // Update allowed fields
    if (businessName) client.businessName = businessName;
    if (businessEmail) client.businessEmail = businessEmail;
    if (businessData) client.businessData = businessData;
    if (model) client.model = model;
    if (plan) client.plan = plan;

    await client.save();

    res.json({
      message: "Client updated successfully.",
      client: {
        clientId: client.clientId,
        businessName: client.businessName,
        businessEmail: client.businessEmail,
        model: client.model,
        plan: client.plan
      }
    });
  } catch (error) {
    console.error("Client update error:", error);
    res.status(500).json({ message: "Failed to update client." });
  }
});

/* =========================================================
   GET CLIENT INFO (Protected with API key)
========================================================= */
Router.get("/clients/info", validateApiKey, async (req, res) => {
  try {
    const client = req.client;
    res.json({
      clientId: client.clientId,
      businessName: client.businessName,
      businessEmail: client.businessEmail,
      model: client.model,
      plan: client.plan,
      active: client.active,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt
    });
  } catch (error) {
    console.error("Error fetching client info:", error);
    res.status(500).json({ message: "Failed to fetch client info." });
  }
});

module.exports = Router;