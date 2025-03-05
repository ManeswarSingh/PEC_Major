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
app.use(express.json());  // Ensure this is before app.post("/tweets")
app.use(express.urlencoded({ extended: true }));

app.post("/tweets", async (req, res) => {
    try {
        const { userId, content } = req.body;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized: Please log in to post tweets." });
        }
        console.log("MongoDB Connection State:", mongoose.connection.readyState);

        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        // Find the user in the database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Create and save the tweet
        const newTweet = new Tweet({ 
            userId: user._id, 
            content 
        });

        await newTweet.save();

        res.status(201).json(newTweet);
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
