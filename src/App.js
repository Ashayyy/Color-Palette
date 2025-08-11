import React, { useState } from "react";
import ColorPalette from "./ColorPalette";
import "./App.css";

function App() {
  const [selectedColor, setSelectedColor] = useState("");
  
  return (
    <div className="App">
      <h2>BI Color Palette Picker</h2>
      <ColorPalette onSelect={setSelectedColor} />
      <div style={{ marginTop: 30 }}>
        <div>
          <b>Your selection:</b>
        </div>
        <div style={{
          height: 28,
          width: 110,
          background: selectedColor,
          border: "1px solid #e0e0e0",
          marginTop: 8,
          borderRadius:"3px" 
      }} />
        <div>{selectedColor}</div>
      </div>
    </div>
  );
}

export default App;
