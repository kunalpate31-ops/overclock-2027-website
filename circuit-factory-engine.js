/* ==========================================================================
   INSIDE THE CHIP — 3D SEMICONDUCTOR CAMERA & BACKGROUND ENGINE
   Hardware Hackathon 2027 | FCRIT × IEEE Student Branch

   Updates:
   - One persistent global canvas behind the entire page.
   - Central content column kept clear of overlapping text/heavy labels.
   - Scene positions mapped to distinct regions per level:
     L1: Wide view of outer die
     L2: Close-up on processing cores
     L3: Main bus splitting into 4 colored lanes
     L4: Memory rows & register banks
     L5: 24H Overclock (amber dominant, faster pulses, CORE-OVERCLOCK appears here ONLY)
     L6: I/O bond pads at chip perimeter
     Footer: Pulls out to show full chip package from outside
   ========================================================================== */

(function () {
  'use strict';

  class GlobalChipEnvironment {
    constructor() {
      this.canvas = document.getElementById('circuit-canvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d', { alpha: false });

      // 6 Silicon Camera Regions
      this.levels = [
        { id: 1, name: 'LVL 01 // OUTER DIE', targetZ: 0, pitch: 0.08, yaw: 0, fov: 750, isOverclock: false },
        { id: 2, name: 'LVL 02 // PROCESSOR CORES', targetZ: 380, pitch: 0.12, yaw: -0.05, fov: 720, isOverclock: false },
        { id: 3, name: 'LVL 03 // 4-BUS JUNCTION', targetZ: 760, pitch: 0.14, yaw: 0, fov: 700, isOverclock: false },
        { id: 4, name: 'LVL 04 // MEMORY REGISTERS', targetZ: 1140, pitch: 0.10, yaw: 0.05, fov: 720, isOverclock: false },
        { id: 5, name: 'LVL 05 // OVERCLOCK CORE', targetZ: 1520, pitch: 0.16, yaw: 0, fov: 680, isOverclock: true },
        { id: 6, name: 'LVL 06 // I/O PERIMETER', targetZ: 1880, pitch: 0.09, yaw: -0.04, fov: 740, isOverclock: false },
        { id: 7, name: 'FOOTER // PACKAGE VIEW', targetZ: 2280, pitch: 0.04, yaw: 0, fov: 820, isOverclock: false }
      ];

      this.currentLevelIndex = 0;
      this.targetLevelIndex = 0;

      // Viewport & Scaling
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.isMobile = this.width < 768;

      // 3D Camera System
      this.camera = {
        x: 0,
        y: 0,
        z: 0,
        targetZ: 0,
        pitch: 0.08,
        yaw: 0,
        fov: 750,
        driftTime: 0
      };

      // Mouse Parallax & Scroll
      this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
      this.scrollProgress = 0;

      // Chip Hardware Geometry
      this.cores = [];
      this.logicGates = [];
      this.memoryBlocks = [];
      this.traces = [];
      this.busLanes = [];
      this.signals = [];
      this.shockwaves = [];
      this.scanLines = [];
      this.microParticles = [];
      this.packagePins = [];

      this.lastFrameTime = performance.now();

      this.init();
    }

    init() {
      this.resize();
      this.buildSemiconductorWorld();
      this.setupEventListeners();
      this.startSignalLoop();
      requestAnimationFrame(this.render.bind(this));
    }

    resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.isMobile = this.width < 768;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      this.canvas.width = Math.floor(this.width * this.dpr);
      this.canvas.height = Math.floor(this.height * this.dpr);
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;

      this.ctx.scale(this.dpr, this.dpr);
    }

    buildSemiconductorWorld() {
      this.cores = [];
      this.logicGates = [];
      this.memoryBlocks = [];
      this.traces = [];
      this.busLanes = [];
      this.microParticles = [];
      this.packagePins = [];

      // KEEP CENTRAL COLUMN CLEAR (|x| > 450 for side structures)
      // 1. Processor Cores (Placed on outer wings to protect readability)
      this.cores.push({
        id: 'ALU-01 // VECTOR',
        x: -540, y: -40, z: 380,
        width: 240, height: 180,
        pulsePhase: 0, pulseSpeed: 0.02, color: '#0ea5e9'
      });

      this.cores.push({
        id: 'DSP-02 // NEURAL',
        x: 540, y: -40, z: 380,
        width: 240, height: 180,
        pulsePhase: 1.5, pulseSpeed: 0.024, color: '#38bdf8'
      });

      // 2. Overclock Core (Visible ONLY in Level 5 Z-zone: Z = 1520)
      this.cores.push({
        id: 'OVERCLOCK CORE',
        x: 0, y: 0, z: 1520,
        width: 320, height: 220,
        pulsePhase: 0, pulseSpeed: 0.06, color: '#f59e0b',
        isOverclockOnly: true
      });

      // 3. Memory Blocks on Side Rails
      const memLayouts = [
        { name: 'SRAM_BANK_0', x: -600, y: 160, z: 400, w: 160, h: 120, type: 'HEX' },
        { name: 'CACHE_BANK_1', x: 600,  y: 160, z: 400, w: 160, h: 120, type: 'BIN' },
        { name: 'REGISTER_ARRAY', x: -580, y: -100, z: 1140, w: 160, h: 140, type: 'HEX' },
        { name: 'INSTRUCTION_FIFO', x: 580, y: -100, z: 1140, w: 160, h: 140, type: 'BIN' }
      ];

      memLayouts.forEach(m => {
        const rows = 4;
        const data = [];
        for (let r = 0; r < rows; r++) data.push(this.generateHexRow(m.type));
        this.memoryBlocks.push({
          id: m.name, x: m.x, y: m.y, z: m.z,
          width: m.w, height: m.h, type: m.type, data: data,
          lastShift: performance.now(), shiftInterval: 400 + Math.random() * 600
        });
      });

      // 4. Level 03: 4-Channel Main Bus Lanes
      this.busLanes = [
        { id: 'BUS_01', color: '#10b981', x1: -40, y1: -200, z1: 720, x2: -520, y2: 300, z2: 820, width: 3 },
        { id: 'BUS_02', color: '#38bdf8', x1: -15, y1: -200, z1: 720, x2: -180, y2: 360, z2: 840, width: 3 },
        { id: 'BUS_03', color: '#818cf8', x1: 15,  y1: -200, z1: 720, x2: 180,  y2: 360, z2: 840, width: 3 },
        { id: 'BUS_04', color: '#f59e0b', x1: 40,  y1: -200, z1: 720, x2: 520,  y2: 300, z2: 820, width: 3 }
      ];

      // 5. Multilayer Traces along Z depth
      const traceCount = this.isMobile ? 24 : 48;
      for (let i = 0; i < traceCount; i++) {
        const baseZ = (i / traceCount) * 2300;
        const pts = this.generateTrace(baseZ);
        this.traces.push({
          points: pts,
          color: Math.random() > 0.4 ? 'rgba(56, 189, 248, 0.22)' : 'rgba(245, 158, 11, 0.18)',
          width: Math.random() > 0.8 ? 2 : 1
        });
      }

      // 6. Footer Package External Leadframe Pins (Z = 2280)
      for (let p = -8; p <= 8; p++) {
        this.packagePins.push({ x: -480, y: p * 45, z: 2280, side: 'L' });
        this.packagePins.push({ x: 480,  y: p * 45, z: 2280, side: 'R' });
      }

      // 7. Ambient Micro-particles
      const particleCount = this.isMobile ? 30 : 60;
      for (let i = 0; i < particleCount; i++) {
        this.microParticles.push({
          x: (Math.random() - 0.5) * 1600,
          y: (Math.random() - 0.5) * 1200,
          z: Math.random() * 2400,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          vz: (Math.random() - 0.5) * 0.2,
          size: 1 + Math.random() * 1.5,
          alpha: 0.15 + Math.random() * 0.25,
          color: Math.random() > 0.6 ? '#38bdf8' : (Math.random() > 0.5 ? '#f59e0b' : '#94a3b8')
        });
      }
    }

    generateTrace(baseZ) {
      const pts = [];
      const numSegments = 3 + Math.floor(Math.random() * 3);
      // Bias traces towards left and right sides so center remains clear
      const side = Math.random() > 0.5 ? 1 : -1;
      let cx = side * (320 + Math.random() * 400);
      let cy = (Math.random() - 0.5) * 800;
      let cz = baseZ + (Math.random() - 0.5) * 80;

      pts.push({ x: cx, y: cy, z: cz });

      for (let s = 0; s < numSegments; s++) {
        const step = 80 + Math.random() * 120;
        const dir = Math.floor(Math.random() * 4);
        if (dir === 0) cx += step * (cx > 0 ? 1 : -1);
        else if (dir === 1) cy += step;
        else if (dir === 2) cx -= step * (cx > 0 ? 1 : -1);
        else if (dir === 3) cy -= step;

        cz += (Math.random() - 0.5) * 30;
        pts.push({ x: cx, y: cy, z: cz });
      }
      return pts;
    }

    generateHexRow(type) {
      if (type === 'BIN') {
        let s = '';
        for (let i = 0; i < 8; i++) s += Math.random() > 0.5 ? '1' : '0';
        return s;
      }
      const addr = '0x' + Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
      const val = Math.floor(Math.random() * 0xFF).toString(16).toUpperCase().padStart(2, '0');
      return `${addr}: ${val}`;
    }

    startSignalLoop() {
      const spawnSignal = () => {
        if (this.traces.length > 0) {
          const trace = this.traces[Math.floor(Math.random() * this.traces.length)];
          const isOverclock = this.targetLevelIndex === 4;
          const speed = (0.012 + Math.random() * 0.018) * (isOverclock ? 2.3 : 1.0);

          this.signals.push({
            trace: trace,
            segmentIndex: 0,
            segmentProgress: 0,
            speed: speed,
            color: isOverclock ? '#f59e0b' : (Math.random() > 0.5 ? '#38bdf8' : '#10b981')
          });
        }

        const nextInterval = (180 + Math.random() * 400) / (this.targetLevelIndex === 4 ? 2.5 : 1.0);
        setTimeout(spawnSignal, nextInterval);
      };
      spawnSignal();

      // Shockwave pulses
      const triggerShockwave = () => {
        const isOverclock = this.targetLevelIndex === 4;
        const targetZ = this.levels[this.targetLevelIndex] ? this.levels[this.targetLevelIndex].targetZ : 0;

        this.shockwaves.push({
          x: 0, y: 0, z: targetZ + 50,
          radius: 20, maxRadius: 500,
          speed: isOverclock ? 6.5 : 3.8,
          alpha: 0.7,
          color: isOverclock ? '#f59e0b' : '#0ea5e9'
        });

        setTimeout(triggerShockwave, isOverclock ? 1200 : 2800);
      };
      triggerShockwave();
    }

    setupEventListeners() {
      window.addEventListener('resize', this.resize.bind(this));

      window.addEventListener('mousemove', (e) => {
        this.mouse.targetX = (e.clientX / this.width - 0.5) * 2;
        this.mouse.targetY = (e.clientY / this.height - 0.5) * 2;
      });

      window.addEventListener('scroll', () => {
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        this.scrollProgress = docH > 0 ? window.scrollY / docH : 0;
        this.updateActiveLevel();
      }, { passive: true });

      this.updateActiveLevel();
    }

    updateActiveLevel() {
      const scrollY = window.scrollY;
      const sections = [
        { id: 'hero', index: 0 },
        { id: 'about', index: 1 },
        { id: 'tracks', index: 2 },
        { id: 'timeline', index: 3 },
        { id: 'hackathon-build-mode', index: 4 },
        { id: 'hardware-specs', index: 5 },
        { id: 'main-footer', index: 6 }
      ];

      let activeIndex = 0;
      const triggerOffset = window.innerHeight * 0.4;

      for (let i = 0; i < sections.length; i++) {
        const el = document.getElementById(sections[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= triggerOffset) {
            activeIndex = sections[i].index;
          }
        }
      }

      if (activeIndex !== this.targetLevelIndex) {
        this.targetLevelIndex = activeIndex;
      }
    }

    project(p) {
      const relX = p.x - this.camera.x;
      const relY = p.y - this.camera.y;
      const relZ = p.z - this.camera.z;

      if (relZ <= -this.camera.fov + 10) {
        return { x: -9999, y: -9999, scale: 0, visible: false };
      }

      const scale = this.camera.fov / (this.camera.fov + relZ);
      const projX = this.width / 2 + relX * scale;
      const projY = this.height / 2 + relY * scale;

      return {
        x: projX,
        y: projY,
        scale: scale,
        visible: projX >= -120 && projX <= this.width + 120 && projY >= -120 && projY <= this.height + 120 && scale > 0.08
      };
    }

    render(now) {
      const dt = Math.min((now - this.lastFrameTime) / 1000, 0.1);
      this.lastFrameTime = now;

      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

      this.camera.driftTime += dt * 0.4;
      const driftX = Math.sin(this.camera.driftTime * 0.7) * 20;
      const driftY = Math.cos(this.camera.driftTime * 0.5) * 14;

      // Smooth Level Camera Interpolation
      const targetLvl = this.levels[this.targetLevelIndex] || this.levels[0];
      const targetZ = targetLvl.targetZ + this.scrollProgress * 200;

      this.camera.x += (this.mouse.x * 60 + driftX - this.camera.x) * 0.05;
      this.camera.y += (this.mouse.y * 40 + driftY - this.camera.y) * 0.05;
      this.camera.z += (targetZ - this.camera.z) * 0.05;
      this.camera.fov += (targetLvl.fov - this.camera.fov) * 0.05;

      // Clear Canvas
      this.ctx.fillStyle = '#050811';
      this.ctx.fillRect(0, 0, this.width, this.height);

      // 1. Silicon Wafer Grid (Subdued ~30% for readability)
      this.drawWaferGrid();

      // 2. 4-Channel I/O Buses (Level 3 region)
      this.drawBusLanes();

      // 3. Traces & Signal Packets
      this.drawTraces();
      this.drawSignalPackets();

      // 4. Processor Cores (Kept in side wings or Overclock Z-zone)
      this.drawCores();

      // 5. Memory Blocks on Side Rails
      this.drawMemoryBlocks(now);

      // 6. Footer Package Leadframe Pins (Level 6 / Footer)
      this.drawPackagePins();

      // 7. Shockwaves & Particles
      this.drawShockwaves();
      this.drawParticles();

      requestAnimationFrame(this.render.bind(this));
    }

    drawWaferGrid() {
      this.ctx.lineWidth = 0.5;
      this.ctx.strokeStyle = 'rgba(25, 45, 80, 0.20)';

      const step = 140;
      const half = 1400;
      const zLevels = [0, 760, 1520, 2280];

      zLevels.forEach(z => {
        if (Math.abs(z - this.camera.z) < 900) {
          for (let x = -half; x <= half; x += step * 2) {
            const p1 = this.project({ x: x, y: -half, z: z });
            const p2 = this.project({ x: x, y: half, z: z });
            if (p1.visible || p2.visible) {
              this.ctx.beginPath();
              this.ctx.moveTo(p1.x, p1.y);
              this.ctx.lineTo(p2.x, p2.y);
              this.ctx.stroke();
            }
          }
        }
      });
    }

    drawBusLanes() {
      this.busLanes.forEach(bus => {
        const p1 = this.project({ x: bus.x1, y: bus.y1, z: bus.z1 });
        const p2 = this.project({ x: bus.x2, y: bus.y2, z: bus.z2 });
        if (!p1.visible && !p2.visible) return;

        this.ctx.save();
        this.ctx.lineWidth = bus.width * Math.max(p1.scale, 0.4);
        this.ctx.strokeStyle = bus.color;
        this.ctx.globalAlpha = 0.35;
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.stroke();

        this.ctx.fillStyle = bus.color;
        this.ctx.globalAlpha = 0.8;
        this.ctx.beginPath();
        this.ctx.arc(p2.x, p2.y, 3.5 * p2.scale, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      });
    }

    drawTraces() {
      this.traces.forEach(trace => {
        if (trace.points.length < 2) return;
        this.ctx.save();
        this.ctx.lineWidth = trace.width;
        this.ctx.strokeStyle = trace.color;
        this.ctx.beginPath();
        let started = false;

        for (let i = 0; i < trace.points.length; i++) {
          const pt = this.project(trace.points[i]);
          if (pt.visible) {
            if (!started) {
              this.ctx.moveTo(pt.x, pt.y);
              started = true;
            } else {
              this.ctx.lineTo(pt.x, pt.y);
            }
          }
        }
        this.ctx.stroke();
        this.ctx.restore();
      });
    }

    drawCores() {
      this.cores.forEach(core => {
        // Render Overclock Core ONLY in Level 5 Z-zone
        if (core.isOverclockOnly && Math.abs(core.z - this.camera.z) > 450) return;

        core.pulsePhase += core.pulseSpeed;
        const pulse = 0.5 + Math.sin(core.pulsePhase) * 0.5;

        const tl = this.project({ x: core.x - core.width / 2, y: core.y - core.height / 2, z: core.z });
        const tr = this.project({ x: core.x + core.width / 2, y: core.y - core.height / 2, z: core.z });
        const br = this.project({ x: core.x + core.width / 2, y: core.y + core.height / 2, z: core.z });
        const bl = this.project({ x: core.x - core.width / 2, y: core.y + core.height / 2, z: core.z });

        if (!tl.visible && !br.visible) return;

        const scale = tl.scale;
        this.ctx.save();
        this.ctx.fillStyle = `rgba(12, 19, 36, ${0.65 + pulse * 0.15})`;
        this.ctx.strokeStyle = core.color;
        this.ctx.lineWidth = 1.2 * scale;

        this.ctx.beginPath();
        this.ctx.moveTo(tl.x, tl.y);
        this.ctx.lineTo(tr.x, tr.y);
        this.ctx.lineTo(br.x, br.y);
        this.ctx.lineTo(bl.x, bl.y);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        if (scale > 0.45) {
          this.ctx.font = `600 ${Math.floor(9 * scale)}px "Chakra Petch", sans-serif`;
          this.ctx.fillStyle = core.color;
          this.ctx.fillText(core.id, tl.x + 8 * scale, tl.y + 14 * scale);
        }
        this.ctx.restore();
      });
    }

    drawMemoryBlocks(now) {
      this.memoryBlocks.forEach(mem => {
        if (now - mem.lastShift > mem.shiftInterval) {
          mem.data.shift();
          mem.data.push(this.generateHexRow(mem.type));
          mem.lastShift = now;
        }

        const center = this.project({ x: mem.x, y: mem.y, z: mem.z });
        if (!center.visible) return;

        const scale = center.scale;
        const mw = mem.width * scale;
        const mh = mem.height * scale;

        this.ctx.save();
        this.ctx.fillStyle = 'rgba(10, 16, 30, 0.65)';
        this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
        this.ctx.lineWidth = 1;

        this.ctx.fillRect(center.x - mw / 2, center.y - mh / 2, mw, mh);
        this.ctx.strokeRect(center.x - mw / 2, center.y - mh / 2, mw, mh);

        if (scale > 0.45) {
          this.ctx.font = `600 ${Math.floor(8 * scale)}px "Chakra Petch", sans-serif`;
          this.ctx.fillStyle = '#38bdf8';
          this.ctx.fillText(mem.id, center.x - mw / 2 + 6 * scale, center.y - mh / 2 + 12 * scale);

          this.ctx.font = `400 ${Math.floor(7 * scale)}px "JetBrains Mono", monospace`;
          this.ctx.fillStyle = 'rgba(203, 213, 225, 0.6)';

          const startY = center.y - mh / 2 + 24 * scale;
          mem.data.forEach((line, idx) => {
            this.ctx.fillText(line, center.x - mw / 2 + 6 * scale, startY + idx * 12 * scale);
          });
        }
        this.ctx.restore();
      });
    }

    drawPackagePins() {
      if (Math.abs(2280 - this.camera.z) > 800) return;

      this.ctx.save();
      this.ctx.fillStyle = '#f59e0b';
      this.ctx.globalAlpha = 0.5;

      this.packagePins.forEach(pin => {
        const pt = this.project(pin);
        if (pt.visible) {
          const pw = 16 * pt.scale;
          const ph = 6 * pt.scale;
          this.ctx.fillRect(pt.x - pw / 2, pt.y - ph / 2, pw, ph);
        }
      });
      this.ctx.restore();
    }

    drawSignalPackets() {
      for (let i = this.signals.length - 1; i >= 0; i--) {
        const sig = this.signals[i];
        sig.segmentProgress += sig.speed;

        const pts = sig.trace.points;
        const pA = pts[sig.segmentIndex];
        const pB = pts[sig.segmentIndex + 1];

        if (!pA || !pB) {
          this.signals.splice(i, 1);
          continue;
        }

        const curX = pA.x + (pB.x - pA.x) * sig.segmentProgress;
        const curY = pA.y + (pB.y - pA.y) * sig.segmentProgress;
        const curZ = pA.z + (pB.z - pA.z) * sig.segmentProgress;

        const pt = this.project({ x: curX, y: curY, z: curZ });

        if (pt.visible) {
          this.ctx.save();
          this.ctx.fillStyle = sig.color;
          this.ctx.shadowColor = sig.color;
          this.ctx.shadowBlur = 8 * pt.scale;

          this.ctx.beginPath();
          this.ctx.arc(pt.x, pt.y, 2.8 * pt.scale, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.restore();
        }

        if (sig.segmentProgress >= 1) {
          sig.segmentIndex++;
          sig.segmentProgress = 0;
          if (sig.segmentIndex >= pts.length - 1) {
            this.signals.splice(i, 1);
          }
        }
      }
    }

    drawShockwaves() {
      for (let i = this.shockwaves.length - 1; i >= 0; i--) {
        const sw = this.shockwaves[i];
        sw.radius += sw.speed;
        sw.alpha = Math.max(0, 1 - sw.radius / sw.maxRadius);

        const center = this.project({ x: sw.x, y: sw.y, z: sw.z });
        if (center.visible) {
          this.ctx.save();
          this.ctx.strokeStyle = sw.color;
          this.ctx.lineWidth = 1.5 * center.scale;
          this.ctx.globalAlpha = sw.alpha * 0.5;

          this.ctx.beginPath();
          this.ctx.arc(center.x, center.y, sw.radius * center.scale, 0, Math.PI * 2);
          this.ctx.stroke();
          this.ctx.restore();
        }

        if (sw.radius >= sw.maxRadius) this.shockwaves.splice(i, 1);
      }
    }

    drawParticles() {
      this.ctx.save();
      this.microParticles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        if (p.x > 800) p.x = -800;
        if (p.x < -800) p.x = 800;
        if (p.y > 600) p.y = -600;
        if (p.y < -600) p.y = 600;
        if (p.z > 2400) p.z = 0;
        if (p.z < 0) p.z = 2400;

        const pt = this.project(p);
        if (pt.visible) {
          this.ctx.fillStyle = p.color;
          this.ctx.globalAlpha = p.alpha;
          this.ctx.beginPath();
          this.ctx.arc(pt.x, pt.y, p.size * pt.scale, 0, Math.PI * 2);
          this.ctx.fill();
        }
      });
      this.ctx.restore();
    }
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.GlobalChipEnvironment = new GlobalChipEnvironment();
    });
  } else {
    window.GlobalChipEnvironment = new GlobalChipEnvironment();
  }
})();
