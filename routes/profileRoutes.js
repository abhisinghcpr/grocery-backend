const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middlewares/authMiddleware");
const multer = require("multer");

// image upload
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// PROFILE VIEW
router.get("/profile", auth, (req, res) => {
  const email = req.user.email;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, result) => {
      if (result.length === 0) {
        return res.json({ success: false });
      }

      const user = result[0];

      res.json({
        success: true,
        user: {
          ...user,
          image_url: user.image
            ? `http://localhost:3000/uploads/${user.image}`
            : null
        }
      });
    }
  );
});

// PROFILE UPDATE
router.put("/profile", auth, upload.single("image"), (req, res) => {
  const email = req.user.email;
  const { name, phone } = req.body;

  if (!name || !phone) {
    return res.json({ success: false, message: "Name & Phone required" });
  }

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, result) => {
      const user = result[0];

      let image = user.image;

      if (req.file) {
        image = req.file.filename;
      }

      db.query(
        "UPDATE users SET name = ?, phone = ?, image = ? WHERE email = ?",
        [name, phone, image, email],
        (err) => {
          if (err) {
            return res.json({ success: false, message: err.message });
          }

          res.json({
            success: true,
            message: "Profile updated",
            image_url: image
              ? `http://localhost:3000/uploads/${image}`
              : null
          });
        }
      );
    }
  );
});

module.exports = router;