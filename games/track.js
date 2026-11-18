// The number track and its marker, shared by every item type.
export class Track {
  constructor(root, sound) {
    this.root = root;
    this.sound = sound;
    this.max = -1;
    this.value = 0;
    this.cells = [];
    this.onCell = null; // set by the session: called with the cell number
    this.marker = document.createElement('div');
    this.marker.className = 'marker';
  }

  build(max) {
    if (max === this.max) return;
    this.max = max;
    this.root.innerHTML = '';
    this.root.dataset.max = String(max);
    this.cells = [];
    for (let i = 0; i <= max; i++) {
      const cell = document.createElement('button');
      cell.type = 'button';
      // Every fifth number is a quiet landmark.
      cell.className = 'cell' + (i % 5 === 0 ? ' landmark' : '');
      cell.innerHTML = '<span class="slot"></span><span class="num">' + i + '</span>';
      cell.addEventListener('pointerdown', (e) => {
        if (!e.isPrimary) return; // ignore a resting palm or second finger
        e.preventDefault();
        if (this.onCell) this.onCell(i);
      });
      this.root.appendChild(cell);
      this.cells.push(cell);
    }
  }

  set(n, { sound = false, big = false } = {}) {
    n = Math.max(0, Math.min(this.max, n));
    this.value = n;
    this.cells.forEach((c) => c.classList.remove('here', 'landed'));
    const cell = this.cells[n];
    cell.classList.add('here');
    this.marker.classList.remove('hop', 'big');
    cell.querySelector('.slot').appendChild(this.marker);
    void this.marker.offsetWidth; // restart the animation
    this.marker.classList.add(big ? 'big' : 'hop');
    if (sound) (big ? this.sound.bigJump() : this.sound.boing());
  }

  // One hop left (-1) or right (+1). Returns false at either end.
  hop(dir) {
    const n = this.value + dir;
    if (n < 0 || n > this.max) return false;
    this.set(n, { sound: true });
    return true;
  }

  // Makes the numeral under the marker grow.
  land() {
    this.cells[this.value].classList.add('landed');
  }
}
