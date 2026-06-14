/**
 * =============================================================
 * ALGORITHM RACE ARENA ENGINE
 * Runs 5 algorithms concurrently on copies of the same dataset,
 * tracks sorting progress relative to a pre-sorted reference,
 * updates rankings dynamically, and reveals the winner podium.
 * =============================================================
 */

const ArenaEngine = {
  contestants: ["bubble", "selection", "insertion", "merge", "quick"],
  lanes: {}, // stores states for each running contestant
  state: "idle", // 'idle' | 'running' | 'completed'
  startTime: null,
  finishedCount: 0,
  leaderboard: [],
  sortedReference: [],

  init() {
    this.stop();
    this.state = "idle";
    this.finishedCount = 0;
    this.leaderboard = [];
    
    // Create a pre-sorted reference of the current global array to track exact progress
    this.sortedReference = [...globalArray].sort((a, b) => a - b);

    // Setup lanes HTML
    const container = document.getElementById("race-lanes-container");
    container.innerHTML = "";

    this.contestants.forEach(algoKey => {
      const meta = ALGO_METADATA[algoKey];
      
      const lane = document.createElement("div");
      lane.className = "race-lane";
      lane.id = `race-lane-${algoKey}`;
      
      lane.innerHTML = `
        <div class="lane-info">
          <span class="lane-name">${meta.name}</span>
          <span class="lane-complexity">${meta.avg} | Aux: ${meta.space}</span>
        </div>
        <div class="lane-mini-canvas" id="mini-canvas-${algoKey}">
          <!-- Mini bars -->
        </div>
        <div class="lane-track-container">
          <div class="lane-track-progress" id="track-progress-${algoKey}"></div>
        </div>
        <div class="lane-rank-badge" id="rank-badge-${algoKey}">-</div>
      `;

      container.appendChild(lane);

      // Create local copy of array
      const arrCopy = [...globalArray];
      this.lanes[algoKey] = {
        array: arrCopy,
        generator: null,
        done: false,
        timeoutId: null,
        timeElapsed: 0,
        comparisons: 0,
        accesses: 0,
        rank: null
      };

      // Draw mini bars in canvas
      this.renderMiniBars(algoKey);
    });

    // Reset leaderboard and podium UI
    document.getElementById("arena-leaderboard").innerHTML = `<div class="leaderboard-empty">Ready for the race... Press Start!</div>`;
    document.getElementById("arena-podium").style.display = "none";
    
    const triggerBtn = document.getElementById("btn-race-trigger");
    triggerBtn.disabled = false;
    triggerBtn.textContent = "🏁 Start Race!";

    this.setupTrigger();
  },

  setupTrigger() {
    const triggerBtn = document.getElementById("btn-race-trigger");
    triggerBtn.replaceWith(triggerBtn.cloneNode(true));
    
    const newBtn = document.getElementById("btn-race-trigger");
    newBtn.addEventListener("click", () => {
      this.startRace();
    });
  },

  renderMiniBars(algoKey) {
    const canvas = document.getElementById(`mini-canvas-${algoKey}`);
    canvas.innerHTML = "";
    
    const arr = this.lanes[algoKey].array;
    // Cap representation at max 40 bars in mini canvas to avoid crowded lanes
    const step = Math.max(1, Math.floor(arr.length / 40));
    
    for (let i = 0; i < arr.length; i += step) {
      const val = arr[i];
      const miniBar = document.createElement("div");
      miniBar.className = "lane-mini-bar";
      miniBar.style.height = `${val}%`;
      miniBar.style.width = "4px";
      canvas.appendChild(miniBar);
    }
  },

  updateMiniBars(algoKey, activeIndices = [], swapIndices = []) {
    const canvas = document.getElementById(`mini-canvas-${algoKey}`);
    const bars = canvas.querySelectorAll(".lane-mini-bar");
    const arr = this.lanes[algoKey].array;
    const step = Math.max(1, Math.floor(arr.length / 40));

    let barIdx = 0;
    for (let i = 0; i < arr.length; i += step) {
      if (barIdx >= bars.length) break;
      const bar = bars[barIdx];
      bar.style.height = `${arr[i]}%`;
      
      // Highlight state colors
      bar.className = "lane-mini-bar";
      if (activeIndices.includes(i)) {
        bar.classList.add("sorting");
      }
      barIdx++;
    }
  },

  stop() {
    this.state = "idle";
    this.contestants.forEach(algoKey => {
      if (this.lanes[algoKey] && this.lanes[algoKey].timeoutId) {
        clearTimeout(this.lanes[algoKey].timeoutId);
        this.lanes[algoKey].timeoutId = null;
      }
    });
  },

  startRace() {
    if (this.state === "running") return;
    
    synth.initContext();
    this.state = "running";
    this.finishedCount = 0;
    this.leaderboard = [];

    const triggerBtn = document.getElementById("btn-race-trigger");
    triggerBtn.disabled = true;
    triggerBtn.textContent = "⚡ Racing...";

    document.getElementById("arena-leaderboard").innerHTML = "";
    document.getElementById("arena-podium").style.display = "none";
    
    this.startTime = performance.now();

    // Spawn async race loop for each contestant
    this.contestants.forEach(algoKey => {
      const laneState = this.lanes[algoKey];
      const algoObj = ALGO_METADATA[algoKey];
      laneState.generator = algoObj.generator.call(algoObj, laneState.array);
      laneState.done = false;
      laneState.rank = null;
      laneState.timeElapsed = 0;
      
      // Set lane border state
      document.getElementById(`race-lane-${algoKey}`).classList.remove("winner");
      document.getElementById(`rank-badge-${algoKey}`).textContent = "RUN";
      document.getElementById(`rank-badge-${algoKey}`).className = "lane-rank-badge";

      this.raceStepLoop(algoKey);
    });
  },

  raceStepLoop(algoKey) {
    if (this.state !== "running") return;
    
    const laneState = this.lanes[algoKey];
    if (laneState.done) return;

    const res = laneState.generator.next();
    
    // Calculate progress
    const progress = this.calculateProgress(algoKey);
    const progressBar = document.getElementById(`track-progress-${algoKey}`);
    progressBar.style.width = `${progress}%`;

    if (res.done) {
      laneState.done = true;
      laneState.timeElapsed = performance.now() - this.startTime;
      this.finishedCount++;

      // Assign Rank
      laneState.rank = this.finishedCount;
      this.leaderboard.push({
        key: algoKey,
        name: ALGO_METADATA[algoKey].name,
        time: laneState.timeElapsed
      });

      // Update Lane Badge
      const badge = document.getElementById(`rank-badge-${algoKey}`);
      badge.textContent = `${laneState.rank} Rank`;
      badge.classList.add(`rank-${Math.min(3, laneState.rank)}`);
      
      progressBar.classList.add("completed");

      // Visual flash on completion
      const laneRow = document.getElementById(`race-lane-${algoKey}`);
      if (laneState.rank === 1) {
        laneRow.classList.add("winner");
        synth.playTone(90, 0.4); // high beep for winner
      } else {
        synth.playTone(60, 0.2);
      }

      // Refresh mini-bars to show fully sorted state
      const canvas = document.getElementById(`mini-canvas-${algoKey}`);
      canvas.querySelectorAll(".lane-mini-bar").forEach(b => b.classList.add("sorted"));

      // Update Leaderboard List
      this.updateLeaderboardUI();

      if (this.finishedCount === this.contestants.length) {
        this.finishRace();
      }
    } else {
      const val = res.value;
      let activeIdx = [];
      
      if (val.type === "compare") {
        activeIdx = val.indices;
        laneState.comparisons++;
      } else if (val.type === "swap") {
        activeIdx = val.indices;
        laneState.accesses += 4;
      } else if (val.type === "set") {
        activeIdx = [val.index];
        laneState.accesses += 2;
      }
      
      // Render visual step inside lane mini-canvas
      this.updateMiniBars(algoKey, activeIdx);

      // Race Arena runs at a set fast delay to make it a rapid race (scale down slow, speed up fast)
      // Bubble / Selection run fast, but Quick/Merge have fewer steps, so it balances nicely!
      let delay = animDelay;
      if (algoKey === "bubble" || algoKey === "selection") {
        delay = Math.max(1, animDelay * 0.1); // accelerate slow algorithms to make race fun
      } else {
        delay = Math.max(2, animDelay * 0.6);
      }

      laneState.timeoutId = setTimeout(() => this.raceStepLoop(algoKey), delay);
    }
  },

  calculateProgress(algoKey) {
    const arr = this.lanes[algoKey].array;
    const size = arr.length;
    let matchCount = 0;
    
    // Compare each item in the contestant's array with the pre-sorted reference
    for (let i = 0; i < size; i++) {
      if (arr[i] === this.sortedReference[i]) {
        matchCount++;
      }
    }
    
    return (matchCount / size) * 100;
  },

  updateLeaderboardUI() {
    const lbContainer = document.getElementById("arena-leaderboard");
    lbContainer.innerHTML = "";

    this.leaderboard.forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "leaderboard-item";
      div.innerHTML = `
        <span class="lb-rank">#${index + 1}</span>
        <span class="lb-name">${item.name}</span>
        <span class="lb-time">${item.time.toFixed(0)} ms</span>
      `;
      lbContainer.appendChild(div);
    });
  },

  finishRace() {
    this.state = "completed";
    
    const triggerBtn = document.getElementById("btn-race-trigger");
    triggerBtn.disabled = false;
    triggerBtn.textContent = "🏁 Re-Race!";

    // Render Victory Podium
    const podium = document.getElementById("arena-podium");
    const pod1 = document.getElementById("pod-1");
    const pod2 = document.getElementById("pod-2");
    const pod3 = document.getElementById("pod-3");

    if (this.leaderboard.length >= 1) pod1.textContent = this.leaderboard[0].name;
    if (this.leaderboard.length >= 2) pod2.textContent = this.leaderboard[1].name;
    if (this.leaderboard.length >= 3) pod3.textContent = this.leaderboard[2].name;

    podium.style.display = "flex";
  }
};
