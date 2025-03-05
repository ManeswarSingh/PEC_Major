
const { Router } = require("express");
const path = require("path");
const User = require("../models/user.model.js");
const { checkForAuthenticationCookie } = require("../middleware/auth.js");
const upload = require("../config/multer.js"); // Import Multer for file uploads
const {uploadOnCloudinary} = require("../config/cloudinary.js"); // Import Cloudinary config

const router = Router();

router.post("/logout", checkForAuthenticationCookie("token"), (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Successfully logged out." });
});

router.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "..", "frontend", "register.html"));
});

router.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "..", "frontend", "login.html"));
});

// router.post("/register", upload.single("profilePicture"), async (req, res) => {
//     const { username, email, password } = req.body;
//     let profilePictureUrl = null;

//     try {
//         // Upload image to Cloudinary
//         if (req.file) {
//             const result = await cloudinary.uploader.upload(req.file.path, {
//                 folder: "user_profiles",
//                 resource_type: "image",
//             });
//             profilePictureUrl = result.secure_url;
//             console.log(profilePictureUrl)
//             console.log("Uploaded Image URL:", req.file?.path);
//         }

//         // Create a new user with the uploaded profile picture URL
//         const newUser = new User({ username, email, password, profilePicture: profilePictureUrl });

//         await newUser.save();
//         res.redirect("/");
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Error registering user.");
//     }
// });


router.post("/register", upload.single("profileImage"), async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // Upload image to Cloudinary
        const uploadResult = await uploadOnCloudinary(req.file.path);
        console.log("File path before upload:", req.file.path); 
        if (!uploadResult || !uploadResult.secure_url) {
            return res.status(500).send("Error uploading image");
        }

        const profileImage = uploadResult.secure_url; // Correctly define profileImage

        console.log("Final Profile Image URL:", profileImage); // Debugging

        const newUser = new User({
            username,
            email,
            password,
            profileImage
        });

        await newUser.save();
        // res.status(201).json({ message: "User registered successfully", user: newUser });
        res.redirect("/");

    } catch (error) {
        console.error("Error saving user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const token = await User.matchPasswordAndGenerateToken(email, password);
        res.cookie("token", token).redirect("/");
    } catch (error) {
        console.log(error);
        res.status(401).json({ error: "Incorrect email or password" });
    }
});

module.exports = router;
