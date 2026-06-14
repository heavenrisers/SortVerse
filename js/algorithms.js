/**
 * =============================================================
 * SORTING ALGORITHMS ENGINE (GENERATORS)
 * Contains metadata, complexity info, pseudocode, and generators
 * that yield visual step states.
 * =============================================================
 */

const ALGO_METADATA = {
  bubble: {
    name: "Bubble Sort",
    best: "O(N)",
    avg: "O(N²)",
    worst: "O(N²)",
    space: "O(1)",
    stability: "Stable",
    code: [
      "function bubbleSort(arr) {",
      "  let n = arr.length;",
      "  for (let i = 0; i < n - 1; i++) {",
      "    for (let j = 0; j < n - i - 1; j++) {",
      "      // Compare adjacent elements",
      "      if (arr[j] > arr[j + 1]) {",
      "        // Swap if out of order",
      "        let temp = arr[j];",
      "        arr[j] = arr[j + 1];",
      "        arr[j + 1] = temp;",
      "      }",
      "    }",
      "  }",
      "}"
    ],
    generator: function* (arr) {
      let n = arr.length;
      yield { type: "line", line: 1 };
      for (let i = 0; i < n - 1; i++) {
        yield { type: "line", line: 2 };
        for (let j = 0; j < n - i - 1; j++) {
          yield { type: "line", line: 3 };
          yield { type: "compare", indices: [j, j + 1], line: 5 };
          
          if (arr[j] > arr[j + 1]) {
            yield { type: "line", line: 6 };
            let temp = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = temp;
            yield { type: "swap", indices: [j, j + 1], line: 8 };
            yield { type: "line", line: 9 };
          }
        }
        yield { type: "sorted", index: n - i - 1 };
      }
      yield { type: "sorted", index: 0 };
    }
  },

  selection: {
    name: "Selection Sort",
    best: "O(N²)",
    avg: "O(N²)",
    worst: "O(N²)",
    space: "O(1)",
    stability: "Unstable",
    code: [
      "function selectionSort(arr) {",
      "  let n = arr.length;",
      "  for (let i = 0; i < n - 1; i++) {",
      "    let minIdx = i;",
      "    for (let j = i + 1; j < n; j++) {",
      "      // Find smallest element in remaining",
      "      if (arr[j] < arr[minIdx]) {",
      "        minIdx = j;",
      "      }",
      "    }",
      "    // Swap min with first element of unsorted",
      "    let temp = arr[i];",
      "    arr[i] = arr[minIdx];",
      "    arr[minIdx] = temp;",
      "  }",
      "}"
    ],
    generator: function* (arr) {
      let n = arr.length;
      yield { type: "line", line: 1 };
      for (let i = 0; i < n - 1; i++) {
        yield { type: "line", line: 2 };
        let minIdx = i;
        yield { type: "line", line: 3 };
        yield { type: "pivot", index: minIdx, line: 3 };

        for (let j = i + 1; j < n; j++) {
          yield { type: "line", line: 4 };
          yield { type: "compare", indices: [j, minIdx], line: 6 };
          
          if (arr[j] < arr[minIdx]) {
            yield { type: "line", line: 7 };
            minIdx = j;
            yield { type: "pivot", index: minIdx, line: 7 };
          }
        }

        if (minIdx !== i) {
          yield { type: "line", line: 10 };
          let temp = arr[i];
          arr[i] = arr[minIdx];
          arr[minIdx] = temp;
          yield { type: "swap", indices: [i, minIdx], line: 12 };
          yield { type: "line", line: 13 };
        }
        yield { type: "sorted", index: i };
      }
      yield { type: "sorted", index: n - 1 };
    }
  },

  insertion: {
    name: "Insertion Sort",
    best: "O(N)",
    avg: "O(N²)",
    worst: "O(N²)",
    space: "O(1)",
    stability: "Stable",
    code: [
      "function insertionSort(arr) {",
      "  let n = arr.length;",
      "  for (let i = 1; i < n; i++) {",
      "    let key = arr[i];",
      "    let j = i - 1;",
      "    // Shift elements greater than key",
      "    while (j >= 0 && arr[j] > key) {",
      "      arr[j + 1] = arr[j];",
      "      j--;",
      "    }",
      "    // Insert key at its correct position",
      "    arr[j + 1] = key;",
      "  }",
      "}"
    ],
    generator: function* (arr) {
      let n = arr.length;
      yield { type: "line", line: 1 };
      yield { type: "sorted", index: 0 };
      
      for (let i = 1; i < n; i++) {
        yield { type: "line", line: 2 };
        let key = arr[i];
        yield { type: "line", line: 3 };
        let j = i - 1;
        yield { type: "line", line: 4 };
        
        yield { type: "pivot", index: i, line: 3 }; // Mark insertion element

        while (j >= 0) {
          yield { type: "line", line: 6 };
          yield { type: "compare", indices: [j, j + 1], line: 6 };
          
          if (arr[j] > key) {
            arr[j + 1] = arr[j];
            yield { type: "set", index: j + 1, value: arr[j], line: 7 };
            yield { type: "line", line: 8 };
            j--;
          } else {
            break;
          }
        }
        arr[j + 1] = key;
        yield { type: "set", index: j + 1, value: key, line: 11 };
        yield { type: "line", line: 12 };
      }
      // Mark all sorted
      for(let i = 0; i < n; i++) {
        yield { type: "sorted", index: i };
      }
    }
  },

  shell: {
    name: "Shell Sort",
    best: "O(N log N)",
    avg: "O(N^1.25)",
    worst: "O(N²)",
    space: "O(1)",
    stability: "Unstable",
    code: [
      "function shellSort(arr) {",
      "  let n = arr.length;",
      "  // Gap starts at n/2 and reduces",
      "  for (let gap = Math.floor(n/2); gap > 0; gap = Math.floor(gap/2)) {",
      "    for (let i = gap; i < n; i++) {",
      "      let temp = arr[i];",
      "      let j = i;",
      "      // Shift elements gap-apart",
      "      while (j >= gap && arr[j - gap] > temp) {",
      "        arr[j] = arr[j - gap];",
      "        j -= gap;",
      "      }",
      "      arr[j] = temp;",
      "    }",
      "  }",
      "}"
    ],
    generator: function* (arr) {
      let n = arr.length;
      yield { type: "line", line: 1 };
      
      for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
        yield { type: "line", line: 3 };
        for (let i = gap; i < n; i++) {
          yield { type: "line", line: 4 };
          let temp = arr[i];
          yield { type: "line", line: 5 };
          let j = i;
          yield { type: "line", line: 6 };
          yield { type: "pivot", index: i, line: 5 }; // highlight current temp element

          while (j >= gap) {
            yield { type: "line", line: 8 };
            yield { type: "compare", indices: [j - gap, i], line: 8 };
            
            if (arr[j - gap] > temp) {
              arr[j] = arr[j - gap];
              yield { type: "set", index: j, value: arr[j - gap], line: 9 };
              yield { type: "line", line: 10 };
              j -= gap;
            } else {
              break;
            }
          }
          arr[j] = temp;
          yield { type: "set", index: j, value: temp, line: 12 };
          yield { type: "line", line: 13 };
        }
      }
      
      // Mark all sorted
      for(let i = 0; i < n; i++) {
        yield { type: "sorted", index: i };
      }
    }
  },

  merge: {
    name: "Merge Sort",
    best: "O(N log N)",
    avg: "O(N log N)",
    worst: "O(N log N)",
    space: "O(N)",
    stability: "Stable",
    code: [
      "function mergeSort(arr, l, r) {",
      "  if (l < r) {",
      "    let m = l + Math.floor((r - l) / 2);",
      "    mergeSort(arr, l, m);",
      "    mergeSort(arr, m + 1, r);",
      "    merge(arr, l, m, r);",
      "  }",
      "}",
      "function merge(arr, l, m, r) {",
      "  let n1 = m - l + 1, n2 = r - m;",
      "  let L = arr.slice(l, m + 1), R = arr.slice(m + 1, r + 1);",
      "  let i = 0, j = 0, k = l;",
      "  while (i < n1 && j < n2) {",
      "    if (L[i] <= R[j]) arr[k++] = L[i++];",
      "    else arr[k++] = R[j++];",
      "  }",
      "  while (i < n1) arr[k++] = L[i++];",
      "  while (j < n2) arr[k++] = R[j++];",
      "}"
    ],
    generator: function* (arr) {
      const self = this;
      
      function* mergeSortHelper(l, r) {
        yield { type: "line", line: 1 };
        if (l < r) {
          let m = l + Math.floor((r - l) / 2);
          yield { type: "line", line: 2 };
          
          yield* mergeSortHelper(l, m);
          yield { type: "line", line: 3 };
          
          yield* mergeSortHelper(m + 1, r);
          yield { type: "line", line: 4 };
          
          yield* mergeHelper(l, m, r);
          yield { type: "line", line: 5 };
        }
      }

      function* mergeHelper(l, m, r) {
        let n1 = m - l + 1;
        let n2 = r - m;
        let L = arr.slice(l, m + 1);
        let R = arr.slice(m + 1, r + 1);
        
        let i = 0, j = 0, k = l;
        yield { type: "line", line: 8 };
        yield { type: "line", line: 9 };
        yield { type: "line", line: 10 };
        yield { type: "line", line: 11 };

        while (i < n1 && j < n2) {
          yield { type: "line", line: 12 };
          yield { type: "compare", indices: [l + i, m + 1 + j], line: 12 };
          
          if (L[i] <= R[j]) {
            arr[k] = L[i];
            yield { type: "set", index: k, value: L[i], line: 13 };
            i++;
          } else {
            arr[k] = R[j];
            yield { type: "set", index: k, value: R[j], line: 14 };
            j++;
          }
          k++;
        }

        while (i < n1) {
          yield { type: "line", line: 16 };
          arr[k] = L[i];
          yield { type: "set", index: k, value: L[i], line: 16 };
          i++;
          k++;
        }

        while (j < n2) {
          yield { type: "line", line: 17 };
          arr[k] = R[j];
          yield { type: "set", index: k, value: R[j], line: 17 };
          j++;
          k++;
        }

        // Highlight merged portion as temporarily sorted
        for (let idx = l; idx <= r; idx++) {
          yield { type: "compare", indices: [idx], line: 17 };
        }
      }

      yield* mergeSortHelper(0, arr.length - 1);
      
      // Mark all sorted
      for(let idx = 0; idx < arr.length; idx++) {
        yield { type: "sorted", index: idx };
      }
    }
  },

  quick: {
    name: "Quick Sort",
    best: "O(N log N)",
    avg: "O(N log N)",
    worst: "O(N²)",
    space: "O(log N)",
    stability: "Unstable",
    code: [
      "function quickSort(arr, low, high) {",
      "  if (low < high) {",
      "    let pi = partition(arr, low, high);",
      "    quickSort(arr, low, pi - 1);",
      "    quickSort(arr, pi + 1, high);",
      "  }",
      "}",
      "function partition(arr, low, high) {",
      "  let pivot = arr[high];",
      "  let i = low - 1;",
      "  for (let j = low; j < high; j++) {",
      "    if (arr[j] < pivot) {",
      "      i++;",
      "      swap(arr, i, j);",
      "    }",
      "  }",
      "  swap(arr, i + 1, high);",
      "  return i + 1;",
      "}"
    ],
    generator: function* (arr) {
      const self = this;

      function* quickSortHelper(low, high) {
        yield { type: "line", line: 0 };
        if (low < high) {
          yield { type: "line", line: 1 };
          let pi = yield* partitionHelper(low, high);
          yield { type: "line", line: 2 };
          
          yield* quickSortHelper(low, pi - 1);
          yield { type: "line", line: 3 };
          
          yield* quickSortHelper(pi + 1, high);
          yield { type: "line", line: 4 };
        } else if (low >= 0 && low < arr.length) {
          yield { type: "sorted", index: low };
        }
      }

      function* partitionHelper(low, high) {
        let pivot = arr[high];
        yield { type: "line", line: 8 };
        yield { type: "pivot", index: high, line: 8 };
        
        let i = low - 1;
        yield { type: "line", line: 9 };

        for (let j = low; j < high; j++) {
          yield { type: "line", line: 10 };
          yield { type: "compare", indices: [j, high], line: 11 };
          
          if (arr[j] < pivot) {
            i++;
            yield { type: "line", line: 12 };
            let temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
            yield { type: "swap", indices: [i, j], line: 13 };
            yield { type: "line", line: 14 };
          }
        }
        
        yield { type: "line", line: 17 };
        let temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;
        yield { type: "swap", indices: [i + 1, high], line: 17 };
        
        yield { type: "sorted", index: i + 1 };
        yield { type: "line", line: 18 };
        return i + 1;
      }

      yield* quickSortHelper(0, arr.length - 1);
      
      // Mark all sorted
      for(let idx = 0; idx < arr.length; idx++) {
        yield { type: "sorted", index: idx };
      }
    }
  },

  heap: {
    name: "Heap Sort",
    best: "O(N log N)",
    avg: "O(N log N)",
    worst: "O(N log N)",
    space: "O(1)",
    stability: "Unstable",
    code: [
      "function heapSort(arr) {",
      "  let n = arr.length;",
      "  // Build max heap",
      "  for (let i = Math.floor(n/2) - 1; i >= 0; i--) {",
      "    heapify(arr, n, i);",
      "  }",
      "  // Extract elements from heap one by one",
      "  for (let i = n - 1; i > 0; i--) {",
      "    swap(arr, 0, i);",
      "    heapify(arr, i, 0);",
      "  }",
      "}",
      "function heapify(arr, n, i) {",
      "  let largest = i, l = 2*i + 1, r = 2*i + 2;",
      "  if (l < n && arr[l] > arr[largest]) largest = l;",
      "  if (r < n && arr[r] > arr[largest]) largest = r;",
      "  if (largest != i) {",
      "    swap(arr, i, largest);",
      "    heapify(arr, n, largest);",
      "  }",
      "}"
    ],
    generator: function* (arr) {
      let n = arr.length;
      yield { type: "line", line: 1 };
      
      // Build heap
      for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        yield { type: "line", line: 3 };
        yield* heapifyHelper(n, i);
        yield { type: "line", line: 4 };
      }
      
      // One by one extract elements
      for (let i = n - 1; i > 0; i--) {
        yield { type: "line", line: 7 };
        
        let temp = arr[0];
        arr[0] = arr[i];
        arr[i] = temp;
        yield { type: "swap", indices: [0, i], line: 8 };
        yield { type: "sorted", index: i };
        
        yield { type: "line", line: 9 };
        yield* heapifyHelper(i, 0);
        yield { type: "line", line: 10 };
      }
      yield { type: "sorted", index: 0 };

      function* heapifyHelper(size, root) {
        let largest = root;
        let l = 2 * root + 1;
        let r = 2 * root + 2;
        yield { type: "line", line: 13 };
        yield { type: "pivot", index: root, line: 13 };

        if (l < size) {
          yield { type: "compare", indices: [l, largest], line: 14 };
          if (arr[l] > arr[largest]) {
            largest = l;
          }
        }

        if (r < size) {
          yield { type: "compare", indices: [r, largest], line: 15 };
          if (arr[r] > arr[largest]) {
            largest = r;
          }
        }

        if (largest !== root) {
          yield { type: "line", line: 16 };
          let swap = arr[root];
          arr[root] = arr[largest];
          arr[largest] = swap;
          yield { type: "swap", indices: [root, largest], line: 17 };
          
          yield { type: "line", line: 18 };
          yield* heapifyHelper(size, largest);
        }
      }
    }
  }
};
