import React, { useEffect, useState } from 'react';
import { Commentbox } from './Comments/Commentbox';

export const Videodetails = () => {
  const [videoData, setVideoData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [videoId, setVideoId] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const fetchVideoData = async () => {
    if (!videoId) return;

    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        const video = data.items[0];
        setVideoData(video);
        setTitle(video.snippet.title);
        setDescription(video.snippet.description);
        setStatus('');
      } else {
        setStatus('❌ Video not found');
      }
    } catch (err) {
      console.log(err);
      setStatus('❌ Failed to load video');
    }
  };

  const checkLogin = async () => {
    try {
      const res = await fetch("http://localhost:3000/comments?videoId=dummy", {
        credentials: "include",
      });
      setIsLoggedIn(res.status !== 401);
    } catch (err) {
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    checkLogin();
  }, []);

  const handleLogin = () => {
    window.location.href = "http://localhost:3000/auth/google";
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch("http://localhost:3000/video", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoId, title, description }),
      });

      if (!res.ok) throw new Error("Failed to update video");

      setStatus("✅ Video Updated!");
      setEditing(false);
      fetchVideoData();
    } catch (err) {
      console.log(err.message);
      setStatus("❌ Error updating video");
    }
  };

  return (
    <div className="video-container">
      {!isLoggedIn ? (
        <div className="login-section">
          <h2>Welcome to the YouTube Companion Dashboard</h2>
          <button className="button" onClick={handleLogin}>🔐 Login with Google</button>
        </div>
      ) : (
        <>
          {!videoData ? (
            <div className="video-input-section">
              <input
                className="input"
                placeholder="Enter YouTube Video ID"
                value={videoId}
                onChange={(e) => setVideoId(e.target.value)}
              />
              <button className="button" onClick={fetchVideoData}>🔍 Load Video</button>
              {status && <p className="status-message error">{status}</p>}
            </div>
          ) : (
            <>
              {editing ? (
                <>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Edit title"
                    className="input"
                  />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Edit description"
                    className="textarea"
                  />
                  <div className="button-group">
                    <button className="button" onClick={handleUpdate}>💾 Save</button>
                    <button className="button cancel" onClick={() => setEditing(false)}>❌ Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="video-title">{videoData.snippet.title}</h2>
                  <img
                    className="video-thumbnail"
                    src={videoData.snippet.thumbnails?.medium?.url || ''}
                    alt="Video Thumbnail"
                    style={{ width: '100%', maxWidth: '500px', borderRadius: '8px' }}
                  />
                  <p className="video-description">{videoData.snippet.description}</p>
                  <p className="video-stats">
                    <strong>Published on:</strong> {formatDate(videoData.snippet.publishedAt)}
                  </p>
                  <button className="button" onClick={() => setEditing(true)}>✏️ Edit</button>
                </>
              )}

              {status && (
                <p className={`status-message ${status.includes("Error") ? "error" : "success"}`}>
                  {status}
                </p>
              )}

              <Commentbox videoId={videoId} />

              <button
                className="button"
                style={{ marginTop: '1rem' }}
                onClick={() => {
                  setVideoData(null);
                  setVideoId('');
                  setStatus('');
                }}
              >
                🔄 Load Another Video
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};