import { useEffect } from "react";
import "./App.css";
console.log("ALL ENV VARS", import.meta.env);
function App() {
   const apiKey= import.meta.env.VITE_YOUTUBE_API_KEY;
  const videoId = import.meta.env.VITE_YOUTUBE_VIDEO_ID;

const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;

  const fetchUrl = async (url) => {
    try {
      const res = await fetch(url);
      const data = await  res.json();
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(()=>{
    fetchUrl(url);
  },[])
 
  return (
    <>
      <div>
        <h1>Hi, This is your youtube analytics!</h1>
      </div>
    </>
  );
}

export default App;
