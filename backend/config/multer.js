const fs = require("fs");
const path = require("path");
const multer = require("multer");

// Define upload directory
const uploadDir = path.join(__dirname, "..", "public", "uploads");

// Ensure "uploads/" directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName);
    }
});

const upload = multer({ storage });

module.exports = upload;
