import React, { useState, useEffect } from "react";

export const Commentbox = () => {
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState("");
  const [replyInput, setReplyInput] = useState("");
  const [replyingTo, setReplyingTo] = useState(null); // fixed naming
  const VIDEO_ID = "9B7edCjtYfA";

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/comments?videoId=${VIDEO_ID}`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();

        const formatted = data.map((item) => ({
          id: item.id,
          text: item.snippet.topLevelComment.snippet.textDisplay,
          replies:
            item.replies?.comments.map((r) => ({
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
  }, []);

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
          videoId: VIDEO_ID,
          commentText: input,
        }),
      });

      if (res.ok) {
        const newComment = await res.json();
        setComments([
          ...comments,
          {
            id: newComment.id,
            text: newComment.snippet.topLevelComment.snippet.textDisplay,
            replies: [],
          },
        ]);
        setInput("");
        alert("✅ Comment posted successfully!");
      } else {
        alert("❌ Failed to post comment");
      }
    } catch (err) {
      console.error("❌ Error posting comment:", err);
      alert("❌ An error occurred while posting the comment.");
    }
  };

  const handleReply = async (e, commentId) => {
    e.preventDefault();
    if (!replyInput.trim()) return;

    try {
      const res = await fetch("http://localhost:3000/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          commentId: commentId,
          replyText: replyInput,
        }),
      });

      if (res.ok) {
        const reply = await res.json();

        const updatedComments = comments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replies: [
                ...comment.replies,
                { id: reply.id, text: reply.snippet.textOriginal },
              ],
            };
          }
          return comment;
        });

        setComments(updatedComments);
        setReplyInput("");
        setReplyingTo(null);
        alert("✅ Reply posted successfully!");
      } else {
        alert("❌ Failed to post reply");
      }
    } catch (err) {
      console.error("❌ Error posting reply:", err.message);
    }
  };

  const handleReplyClick = (commentId) => {
    setReplyingTo(commentId);
  };

  const handleDelete = async (commentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this comment?"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`http://localhost:3000/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setComments(comments.filter((comment) => comment.id !== commentId));
        alert("🗑️ Comment deleted!");
      } else {
        alert("❌ Failed to delete comment");
      }
    } catch (err) {
      console.error("❌ Error deleting comment:", err.message);
      alert("❌ Something went wrong");
    }
  };

  return (
    <div className="comment-box">
      <form onSubmit={handleSubmit}>
        <textarea
          className="comment-input"
          placeholder="Speak your thoughts, O wise one..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="comment-button" type="submit">
          💬 Comment
        </button>
      </form>

      <div>
        {comments.map((ele) => (
          <div key={ele.id} className="comment" style={{ marginTop: "1rem" }}>
            <p dangerouslySetInnerHTML={{ __html: ele.text }} />

            {ele.replies.map((reply) => (
              <div
                key={reply.id}
                className="reply"
                style={{ marginLeft: "1rem", color: "#666" }}
              >
                ↪️ <span dangerouslySetInnerHTML={{ __html: reply.text }} />
              </div>
            ))}

            <button onClick={() => handleReplyClick(ele.id)}>Reply</button>
            <button
              onClick={() => handleDelete(ele.id)}
              style={{ marginLeft: "1rem", color: "red" }}
            >
              Delete
            </button>

            {replyingTo === ele.id && (
              <form onSubmit={(e) => handleReply(e, ele.id)}>
                <textarea
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  placeholder="Write your reply..."
                  style={{ width: "100%", marginTop: "0.5rem" }}
                />
                <button type="submit">Post Reply</button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};