import React, { useState, useRef, useEffect } from "react";
import "./ColorPalette.css"; // (Your custom SCSS already covers the gradient section and general UI)

/////////////////////////////
// Utility Functions
/////////////////////////////


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
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
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
  s /= 100; v /= 100;
  let c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
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
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
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
  h = Number(h) / 360; s = Number(s) / 100; l = Number(l) / 100;
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

/////////////////////////////
// Predefined Colors
/////////////////////////////

const themeColors = [
  ["#ffffff", "#000000", "#f2f2f2", "#c00000", "#002060", "#004b7e", "#0070c0", "#00b0f0", "#00b050", "#7f7f7f"],
  ["#f2f2f2", "#7f7f7f", "#d9d9d9", "#ffbfbf", "#d5e3ff", "#b2dfff", "#bfe4ff", "#c9f0fe", "#bcffda", "#e5e5e5"],
  ["#d8d8d8", "#595959", "#b5b5b5", "#fe7f7f", "#97baff", "#65c0fe", "#7fcafe", "#93e2fe", "#79ffb6", "#cbcbcb"],
  ["#bfbfbf", "#3f3f3f", "#797979", "#ff4040", "#3075ff", "#18a1ff", "#40afff", "#5dd3ff", "#36fe91", "#b2b2b2"],
  ["#a5a5a5", "#262626", "#3c3c3c", "#900000", "#0042c7", "#00385e", "#005390", "#0083b3", "#00833b", "#5f5f5f"],
  ["#7f7f7f", "#0c0c0c", "#181818", "#600000", "#002d89", "#00253f", "#003760", "#005878", "#005827", "#3f3f3f"]
];
const standardColors = [
  "#C00000", "#FF0000", "#FFC000", "#FFFF00", "#92D050",
  "#00B050", "#00B0F0", "#0070C0", "#002060", "#7030A0"
];

///////////////////////////
// Gradient Section Utils
///////////////////////////

function hexToRgb(hex) {
  hex = hex.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map(x => x + x).join("");
  const bigint = parseInt(hex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}
function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("")
  );
}
function getRgbaString({ color, opacity }) {
  const { r, g, b } = hexToRgb(color);
  return `rgba(${r},${g},${b},${opacity})`;
}
function getGradient(type, angle, stops) {
  const stopsStr = stops.map(stop => `${getRgbaString(stop)} ${stop.percentage}%`).join(", ");
  if (type === "linear") {
    return `linear-gradient(${angle}deg, ${stopsStr})`;
  }
  return `radial-gradient(${stopsStr})`;
}
function getChartBackground(stops) {
  const stopsStr = stops.map(stop => `${getRgbaString(stop)} ${stop.percentage}%`).join(", ");
  return `linear-gradient(90deg, ${stopsStr})`;
}

/////////////////////////////////////////////////////
// MAIN COMPONENT
/////////////////////////////////////////////////////

export default function ColorPalette({ onSelect }) {
  // ---------------- Basic color state -----------------
  const [selected, setSelected] = useState("");
  const [section, setSection] = useState("Palette");
  const [hex, setHex] = useState("#3da6fb");
  const [rgba, setRgba] = useState(hexToRgba("#3da6fb"));
  const [hsv, setHsv] = useState(rgbaToHsv(rgba));
  const [hsl, setHsl] = useState(rgbaToHsl(rgba));
  const [alpha, setAlpha] = useState(1);
  const [recentColors, setRecentColors] = useState([]);
  const [rgbaInput, setRgbaInput] = useState(rgba.join(','));
  const hueCanvasRef = useRef(null);
  const huePointerRef = useRef(null);
  const [isHueDragging, setIsHueDragging] = useState(false);

  useEffect(() => {
    setRgbaInput(rgba.join(','));
  }, [rgba]);

  // ------------- Color history -------------
  function addRecentColor(color) {
    setRecentColors(prev => {
      const filtered = prev.filter(c => c !== color);
      const updated = [color, ...filtered];
      return updated.slice(0, 10);
    });
  }

  // ------------- Color pick/commit ----------
  const pickColor = color => {
    setSelected(color);
    onSelect && onSelect(color);
    addRecentColor(color);
  };

  // ----------- Model Change Handlers -----------
  const handleHexChange = e => {
    const value = e.target.value;
    setHex(value);
    try {
      const r = hexToRgba(value);
      setRgba(r); setHsv(rgbaToHsv(r)); setHsl(rgbaToHsl(r));
      setAlpha(r[3]);
      setSelected(value);
    } catch { }
  };
  const handleRgbaChange = e => {
    const inputValue = e.target.value;
    setRgbaInput(inputValue);
    const parts = inputValue.split(',').map(s => s.trim());
    if (parts.length >= 3 && parts.length <= 4) {
      const nums = parts.map(Number);
      const validRgb = nums.slice(0, 3).every(n => !isNaN(n) && n >= 0 && n <= 255);
      const validAlpha = nums.length === 4 ? (nums[3] >= 0 && nums[3] <= 1) : true;
      if (validRgb && validAlpha) {
        const rgbaArr = nums.length === 4 ? nums : [...nums, 1];
        setRgba(rgbaArr);
        const newHex = rgbaToHex(rgbaArr);
        setHex(newHex); setHsv(rgbaToHsv(rgbaArr)); setHsl(rgbaToHsl(rgbaArr)); setAlpha(rgbaArr[3]);
        setSelected(newHex);
      }
    }
  };
  const handleHsvChange = e => {
    const arr = e.target.value.split(',').map(Number);
    setHsv(arr);
    const r = hsvToRgba(arr);
    const newHex = rgbaToHex(r);
    setRgba(r); setHex(newHex); setHsl(rgbaToHsl(r));
    setSelected(newHex);
  };
  const handleHslChange = e => {
    const arr = e.target.value.split(',').map(Number);
    setHsl(arr);
    const r = hslToRgba(arr);
    const newHex = rgbaToHex(r);
    setRgba(r); setHex(newHex); setHsv(rgbaToHsv(r));
    setSelected(newHex);
  };
  const handleAlphaChange = e => {
    const val = e.target.value;
    setAlpha(val);
    let copy = [...rgba];
    copy[3] = parseFloat(val);
    setRgba(copy);
    const newHex = rgbaToHex(copy);
    setSelected(newHex);
  };

  function handleGradientAreaClick(e) {
      const rect = e.target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Convert x/y to HSV/SV value and update selected color accordingly.
      // Example: updateHsvFromGradientArea(x, y);
    }
    const canvasRef = useRef(null);

// Renders the color palette (Saturation-Value map for current Hue) whenever `hsv[0]` changes
useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas) return ;

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const saturation = x / width;
      const value = 1 - y / height;
      const [r, g, b] = hsvToRgbArray(hsv[0], saturation * 100, value * 100); // Use your HSV-to-RGB func
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }
}, [hsv[0]]); // Only redraw when hue changes

function hsvToRgbArray(h, s, v) {
  s /= 100; v /= 100;
  let c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
  let [r1, g1, b1] =
    h < 60 ? [c, x, 0] :
    h < 120 ? [x, c, 0] :
    h < 180 ? [0, c, x] :
    h < 240 ? [0, x, c] :
    h < 300 ? [x, 0, c] :
    [c, 0, x];
  return [
    Math.round((r1 + m) * 255),
    Math.round((g1 + m) * 255),
    Math.round((b1 + m) * 255)
  ];
}

// Handle clicking the canvas to pick a color
function handleCanvasClick(e) {
  const canvas = canvasRef.current;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const x = Math.max(0, Math.min(canvas.width-1, e.clientX - rect.left));
  const y = Math.max(0, Math.min(canvas.height-1, e.clientY - rect.top));
  const s = x / canvas.width;
  const v = 1 - y / canvas.height;

  setHsv([hsv[0], s*100, v*100]);
  const rgb = hsvToRgbArray(hsv[0], s*100, v*100);
  setRgba([...rgb, 1]);
}

// Draw the hue bar whenever the component mounts
useEffect(() => {
  const canvas = hueCanvasRef.current;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  for (let x = 0; x < canvas.width; x++) {
    const hue = (x / canvas.width) * 360;
    ctx.fillStyle = `hsl(${hue},100%,50%)`;
    ctx.fillRect(x, 0, 1, canvas.height);
  }
}, []);

function onHueSelect(e) {
  const rect = hueCanvasRef.current.getBoundingClientRect();
  const x = Math.max(0, Math.min(hueCanvasRef.current.width-1, e.clientX - rect.left));
  const newHue = Math.max(0, Math.min(360, Math.round((x / rect.width) * 360)));

  // Update color using setter (update HSV state and compute new RGBA)
  setHsv([newHue, hsv[1], hsv[2]]);
  const rgb = hsvToRgbArray(newHue, hsv[1], hsv[2]);
  setRgba([...rgb, 1]);
}

function onHuePointerMouseDown(e) {
  setIsHueDragging(true);
  function onMouseMove(ev) {
    const rect = hueCanvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(hueCanvasRef.current.width-1, ev.clientX - rect.left));
    const hue = Math.max(0, Math.min(360, Math.round((x / rect.width) * 360)));
    setHsv([hue, hsv[1], hsv[2]]);
    const rgb = hsvToRgbArray(hue, hsv[1], hsv[2]);
    setRgba([...rgb, 1]);
  }
  function onMouseUp() {
    setIsHueDragging(false);
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}

  ///////////////////////////////////////////////////////////////
  // ----------------------- Gradient Section ------------------
  ///////////////////////////////////////////////////////////////
  function GradientSection({ onApply }) {
    const [gradientType, setGradientType] = useState("linear");
    const [gradientAngle, setGradientAngle] = useState(45);
    const [colorStops, setColorStops] = useState([
      { color: "#662D8C", percentage: 0, opacity: 1 },
      { color: "#ED1E79", percentage: 100, opacity: 1 }
    ]);
    const [selectedColorStopIndex, setSelectedColorStopIndex] = useState(0);
    const [draggingStopIndex, setDraggingStopIndex] = useState(null);
    const [adjustingIndex, setAdjustingIndex] = useState(null);

    // Chart drag ref
    const chartRef = useRef(null);
    const anglePickerRef = useRef(null);

    function addColorStop() {
      const newStop = { color: "#000000", percentage: 100, opacity: 1 };
      const newStops = [...colorStops, newStop];
      distributeStops(newStops);
      setSelectedColorStopIndex(newStops.length - 1);
    }
    function removeColorStop(index) {
      if (colorStops.length > 2) {
        const newStops = colorStops.filter((_, i) => i !== index);
        distributeStops(newStops);
        setSelectedColorStopIndex(0);
      }
    }
    function distributeStops(stops) {
      const totalStops = stops.length;
      stops.forEach((stop, idx) => {
        stop.percentage = Math.round((idx / (totalStops - 1)) * 100);
      });
      setColorStops([...stops]);
    }

    function startDragStop(e, idx) {
      setDraggingStopIndex(idx);
      e.preventDefault();
    }
    function dragStop(e) {
      if (draggingStopIndex !== null) {
        const chart = chartRef.current;
        if (chart) {
          const rect = chart.getBoundingClientRect();
          let newX = e.clientX - rect.left;
          newX = Math.max(0, Math.min(newX, rect.width));
          const stopsCopy = [...colorStops];
          stopsCopy[draggingStopIndex].percentage = Math.round((newX / rect.width) * 100);
          setColorStops(stopsCopy);
        }
      }
    }
    function endDragStop() {
      setDraggingStopIndex(null);
    }
    // Angle picker
    function startAngleChange(e) {
      function onMouseMove(evt) {
        const rect = anglePickerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = evt.clientX - centerX;
        const dy = evt.clientY - centerY;
        let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        if (angle < 0) angle += 360;
        setGradientAngle(Math.round(angle));
      }
      function onMouseUp() {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      }
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    }
    // Opacity slider drag
    function onOpacityMouseDown(event, idx) {
      setAdjustingIndex(idx);
      event.preventDefault();
    }
    function onOpacityMouseMove(event) {
      if (adjustingIndex !== null && adjustingIndex !== -1) {
        let chart = event.target.closest(".opacity-control");
        if (chart) {
          const rect = chart.getBoundingClientRect();
          let newX = event.clientX - rect.left;
          newX = Math.max(0, Math.min(newX, rect.width));
          const stopsCopy = [...colorStops];
          stopsCopy[adjustingIndex].opacity = Math.round((newX / rect.width) * 100) / 100;
          setColorStops(stopsCopy);
        }
      }
    }
    function onOpacityMouseUp() {
      setAdjustingIndex(null);
    }
    function handleApply() {
      let cssGradient = getGradient(gradientType, gradientAngle, colorStops);
      if (onApply) onApply(cssGradient);
      setSelected(cssGradient);
      //cssGradient=extractHexColorsFromGradient(cssGradient);
    }

    function extractHexColorsFromGradient(gradientString) {
      // Find all rgba(R,G,B,...) matches:
      const regex = /rgba?\s*\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/g;
      const hexList = [];
      let match;
      while ((match = regex.exec(gradientString)) !== null) {
        const r = Number(match[1]);
        const g = Number(match[2]);
        const b = Number(match[3]);
        // Convert each RGB to HEX:
        const hex = '#' + [r, g, b].map(v => {
          const h = v.toString(16);
          return h.length === 1 ? '0' + h : h;
        }).join('');
        hexList.push(hex);
      }
      return hexList;
    }

    return (
      <div className="gradient-generator">
        <div className="controls" onClick={e => e.stopPropagation()}>
          <div className="parallel-align">
            <div className="control-group">
              <label htmlFor="gradient-type">Gradient Type:</label>
              <div className="toggle-switch">
                <button
                  className={gradientType === "linear" ? "active" : ""}
                  onClick={() => setGradientType("linear")}
                >Linear</button>
                <button
                  className={gradientType === "radial" ? "active" : ""}
                  onClick={() => setGradientType("radial")}
                >Radial</button>
              </div>
            </div>
            {gradientType === "linear" && (
              <div className="control-group ctrl-grp1">
                <label htmlFor="gradient-angle">Angle:</label>
                <div className="parallel-align align-center">
                  <div
                    className="angle-picker"
                    ref={anglePickerRef}
                    onMouseDown={startAngleChange}
                  >
                    <div
                      className="indicator"
                      style={{
                        transform: `translate(0px,-100%) rotate(${gradientAngle}deg)`
                      }}
                    />
                  </div>
                  <input
                    className="gradient-angle"
                    type="number"
                    min={0}
                    max={360}
                    value={gradientAngle}
                    onChange={e => setGradientAngle(Number(e.target.value))}
                  />
                </div>
              </div>
            )}
            <div className="angle-picker-container"></div>
          </div>

          <div className="control-group">
            <label htmlFor="color-stops">Color Stops:</label>
            <div id="color-stops">
              <div className="color-stop-list-view">
                {colorStops.map((stop, i) => (
                  <div key={i}>
                    <div
                      className={`color-selector${selectedColorStopIndex === i ? " selected" : ""}`}
                      style={{ background: stop.color }}
                      onClick={() => setSelectedColorStopIndex(i)}
                    />
                  </div>
                ))}
                <div className="color-selector add-stop" onClick={addColorStop}>+</div>
              </div>
            </div>
            <div className="parallel-align align-center">
              <input
                className="color-input-field"
                type="color"
                value={colorStops[selectedColorStopIndex].color}
                onChange={e => {
                  const stopsCopy = [...colorStops];
                  stopsCopy[selectedColorStopIndex].color = e.target.value;
                  setColorStops(stopsCopy);
                }}
              />
              <div
                className="opacity-control"
                onMouseMove={onOpacityMouseMove}
                onMouseUp={onOpacityMouseUp}
                onMouseLeave={onOpacityMouseUp}
                style={{
                  backgroundImage:
                    `linear-gradient(to right, rgba(0,0,0,0), ${colorStops[selectedColorStopIndex].color}), url(../../../assets/svg/transparent_grid.png)`
                }}
              >
                <div
                  className="pointer"
                  style={{
                    left: (colorStops[selectedColorStopIndex].opacity * 100) + "%",
                    background: colorStops[selectedColorStopIndex].color
                  }}
                  onMouseDown={e => onOpacityMouseDown(e, selectedColorStopIndex)}
                ></div>
              </div>
              <div
                className="remove-stop"
                onClick={() => removeColorStop(selectedColorStopIndex)}
              />
            </div>

            <div className="control-group">
              <label htmlFor="color-stop-chart">Adjust Stops:</label>
              <div
                id="color-stop-chart"
                className="color-stop-chart"
                ref={chartRef}
                onMouseMove={dragStop}
                onMouseUp={endDragStop}
                onMouseLeave={endDragStop}
              >
                <div
                  id="color-stop-chart-bg"
                  className="gradient-preview"
                  style={{ background: getChartBackground(colorStops) }}
                />
                {colorStops.map((stop, i) => (
                  <div
                    key={i}
                    className="color-stop-circle"
                    style={{
                      left: stop.percentage + "%",
                      background: getRgbaString(stop)
                    }}
                    onMouseDown={e => startDragStop(e, i)}
                  />
                ))}
              </div>
            </div>
            <div className="control-group">
              <label htmlFor="gradient-preview">Preview:</label>
              <div
                id="gradient-preview"
                className="gradient-preview-full"
                style={{ background: getGradient(gradientType, gradientAngle, colorStops) }}
              ></div>
            </div>
          </div>
        </div>
        <div className="preview-area">
            Selected Color: <span className="preview-color" style={{ background: selected }}></span>
          </div>
          
        <div className="btnWrapperGradient">
          <button className="applyBtn" type="button" onClick={handleApply}>Apply</button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------
  // ----------------- Render Section Tabs -----------------
  // -------------------------------------------------------
  return (
    <div className="palette-container">
      <div className="headings">
        <h4 className={section === 'Palette' ? 'active' : ''} id="palette" onClick={() => setSection('Palette')}>Palette</h4>
        <h4 className={section === 'More Colors' ? 'active' : ''} id="morecolors" onClick={() => setSection('More Colors')}>More Colors</h4>
        <h4 className={section === 'Gradient' ? 'active' : ''} id="gradient" onClick={() => setSection('Gradient')}>Gradient</h4>
      </div>

      {/* --- Palette Section --- */}
      {section === "Palette" &&
        <div className="Palette">
          <p style={{ fontWeight: "bold", fontSize: '12px' }}>Theme Colors</p>
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
          { (
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
            Selected Color: <span className="preview-color" style={{ background: selected }}></span>
          </div>
        </div>
      }

      {/* --- More Colors Section --- */}
      {section === "More Colors" &&
        <div className="color-picker-ui" style={{ width: 230, border: "1px solid #aaa", padding: 12 }}>
          <div className="color-area">
            <canvas
              ref={canvasRef}
              width={203}
              height={124}
              className="paletteCanvas"
              style={{
                borderRadius: 4,
                border: "1px solid #999",
                cursor: "crosshair"
              }}
              onClick={handleCanvasClick}
            />
            <div style={{ position: "relative", margin: "10px 15px 0px" }}>
              <canvas
                ref={hueCanvasRef}
                width={160}
                height={20}
                style={{ borderRadius: "8px", cursor: "pointer", display: "block", marginBottom: "4px" }}
                onClick={onHueSelect}
              />
              <div
                ref={huePointerRef}
                className={`hue-pointer${isHueDragging ? " grabbed" : ""}`}
                style={{
                  position: "absolute",
                  top: 0,
                  left: `${(hsv[0] / 360) * 160 - 7}px`, // Pointer centers above hue
                  width: "7px",
                  height: "20px",
                  borderRadius: "7px",
                  boxShadow: "0 0 4px #333",
                  background: `rgba(${rgba[0]},${rgba[1]},${rgba[2]},1)`,
                  border: "2px solid white",
                  cursor: isHueDragging ? "grabbing" : "grab",
                  zIndex: 2,
                  pointerEvents: "auto",
                  transition: isHueDragging ? "none" : "left 0.1s cubic-bezier(.4,.2,.2,1)"
                }}
                onMouseDown={onHuePointerMouseDown}
              />
            </div>
          </div>

          <div className="mini-toolbar" style={{ margin: "10px 0", display: "flex", alignItems: "center", gap: 8 }}>
            <button className="eyedropper" style={{ fontSize: 18 }} tabIndex={-1}>
              <span role="img" aria-label="eyedropper">&#128161;</span>
            </button>
            <div className="color-preview" style={{
              background: `rgba(${rgba[0]},${rgba[1]},${rgba[2]},${alpha})`,
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
            Selected Color: <span className="preview-color" style={{ background: selected }}></span>
          </div>
          <button
            className="apply-btn"
            onClick={() => pickColor(hex)}
            style={{ marginTop: 12, padding: "4px 12px", background: "#3da6fb", color: "white", border: "none", borderRadius: 3 }}
          >
            Apply
          </button>
        </div>
      }

      {/* --- Gradient Section --- */}
      {section === "Gradient" && (
        <GradientSection />
      )}
    </div>
  );
}
