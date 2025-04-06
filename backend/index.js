const express = require("express")
const app = express()
const cors = require("cors")
const PORT = 3000;
const path = require("path")
const mongoose = require("mongoose")
const { checkForAuthenticationCookie } = require("./middleware/auth.js")
const cookieParser = require("cookie-parser");
const Tweet = require("./models/tweet.model.js")
const User = require("./models/user.model.js");
const Comment = require("./models/comment.model.js");  // <- Added
const { uploadOnCloudinary } = require("./config/cloudinary.js");
const upload = require("./config/multer.js");

const mongouri = "mongodb+srv://singhmaneshwar08:singh@cluster0.kzv3s.mongodb.net"
const dbname = "planteasycare"

mongoose.connect(`${mongouri}/${dbname}`)
    .then(() => console.log("mongodb connected"))
    .catch(() => console.log("error while connecting mongodb"))

const userRoute = require("./routes/userroute.js")

app.use(cors())
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cookieParser())
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(checkForAuthenticationCookie('token'))

app.use('/user', userRoute)

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "index.html"));
});

app.get("/api/login-status", (req, res) => {
    if (req.user) {
        return res.json({ isLoggedIn: true, email: req.user.email, userId: req.user._id });
    }
    res.json({ isLoggedIn: false });
});

app.get("/tweets", async (req, res) => {
    try {
        const tweets = await Tweet.find()
            .populate("userId", "username profileImage")
            .sort({ timestamp: -1 });

        res.json(tweets);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/tweets", upload.single("image"), async (req, res) => {
    try {
        const { userId, content } = req.body;
        let imageUrl = null;

        if (req.file) {
            const uploadResult = await uploadOnCloudinary(req.file.path);
            if (!uploadResult || !uploadResult.secure_url) {
                return res.status(500).json({ error: "Error uploading image" });
            }
            imageUrl = uploadResult.secure_url;
        }

        const newTweet = new Tweet({
            userId,
            content,
            image: imageUrl || null,
            timestamp: new Date()
        });

        await newTweet.save();
        res.status(201).json({ message: "Tweet posted successfully", newTweet });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ADD COMMENT TO TWEET
app.post('/tweets/:tweetId/comments', async (req, res) => {
    try {
        const { content, userId } = req.body;
        const tweetId = req.params.tweetId;

        console.log(req.body)

        const tweet = await Tweet.findById(tweetId);
        if (!tweet) return res.status(404).json({ message: 'Tweet not found' });

        const newComment = await Comment.create({
            tweetId: tweetId,
            userId,
            content
        });

        console.log("****",newComment)

        tweet.comments.push(newComment._id);
        await tweet.save();

        res.status(201).json({ message: 'Comment added successfully', comment: newComment });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET ALL COMMENTS OF TWEET
app.get('/tweets/:tweetId/comments', async (req, res) => {
    try {
        const tweetId = req.params.tweetId;

        const tweet = await Tweet.findById(tweetId)
            .populate({
                path: 'comments',
                populate: {
                    path: 'userId',
                    select: 'username profileImage'
                }
            });

        if (!tweet) return res.status(404).json({ message: 'Tweet not found' });

        res.json(tweet.comments);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// LIKE / UNLIKE TWEET
app.post('/tweets/:tweetId/like', async (req, res) => {
    try {
        const { userId } = req.body;
        const tweet = await Tweet.findById(req.params.tweetId);

        if (!tweet) return res.status(404).json({ message: 'Tweet not found' });

        if (tweet.likes.includes(userId)) {
            tweet.likes.pull(userId);
        } else {
            tweet.likes.push(userId);
        }

        await tweet.save();
        res.status(200).json({ message: "Like status updated", likes: tweet.likes.length });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/predict", (req, res) => {
    res.render("model_form.html")
})

app.get("/growbot", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "growbot.html"));
});

app.listen(PORT, () => {
    console.log(`APP listening on ${PORT}`)
})
