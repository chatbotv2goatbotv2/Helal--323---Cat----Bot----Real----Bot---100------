/**
 * scan.js
 * QR Code Scanner (Reply Image)
 * Fully Fixed — onStart version
 * Author: Helal (Credit Locked)
 */

const fs = require("fs");
const path = require("path");

// 🧩 Fix loader error (no clearLine crash)
if (typeof process.stderr.clearLine !== "function") process.stderr.clearLine = () => {};
if (typeof process.stderr.cursorTo !== "function") process.stderr.cursorTo = () => {};

module.exports = {
  config: {
    name: "scan",
    version: "2.0.1",
    author: "Helal", // ⚠️ Credit Locked
    countDown: 3,
    role: 0,
    category: "utility",
    shortDescription: "Scan QR code from a replied image",
    longDescription: "Reply to any image containing a QR code, and this command will decode it.",
    guide: "{pn} (reply to a QR code image)"
  },

  onStart: async function ({ message, event }) {
    const { messageReply } = event;

    // 🔒 Credit lock
    if (this.config.author !== "Helal") {
      return message.reply("🚫 This command is credit locked by Helal!");
    }

    // ✅ Check if image is replied
    if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
      return message.reply("⚠️ Please reply to a QR code image!");
    }

    const attachment = messageReply.attachments[0];
    if (attachment.type !== "photo") {
      return message.reply("❌ The replied message is not an image!");
    }

    // ✅ Safe dependency loader
    async function requireModule(name) {
      try {
        return require(name);
      } catch {
        const { execSync } = require("child_process");
        console.log(`📦 Installing missing module: ${name}`);
        execSync(`npm install ${name}`, { stdio: "inherit" });
        return require(name);
      }
    }

    const jimp = await requireModule("jimp");
    const QrCode = await requireModule("qrcode-reader");
    const imageDownloader = await requireModule("image-downloader");

    const cachePath = path.join(__dirname, "cache");
    if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);

    const filePath = path.join(cachePath, `qrcode_${Date.now()}.png`);

    try {
      message.reply("🔍 Scanning QR code...");

      // Download the image
      await imageDownloader.image({ url: attachment.url, dest: filePath });

      // Read image
      const img = await jimp.read(fs.readFileSync(filePath));
      const qr = new QrCode();

      // Decode QR
      const value = await new Promise((resolve, reject) => {
        qr.callback = (err, v) => (err ? reject(err) : resolve(v));
        qr.decode(img.bitmap);
      });

      fs.unlinkSync(filePath); // Clean cache

      if (!value || !value.result)
        return message.reply("❌ No QR code found or image unclear!");

      // ✅ Send decoded result
      message.reply(`✅ QR Result:\n${value.result}`);
    } catch (err) {
      console.error("QR Scan Error:", err.message);
      message.reply("❌ Failed to read QR code. Make sure the image is clear!");
    }
  }
};