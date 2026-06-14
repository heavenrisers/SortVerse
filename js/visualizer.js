/**
 * =============================================================
 * SINGLE ALGORITHM VISUALIZER ENGINE
 * Manages tab switching, controls, execution loops, 
 * pseudocode highlight rendering, and statistics.
 * =============================================================
 */

// Global App State
let activeView = "single";
let globalArray = [];
let animDelay = 50;

// Single Mode State
const SingleVisualizer = {
  currentAlgo: "bubble",
  array: [],
  state: "idle", // 'idle' | 'sorting' | 'paused' | 'completed'
  generator: null,
  comparisons: 0,
  accesses: 0,
  startTime: null,
  elapsedTime: 0,
  timerId: null,
  timeoutId: null,
  activeHighlights: [], // track bars currently highlighted to clean up

  init() {
    this.loadAlgorithmDetails();
    this.reset();
  },

  loadAlgorithmDetails() {
    const meta = ALGO_METADATA[this.currentAlgo];
    if (!meta) return;

    // Load complexity cards
    document.getElementById("algo-type-badge").textContent = `Aux: ${meta.space}`;
    document.getElementById("stat-space").textContent = meta.space;
    document.getElementById("comp-best").textContent = meta.best;
    document.getElementById("comp-avg").textContent = meta.avg;
    document.getElementById("comp-worst").textContent = meta.worst;
    document.getElementById("comp-stability").textContent = meta.stability;

    // Load pseudocode
    const codeDisplay = document.getElementById("code-display");
    codeDisplay.innerHTML = meta.code
      .map((line, idx) => `<span class="code-line" id="single-line-${idx}">${escapeHtml(line)}</span>`)
      .join("\n");
  },

  reset() {
    this.stop();
    this.state = "idle";
    this.array = [...globalArray];
    this.comparisons = 0;
    this.accesses = 0;
    this.elapsedTime = 0;
    this.generator = null;
    this.activeHighlights = [];
    
    this.updateStatsUI();
    this.renderBars();
    
    const statusText = document.getElementById("single-status");
    statusText.textContent = "Ready";
    statusText.className = "status-indicator";

    // Clear code highlights
    const lines = document.querySelectorAll("#code-display .code-line");
    lines.forEach(l => l.classList.remove("highlight"));
  },

  renderBars() {
    const container = document.getElementById("single-bars-container");
    container.innerHTML = "";
    
    const n = this.array.length;
    // Determine if we should show labels (only on small arrays <= 25)
    const showLabels = n <= 25;

    this.array.forEach((val, idx) => {
      const bar = document.createElement("div");
      bar.className = "bar";
      bar.style.height = `${val}%`;
      bar.id = `single-bar-${idx}`;
      
      if (showLabels) {
        const span = document.createElement("span");
        span.className = "bar-val";
        span.textContent = val;
        bar.appendChild(span);
      }
      
      container.appendChild(bar);
    });
  },

  updateStatsUI() {
    document.getElementById("stat-comparisons").textContent = this.comparisons;
    document.getElementById("stat-accesses").textContent = this.accesses;
    document.getElementById("stat-time").textContent = `${this.elapsedTime.toFixed(2)} ms`;
  },

  startTimer() {
    this.startTime = performance.now() - this.elapsedTime;
    this.timerId = setInterval(() => {
      if (this.state === "sorting") {
        this.elapsedTime = performance.now() - this.startTime;
        document.getElementById("stat-time").textContent = `${this.elapsedTime.toFixed(2)} ms`;
      }
    }, 10);
  },

  stopTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  },

  play() {
    if (this.state === "completed") {
      this.reset();
    }
    
    synth.initContext();
    this.state = "sorting";
    
    const statusText = document.getElementById("single-status");
    statusText.textContent = "Sorting";
    statusText.className = "status-indicator sorting";
    
    document.getElementById("btn-play").style.display = "none";
    document.getElementById("btn-pause").style.display = "flex";
    
    this.startTimer();
    this.runLoop();
  },

  pause() {
    this.state = "paused";
    this.stopTimer();
    
    const statusText = document.getElementById("single-status");
    statusText.textContent = "Paused";
    statusText.className = "status-indicator";
    
    document.getElementById("btn-play").style.display = "flex";
    document.getElementById("btn-pause").style.display = "none";
  },

  stop() {
    this.stopTimer();
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    document.getElementById("btn-play").style.display = "flex";
    document.getElementById("btn-pause").style.display = "none";
  },

  // Core execution loop
  runLoop() {
    if (this.state !== "sorting") return;
    
    const result = this.step();
    
    if (result.done) {
      this.state = "completed";
      this.stopTimer();
      
      const statusText = document.getElementById("single-status");
      statusText.textContent = "Sorted";
      statusText.className = "status-indicator sorted";
      
      document.getElementById("btn-play").style.display = "flex";
      document.getElementById("btn-pause").style.display = "none";
    } else {
      this.timeoutId = setTimeout(() => this.runLoop(), animDelay);
    }
  },

  // Execute a single sorting step
  step() {
    if (!this.generator) {
      const algo = ALGO_METADATA[this.currentAlgo].generator;
      this.generator = algo.call(ALGO_METADATA[this.currentAlgo], this.array);
    }

    // Clear previous temporary highlights
    this.clearHighlights();

    const stepResult = this.generator.next();
    if (stepResult.done) {
      // Final flash of green to mark completion
      const bars = document.querySelectorAll("#single-bars-container .bar");
      bars.forEach(b => b.classList.add("sorted"));
      return { done: true };
    }

    const val = stepResult.value;
    
    // Highlight Pseudocode Line
    if (val.line !== undefined) {
      this.highlightCodeLine(val.line);
    }

    // Process step action
    if (val.type === "compare") {
      this.comparisons++;
      this.accesses += val.indices.length;
      
      val.indices.forEach(idx => {
        const bar = document.getElementById(`single-bar-${idx}`);
        if (bar) {
          bar.classList.add("compare");
          this.activeHighlights.push(bar);
        }
      });
      
      // Play synthesis sound based on first index value
      if (val.indices.length > 0) {
        synth.playTone(this.array[val.indices[0]]);
      }
    } 
    else if (val.type === "swap") {
      this.accesses += 4; // 2 reads, 2 writes
      const [i, j] = val.indices;
      
      // Swap array elements
      let temp = this.array[i];
      this.array[i] = this.array[j];
      this.array[j] = temp;
      
      // Update DOM heights
      const barI = document.getElementById(`single-bar-${i}`);
      const barJ = document.getElementById(`single-bar-${j}`);
      
      if (barI && barJ) {
        barI.style.height = `${this.array[i]}%`;
        barJ.style.height = `${this.array[j]}%`;
        
        // Update label values if showing
        const spanI = barI.querySelector(".bar-val");
        const spanJ = barJ.querySelector(".bar-val");
        if (spanI) spanI.textContent = this.array[i];
        if (spanJ) spanJ.textContent = this.array[j];

        barI.classList.add("swap");
        barJ.classList.add("swap");
        this.activeHighlights.push(barI, barJ);
      }
      synth.playTone(this.array[i]);
    } 
    else if (val.type === "set") {
      this.accesses += 2; // 1 read, 1 write
      const i = val.index;
      this.array[i] = val.value;
      
      const bar = document.getElementById(`single-bar-${i}`);
      if (bar) {
        bar.style.height = `${this.array[i]}%`;
        const span = bar.querySelector(".bar-val");
        if (span) span.textContent = this.array[i];
        
        bar.classList.add("swap");
        this.activeHighlights.push(bar);
      }
      synth.playTone(this.array[i]);
    }
    else if (val.type === "pivot") {
      const bar = document.getElementById(`single-bar-${val.index}`);
      if (bar) {
        bar.classList.add("pivot");
        this.activeHighlights.push(bar);
      }
    }
    else if (val.type === "sorted") {
      const bar = document.getElementById(`single-bar-${val.index}`);
      if (bar) {
        bar.classList.add("sorted");
      }
    }

    this.updateStatsUI();
    return { done: false };
  },

  clearHighlights() {
    this.activeHighlights.forEach(bar => {
      bar.classList.remove("compare", "swap", "pivot");
    });
    this.activeHighlights = [];
  },

  highlightCodeLine(lineIdx) {
    const lines = document.querySelectorAll("#code-display .code-line");
    lines.forEach(l => l.classList.remove("highlight"));
    
    const targetLine = document.getElementById(`single-line-${lineIdx}`);
    if (targetLine) {
      targetLine.classList.add("highlight");
      // Scroll to highlight if needed
      targetLine.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }
};

// Escape HTML utility
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Global UI Navigation & Config Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  const sizeInput = document.getElementById("array-size");
  const sizeVal = document.getElementById("size-val");
  const arrayType = document.getElementById("array-type");
  const speedInput = document.getElementById("animation-speed");
  const speedVal = document.getElementById("speed-val");
  const generateBtn = document.getElementById("btn-generate");
  const algoSelect = document.getElementById("single-algo-select");

  // Volume / Audio Controls
  const audioToggle = document.getElementById("audio-toggle");
  const volumeControl = document.getElementById("volume-control");

  synth.enabled = audioToggle.checked;
  synth.volume = volumeControl.value / 100;

  audioToggle.addEventListener("change", (e) => {
    synth.enabled = e.target.checked;
  });
  volumeControl.addEventListener("input", (e) => {
    synth.volume = e.target.value / 100;
  });

  // Initial array size text
  sizeVal.textContent = sizeInput.value;
  
  // Set global array
  globalArray = ArrayGenerators[arrayType.value](parseInt(sizeInput.value));
  
  // Initialize Single Visualizer
  SingleVisualizer.init();

  // Navigation handlers
  const navBtns = document.querySelectorAll(".nav-btn");
  navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      navBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      // Stop all active runs
      SingleVisualizer.stop();
      if (typeof CompareEngine !== 'undefined') CompareEngine.stop();
      if (typeof ArenaEngine !== 'undefined') ArenaEngine.stop();

      const nextView = btn.dataset.view;
      activeView = nextView;
      
      const panels = document.querySelectorAll(".view-panel");
      panels.forEach(p => p.classList.remove("active"));
      document.getElementById(`view-${nextView}`).classList.add("active");

      // Setup/Reset the active view
      if (nextView === "single") {
        SingleVisualizer.reset();
        document.querySelector(".top-controls").style.display = "flex";
      } else if (nextView === "compare") {
        CompareEngine.init();
        document.querySelector(".top-controls").style.display = "flex";
      } else if (nextView === "arena") {
        ArenaEngine.init();
        // The Race Arena has its own Start button, so we can hide or restrict standard top controls
        document.querySelector(".top-controls").style.display = "none";
      }
    });
  });

  // Dataset Config Event Handlers
  sizeInput.addEventListener("input", (e) => {
    sizeVal.textContent = e.target.value;
  });

  sizeInput.addEventListener("change", () => {
    globalArray = ArrayGenerators[arrayType.value](parseInt(sizeInput.value));
    triggerActiveViewReset();
  });

  arrayType.addEventListener("change", () => {
    globalArray = ArrayGenerators[arrayType.value](parseInt(sizeInput.value));
    triggerActiveViewReset();
  });

  generateBtn.addEventListener("click", () => {
    globalArray = ArrayGenerators[arrayType.value](parseInt(sizeInput.value));
    triggerActiveViewReset();
  });

  // Algorithm select dropdown handler
  algoSelect.addEventListener("change", (e) => {
    SingleVisualizer.currentAlgo = e.target.value;
    SingleVisualizer.loadAlgorithmDetails();
    SingleVisualizer.reset();
  });

  // Animation speed controls
  speedInput.addEventListener("input", (e) => {
    animDelay = parseInt(e.target.value);
    speedVal.textContent = `${animDelay} ms`;
  });

  // Top header button action handlers
  document.getElementById("btn-play").addEventListener("click", () => {
    if (activeView === "single") {
      SingleVisualizer.play();
    } else if (activeView === "compare") {
      CompareEngine.play();
    }
  });

  document.getElementById("btn-pause").addEventListener("click", () => {
    if (activeView === "single") {
      SingleVisualizer.pause();
    } else if (activeView === "compare") {
      CompareEngine.pause();
    }
  });

  document.getElementById("btn-step").addEventListener("click", () => {
    if (activeView === "single") {
      SingleVisualizer.step();
    } else if (activeView === "compare") {
      CompareEngine.step();
    }
  });

  document.getElementById("btn-reset").addEventListener("click", () => {
    if (activeView === "single") {
      SingleVisualizer.reset();
    } else if (activeView === "compare") {
      CompareEngine.reset();
    }
  });

  function triggerActiveViewReset() {
    if (activeView === "single") {
      SingleVisualizer.reset();
    } else if (activeView === "compare") {
      CompareEngine.reset();
    } else if (activeView === "arena") {
      ArenaEngine.init();
    }
  }
});
