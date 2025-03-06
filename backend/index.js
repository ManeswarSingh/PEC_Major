const express = require("express")
const app = express()
const cors = require("cors")
const PORT = 3000;
const path = require("path")
const mongoose = require("mongoose")
const {checkForAuthenticationCookie} = require("./middleware/auth.js")
const cookieParser = require("cookie-parser");
const Tweet = require("./models/tweet.model.js")
const User = require("./models/user.model.js");
const {uploadOnCloudinary} = require("./config/cloudinary.js");
const upload = require("./config/multer.js");


const mongouri = "mongodb+srv://singhmaneshwar08:singh@cluster0.kzv3s.mongodb.net"
const dbname = "planteasycare"
mongoose.connect(`${mongouri}/${dbname}`)
.then((e)=>{
    console.log("mongodb connected")
})
.catch((e)=>{
    console.log("error while connecting mongodb")
})

const userRoute = require("./routes/userroute.js")

app.use(cors())
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

app.use(cookieParser())

app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(checkForAuthenticationCookie('token'))
// app.get('/api',(req,res)=>{
//     res.json({message : " testing the api"})
// })
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});
app.use('/user', userRoute)

app.get("/api/login-status", (req, res) => {
    if (req.user) {
        return res.json({ isLoggedIn: true, email: req.user.email,userId: req.user._id });
    }
    res.json({ isLoggedIn: false });
});
app.use(express.json());  // Ensure this is before app.post("/tweets")
app.use(express.urlencoded({ extended: true }));

app.get("/tweets", async (req, res) => {
        try {
            const tweets = await Tweet.find()
                .populate("userId", "username profileImage") // Get username & profile picture
                .sort({ timestamp: -1 }); // Latest tweets first
    
            res.json(tweets);
        } catch (error) {
            console.error("Error fetching tweets:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    
});

app.post("/tweets", upload.single("image"), async (req, res) => {
    try {
        const { userId, content } = req.body;
        let imageUrl = null;

        // Check if an image was uploaded
        if (req.file) {
            // console.log("Uploading file:", req.file.path);
            const uploadResult = await uploadOnCloudinary(req.file.path);

            if (!uploadResult || !uploadResult.secure_url) {
                return res.status(500).json({ error: "Error uploading image" });
            }

            imageUrl = uploadResult.secure_url;
        }

        // Create new tweet
        const newTweet = new Tweet({
            userId,
            content,
            image: imageUrl || null, 
            timestamp: new Date()
        });

        await newTweet.save();
        res.status(201).json({ message: "Tweet posted successfully", newTweet });
    } catch (err) {
        console.error("Error creating tweet:", err);
        res.status(500).json({ error: err.message });
    }
});

app.get("/predict",(req,res)=>{
    res.render("model_form.html")
})


app.listen(PORT,()=>{
    console.log(`APP listening on ${PORT}`)
})
