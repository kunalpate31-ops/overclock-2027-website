/* ==========================================================================
   Interactive Background Circuit Canvas
   Subtle PCB traces, nodes, and signal pulse animations
   ========================================================================== */

(function () {
  const canvas = document.getElementById('circuit-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let nodes = [];
  let pulses = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initGrid();
  }

  function initGrid() {
    nodes = [];
    pulses = [];
    const step = 90;
    const cols = Math.ceil(width / step);
    const rows = Math.ceil(height / step);

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        if (Math.random() > 0.4) {
          nodes.push({
            x: i * step + (Math.random() * 20 - 10),
            y: j * step + (Math.random() * 20 - 10),
            size: Math.random() > 0.8 ? 2.5 : 1.5,
            connections: []
          });
        }
      }
    }

    // Connect close nodes with orthogonal/diagonal PCB traces
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = Math.abs(nodes[i].x - nodes[j].x);
        const dy = Math.abs(nodes[i].y - nodes[j].y);
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110 && (dx < 15 || dy < 15 || Math.abs(dx - dy) < 15)) {
          nodes[i].connections.push(nodes[j]);
        }
      }
    }
  }

  function createPulse() {
    if (nodes.length === 0) return;
    const startNode = nodes[Math.floor(Math.random() * nodes.length)];
    if (startNode && startNode.connections.length > 0) {
      const targetNode = startNode.connections[Math.floor(Math.random() * startNode.connections.length)];
      pulses.push({
        x: startNode.x,
        y: startNode.y,
        targetX: targetNode.x,
        targetY: targetNode.y,
        progress: 0,
        speed: 0.015 + Math.random() * 0.02,
        color: Math.random() > 0.6 ? '#f59e0b' : '#38bdf8'
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Draw Traces
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.07)';

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      for (let j = 0; j < node.connections.length; j++) {
        const target = node.connections[j];
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      }
    }

    // Draw Nodes (Vias / Pads)
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      ctx.fillStyle = 'rgba(148, 163, 184, 0.15)';
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Update and Draw Signal Pulses
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.progress += p.speed;

      const curX = p.x + (p.targetX - p.x) * p.progress;
      const curY = p.y + (p.targetY - p.y) * p.progress;

      ctx.fillStyle = p.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(curX, curY, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      if (p.progress >= 1) {
        pulses.splice(i, 1);
      }
    }

    if (Math.random() < 0.12 && pulses.length < 12) {
      createPulse();
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();
