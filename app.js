const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const session = require("express-session");
const { google } = require("googleapis");
const Note = require("./src/models/Note"); 
const logger = require("./src/models/EventLogs")

dotenv.config();
const app = express();
app.use(
  cors({
    origin: "youtube-dasboard.netlify.app",
    credentials: true, 
  })
);

// Middleware

app.use(express.json());
// Session setup
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// Google OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Step 1: Redirect user to Google for authentication
app.get("/auth/google", (req, res) => {
  const scopes = ["https://www.googleapis.com/auth/youtube.force-ssl"];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline", 
    scope: scopes,
    prompt: "consent", 
  });

  res.redirect(authUrl);
});

// Step 2: Google callback and save tokens to session
app.get("/auth/google/callback", async (req, res) => {
  const code = req.query.code;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    req.session.tokens = tokens; // Save in session
    logger.log("✅ Tokens saved:", tokens);

    res.send("You are logged in and ready to use YouTube!");
  } catch (err) {
    logger.error("❌ Error getting tokens:", err);
    res.status(500).send("Login failed");
  }
});

// Step 3: Fetch comments on a YouTube video
app.get("/comments", async (req, res) => {
  if (!req.session.tokens) {
    return res.status(401).send("You need to log in first!");
  }

  oauth2Client.setCredentials(req.session.tokens);

  try {
    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

    const videoId = req.query.videoId;

    const response = await youtube.commentThreads.list({
      part: "snippet,replies",
      videoId: videoId,
      maxResults: 10,
    });

    res.json(response.data.items);
  } catch (error) {
    logger.error("❌ Error fetching comments:", error);
    res.status(500).send("Failed to fetch comments");
  }
});

// Step 4: Post a comment on a YouTube video
app.post("/comments", async (req, res) => {
  const { videoId, commentText } = req.body;

  if (!req.session.tokens) {
    return res.status(401).send("You need to log in first!");
  }

  oauth2Client.setCredentials(req.session.tokens);

  try {
    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

    const response = await youtube.commentThreads.insert({
      part: "snippet",
      requestBody: {
        snippet: {
          videoId,
          topLevelComment: {
            snippet: {
              textOriginal: commentText,
            },
          },
        },
      },
    });
    logger.info(`Fetched comments for video: ${videoId}`);
    res.json(response.data);
  } catch (error) {
    logger.error("Error fetching comments: " + error.message);
    logger.error(
      "❌ Error posting comment:",
      error.response?.data || error.message
    );
    res.status(500).send("Failed to post comment");
  }
});
//Reply
app.post("/reply", async (req, res) => {
  const { commentId, replyText } = req.body;
  if (!req.session.tokens) {
    return res.status(401).send("You need to log in first");
  }
  oauth2Client.setCredentials(req.session.tokens);
  try {
    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });
    const response = await youtube.comments.insert({
      part: "snippet",
      requestBody: {
        snippet: {
          parentId: commentId,
          textOriginal: replyText,
        },
      },
    });
    res.json(response.data);
  } catch (err) {
    logger.log(err);
    res.status(500).send("Failed to reply");
  }
});
//fetch video details
app.put("/video", async (req, res) => {
  const { videoId, title, description } = req.body;
  if (!req.session.tokens) return res.status(401).send("Login Required");
  oauth2Client.setCredentials(req.session.tokens);
  const youtube = google.youtube({ version: "v3", auth: oauth2Client });
  try {
    const response = await youtube.videos.update({
      part: "snippet",
      requestBody: {
        id: videoId,
        snippet: {
          title,
          description,
          categoryId: "22",
        },
      },
    });
    res.json(response.data);
  } catch (error) {
    logger.error(error.message);
  }
});
// Delete a comment
app.delete("/comments/:commentId", async (req, res) => {
  const { commentId } = req.params;
  if (!req.session.tokens) {
    return res.status(401).send("You need to log in first");
  }

  oauth2Client.setCredentials(req.session.tokens);

  try {
    const youtube = google.youtube({
      version: "v3",
      auth: oauth2Client,
    });

    await youtube.comments.delete({ id: commentId });

    res.send("✅ Comment deleted");
  } catch (error) {
    logger.error("❌ Error deleting comment:", error.message);
    res.status(500).send("Failed to delete comment");
  }
});

// POST /notes → Save a note for a video
app.post("/notes", async (req, res) => {
  const { videoId, text } = req.body;

  if (!videoId || !text) {
    return res.status(400).send("videoId and text are required");
  }

  try {
    const note = new Note({ videoId, text });
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    logger.error("❌ Error saving note:", error.message);
    res.status(500).send("Failed to save note");
  }
});

// GET /notes/:videoId → Get all notes for a video
app.get("/notes/:videoId", async (req, res) => {
  const { videoId } = req.params;

  try {
    const notes = await Note.find({ videoId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    logger.error("Error fetching notes: " + error.message); 
    res.status(500).send("Failed to fetch notes");
  }
});
// Root
app.get("/", (req, res) => {
  res.send("App is running");
});

// Server
// app.listen(3000, () => {
//   logger.log("🚀 App is running at http://localhost:3000");
// });
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    logger.info("MongoDB connected successfully"); 

    // Start Express server *after* successful DB connection
    app.listen(3000, () => {
        logger.info("Server running on http://localhost:3000")
    });
  })
  .catch((err) => {
    logger.error("MongoDB connection error: " + err.message);
    process.exit(1); // Stop the app if DB connection fails
  });
