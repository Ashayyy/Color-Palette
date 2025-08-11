import React, { useState } from "react";
import "./ColorPalette.css";

function hexToRgba(hex) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16);
  return [
    (num >> 16) & 255,
    (num >> 8) & 255,
    num & 255,
    1,
  ];
}
function rgbaToHex([r, g, b, a]) {
  // ignore alpha in hex
  return (
    '#' +
    [r, g, b]
      .map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
}
function rgbaToHsv([r, g, b, a]) {
  r /= 255; g /= 255; b /= 255;
  let max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h, s, v = max;
  let d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max === min) h = 0;
  else {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
}
function hsvToRgba([h, s, v]) {
  h = Number(h); s = Number(s); v = Number(v);
  s /= 100;
  v /= 100;
  let c = v * s;
  let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  let m = v - c;
  let rgb =
    h < 60 ? [c, x, 0] :
      h < 120 ? [x, c, 0] :
        h < 180 ? [0, c, x] :
          h < 240 ? [0, x, c] :
            h < 300 ? [x, 0, c] :
              [c, 0, x];
  return [Math.round((rgb[0] + m) * 255), Math.round((rgb[1] + m) * 255), Math.round((rgb[2] + m) * 255), 1];
}
function rgbaToHsl([r, g, b, a]) {
  r /= 255; g /= 255; b /= 255;
  let max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h, s, l;
  l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}
function hslToRgba([h, s, l]) {
  h = Number(h) / 360;
  s = Number(s) / 100;
  l = Number(l) / 100;
  let r, g, b;
  if (s === 0) r = g = b = l;
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    let p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), 1];
}

const themeColors = [
  ["#ffffff", "#000000", "#f2f2f2", "#c00000", "#002060", "#004b7e", "#0070c0", "#00b0f0", "#00b050", "#7f7f7f"],
  ["#f2f2f2", "#7f7f7f", "#d9d9d9", "#ffbfbf", "#d5e3ff", "#b2dfff", "#bfe4ff", "#c9f0fe", "#bcffda", "#e5e5e5"],
  ["#d8d8d8", "#595959", "#b5b5b5", "#fe7f7f", "#97baff", "#65c0fe", "#7fcafe", "#93e2fe", "#79ffb6", "#cbcbcb"],
  ["#bfbfbf", "#3f3f3f", "#797979", "#ff4040", "#3075ff", "#18a1ff", "#40afff", "#5dd3ff", "#36fe91", "#b2b2b2"],
  ["#a5a5a5", "#262626", "#3c3c3c", "#900000", "#0042c7", "#00385e", "#005390", "#0083b3", "#00833b", "#5f5f5f"],
  ["#7f7f7f", "#0c0c0c", "#181818", "#600000", "#002d89", "#00253f", "#003760", "#005878", "#005827", "#3f3f3f"]
];

const standardColors = ["#C00000", "#FF0000", "#FFC000", "#FFFF00", "#92D050", "#00B050", "#00B0F0", "#0070C0", "#002060", "#7030A0"];
export default function ColorPalette({ onSelect }) {
  const [selected, setSelected] = useState("");
  const [section, setSection] = useState("Palette");

  // const pickColor = color => {
  //   setSelected(color);
  //   onSelect && onSelect(color);
  // };

  // const [hex, setHex] = useState('#4298F5');
  // const [rgba, setRgba] = useState([66, 152, 245, 1]);
  // const [hsv, setHsv] = useState([211, 73, 96]);
  // const [hsl, setHsl] = useState([211, 89.9, 60.9]);

  const [hex, setHex] = useState("#3da6fb");
  const [rgba, setRgba] = useState(hexToRgba("#3da6fb"));
  const [hsv, setHsv] = useState(rgbaToHsv(rgba));
  const [hsl, setHsl] = useState(rgbaToHsl(rgba));
  const [alpha, setAlpha] = useState(1);
  const [recentColors, setRecentColors] = useState([]);
  // Add this near your other state declarations:
  const [rgbaInput, setRgbaInput] = useState(rgba.join(','));

  React.useEffect(() => {
  setRgbaInput(rgba.join(','));
}, [rgba]);




  const pickColor = color => {
    setSelected(color);
    onSelect && onSelect(color);
    addRecentColor(color);
  };

  function addRecentColor(color) {
    setRecentColors(prev => {
      // Remove if already exists
      const filtered = prev.filter(c => c !== color);
      // Add to start
      const updated = [color, ...filtered];
      // Limit to 10
      return updated.slice(0, 10);
    });
  }


  // Handlers
  const handleHexChange = e => {
    const value = e.target.value;
    setHex(value);
    try {
      const r = hexToRgba(value);
      setRgba(r);
      setHsv(rgbaToHsv(r));
      setHsl(rgbaToHsl(r));
      setAlpha(r[3]);
      setSelected(value); // add this line
    } catch { }
  };

  // Update your handleRgbaChange:
const handleRgbaChange = e => {
  const inputValue = e.target.value;
  setRgbaInput(inputValue);

  // Parse and validate the RGBA input
  const parts = inputValue.split(',').map(s => s.trim());
  if (parts.length >= 3 && parts.length <= 4) {
    const nums = parts.map(Number);
    const validRgb = nums.slice(0, 3).every(n => !isNaN(n) && n >= 0 && n <= 255);
    const validAlpha = nums.length === 4 ? (nums[3] >= 0 && nums[3] <= 1) : true;
    if (validRgb && validAlpha) {
      const rgbaArr = nums.length === 4 ? nums : [...nums, 1];
      setRgba(rgbaArr);
      const newHex = rgbaToHex(rgbaArr);
      setHex(newHex);
      setHsv(rgbaToHsv(rgbaArr));
      setHsl(rgbaToHsl(rgbaArr));
      setAlpha(rgbaArr[3]);
      setSelected(newHex);
    }
  }
};

  const handleHsvChange = e => {
    const arr = e.target.value.split(',').map(Number);
    setHsv(arr);
    const r = hsvToRgba(arr);
    const newHex = rgbaToHex(r);
    setRgba(r);
    setHex(newHex);
    setHsl(rgbaToHsl(r));
    setSelected(newHex); // add this line
  };
  const handleHslChange = e => {
    const arr = e.target.value.split(',').map(Number);
    setHsl(arr);
    const r = hslToRgba(arr);
    const newHex = rgbaToHex(r);
    setRgba(r);
    setHex(newHex);
    setHsv(rgbaToHsv(r));
    setSelected(newHex); // add this line
  };

  const handleAlphaChange = e => {
    const val = e.target.value;
    setAlpha(val);
    let copy = [...rgba];
    copy[3] = parseFloat(val);
    setRgba(copy);
    const newHex = rgbaToHex(copy);
    setSelected(newHex); // add this line
  };

  // use all functions, variables in the JSX here

  return (
    <div className="palette-container">
      <div className="headings">
        <h4 className={section === 'Palette' ? 'active' : ''} id="palette" onClick={() => setSection('Palette')}>Palette</h4>
        <h4 className={section === 'More Colors' ? 'active' : ''} id="morecolors" onClick={() => setSection('More Colors')}>More Colors</h4>
        <h4 className={section === 'Gradient' ? 'active' : ''} id="gradient" onClick={() => setSection('Gradient')}>Gradient</h4>
      </div>

      {section === "Palette" ? (
        <div className="Palette">
          <p style={{fontWeight:"bold", fontSize:'12px'}}>Theme Colors</p>
          <div className="swatch-grid">
            {themeColors.map((row, rowIdx) =>
              row.map((color, colIdx) => (
                <button
                  key={color + rowIdx}
                  className={`color-swatch${selected === color ? " selected" : ""}`}
                  style={{ background: color }}
                  title={color}
                  onClick={() => pickColor(color)}
                />
              ))
            )}
          </div>

          {recentColors.length > 0 && (
            <>
              <h4>Recent Colors</h4>
              <div className="swatch-row">
                {recentColors.map(color => (
                  <button
                    key={color}
                    className={`color-swatch small${selected === color ? " selected" : ""}`}
                    style={{ background: color }}
                    title={color}
                    onClick={() => pickColor(color)}
                  />
                ))}
              </div>
            </>
          )}

          <h4>Standard Colors</h4>
          <div className="swatch-row">
            {standardColors.map(color => (
              <button
                key={color}
                className={`color-swatch small${selected === color ? " selected" : ""}`}
                style={{ background: color }}
                title={color}
                onClick={() => pickColor(color)}
              />
            ))}
          </div>

          <div className="preview-area">
            Selected Color: <span className="preview-color" style={{ background: selected }}>{selected}</span>
          </div>
        </div>
      )
        : section === 'More Colors' ? (
          <div className="color-picker-ui" style={{ width: 230, border: "1px solid #aaa", padding: 12 }}>
            <div className="color-area">
              <div className="color-box" style={{
                background: hex,
                width: 228, height: 72, border: "1px solid #999", marginBottom: 6
              }} />
              {/* You can add a real color slider/area here */}
              <input
                type="range"
                className="color-slider"
                min={0}
                max={360}
                value={hsv[0]}
                onChange={e => handleHsvChange({ target: { value: [e.target.value, hsv[1], hsv[2]].join(',') } })}
              />
            </div>
            <div className="mini-toolbar" style={{ margin: "10px 0", display: "flex", alignItems: "center", gap: 8 }}>
              <button className="eyedropper" style={{ fontSize: 18 }} tabIndex={-1}>
                <span role="img" aria-label="eyedropper">&#128161;</span>
              </button>
              <div className="color-preview" style={{
                background: hex,
                width: 22,
                height: 22,
                borderRadius: 3,
                border: "1px solid #999"
              }}></div>
              <input
                type="range"
                className="alpha-slider"
                min={0}
                max={1}
                step={0.01}
                value={alpha}
                onChange={handleAlphaChange}
              />
            </div>
            <div className="color-values" style={{ fontSize: 13 }}>
              <div>
                <label>HEX:</label>
                <input value={hex} onChange={handleHexChange} />
              </div>
              <div>
                <label>RGBA:</label>
                <input
                  value={rgbaInput}
                  onChange={handleRgbaChange}
                />
              </div>
              <div>
                <label>HSV:</label>
                <input
                  value={hsv.join(',')}
                  onChange={handleHsvChange}
                />
              </div>
              <div>
                <label>HSL:</label>
                <input
                  value={hsl.join(',')}
                  onChange={handleHslChange}
                />
              </div>
            </div>
            <div className="preview-area">
              Selected Color: <span className="preview-color" style={{ background: selected }}>{selected}</span>
            </div>
            <button className="apply-btn"onClick={() => pickColor(selected)} style={{ marginTop: 12, padding: "4px 12px", background: "#3da6fb", color: "white", border: "none", borderRadius: 3 }}>
              Apply
            </button>
          </div>
        ) : (
          <div>
            {/*Here you write the logic for placeholder for Gradient section */}
            <p>Gradient section coming soon!</p>
          </div>
        )}
    </div>
  );
}
