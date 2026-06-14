# SortVerse 🚀
### Premium DSA Sorting Visualizer, Side-by-Side Comparator & Algorithm Race Arena

SortVerse is a feature-rich, high-performance, and visually stunning interactive web application designed to visualize and analyze popular Data Structures and Algorithms (DSA) sorting routines. Built from scratch with pure web standards (HTML5, CSS3, and ES6 JavaScript), it requires **zero external libraries or framework overhead**.

👉 **[Live Interactive Demo](https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPO_NAME/)**

---

## 🌟 Visualizer Modes

### 1. Single Algorithm Mode
Observe the inner workings of sorting routines.
* **Line-by-Line Highlight**: Interactive code panel displaying the algorithm's actual code, highlighting the active execution line in real-time.
* **Auditory Feedback**: Generates frequency-mapped sounds corresponding to bar heights as values are compared or modified.
* **Complexity Overview**: Displays live stats (Comparisons, Array Accesses, High-resolution Time Elapsed) alongside a theoretical complexity grid.

### 2. Side-by-Side Comparator
Compare two different algorithms executing simultaneously on copies of the **identical dataset**.
* **Performance Gap Visualized**: Witness the practical speed difference between $O(N \log N)$ and $O(N^2)$ algorithms running concurrently.
* **Live SVG Charting**: A custom-built, self-scaling SVG charting panel updates comparisons, writes, and active execution times in real-time.
* **Space Complexity scale**: Visual indicator comparing the auxiliary memory footprint of the selected algorithms.

### 3. Algorithm Race Arena
A gamified dashboard where multiple algorithms race to complete sorting tasks.
* **5 Lane Grid**: Lanes pre-configured for Bubble, Selection, Insertion, Merge, and Quick Sort.
* **Mini Visualizer Waves**: Real-time wave indicators mapping sorting states inside each lane.
* **Progress Cars**: Cars race across the tracks. Progress is computed mathematically by comparing live elements to a pre-sorted reference state.
* **Leaderboard & Victory Podium**: Logs finish times, assigns ranks (1st, 2nd, 3rd), and triggers podium celebration animations.

---

## 🛠️ Key Technical Features

### 1. ES6 Generator Architecture (`function*`)
Decouples execution state from the rendering loop. By yielding operation descriptors (e.g., compare, swap, pivot) and pausing, the visualizer allows:
* Infinite speed adjustments mid-sort.
* Step-by-step manual iteration (stepping forward).
* Unrestricted play/pause states.

### 2. Built-in Web Audio API Synth Engine
Provides multi-sensory feedback. Bar values (5-100%) are mapped to oscillator frequencies between 180Hz and 1000Hz. Popping or clipping is mitigated using a custom volume envelope:
* **Attack**: 5ms linear volume ramp.
* **Decay/Release**: 50ms exponential drop to zero.

### 3. Dynamic SVG Charting
Features a zero-dependency vector charting system. Coordinates are calculated dynamically to scale the heights of comparison bars relative to the maximum contestant value:
$$\text{Bar Height} = \left( \frac{\text{Contestant Value}}{\max(\text{Val A}, \text{Val B})} \right) \times \text{Chart Canvas Height}$$

---

## 📂 Project Structure

```text
sorting-visualizer/
├── index.html          # Main HTML5 layout and dashboards
├── css/
│   └── styles.css      # Space-dark styles, glassmorphic layout, and animations
└── js/
    ├── algorithms.js   # ES6 Generator algorithms, pseudocode and complexity metadata
    ├── utils.js        # Dataset generators and Web Audio API synthesizer
    ├── visualizer.js   # Single visualizer controller and view router
    ├── comparator.js   # Side-by-side comparator engine & SVG chart generator
    └── arena.js        # Race Arena lanes progress and standings controller
```

---

## 📊 Algorithms Supported & Complexities

| Algorithm | Best Case | Average Case | Worst Case | Space Complexity | Stability |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Bubble Sort** | $O(N)$ | $O(N^2)$ | $O(N^2)$ | $O(1)$ | Stable |
| **Selection Sort** | $O(N^2)$ | $O(N^2)$ | $O(N^2)$ | $O(1)$ | Unstable |
| **Insertion Sort** | $O(N)$ | $O(N^2)$ | $O(N^2)$ | $O(1)$ | Stable |
| **Shell Sort** | $O(N \log N)$ | $O(N^{1.25})$ | $O(N^2)$ | $O(1)$ | Unstable |
| **Merge Sort** | $O(N \log N)$ | $O(N \log N)$ | $O(N \log N)$ | $O(N)$ | Stable |
| **Quick Sort** | $O(N \log N)$ | $O(N \log N)$ | $O(N^2)$ | $O(\log N)$ | Unstable |
| **Heap Sort** | $O(N \log N)$ | $O(N \log N)$ | $O(N \log N)$ | $O(1)$ | Unstable |

---

## 🚀 Getting Started & Deployment

### 1. View Locally
To run the project locally on your machine, simply download/clone the folder and open `index.html` in any web browser. 

If you prefer to run a local dev server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server -p 8000
```

### 2. Deploy to GitHub Pages (Get a Live Demo Link)
You can host this project on GitHub for free:
1. Push this project to your GitHub repository.
2. On GitHub, go to your repository's **Settings** tab.
3. In the left sidebar, click on **Pages**.
4. Under **Build and deployment**, set the source to **Deploy from a branch**.
5. Select the **main** branch and `/ (root)` folder, then click **Save**.
6. GitHub will generate your live link (e.g. `https://username.github.io/repo-name/`) in a few minutes!

---

## 📜 License
This project is licensed under the MIT License - feel free to use, modify, and distribute this codebase.
