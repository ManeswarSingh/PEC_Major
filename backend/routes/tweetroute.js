// const {Router} = require("express")
// const Tweet = require("../models/tweet.model.js")


// const router = Router()

// app.get("/tweets", async (req, res) => {
//     try {
//         const tweets = await Tweet.find().sort({ timestamp: -1 }); // Get latest tweets first
//         res.json(tweets);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// app.post("/tweets", async (req, res) => {
//     try {
//         const { username, content } = req.body;
//         const newTweet = new Tweet({ username, content });
//         await newTweet.save();
//         res.status(201).json(newTweet);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });
