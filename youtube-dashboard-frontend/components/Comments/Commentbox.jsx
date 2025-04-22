import React, { useState, useEffect } from "react";

export const Commentbox = () => {
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState("");
  const VIDEO_ID = "SzUm3ZNaxvM"; // Set the video ID for the video you want to comment on

  // Fetch comments when the component loads
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`http://localhost:3000/comments?videoId=${VIDEO_ID}`);
        const data = await res.json();
        console.log("👉 YouTube comments:", data);

        const formatted = data.map((item) => ({
          id: item.id,
          text: item.snippet.topLevelComment.snippet.textDisplay,
          replies: item.replies?.comments.map((r) => ({
            id: r.id,
            text: r.snippet.textDisplay,
          })) || [],
        }));

        setComments(formatted);
      } catch (err) {
        console.error("❌ Error fetching comments:", err);
      }
    };

    fetchComments();
  }, []); // Empty array ensures this effect runs only once

  // Handle the form submission to post a comment
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!input.trim()) {
      alert("❌ Please enter a comment before submitting.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", 
        body: JSON.stringify({
          videoId: VIDEO_ID, // Video ID where the comment is being posted
          commentText: input, // The comment input from the user
        }),
      });

      if (res.ok) {
        const newComment = await res.json();
        setComments([...comments, {
          id: newComment.id,
          text: newComment.snippet.topLevelComment.snippet.textDisplay,
          replies: [], // Assuming no replies to start with
        }]);
        setInput(''); // Clear the input after posting
        alert("✅ Comment posted successfully!");
      } else {
        alert("❌ Failed to post comment");
      }
    } catch (err) {
      console.error("❌ Error posting comment:", err);
      alert("❌ An error occurred while posting the comment.");
    }
  };

  return (
    <div className="comment-box">
      <form onSubmit={handleSubmit}>
        <textarea
          className="comment-input"
          placeholder="Speak your thoughts, O wise one..."
          value={input}
          onChange={(e) => setInput(e.target.value)} // Update input as the user types
        />
        <button className="comment-button" type="submit">
          💬 Comment
        </button>
      </form>

      <div>
        {comments.map((ele) => (
          <div key={ele.id} className="comment">
            <p dangerouslySetInnerHTML={{ __html: ele.text }} />
            {ele.replies.map((reply) => (
              <div key={reply.id} className="reply" style={{ marginLeft: "1rem", color: "#666" }}>
                ↪️ <span dangerouslySetInnerHTML={{ __html: reply.text }} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};