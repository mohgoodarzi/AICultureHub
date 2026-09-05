import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

interface NeuralNode {
  x: number; y: number;
  vx: number; vy: number;
  radius: number;
  pulse: number;
  pulseSpeed: number;
}

interface DataPacket {
  fromIdx: number; toIdx: number;
  t: number; speed: number;
  hue: number;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-page">
      <!-- Animated background -->
      <div class="bg-layer">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
        <div class="grid-overlay"></div>
      </div>

      <div class="login-shell">
        <!-- Brand hero panel -->
        <div class="brand-panel">
          <div class="brand-chip">✦ سامانه هوش مصنوعی سازمانی</div>
          <h2>با هم،<br>سازمانی هوشمندتر می‌سازیم</h2>
          <p>پلتفرم ترویج فرهنگ هوش مصنوعی و تحول دیجیتال — آموزش، مقالات، آزمون و رقابت در یک تجربهٔ یکپارچه.</p>
          <div class="brand-features">
            <div class="feature-row"><span class="feature-dot">◆</span> یادگیری شخصی‌سازی‌شده با مسیر امتیاز</div>
            <div class="feature-row"><span class="feature-dot">◆</span> مقالات و دوره‌های به‌روز AI</div>
            <div class="feature-row"><span class="feature-dot">◆</span> آزمون‌ها و جدول امتیازات رقابتی</div>
          </div>
          <div class="brand-ring r1"></div>
          <div class="brand-ring r2"></div>
        </div>

        <!-- Login card -->
        <div class="login-card animate-fade-up">
          <!-- AI neural network canvas: nodes, synapses and data packets -->
          <canvas #neuralCanvas class="neural-canvas" aria-hidden="true"></canvas>

          <!-- Rotating AI keywords -->
          <div class="ai-words" aria-hidden="true">
            <span class="ai-word" *ngFor="let w of aiWords" [style.top.%]="w.top" [style.right.%]="w.right" [style.animation-delay.s]="w.delay">{{ w.text }}</span>
          </div>

          <div class="login-header">
            <img src="assets/logo.png" alt="شرکت طراحی و ساختمان نفت" class="login-logo">
            <h1>شرکت طراحی و ساختمان نفت</h1>
            <p>برای ادامه وارد حساب خود شوید</p>
          </div>
          <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
            <div class="form-group">
              <label for="username">نام کاربری</label>
              <input type="text" id="username" name="username" [(ngModel)]="credentials.username" required placeholder="نام کاربری خود را وارد کنید" autocomplete="username">
            </div>
            <div class="form-group">
              <label for="password">رمز عبور</label>
              <input type="password" id="password" name="password" [(ngModel)]="credentials.password" required placeholder="رمز عبور خود را وارد کنید" autocomplete="current-password">
            </div>
            <div class="error-message" *ngIf="errorMessage">{{ errorMessage }}</div>
            <button type="submit" class="btn-primary btn-submit" [disabled]="isLoading">
              <span *ngIf="isLoading" class="spinner"></span>
              {{ isLoading ? 'در حال ورود...' : 'ورود به سیستم' }}
            </button>
          </form>
          <div class="login-footer">
            <p>حساب کاربری ندارید؟ <a routerLink="/register">ثبت‌نام کنید</a></p>
          </div>
        </div>
      </div>

      <!-- Footer credit: bottom-left corner -->
      <div class="page-credit">توسعه و پشتیبانی توسط واحد فناوری اطلاعات ، ارتباطات و حکمرانی داده</div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      padding: 24px;
      background:
        radial-gradient(1000px 600px at 85% 10%, color-mix(in srgb, var(--theme-primary) 16%, transparent), transparent 60%),
        radial-gradient(900px 500px at 10% 90%, color-mix(in srgb, var(--theme-secondary) 14%, transparent), transparent 55%),
        var(--theme-background);
    }

    /* Footer credit - bottom-left corner */
    .page-credit {
      position: fixed;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 5;
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--theme-text-muted);
      background: color-mix(in srgb, var(--theme-surface) 82%, transparent);
      backdrop-filter: blur(6px);
      padding: 7px 18px;
      border-radius: 20px;
      border: 1px solid color-mix(in srgb, var(--theme-border) 75%, transparent);
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
      letter-spacing: 0.01em;
      direction: rtl;
      white-space: nowrap;
      text-align: center;
    }
    @media (max-width: 720px) {
      .page-credit { font-size: 0.62rem; bottom: 10px; padding: 5px 12px; max-width: calc(100vw - 24px); white-space: normal; }
    }

    /* Animated orbs */
    .bg-layer { position: absolute; inset: 0; pointer-events: none; }
    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(70px);
      opacity: 0.35;
      animation: floatY 9s ease-in-out infinite;
    }
    .orb-1 { width: 380px; height: 380px; background: var(--theme-primary); top: -120px; right: -80px; }
    .orb-2 { width: 320px; height: 320px; background: var(--theme-secondary); bottom: -100px; left: -60px; animation-delay: 2s; }
    .orb-3 { width: 200px; height: 200px; background: var(--theme-accent); top: 55%; left: 42%; opacity: 0.18; animation-delay: 4s; }

    .grid-overlay {
      position: absolute;
      inset: 0;
      background-image:
        linear-gradient(color-mix(in srgb, var(--theme-primary) 7%, transparent) 1px, transparent 1px),
        linear-gradient(90deg, color-mix(in srgb, var(--theme-primary) 7%, transparent) 1px, transparent 1px);
      background-size: 56px 56px;
      mask-image: radial-gradient(720px 520px at 50% 50%, #000 20%, transparent 80%);
      -webkit-mask-image: radial-gradient(720px 520px at 50% 50%, #000 20%, transparent 80%);
      animation: gridDrift 14s linear infinite;
    }

    .login-shell {
      position: relative;
      display: flex;
      align-items: stretch;
      gap: 0;
      max-width: 980px;
      width: 100%;
      border-radius: var(--radius-xl);
      overflow: hidden;
      box-shadow: var(--shadow-lg);
      background: color-mix(in srgb, var(--theme-surface) 92%, transparent);
      backdrop-filter: blur(20px);
      border: 1px solid color-mix(in srgb, var(--theme-border) 80%, transparent);
      z-index: 1;
    }

    /* Brand side */
    .brand-panel {
      flex: 1.1;
      position: relative;
      padding: 56px 48px;
      color: #fff;
      display: flex;
      flex-direction: column;
      justify-content: center;
      overflow: hidden;
      background:
        radial-gradient(700px 320px at 85% -10%, rgba(255,255,255,0.16), transparent 60%),
        var(--gradient-brand);
      background-size: 200% 200%;
      animation: gradientShift 12s ease infinite;
    }

    .brand-chip {
      align-self: flex-start;
      padding: 7px 16px;
      border-radius: 100px;
      background: rgba(255,255,255,0.16);
      border: 1px solid rgba(255,255,255,0.3);
      backdrop-filter: blur(8px);
      font-size: 0.8rem;
      font-weight: 700;
      margin-bottom: 26px;
    }

    .brand-panel h2 {
      font-size: 2.1rem;
      font-weight: 900;
      line-height: 1.4;
      margin: 0 0 16px;
      letter-spacing: -0.02em;
    }

    .brand-panel p {
      opacity: 0.9;
      line-height: 2;
      font-size: 0.95rem;
      margin: 0 0 30px;
    }

    .brand-features { display: flex; flex-direction: column; gap: 14px; }

    .feature-row {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.9rem;
      font-weight: 600;
      opacity: 0.94;
    }

    .feature-dot {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 26px; height: 26px;
      border-radius: 8px;
      background: rgba(255,255,255,0.18);
      font-size: 0.65rem;
    }

    .brand-ring {
      position: absolute;
      border-radius: 50%;
      border: 1.5px solid rgba(255,255,255,0.18);
      pointer-events: none;
    }
    .brand-ring.r1 { width: 340px; height: 340px; top: -140px; left: -120px; animation: floatY 8s ease-in-out infinite; }
    .brand-ring.r2 { width: 220px; height: 220px; bottom: -90px; right: -60px; animation: floatY 10s ease-in-out infinite 2s; }

    /* Card side */
    .login-card {
      flex: 1;
      position: relative;
      isolation: isolate;
      overflow: hidden;
      padding: 52px 48px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: linear-gradient(150deg, #2c120a 0%, #451f12 45%, #0a3a4d 100%);
    }

    /* ===== Animated flowing color mesh — clearly visible, stays inside the form ===== */
    .login-card::before {
      content: '';
      position: absolute;
      inset: -55%;
      z-index: -1;
      background:
        radial-gradient(38% 34% at 24% 28%, rgba(240, 79, 36, 0.50), transparent 68%),
        radial-gradient(42% 38% at 72% 22%, rgba(201, 74, 48, 0.55), transparent 68%),
        radial-gradient(40% 40% at 78% 72%, rgba(15, 126, 168, 0.58), transparent 68%),
        radial-gradient(36% 36% at 26% 76%, rgba(11, 138, 102, 0.52), transparent 68%);
      animation: colorFlow 16s ease-in-out infinite alternate;
      will-change: transform;
    }

    /* Second layer moving the opposite way for continuous blending */
    .login-card::after {
      content: '';
      position: absolute;
      inset: -50%;
      z-index: -1;
      background:
        radial-gradient(30% 30% at 50% 50%, rgba(217, 131, 36, 0.42), transparent 70%),
        radial-gradient(26% 26% at 70% 40%, rgba(240, 79, 36, 0.35), transparent 70%),
        radial-gradient(24% 24% at 30% 60%, rgba(95, 182, 214, 0.40), transparent 70%);
      animation: colorBlend 11s ease-in-out infinite alternate-reverse;
      will-change: transform;
    }

    @keyframes colorFlow {
      0%   { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
      33%  { transform: translate3d(6%, -4%, 0) scale(1.12) rotate(6deg); }
      66%  { transform: translate3d(-5%, 5%, 0) scale(1.05) rotate(-5deg); }
      100% { transform: translate3d(3%, -2%, 0) scale(1.15) rotate(3deg); }
    }

    @keyframes colorBlend {
      0%   { transform: translate3d(-4%, 3%, 0) scale(1.08) rotate(-4deg); }
      50%  { transform: translate3d(5%, -5%, 0) scale(1.16) rotate(5deg); }
      100% { transform: translate3d(-2%, 4%, 0) scale(1.02) rotate(-6deg); }
    }

    @media (prefers-reduced-motion: reduce) {
      .login-card::before, .login-card::after { animation: none; }
      .neural-canvas { display: none; }
      .ai-words { display: none; }
    }

    /* ===== Neural network canvas layer ===== */
    .neural-canvas {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
    }

    /* ===== Floating AI keywords ===== */
    .ai-words {
      position: absolute;
      inset: 0;
      z-index: 0;
      overflow: hidden;
      pointer-events: none;
    }
    .ai-word {
      position: absolute;
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.22em;
      color: rgba(246, 214, 200, 0.5);
      text-shadow: 0 0 12px rgba(232, 132, 107, 0.8);
      white-space: nowrap;
      animation: wordDrift 9s ease-in-out infinite alternate;
      will-change: transform, opacity;
    }
    @keyframes wordDrift {
      0%   { transform: translate3d(0, 0, 0); opacity: 0.25; }
      50%  { opacity: 0.9; }
      100% { transform: translate3d(-14px, -18px, 0); opacity: 0.35; }
    }

    .login-header { text-align: center; margin-bottom: 34px; position: relative; z-index: 1; }
    .login-header .login-logo {
      max-width: 110px;
      max-height: 74px;
      margin-bottom: 18px;
      filter: drop-shadow(0 6px 16px rgba(0,0,0,0.45));
    }
    .login-card form {
      position: relative;
      z-index: 1;
    }

    .login-card form .form-group { position: relative; }
    .login-card form .btn-submit { position: relative; }
    .login-card form .error-message { position: relative; }

    .login-header h1 { margin: 0 0 6px 0; font-size: 1.25rem; color: #ffffff; font-weight: 800; text-shadow: 0 2px 12px rgba(0,0,0,0.4); }
    .login-header p { color: rgba(255,255,255,0.85); margin: 0; font-size: 0.88rem; text-shadow: 0 1px 8px rgba(0,0,0,0.4); }

    .form-group { margin-bottom: 20px; }
    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 700;
      color: #ffffff;
      font-size: 0.88rem;
      text-shadow: 0 1px 8px rgba(0,0,0,0.45);
    }
    .form-group input {
      width: 100%;
      padding: 13px 16px;
      border: 1.5px solid rgba(255,255,255,0.55);
      border-radius: 12px;
      font-size: 0.95rem;
      transition: all 0.25s var(--ease-smooth);
      box-sizing: border-box;
      background: rgba(255,255,255,0.93);
      color: #1e1b4b;
    }
    .form-group input::placeholder { color: rgba(30,27,75,0.45); }
    .form-group input:focus {
      outline: none;
      border-color: #ffffff;
      background: #ffffff;
      box-shadow: 0 0 0 4px rgba(255,255,255,0.25);
    }
    .form-group input::placeholder { color: var(--theme-text-muted); }

    .btn-submit {
      width: 100%;
      padding: 14px;
      color: #4c1d95;
      background: #ffffff;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.25s var(--ease-smooth);
      margin-top: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.4);
    }
    .btn-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(0,0,0,0.45), 0 0 24px rgba(240, 79, 36, 0.45);
    }
    .btn-submit:disabled { opacity: 0.75; cursor: not-allowed; }

    .spinner {
      width: 16px; height: 16px;
      border: 2.5px solid rgba(76,29,149,0.25);
      border-top-color: #4c1d95;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    .error-message {
      color: #ffffff;
      font-size: 0.85rem;
      margin-bottom: 16px;
      text-align: center;
      padding: 10px;
      background: rgba(239,68,68,0.4);
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.35);
    }

    .login-footer { text-align: center; margin-top: 26px; font-size: 0.9rem; color: rgba(255,255,255,0.85); text-shadow: 0 1px 8px rgba(0,0,0,0.4); position: relative; z-index: 1; }
    .login-footer a {
      color: #ffffff;
      text-decoration: none;
      font-weight: 800;
      text-decoration: underline;
      text-underline-offset: 3px;
      transition: all 0.2s ease;
    }
    .login-footer a:hover { color: #fbcfe8; }

    @media (max-width: 860px) {
      .brand-panel { display: none; }
      .login-shell { max-width: 440px; }
    }
  `]
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  credentials = { username: '', password: '' };
  isLoading = false;
  errorMessage = '';

  @ViewChild('neuralCanvas') neuralCanvas!: ElementRef<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D | null = null;
  private rafId = 0;
  private resizeObs?: ResizeObserver;
  private nodes: NeuralNode[] = [];
  private packets: DataPacket[] = [];
  private W = 0; private H = 0;

  // Floating AI keywords drifting across the form
  aiWords = [
    { text: 'AI', top: 12, right: 6, delay: 0 },
    { text: 'ML', top: 30, right: 70, delay: 2.5 },
    { text: 'DEEP LEARNING', top: 48, right: 3, delay: 1.2 },
    { text: 'NLP', top: 66, right: 62, delay: 3.5 },
    { text: 'NEURAL', top: 22, right: 40, delay: 5 },
    { text: 'DATA', top: 74, right: 12, delay: 1.8 },
    { text: 'GPT', top: 55, right: 30, delay: 4.2 },
    { text: 'AI', top: 84, right: 48, delay: 0.8 },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService,
    private zone: NgZone
  ) {}

  ngAfterViewInit(): void {
    this.initNeuralCanvas();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
    this.resizeObs?.disconnect();
  }

  private initNeuralCanvas(): void {
    const canvas = this.neuralCanvas?.nativeElement;
    if (!canvas) return;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.W = rect.width; this.H = rect.height;
      canvas.width = this.W * dpr;
      canvas.height = this.H * dpr;
      canvas.style.width = `${this.W}px`;
      canvas.style.height = `${this.H}px`;
      this.ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.seedNodes();
    };

    resize();
    this.resizeObs = new ResizeObserver(resize);
    this.resizeObs.observe(canvas.parentElement!);

    // Run outside Angular zone so change detection never fires from the animation loop
    this.zone.runOutsideAngular(() => this.animate());
  }

  private seedNodes(): void {
    const count = Math.max(18, Math.min(34, Math.floor((this.W * this.H) / 9000)));
    this.nodes = Array.from({ length: count }, () => ({
      x: Math.random() * this.W,
      y: Math.random() * this.H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: 1.2 + Math.random() * 2.2,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.015 + Math.random() * 0.03
    }));
    this.packets = [];
  }

  private animate(): void {
    this.rafId = requestAnimationFrame(() => this.animate());
    const ctx = this.ctx;
    if (!ctx) return;

    ctx.clearRect(0, 0, this.W, this.H);

    // --- Moving nodes ---
    for (const n of this.nodes) {
      n.x += n.vx; n.y += n.vy;
      n.pulse += n.pulseSpeed;
      if (n.x < 0 || n.x > this.W) n.vx *= -1;
      if (n.y < 0 || n.y > this.H) n.vy *= -1;
    }

    // --- Synapse connections between nearby nodes ---
    const maxDist = Math.min(150, this.W * 0.28);
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const a = this.nodes[i], b = this.nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > maxDist * maxDist) continue;
        const alpha = (1 - Math.sqrt(d2) / maxDist) * 0.5;
        ctx.strokeStyle = `rgba(232, 190, 172, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    // --- Spawn data packets traveling along synapses ---
    if (this.packets.length < 6 && this.nodes.length > 2 && Math.random() < 0.12) {
      const fromIdx = Math.floor(Math.random() * this.nodes.length);
      let best = -1, bestD = Infinity;
      for (let k = 0; k < this.nodes.length; k++) {
        if (k === fromIdx) continue;
        const dx = this.nodes[fromIdx].x - this.nodes[k].x;
        const dy = this.nodes[fromIdx].y - this.nodes[k].y;
        const d = dx * dx + dy * dy;
        if (d < bestD && d <= maxDist * maxDist) { bestD = d; best = k; }
      }
      if (best >= 0) {
        this.packets.push({ fromIdx, toIdx: best, t: 0, speed: 0.012 + Math.random() * 0.02, hue: [12, 28, 196, 164][Math.floor(Math.random() * 3)] });
      }
    }

    // --- Draw traveling data pulses with glow trails ---
    for (let p = this.packets.length - 1; p >= 0; p--) {
      const pkt = this.packets[p];
      pkt.t += pkt.speed;
      if (pkt.t >= 1) { this.packets.splice(p, 1); continue; }
      const a = this.nodes[pkt.fromIdx], b = this.nodes[pkt.toIdx];
      if (!a || !b) { this.packets.splice(p, 1); continue; }
      const x = a.x + (b.x - a.x) * pkt.t;
      const y = a.y + (b.y - a.y) * pkt.t;

      const grad = ctx.createLinearGradient(
        a.x + (b.x - a.x) * Math.max(0, pkt.t - 0.25), a.y + (b.y - a.y) * Math.max(0, pkt.t - 0.25), x, y
      );
      grad.addColorStop(0, `hsla(${pkt.hue}, 95%, 70%, 0)`);
      grad.addColorStop(1, `hsla(${pkt.hue}, 95%, 72%, 0.9)`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(a.x + (b.x - a.x) * Math.max(0, pkt.t - 0.25), a.y + (b.y - a.y) * Math.max(0, pkt.t - 0.25));
      ctx.lineTo(x, y);
      ctx.stroke();

      ctx.fillStyle = `hsla(${pkt.hue}, 100%, 80%, 0.95)`;
      ctx.shadowColor = `hsla(${pkt.hue}, 100%, 70%, 1)`;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // --- Draw pulsing neural nodes ---
    for (const n of this.nodes) {
      const glow = 0.55 + Math.sin(n.pulse) * 0.35;
      ctx.fillStyle = `rgba(246, 214, 200, ${glow})`;
      ctx.shadowColor = 'rgba(232, 132, 107, 0.9)';
      ctx.shadowBlur = 6 + glow * 6;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.authService.login(this.credentials).subscribe({
      next: () => { this.router.navigate(['/dashboard']); },
      error: (err) => { this.errorMessage = err.error?.message || 'نام کاربری یا رمز عبور اشتباه است'; this.isLoading = false; }
    });
  }
}
