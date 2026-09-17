"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/app/providers";

// Calm ambient network over the homepage hero. Nodes and pulses live
// exactly on the default CSS grid (hero-grid, 34px cells): the canvas draws
// no wires of its own, so only one grid is ever visible. Pulses follow a
// blink-then-move lifecycle — the origin node charges (blink), then a pulse
// launches along the grid line with a soft fading tail and lands with an
// answering flash. Every pulse picks its own grid line and direction, so
// traffic flows all ways at once; scrolling only biases the mix and feeds
// energy (speed/spawn rate), never a single flow.
//
// Decorative only: aria-hidden, pointer-events-none. The scene is a dull
// static frame by default and only animates while the pointer hovers the
// empty grid/canvas background (never over hero content or controls).
// Touch devices (no hover), prefers-reduced-motion, and offscreen states
// always stay on the static frame.

// Must match .hero-grid background-size in globals.css.
const CELL = 34;
const TRAIL_SAMPLES = 14;
// Deliberately muted palette: same blue/violet/cyan/green/amber family as
// the brand, but desaturated so idle and animated nodes stay calm.
const HUES = ["#4F7AB8", "#8478B8", "#5FA8BF", "#5FA87E", "#B89A5F"];
const FALLBACK_HUE = "#4F7AB8";
// Interactive hero content: hovering these must NOT start the animation.
const INTERACTIVE_SELECTOR =
  "a,button,input,select,textarea,label,[role='button'],[role='link'],[role='textbox'],[role='searchbox'],[data-no-hero-hover]";

interface GridNode {
  col: number;
  row: number;
  phase: number;
  shimmerSpeed: number;
  charge: number;
  flash: number;
  hue: string;
}

interface Pulse {
  orient: "row" | "col";
  fixed: number;
  from: number;
  to: number;
  t: number;
  speed: number;
  hue: string;
  state: "charging" | "traveling";
  chargeTime: number;
  origin: GridNode;
}

interface Flash {
  x: number;
  y: number;
  hue: string;
  life: number;
}

export default function HeroNetworkCanvas(): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolved } = useTheme();
  const isDark = resolved === "dark";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (ctx === null) {
      return;
    }
    // Non-nullable aliases: narrowing of the guards above is not tracked
    // inside the nested scene functions, so bind explicitly-typed locals.
    const el: HTMLCanvasElement = canvas;
    const g: CanvasRenderingContext2D = ctx;
    if (typeof window === "undefined") {
      return;
    }

    const reducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const nodeBase = isDark ? "rgba(203, 213, 225, 0.5)" : "rgba(51, 65, 85, 0.45)";

    let width = 0;
    let height = 0;
    let dpr = 1;
    let cols = 0;
    let rows = 0;
    let mobile = false;

    let nodes: Array<GridNode> = [];
    let pulses: Array<Pulse> = [];
    let flashes: Array<Flash> = [];
    let maxPulses = 9;
    let spawnTimer = 0;

    // Scroll-fed state (refs shared with the loop, no re-renders).
    let energy = 0;
    let biasDir = 0; // -1 up, 1 down, 0 none
    let lastBiasAt = 0;
    let lastScrollY = window.scrollY;
    let lastTime = 0;

    function resize(): void {
      const rect = el.getBoundingClientRect();
      mobile = rect.width < 640;
      dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      el.width = Math.round(rect.width * dpr);
      el.height = Math.round(rect.height * dpr);
      // Grid lines sit at multiples of CELL from the same top-left origin as
      // the CSS background grid, so canvas points coincide with its lines.
      cols = Math.max(4, Math.ceil(width / CELL) + 1);
      rows = Math.max(4, Math.ceil(height / CELL) + 1);
      maxPulses = mobile ? 4 : 9;
      seedNodes();
    }

    function seedNodes(): void {
      const target = mobile ? 26 : 64;
      nodes = [];
      const picked = new Set<number>();
      let guard = 0;
      while (nodes.length < target && guard < target * 40) {
        guard += 1;
        const col = Math.floor(Math.random() * cols);
        const row = Math.floor(Math.random() * rows);
        const key = row * cols + col;
        if (picked.has(key)) {
          continue;
        }
        picked.add(key);
        nodes.push({
          col,
          row,
          phase: Math.random() * Math.PI * 2,
          shimmerSpeed: 0.6 + Math.random() * 1.4,
          charge: 0,
          flash: 0,
          hue: HUES[Math.floor(Math.random() * HUES.length)] ?? FALLBACK_HUE,
        });
      }
    }

    // Straight grid point: identical lattice to the CSS background grid.
    function project(col: number, row: number): { x: number; y: number } {
      return { x: col * CELL, y: row * CELL };
    }

    function pulsePoint(pulse: Pulse, t: number): { x: number; y: number } {
      const clamped = Math.min(1, Math.max(0, t));
      const v = pulse.from + (pulse.to - pulse.from) * clamped;
      return pulse.orient === "row" ? project(v, pulse.fixed) : project(pulse.fixed, v);
    }

    function spawnPulse(now: number): void {
      if (nodes.length === 0) {
        return;
      }
      const origin = nodes[Math.floor(Math.random() * nodes.length)];
      if (origin === undefined) {
        return;
      }
      const orient = Math.random() < 0.5 ? "row" : "col";
      const limit = (orient === "row" ? cols : rows) - 1;
      const fixed = orient === "row" ? origin.row : origin.col;
      const start = orient === "row" ? origin.col : origin.row;

      // Direction: per-pulse random, so traffic flows all ways at once.
      // Recent vertical scroll only mildly biases pulses that travel
      // vertically; horizontal traffic always stays 50/50.
      let dir = Math.random() < 0.5 ? -1 : 1;
      const biasFresh = now - lastBiasAt < 1200 && biasDir !== 0;
      if (biasFresh && orient === "col" && Math.random() < 0.5 + 0.2 * energy) {
        dir = biasDir;
      }
      const span = 2 + Math.floor(Math.random() * 3);
      const end = Math.min(limit, Math.max(0, start + dir * span));
      if (end === start) {
        return;
      }
      pulses.push({
        orient,
        fixed,
        from: start,
        to: end,
        t: 0,
        speed: 0.5 + Math.random() * 0.5,
        hue: origin.hue,
        state: "charging",
        chargeTime: 0.35 + Math.random() * 0.35,
        origin,
      });
    }

    function drawNode(node: GridNode, time: number): void {
      const { x, y } = project(node.col, node.row);
      const shimmer = 0.12 + 0.1 * Math.sin(time * node.shimmerSpeed + node.phase);
      const glow = Math.max(shimmer, node.charge, node.flash);
      if (glow > 0.03) {
        const radius = 2 + 6 * glow;
        const gradient = g.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, node.hue);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        g.globalAlpha = 0.06 + 0.3 * glow;
        g.fillStyle = gradient;
        g.beginPath();
        g.arc(x, y, radius, 0, Math.PI * 2);
        g.fill();
        g.globalAlpha = 1;
      }
      g.fillStyle = nodeBase;
      g.beginPath();
      g.arc(x, y, 1.3, 0, Math.PI * 2);
      g.fill();
      if (glow > 0.8) {
        g.fillStyle = "rgba(255, 255, 255, 0.8)";
        g.beginPath();
        g.arc(x, y, 0.9, 0, Math.PI * 2);
        g.fill();
      }
    }

    function drawPulse(pulse: Pulse): void {
      if (pulse.state === "charging") {
        const { x, y } = pulsePoint(pulse, 0);
        const radius = 2 + 5 * pulse.origin.charge;
        const gradient = g.createRadialGradient(x, y, 0, x, y, Math.max(1, radius));
        gradient.addColorStop(0, "#ffffff");
        gradient.addColorStop(0.4, pulse.hue);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        g.globalAlpha = 0.2 + 0.4 * pulse.origin.charge;
        g.fillStyle = gradient;
        g.beginPath();
        g.arc(x, y, Math.max(1, radius), 0, Math.PI * 2);
        g.fill();
        g.globalAlpha = 1;
        return;
      }
      // Traveling: head glow plus a fading polyline tail (shooting star).
      const step = 0.012;
      g.lineCap = "round";
      for (let k = TRAIL_SAMPLES; k >= 1; k -= 1) {
        const t1 = pulse.t - (k - 1) * step;
        const t0 = pulse.t - k * step;
        if (t1 <= 0) {
          continue;
        }
        const fade = Math.pow(1 - k / (TRAIL_SAMPLES + 1), 2);
        const a = pulsePoint(pulse, Math.max(0, t0));
        const b = pulsePoint(pulse, t1);
        g.globalAlpha = 0.45 * fade;
        g.strokeStyle = pulse.hue;
        g.lineWidth = Math.max(0.4, 1.6 * fade);
        g.beginPath();
        g.moveTo(a.x, a.y);
        g.lineTo(b.x, b.y);
        g.stroke();
        g.globalAlpha = 1;
      }
      g.globalAlpha = 1;
      const head = pulsePoint(pulse, pulse.t);
      const gradient = g.createRadialGradient(head.x, head.y, 0, head.x, head.y, 6);
      gradient.addColorStop(0, "#ffffff");
      gradient.addColorStop(0.35, pulse.hue);
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      g.globalAlpha = 0.6;
      g.fillStyle = gradient;
      g.beginPath();
      g.arc(head.x, head.y, 6, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = 1;
    }

    function drawStaticFrame(): void {
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, width, height);
      for (const node of nodes) {
        drawNode(node, 0.6);
      }
    }

    let rafId = 0;
    let running = false;
    // Hover-gated playback: static by default, animate only while hovering
    // the empty grid/canvas background. Touch devices stay static.
    let hovered = false;
    let inView = true;
    const canHover =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const hoverRoot = el.closest("section") ?? el.parentElement;

    function frame(nowMs: number): void {
      rafId = 0;
      if (!running) {
        return;
      }
      const now = nowMs / 1000;
      const dt = Math.min(0.05, lastTime === 0 ? 0.016 : now - lastTime);
      lastTime = now;

      energy *= Math.pow(0.35, dt);
      const speedMul = 0.7 + energy * 1.6;

      // Decay flashes, spawn while under budget.
      flashes = flashes.filter((flash) => flash.life > 0.02);
      for (const flash of flashes) {
        flash.life *= Math.pow(0.25, dt);
      }
      spawnTimer -= dt;
      if (spawnTimer <= 0 && pulses.length < maxPulses) {
        spawnPulse(now);
        spawnTimer = 0.55 - 0.37 * energy + Math.random() * 0.2;
      }

      // Advance pulses through blink-then-move lifecycle.
      const settled: Array<Pulse> = [];
      for (const pulse of pulses) {
        if (pulse.state === "charging") {
          pulse.origin.charge = Math.min(1, pulse.origin.charge + dt / pulse.chargeTime);
          if (pulse.origin.charge >= 1) {
            pulse.state = "traveling";
            pulse.origin.charge = 0;
          }
        } else {
          pulse.t += dt * pulse.speed * speedMul;
          if (pulse.t >= 1) {
            const dest = pulsePoint(pulse, 1);
            flashes.push({ x: dest.x, y: dest.y, hue: pulse.hue, life: 1 });
            continue;
          }
        }
        settled.push(pulse);
      }
      pulses = settled;
      for (const node of nodes) {
        node.flash *= Math.pow(0.2, dt);
        if (node.charge > 0 && !pulses.some((p) => p.origin === node && p.state === "charging")) {
          node.charge = 0;
        }
      }

      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, width, height);
      for (const flash of flashes) {
        const gradient = g.createRadialGradient(flash.x, flash.y, 0, flash.x, flash.y, 8);
        gradient.addColorStop(0, "#ffffff");
        gradient.addColorStop(0.4, flash.hue);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        g.globalAlpha = 0.5 * flash.life;
        g.fillStyle = gradient;
        g.beginPath();
        g.arc(flash.x, flash.y, 8, 0, Math.PI * 2);
        g.fill();
        g.globalAlpha = 1;
      }
      for (const node of nodes) {
        drawNode(node, now);
      }
      for (const pulse of pulses) {
        drawPulse(pulse);
      }

      rafId = window.requestAnimationFrame(frame);
    }

    function shouldRun(): boolean {
      return canHover && hovered && inView && !reducedMotion && !document.hidden;
    }

    function start(): void {
      if (running || !shouldRun() || typeof window.requestAnimationFrame !== "function") {
        return;
      }
      running = true;
      lastTime = 0;
      rafId = window.requestAnimationFrame(frame);
    }

    function stop(): void {
      running = false;
      if (rafId !== 0 && typeof window.cancelAnimationFrame === "function") {
        window.cancelAnimationFrame(rafId);
      }
      rafId = 0;
    }

    function refresh(): void {
      if (shouldRun()) {
        start();
      } else {
        stop();
        drawStaticFrame();
      }
    }

    function onScroll(): void {
      const y = window.scrollY;
      const dy = y - lastScrollY;
      lastScrollY = y;
      if (dy !== 0) {
        biasDir = dy > 0 ? 1 : -1;
        lastBiasAt = performance.now() / 1000;
        energy = Math.min(1, energy + Math.min(1, Math.abs(dy) / 160) * 0.35);
      }
    }

    function onResize(): void {
      resize();
      if (!running) {
        drawStaticFrame();
      }
    }

    // Only the empty background counts as a hover target: the canvas itself,
    // the .hero-grid div, or the section. Anything interactive (links,
    // buttons, inputs, search, cards) keeps the scene static.
    function isBackgroundTarget(target: EventTarget | null): boolean {
      if (target === null) {
        return false;
      }
      if (target === el) {
        return true;
      }
      if (target instanceof Element) {
        if (target.closest(INTERACTIVE_SELECTOR) !== null) {
          return false;
        }
        if (target === hoverRoot) {
          return true;
        }
        if (target.classList.contains("hero-grid")) {
          return true;
        }
        // The canvas is pointer-events-none, so hovering empty grid area
        // usually targets the section or grid div — both already covered.
        // Any other non-interactive child (headings, plain text) is content,
        // not background, and must not trigger motion.
        return false;
      }
      return false;
    }

    resize();

    if (reducedMotion || !canHover) {
      // Always static: touch devices, reduced motion. Still respond to
      // resizes so the dull static frame always covers the hero.
      drawStaticFrame();
      window.addEventListener("resize", onResize);
      let staticObserver: ResizeObserver | null = null;
      if (typeof ResizeObserver === "function" && hoverRoot !== null) {
        staticObserver = new ResizeObserver(() => {
          onResize();
        });
        staticObserver.observe(hoverRoot);
      }
      return () => {
        window.removeEventListener("resize", onResize);
        staticObserver?.disconnect();
      };
    }

    // Default state: dull static frame until the grid background is hovered.
    drawStaticFrame();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver === "function") {
      resizeObserver = new ResizeObserver(() => {
        onResize();
      });
      resizeObserver.observe(el);
    }

    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver === "function") {
      io = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          inView = entry !== undefined ? entry.isIntersecting : true;
          refresh();
        },
        { threshold: 0.05 },
      );
      io.observe(el);
    }

    function setHovered(next: boolean): void {
      if (hovered === next) {
        return;
      }
      hovered = next;
      refresh();
    }

    function onHoverMove(event: MouseEvent): void {
      setHovered(isBackgroundTarget(event.target));
    }

    function onHoverLeave(): void {
      setHovered(false);
    }

    function onVisibility(): void {
      refresh();
    }
    hoverRoot?.addEventListener("mousemove", onHoverMove);
    hoverRoot?.addEventListener("mouseleave", onHoverLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      resizeObserver?.disconnect();
      io?.disconnect();
      hoverRoot?.removeEventListener("mousemove", onHoverMove);
      hoverRoot?.removeEventListener("mouseleave", onHoverLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-testid="hero-network-canvas"
      className="pointer-events-none absolute inset-0 h-full w-full [mask-image:radial-gradient(ellipse_90%_80%_at_50%_20%,black_45%,transparent_100%)]"
    />
  );
}
