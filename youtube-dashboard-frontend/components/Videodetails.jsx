import React, {  useEffect, useState } from 'react'
import { Commentbox } from './Comments/Commentbox';

export const Videodetails = () => {
    const [videoData, setVideoData]= useState(null)
    const apiKey= import.meta.env.VITE_YOUTUBE_API_KEY;
    const videoId = import.meta.env.VITE_YOUTUBE_VIDEO_ID;
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
    const fetchUrl = async (url) => {
      try {
        const res = await fetch(url);
        const data = await  res.json();
        console.log(data);
        setVideoData(data.items[0]);
      } catch (err) {
        console.log(err);
      }
    };

    useEffect(()=>{
      fetchUrl(url);
    },[])
   if(!videoData) return <h1>Loading...</h1>
   const formatDate = (isoDateString) => {
    const date = new Date(isoDateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };
  const handleCommentSubmit = (text)=>{
console.log("here")
  }
  return (
    // <div>
    //     <h2>{videoData.snippet.title}</h2>
    //     <img src={videoData.snippet.thumbnails.medium.url} alt="thumbnail" />
    //     <p>{videoData.snippet.description}</p>
    // </div>
    <div className="video-container">
    <h2 className="video-title">{videoData.snippet.title}</h2>
    <img
      className="video-thumbnail"
      src={videoData.snippet.thumbnails.medium.url}
      alt="thumbnail"
    />
    <p className="video-description">{videoData.snippet.description}</p>
    <p className="video-stats">
      <strong>Published on :</strong>{formatDate(videoData.snippet.publishedAt)}
    </p>
    <Commentbox onSubmit={handleCommentSubmit}/>
  </div>
  )
}
