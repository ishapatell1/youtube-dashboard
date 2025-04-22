import { useEffect } from "react";
import "./App.css";
import { Videodetails } from "../components/Videodetails";

console.log("ALL ENV VARS", import.meta.env);
function App() {
  return (
    <>
      <div>
        <h1>Hi, This is your youtube analytics!</h1>
        <Videodetails />
 
      </div>
    </>
  );
}

export default App;
