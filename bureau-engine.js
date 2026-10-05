/**
 * OVERCLOCK 2027 — THE BUREAU MACHINE ENGINE
 * FCRIT × IEEE Student Branch
 * Persistent global animated canvas background: 1970s retro-futuristic time bureau.
 * Analog clocks, CRT monitors, pneumatic tubes, rotating clock gears, reel-to-reel spools,
 * dust motes in warm amber light beams, and level-based overclock acceleration.
 */

class BureauEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    
    this.scrollY = window.scrollY;
    this.maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1);
    this.scrollProgress = 0;
    this.targetScrollProgress = 0;
    
    this.time = 0;
    this.lastTimestamp = performance.now();
    this.isOverclocked = false;
    this.overclockFactor = 1.0;
    
    // System elements
    this.wallClocks = [];
    this.crtRacks = [];
    this.gears = [];
    this.dustParticles = [];
    this.pneumaticTubes = [];
    this.capsules = [];
    this.wallTraces = [];
    this.dataPulses = [];
    this.lightBeams = [];
    
    // Event scheduler for random bureau occurrences
    this.events = [];
    this.nextEventTime = 2.0;
    
    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize(), { passive: true });
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    
    this.buildWorld();
    requestAnimationFrame((ts) => this.render(ts));
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.scale(this.dpr, this.dpr);
    this.maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1);
    this.buildWorld();
  }

  onScroll() {
    this.scrollY = window.scrollY;
    this.maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1);
    this.targetScrollProgress = Math.min(Math.max(this.scrollY / this.maxScroll, 0), 1);
  }

  buildWorld() {
    const isMobile = this.width < 768;
    const countClocks = isMobile ? 6 : 14;
    const countGears = isMobile ? 4 : 8;
    const countDust = isMobile ? 35 : 75;
    const countBeams = isMobile ? 2 : 4;
    
    // 1. Clocks distributed on the outer flanks (|x - width/2| > 380px)
    this.wallClocks = [];
    for (let i = 0; i < countClocks; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const flankOffset = (this.width > 1200 ? 460 : 340) + Math.random() * (this.width * 0.45);
      const x = this.width / 2 + side * flankOffset;
      const y = (i / countClocks) * (this.height * 2.5) + (Math.random() * 80 - 40);
      const radius = 24 + Math.random() * 32;
      const tickSpeed = 0.8 + Math.random() * 0.4;
      const baseAngle = Math.random() * Math.PI * 2;
      
      this.wallClocks.push({
        x, y, radius, tickSpeed, baseAngle,
        secondHand: baseAngle,
        minuteHand: baseAngle / 12,
        hourHand: baseAngle / 144,
        skipTime: 0,
        type: Math.random() > 0.4 ? 'round' : 'square',
        dialNumber: Math.floor(Math.random() * 99 + 10)
      });
    }

    // 2. Distant CRT monitor banks on flanks
    this.crtRacks = [];
    const countCRTs = isMobile ? 3 : 8;
    for (let i = 0; i < countCRTs; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const x = this.width / 2 + side * ((this.width > 1200 ? 520 : 380) + Math.random() * 200);
      const y = (i / countCRTs) * (this.height * 2.6) + Math.random() * 100;
      this.crtRacks.push({
        x, y,
        w: 110 + Math.random() * 40,
        h: 75 + Math.random() * 25,
        flicker: 0,
        waveFreq: 1 + Math.random() * 3,
        glowColor: Math.random() > 0.6 ? '#7CFF9B' : '#E8892B', // Green or Amber phosphor
        label: `BUREAU-DISP//${104 + i}`
      });
    }

    // 3. Brass Gears in the far background
    this.gears = [];
    for (let i = 0; i < countGears; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const x = this.width / 2 + side * (this.width * 0.38 + Math.random() * 200);
      const y = (i / countGears) * (this.height * 2.8);
      const radius = 35 + Math.random() * 55;
      const teeth = Math.floor(radius / 5);
      const speed = (Math.random() > 0.5 ? 1 : -1) * (0.15 + Math.random() * 0.25);
      this.gears.push({ x, y, radius, teeth, speed, angle: Math.random() * Math.PI });
    }

    // 4. Pneumatic Brass Tubes crossing diagonally across the background
    this.pneumaticTubes = [
      { startX: 0, startY: this.height * 0.2, endX: this.width * 0.4, endY: this.height * 1.2, width: 14 },
      { startX: this.width, startY: this.height * 0.5, endX: this.width * 0.6, endY: this.height * 1.8, width: 16 },
      { startX: this.width * 0.1, startY: this.height * 1.5, endX: 0, endY: this.height * 2.4, width: 14 },
      { startX: this.width * 0.85, startY: this.height * 1.7, endX: this.width, endY: this.height * 2.7, width: 15 }
    ];

    // 5. Capsules shooting through tubes
    this.capsules = [];
    for (let i = 0; i < 4; i++) {
      this.capsules.push({
        tubeIndex: i % this.pneumaticTubes.length,
        progress: Math.random(),
        speed: 0.15 + Math.random() * 0.2,
        active: true,
        glowColor: '#FFB347'
      });
    }

    // 6. Copper/Wall Traces running like bureau wiring
    this.wallTraces = [];
    for (let i = 0; i < (isMobile ? 8 : 18); i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const x0 = this.width / 2 + side * (320 + Math.random() * (this.width * 0.45));
      const y0 = Math.random() * (this.height * 2.5);
      const len = 120 + Math.random() * 200;
      this.wallTraces.push({
        x: x0,
        y: y0,
        length: len,
        vertical: Math.random() > 0.3
      });
    }

    // 7. Dust motes in warm ambient light
    this.dustParticles = [];
    for (let i = 0; i < countDust; i++) {
      this.dustParticles.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height * 3),
        size: 0.8 + Math.random() * 2.2,
        alpha: 0.1 + Math.random() * 0.4,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.4,
        glow: Math.random() > 0.7
      });
    }

    // 8. Volumetric Warm Light Beams
    this.lightBeams = [];
    for (let i = 0; i < countBeams; i++) {
      this.lightBeams.push({
        x: (i / countBeams) * this.width + (Math.random() * 100 - 50),
        angle: 0.35 + Math.random() * 0.2,
        width: 140 + Math.random() * 120,
        intensity: 0.04 + Math.random() * 0.05
      });
    }
  }

  triggerRandomEvent(now) {
    if (now > this.nextEventTime) {
      this.nextEventTime = now + 1.5 + Math.random() * 3.0;
      const eventType = Math.floor(Math.random() * 4);
      
      if (eventType === 0 && this.wallClocks.length > 0) {
        // Clock skips a second or twitches
        const clock = this.wallClocks[Math.floor(Math.random() * this.wallClocks.length)];
        clock.skipTime = 0.5;
      } else if (eventType === 1 && this.crtRacks.length > 0) {
        // CRT screen glitches / flickers
        const crt = this.crtRacks[Math.floor(Math.random() * this.crtRacks.length)];
        crt.flicker = 1.0;
      } else if (eventType === 2 && this.pneumaticTubes.length > 0) {
        // Fast pneumatic capsule burst
        const tubeIdx = Math.floor(Math.random() * this.pneumaticTubes.length);
        this.capsules.push({
          tubeIndex: tubeIdx,
          progress: 0,
          speed: 0.45 + Math.random() * 0.3,
          active: true,
          glowColor: '#7CFF9B'
        });
      } else if (this.wallTraces.length > 0) {
        // Data pulse along a wall trace
        const trace = this.wallTraces[Math.floor(Math.random() * this.wallTraces.length)];
        this.dataPulses.push({
          x: trace.x,
          y: trace.y,
          len: trace.length,
          vertical: trace.vertical,
          progress: 0,
          speed: 1.2 + Math.random() * 1.5,
          color: Math.random() > 0.5 ? '#E8892B' : '#D9A93A'
        });
      }
    }
  }

  render(timestamp) {
    const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
    this.lastTimestamp = timestamp;
    this.time += dt;

    // Smooth scroll interpolation
    this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * 0.08;
    const cameraY = this.scrollProgress * (this.height * 2.0);

    // Check if user is in Section 5 (24H Overclock section: ~0.55 - 0.75 progress)
    const inOverclockZone = this.scrollProgress > 0.52 && this.scrollProgress < 0.78;
    const targetOverclockFactor = inOverclockZone ? 2.8 : 1.0;
    this.overclockFactor += (targetOverclockFactor - this.overclockFactor) * 0.05;

    // Trigger bureau events
    this.triggerRandomEvent(this.time);

    // 1. CLEAR WITH WARM RETRO CHARCOAL / DEEP BROWN BASE
    const ctx = this.ctx;
    ctx.fillStyle = inOverclockZone ? '#1a100a' : '#14100C';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.save();
    // Parallax camera transform
    ctx.translate(0, -cameraY * 0.85);

    // 2. VOLUMETRIC LIGHT BEAMS
    this.renderLightBeams(ctx);

    // 3. BACKGROUND BRASS GEARS
    this.renderGears(ctx, dt);

    // 4. WALL WIRES & COPPER TRACES
    this.renderWallTraces(ctx);

    // 5. DATA PULSES
    this.renderDataPulses(ctx, dt);

    // 6. PNEUMATIC TUBES & TRAVELING CAPSULES
    this.renderPneumaticTubes(ctx, dt);

    // 7. DISTANT CRT MONITOR BANKS
    this.renderCRTRacks(ctx, dt);

    // 8. ANALOG WALL CLOCKS
    this.renderWallClocks(ctx, dt);

    // 9. DUST MOTES
    this.renderDust(ctx, dt);

    ctx.restore();

    // 10. SCREEN-SPACE RETRO VIGNETTE & CENTRAL CONTENT MASK
    this.renderCentralContentMask(ctx, inOverclockZone);

    requestAnimationFrame((ts) => this.render(ts));
  }

  renderLightBeams(ctx) {
    for (const beam of this.lightBeams) {
      const grad = ctx.createLinearGradient(beam.x, 0, beam.x + Math.sin(beam.angle) * this.height * 2, this.height * 2);
      grad.addColorStop(0, `rgba(232, 137, 43, ${beam.intensity * 0.8})`);
      grad.addColorStop(0.5, `rgba(217, 169, 58, ${beam.intensity * 0.4})`);
      grad.addColorStop(1, 'rgba(20, 16, 12, 0)');
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(beam.x, -100);
      ctx.lineTo(beam.x + beam.width, -100);
      ctx.lineTo(beam.x + beam.width * 2.2 + 200, this.height * 2.8);
      ctx.lineTo(beam.x + 100, this.height * 2.8);
      ctx.closePath();
      ctx.fill();
    }
  }

  renderGears(ctx, dt) {
    ctx.save();
    for (const gear of this.gears) {
      gear.angle += gear.speed * dt * this.overclockFactor;
      
      ctx.save();
      ctx.translate(gear.x, gear.y);
      ctx.rotate(gear.angle);

      ctx.strokeStyle = this.overclockFactor > 1.5 ? 'rgba(232, 137, 43, 0.22)' : 'rgba(107, 107, 58, 0.18)';
      ctx.fillStyle = 'rgba(26, 20, 14, 0.4)';
      ctx.lineWidth = 2;

      // Outer rim with teeth
      ctx.beginPath();
      const step = (Math.PI * 2) / gear.teeth;
      for (let i = 0; i < gear.teeth; i++) {
        const a = i * step;
        const r1 = gear.radius;
        const r2 = gear.radius + 6;
        ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1);
        ctx.lineTo(Math.cos(a + step * 0.3) * r2, Math.sin(a + step * 0.3) * r2);
        ctx.lineTo(Math.cos(a + step * 0.7) * r2, Math.sin(a + step * 0.7) * r2);
        ctx.lineTo(Math.cos(a + step) * r1, Math.sin(a + step) * r1);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner hub & spokes
      ctx.beginPath();
      ctx.arc(0, 0, gear.radius * 0.4, 0, Math.PI * 2);
      ctx.stroke();

      for (let s = 0; s < 4; s++) {
        const sa = (Math.PI / 2) * s;
        ctx.beginPath();
        ctx.moveTo(Math.cos(sa) * (gear.radius * 0.4), Math.sin(sa) * (gear.radius * 0.4));
        ctx.lineTo(Math.cos(sa) * gear.radius, Math.sin(sa) * gear.radius);
        ctx.stroke();
      }

      ctx.restore();
    }
    ctx.restore();
  }

  renderWallTraces(ctx) {
    ctx.strokeStyle = 'rgba(217, 169, 58, 0.12)';
    ctx.lineWidth = 1.5;
    
    for (const trace of this.wallTraces) {
      ctx.beginPath();
      ctx.moveTo(trace.x, trace.y);
      if (trace.vertical) {
        ctx.lineTo(trace.x, trace.y + trace.length);
        // Small junction dot
        ctx.arc(trace.x, trace.y + trace.length, 2.5, 0, Math.PI * 2);
      } else {
        ctx.lineTo(trace.x + trace.length, trace.y);
        ctx.arc(trace.x + trace.length, trace.y, 2.5, 0, Math.PI * 2);
      }
      ctx.stroke();
    }
  }

  renderDataPulses(ctx, dt) {
    for (let i = this.dataPulses.length - 1; i >= 0; i--) {
      const pulse = this.dataPulses[i];
      pulse.progress += pulse.speed * dt * this.overclockFactor;
      
      if (pulse.progress > 1.0) {
        this.dataPulses.splice(i, 1);
        continue;
      }

      const px = pulse.vertical ? pulse.x : pulse.x + pulse.len * pulse.progress;
      const py = pulse.vertical ? pulse.y + pulse.len * pulse.progress : pulse.y;

      ctx.fillStyle = pulse.color;
      ctx.shadowColor = pulse.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  renderPneumaticTubes(ctx, dt) {
    for (const tube of this.pneumaticTubes) {
      ctx.strokeStyle = 'rgba(107, 107, 58, 0.25)';
      ctx.lineWidth = tube.width;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.moveTo(tube.startX, tube.startY);
      ctx.lineTo(tube.endX, tube.endY);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(239, 230, 210, 0.08)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    for (let i = this.capsules.length - 1; i >= 0; i--) {
      const cap = this.capsules[i];
      const tube = this.pneumaticTubes[cap.tubeIndex];
      if (!tube) continue;

      cap.progress += cap.speed * dt * this.overclockFactor;
      if (cap.progress > 1.0) {
        cap.progress = 0;
        cap.tubeIndex = Math.floor(Math.random() * this.pneumaticTubes.length);
      }

      const cx = tube.startX + (tube.endX - tube.startX) * cap.progress;
      const cy = tube.startY + (tube.endY - tube.startY) * cap.progress;
      const angle = Math.atan2(tube.endY - tube.startY, tube.endX - tube.startX);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      ctx.fillStyle = cap.glowColor;
      ctx.shadowColor = cap.glowColor;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(-12, -4, 24, 8, 4);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }

  renderCRTRacks(ctx, dt) {
    for (const crt of this.crtRacks) {
      if (crt.flicker > 0) crt.flicker -= dt * 2.5;

      ctx.fillStyle = '#1c1611';
      ctx.strokeStyle = '#33271d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(crt.x, crt.y, crt.w, crt.h, 6);
      ctx.fill();
      ctx.stroke();

      const screenGrad = ctx.createLinearGradient(crt.x, crt.y, crt.x, crt.y + crt.h);
      screenGrad.addColorStop(0, '#0d0d0a');
      screenGrad.addColorStop(1, '#16130d');
      ctx.fillStyle = screenGrad;
      ctx.beginPath();
      ctx.roundRect(crt.x + 6, crt.y + 6, crt.w - 12, crt.h - 12, 4);
      ctx.fill();

      const alpha = crt.flicker > 0 ? 0.3 + Math.random() * 0.5 : 0.65;
      ctx.strokeStyle = crt.glowColor;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      
      const waveY = crt.y + crt.h * 0.5;
      for (let wx = 0; wx < crt.w - 16; wx += 4) {
        const wy = waveY + Math.sin(wx * 0.15 * crt.waveFreq + this.time * 4 * this.overclockFactor) * (crt.h * 0.2);
        if (wx === 0) ctx.moveTo(crt.x + 8 + wx, wy);
        else ctx.lineTo(crt.x + 8 + wx, wy);
      }
      ctx.stroke();

      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      for (let sy = crt.y + 6; sy < crt.y + crt.h - 6; sy += 3) {
        ctx.fillRect(crt.x + 6, sy, crt.w - 12, 1);
      }

      ctx.globalAlpha = 1.0;
    }
  }

  renderWallClocks(ctx, dt) {
    for (const clock of this.wallClocks) {
      if (clock.skipTime > 0) {
        clock.skipTime -= dt;
        clock.secondHand += dt * 15;
      } else {
        clock.secondHand += dt * clock.tickSpeed * this.overclockFactor * 0.5;
      }
      clock.minuteHand = clock.secondHand / 60;
      clock.hourHand = clock.secondHand / 720;

      ctx.save();
      ctx.translate(clock.x, clock.y);

      ctx.fillStyle = '#1c1611';
      ctx.strokeStyle = this.overclockFactor > 1.5 ? '#E8892B' : '#D9A93A';
      ctx.lineWidth = 2.5;

      if (clock.type === 'round') {
        ctx.beginPath();
        ctx.arc(0, 0, clock.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = 'rgba(239, 230, 210, 0.05)';
        ctx.beginPath();
        ctx.arc(0, 0, clock.radius - 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(217, 169, 58, 0.5)';
        ctx.lineWidth = 1.5;
        for (let t = 0; t < 12; t++) {
          const ta = (Math.PI / 6) * t;
          ctx.beginPath();
          ctx.moveTo(Math.cos(ta) * (clock.radius - 8), Math.sin(ta) * (clock.radius - 8));
          ctx.lineTo(Math.cos(ta) * (clock.radius - 3), Math.sin(ta) * (clock.radius - 3));
          ctx.stroke();
        }
      } else {
        ctx.beginPath();
        ctx.roundRect(-clock.radius, -clock.radius, clock.radius * 2, clock.radius * 2, 6);
        ctx.fill();
        ctx.stroke();
      }

      ctx.strokeStyle = '#EFE6D2';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(clock.hourHand) * (clock.radius * 0.45), Math.sin(clock.hourHand) * (clock.radius * 0.45));
      ctx.stroke();

      ctx.strokeStyle = '#D9A93A';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(clock.minuteHand) * (clock.radius * 0.65), Math.sin(clock.minuteHand) * (clock.radius * 0.65));
      ctx.stroke();

      ctx.strokeStyle = '#E8892B';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(clock.secondHand) * (clock.radius * 0.8), Math.sin(clock.secondHand) * (clock.radius * 0.8));
      ctx.stroke();

      ctx.fillStyle = '#E8892B';
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  renderDust(ctx, dt) {
    for (const dust of this.dustParticles) {
      dust.x += dust.speedX * this.overclockFactor;
      dust.y += dust.speedY * this.overclockFactor;

      if (dust.x < 0) dust.x = this.width;
      if (dust.x > this.width) dust.x = 0;
      if (dust.y < 0) dust.y = this.height * 3;
      if (dust.y > this.height * 3) dust.y = 0;

      ctx.fillStyle = dust.glow ? 'rgba(255, 179, 71, 0.45)' : 'rgba(239, 230, 210, 0.2)';
      ctx.beginPath();
      ctx.arc(dust.x, dust.y, dust.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderCentralContentMask(ctx, inOverclockZone) {
    const maskGrad = ctx.createRadialGradient(
      this.width / 2, this.height / 2, this.width * 0.15,
      this.width / 2, this.height / 2, this.width * 0.65
    );
    
    maskGrad.addColorStop(0, inOverclockZone ? 'rgba(20, 14, 10, 0.78)' : 'rgba(18, 14, 10, 0.72)');
    maskGrad.addColorStop(0.5, inOverclockZone ? 'rgba(22, 16, 12, 0.45)' : 'rgba(20, 16, 12, 0.35)');
    maskGrad.addColorStop(1, 'rgba(20, 16, 12, 0.05)');

    ctx.fillStyle = maskGrad;
    ctx.fillRect(0, 0, this.width, this.height);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.bureauEngine = new BureauEngine('circuit-canvas');
});
