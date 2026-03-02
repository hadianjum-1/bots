const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
require("dotenv").config();
require("./Dbconection/connection");

const Routes = require("./Routes/Route");

app.use(cors());
// allow larger base64 images (up to 50 MB)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// handle body-parser errors such as payload too large
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.too.large') {
    console.warn('Request payload too large', err);
    return res.status(413).json({ reply: 'Payload too large' });
  }
  next(err);
});

app.use("/api", Routes);
app.use("/api", express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running → http://localhost:${PORT}`);
});