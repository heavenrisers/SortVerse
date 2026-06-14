/**
 * =============================================================
 * ALGORITHM COMPARATOR ENGINE (SIDE-BY-SIDE)
 * Manages dual visualizers, dual async loops, live statistics,
 * and a self-scaling dynamic SVG metrics comparison chart.
 * =============================================================
 */

const CompareEngine = {
  algoA: "bubble",
  algoB: "quick",
  arrayA: [],
  arrayB: [],
  state: "idle", // 'idle' | 'sorting' | 'paused' | 'completed'
  
  // Instance states
  genA: null,
  genB: null,
  timeoutA: null,
  timeoutB: null,
  
  // Metrics
  compA: 0,
  compB: 0,
  accA: 0,
  accB: 0,
  timeA: 0,
  timeB: 0,
  startA: null,
  startB: null,
  doneA: false,
  doneB: false,

  activeHighlightsA: [],
  activeHighlightsB: [],

  init() {
    const selectA = document.getElementById("compare-algo-a");
    const selectB = document.getElementById("compare-algo-b");

    this.algoA = selectA.value;
    this.algoB = selectB.value;

    this.reset();
    this.setupListeners();
  },

  setupListeners() {
    const selectA = document.getElementById("compare-algo-a");
    const selectB = document.getElementById("compare-algo-b");

    // Remove old listeners to prevent duplicates
    selectA.replaceWith(selectA.cloneNode(true));
    selectB.replaceWith(selectB.cloneNode(true));

    const newSelectA = document.getElementById("compare-algo-a");
    const newSelectB = document.getElementById("compare-algo-b");

    newSelectA.addEventListener("change", (e) => {
      this.algoA = e.target.value;
      this.reset();
    });

    newSelectB.addEventListener("change", (e) => {
      this.algoB = e.target.value;
      this.reset();
    });
  },

  reset() {
    this.stop();
    this.state = "idle";
    
    this.arrayA = [...globalArray];
    this.arrayB = [...globalArray];

    this.compA = 0;
    this.compB = 0;
    this.accA = 0;
    this.accB = 0;
    this.timeA = 0;
    this.timeB = 0;
    
    this.doneA = false;
    this.doneB = false;

    this.genA = null;
    this.genB = null;

    this.activeHighlightsA = [];
    this.activeHighlightsB = [];

    // Render bars side-by-side
    this.renderBars("a", this.arrayA, "compare-bars-a");
    this.renderBars("b", this.arrayB, "compare-bars-b");

    // Reset indicator cards
    this.updateStatsUI("a");
    this.updateStatsUI("b");

    document.getElementById("compare-a-status").textContent = "Ready";
    document.getElementById("compare-a-status").className = "status-indicator";
    document.getElementById("compare-b-status").textContent = "Ready";
    document.getElementById("compare-b-status").className = "status-indicator";

    // Setup Space Footprint blocks
    this.updateFootprintUI();

    // Reset/Draw SVG Chart
    this.drawChart();
  },

  stop() {
    if (this.timeoutA) clearTimeout(this.timeoutA);
    if (this.timeoutB) clearTimeout(this.timeoutB);
    this.timeoutA = null;
    this.timeoutB = null;
    
    document.getElementById("btn-play").style.display = "flex";
    document.getElementById("btn-pause").style.display = "none";
  },

  renderBars(idPrefix, arr, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    const n = arr.length;
    const showLabels = n <= 20;

    arr.forEach((val, idx) => {
      const bar = document.createElement("div");
      bar.className = "bar";
      bar.style.height = `${val}%`;
      bar.id = `compare-bar-${idPrefix}-${idx}`;
      
      if (showLabels) {
        const span = document.createElement("span");
        span.className = "bar-val";
        span.textContent = val;
        bar.appendChild(span);
      }
      container.appendChild(bar);
    });
  },

  updateStatsUI(side) {
    if (side === "a") {
      document.getElementById("compare-a-comp").textContent = this.compA;
      document.getElementById("compare-a-acc").textContent = this.accA;
      document.getElementById("compare-a-time").textContent = `${this.timeA.toFixed(2)} ms`;
    } else {
      document.getElementById("compare-b-comp").textContent = this.compB;
      document.getElementById("compare-b-acc").textContent = this.accB;
      document.getElementById("compare-b-time").textContent = `${this.timeB.toFixed(2)} ms`;
    }
  },

  updateFootprintUI() {
    const metaA = ALGO_METADATA[this.algoA];
    const metaB = ALGO_METADATA[this.algoB];

    document.getElementById("footprint-name-a").textContent = metaA.name;
    document.getElementById("footprint-name-b").textContent = metaB.name;
    
    document.getElementById("footprint-val-a").textContent = `Aux Space: ${metaA.space}`;
    document.getElementById("footprint-val-b").textContent = `Aux Space: ${metaB.space}`;

    // Helper mapping auxiliary spaces to percentage widths for scale bars
    const spaceToWidth = (space) => {
      if (space.includes("O(1)")) return "15%";
      if (space.includes("O(log N)")) return "45%";
      if (space.includes("O(N)")) return "90%";
      return "30%";
    };

    document.getElementById("scale-bar-a").style.width = spaceToWidth(metaA.space);
    document.getElementById("scale-bar-b").style.width = spaceToWidth(metaB.space);
  },

  play() {
    if (this.state === "completed") {
      this.reset();
    }
    
    synth.initContext();
    this.state = "sorting";
    
    document.getElementById("btn-play").style.display = "none";
    document.getElementById("btn-pause").style.display = "flex";

    // Set statuses
    if (!this.doneA) {
      const status = document.getElementById("compare-a-status");
      status.textContent = "Sorting";
      status.className = "status-indicator sorting";
      this.startA = performance.now() - this.timeA;
      this.runLoopA();
    }
    
    if (!this.doneB) {
      const status = document.getElementById("compare-b-status");
      status.textContent = "Sorting";
      status.className = "status-indicator sorting";
      this.startB = performance.now() - this.timeB;
      this.runLoopB();
    }
  },

  pause() {
    this.state = "paused";
    this.stop();

    if (!this.doneA) {
      const status = document.getElementById("compare-a-status");
      status.textContent = "Paused";
      status.className = "status-indicator";
    }
    if (!this.doneB) {
      const status = document.getElementById("compare-b-status");
      status.textContent = "Paused";
      status.className = "status-indicator";
    }
  },

  runLoopA() {
    if (this.state !== "sorting" || this.doneA) return;
    
    this.timeA = performance.now() - this.startA;
    const stepResult = this.stepSide("a");
    this.updateStatsUI("a");
    this.drawChart();

    if (stepResult.done) {
      this.doneA = true;
      const status = document.getElementById("compare-a-status");
      status.textContent = "Sorted";
      status.className = "status-indicator sorted";
      
      // Clean up highlights
      this.clearHighlights("a");
      document.querySelectorAll("#compare-bars-a .bar").forEach(b => b.classList.add("sorted"));

      this.checkGlobalCompletion();
    } else {
      this.timeoutA = setTimeout(() => this.runLoopA(), animDelay);
    }
  },

  runLoopB() {
    if (this.state !== "sorting" || this.doneB) return;
    
    this.timeB = performance.now() - this.startB;
    const stepResult = this.stepSide("b");
    this.updateStatsUI("b");
    this.drawChart();

    if (stepResult.done) {
      this.doneB = true;
      const status = document.getElementById("compare-b-status");
      status.textContent = "Sorted";
      status.className = "status-indicator sorted";
      
      this.clearHighlights("b");
      document.querySelectorAll("#compare-bars-b .bar").forEach(b => b.classList.add("sorted"));
      
      this.checkGlobalCompletion();
    } else {
      this.timeoutB = setTimeout(() => this.runLoopB(), animDelay);
    }
  },

  checkGlobalCompletion() {
    if (this.doneA && this.doneB) {
      this.state = "completed";
      this.stop();
    }
  },

  step() {
    // Top-header single step button: steps both once manually
    synth.initContext();
    this.state = "paused";
    
    let stepped = false;
    
    if (!this.doneA) {
      const res = this.stepSide("a");
      this.updateStatsUI("a");
      stepped = true;
      if (res.done) {
        this.doneA = true;
        document.getElementById("compare-a-status").textContent = "Sorted";
        document.getElementById("compare-a-status").className = "status-indicator sorted";
        document.querySelectorAll("#compare-bars-a .bar").forEach(b => b.classList.add("sorted"));
      }
    }

    if (!this.doneB) {
      const res = this.stepSide("b");
      this.updateStatsUI("b");
      stepped = true;
      if (res.done) {
        this.doneB = true;
        document.getElementById("compare-b-status").textContent = "Sorted";
        document.getElementById("compare-b-status").className = "status-indicator sorted";
        document.querySelectorAll("#compare-bars-b .bar").forEach(b => b.classList.add("sorted"));
      }
    }

    if (stepped) {
      this.drawChart();
    }
    this.checkGlobalCompletion();
  },

  stepSide(side) {
    const isA = side === "a";
    let gen = isA ? this.genA : this.genB;
    const arr = isA ? this.arrayA : this.arrayB;
    const algo = isA ? this.algoA : this.algoB;
    
    if (!gen) {
      const genFunc = ALGO_METADATA[algo].generator;
      gen = genFunc.call(ALGO_METADATA[algo], arr);
      if (isA) this.genA = gen; else this.genB = gen;
    }

    this.clearHighlights(side);

    const stepResult = gen.next();
    if (stepResult.done) {
      return { done: true };
    }

    const val = stepResult.value;
    const highlights = isA ? this.activeHighlightsA : this.activeHighlightsB;

    if (val.type === "compare") {
      if (isA) this.compA++; else this.compB++;
      if (isA) this.accA += val.indices.length; else this.accB += val.indices.length;
      
      val.indices.forEach(idx => {
        const bar = document.getElementById(`compare-bar-${side}-${idx}`);
        if (bar) {
          bar.classList.add("compare");
          highlights.push(bar);
        }
      });
      // Play audio on side A or side B depending on settings
      if (isA && val.indices.length > 0) {
        synth.playTone(arr[val.indices[0]]);
      }
    } 
    else if (val.type === "swap") {
      if (isA) this.accA += 4; else this.accB += 4;
      const [i, j] = val.indices;
      
      let temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
      
      const barI = document.getElementById(`compare-bar-${side}-${i}`);
      const barJ = document.getElementById(`compare-bar-${side}-${j}`);
      
      if (barI && barJ) {
        barI.style.height = `${arr[i]}%`;
        barJ.style.height = `${arr[j]}%`;
        
        const spanI = barI.querySelector(".bar-val");
        const spanJ = barJ.querySelector(".bar-val");
        if (spanI) spanI.textContent = arr[i];
        if (spanJ) spanJ.textContent = arr[j];

        barI.classList.add("swap");
        barJ.classList.add("swap");
        highlights.push(barI, barJ);
      }
      if (isA) synth.playTone(arr[i]);
    } 
    else if (val.type === "set") {
      if (isA) this.accA += 2; else this.accB += 2;
      const i = val.index;
      arr[i] = val.value;
      
      const bar = document.getElementById(`compare-bar-${side}-${i}`);
      if (bar) {
        bar.style.height = `${arr[i]}%`;
        const span = bar.querySelector(".bar-val");
        if (span) span.textContent = arr[i];
        
        bar.classList.add("swap");
        highlights.push(bar);
      }
      if (isA) synth.playTone(arr[i]);
    }
    else if (val.type === "pivot") {
      const bar = document.getElementById(`compare-bar-${side}-${val.index}`);
      if (bar) {
        bar.classList.add("pivot");
        highlights.push(bar);
      }
    }
    else if (val.type === "sorted") {
      const bar = document.getElementById(`compare-bar-${side}-${val.index}`);
      if (bar) {
        bar.classList.add("sorted");
      }
    }

    return { done: false };
  },

  clearHighlights(side) {
    const highlights = side === "a" ? this.activeHighlightsA : this.activeHighlightsB;
    highlights.forEach(bar => {
      bar.classList.remove("compare", "swap", "pivot");
    });
    if (side === "a") this.activeHighlightsA = []; else this.activeHighlightsB = [];
  },

  // Renders a dynamic, self-scaling comparison SVG bar chart
  drawChart() {
    const svg = document.getElementById("comparison-svg-chart");
    svg.innerHTML = "";

    const width = 500;
    const height = 240;
    const padding = 40;

    const chartW = width - padding * 2;
    const chartH = height - padding * 2;

    // Add Gridlines
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartH / 4) * i;
      const grid = document.createElementNS("http://www.w3.org/2000/svg", "line");
      grid.setAttribute("x1", padding);
      grid.setAttribute("y1", y);
      grid.setAttribute("x2", width - padding);
      grid.setAttribute("y2", y);
      grid.setAttribute("stroke", "rgba(255,255,255,0.04)");
      grid.setAttribute("stroke-width", "1");
      svg.appendChild(grid);
    }

    const categories = ["Comparisons", "Accesses", "Time (ms)"];
    
    // Values
    const valsA = [this.compA, this.accA, Math.round(this.timeA)];
    const valsB = [this.compB, this.accB, Math.round(this.timeB)];

    const categoryWidth = chartW / categories.length;
    const groupPadding = 20;
    const barWidth = (categoryWidth - groupPadding * 2) / 2 - 4;

    categories.forEach((cat, index) => {
      const groupX = padding + index * categoryWidth + groupPadding;
      
      const valA = valsA[index];
      const valB = valsB[index];
      
      // Auto-scale relative to max value in category (minimum scale 10 to avoid 0 divisions)
      const maxVal = Math.max(valA, valB, 10);
      
      const hA = (valA / maxVal) * chartH;
      const hB = (valB / maxVal) * chartH;
      
      // Draw Bar A (Purple)
      const rectA = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rectA.setAttribute("x", groupX);
      rectA.setAttribute("y", padding + chartH - hA);
      rectA.setAttribute("width", barWidth);
      rectA.setAttribute("height", hA);
      rectA.setAttribute("rx", "4");
      rectA.setAttribute("fill", "#8B5CF6");
      rectA.setAttribute("filter", "drop-shadow(0 2px 6px rgba(139, 92, 246, 0.4))");
      svg.appendChild(rectA);

      // Label A
      const textA = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textA.setAttribute("x", groupX + barWidth / 2);
      textA.setAttribute("y", padding + chartH - hA - 6);
      textA.setAttribute("fill", "#94A3B8");
      textA.setAttribute("font-size", "10");
      textA.setAttribute("font-family", "Outfit");
      textA.setAttribute("text-anchor", "middle");
      textA.textContent = valA;
      svg.appendChild(textA);

      // Draw Bar B (Cyan)
      const rectB = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rectB.setAttribute("x", groupX + barWidth + 8);
      rectB.setAttribute("y", padding + chartH - hB);
      rectB.setAttribute("width", barWidth);
      rectB.setAttribute("height", hB);
      rectB.setAttribute("rx", "4");
      rectB.setAttribute("fill", "#06B6D4");
      rectB.setAttribute("filter", "drop-shadow(0 2px 6px rgba(6, 182, 212, 0.4))");
      svg.appendChild(rectB);

      // Label B
      const textB = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textB.setAttribute("x", groupX + barWidth + 8 + barWidth / 2);
      textB.setAttribute("y", padding + chartH - hB - 6);
      textB.setAttribute("fill", "#94A3B8");
      textB.setAttribute("font-size", "10");
      textB.setAttribute("font-family", "Outfit");
      textB.setAttribute("text-anchor", "middle");
      textB.textContent = valB;
      svg.appendChild(textB);

      // Category axis text
      const catText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      catText.setAttribute("x", groupX + barWidth + 4);
      catText.setAttribute("y", padding + chartH + 18);
      catText.setAttribute("fill", "#64748B");
      catText.setAttribute("font-size", "11");
      catText.setAttribute("font-family", "Outfit");
      catText.setAttribute("font-weight", "600");
      catText.setAttribute("text-anchor", "middle");
      catText.textContent = cat;
      svg.appendChild(catText);
    });

    // Draw bottom baseline
    const baseline = document.createElementNS("http://www.w3.org/2000/svg", "line");
    baseline.setAttribute("x1", padding);
    baseline.setAttribute("y1", padding + chartH);
    baseline.setAttribute("x2", width - padding);
    baseline.setAttribute("y2", padding + chartH);
    baseline.setAttribute("stroke", "rgba(255, 255, 255, 0.12)");
    baseline.setAttribute("stroke-width", "1.5");
    svg.appendChild(baseline);
  }
};
