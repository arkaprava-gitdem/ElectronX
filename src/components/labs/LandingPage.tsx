import React, { useEffect, useRef } from 'react';
import {
  Atom,
  Zap,
  Cpu,
  Layers,
  SunMedium,
  Radio,
  ArrowRight,
  Sparkles,
  FlaskConical,
  Scale,
  LineChart,
  ShieldCheck,
  Calculator,
  Compass,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { LabViewId } from '../../types';

interface LandingPageProps {
  onEnterLab: (view?: LabViewId) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterLab }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animated Wafer & Electron simulation on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Electron Particles
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      charge: 'electron' | 'hole';
      size: number;
      alpha: number;
    }

    const particles: Particle[] = [];
    const particleCount = 45;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        charge: Math.random() > 0.4 ? 'electron' : 'hole',
        size: Math.random() * 2.5 + 2,
        alpha: Math.random() * 0.7 + 0.3,
      });
    }

    // Circuit grid trace nodes
    const traces = [
      { x1: 50, y1: height / 2, x2: width / 2 - 80, y2: height / 2 },
      { x1: width / 2 + 80, y1: height / 2, x2: width - 50, y2: height / 2 },
      { x1: width / 2, y1: 50, x2: width / 2, y2: height / 2 - 80 },
      { x1: width / 2, y1: height / 2 + 80, x2: width / 2, y2: height - 50 },
    ];

    let t = 0;
    const render = () => {
      t += 0.02;
      ctx.clearRect(0, 0, width, height);

      // Draw subtle silicon wafer disk in center
      const centerX = width / 2;
      const centerY = height / 2;
      const waferRadius = Math.min(width, height) * 0.38;

      // Glow behind wafer
      const grad = ctx.createRadialGradient(centerX, centerY, waferRadius * 0.1, centerX, centerY, waferRadius * 1.2);
      grad.addColorStop(0, 'rgba(6, 182, 212, 0.15)');
      grad.addColorStop(0.5, 'rgba(14, 165, 233, 0.05)');
      grad.addColorStop(1, 'rgba(11, 15, 23, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, waferRadius * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Wafer boundary ring
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, waferRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Flat notch on wafer (crystal orientation indicator)
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, waferRadius, -0.3, 0.3);
      ctx.stroke();

      // Internal concentric grid / die squares
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      const dieStep = 36;
      for (let x = -waferRadius + 20; x < waferRadius - 20; x += dieStep) {
        for (let y = -waferRadius + 20; y < waferRadius - 20; y += dieStep) {
          if (x * x + y * y < (waferRadius - 15) * (waferRadius - 15)) {
            ctx.strokeRect(centerX + x, centerY + y, dieStep - 4, dieStep - 4);
          }
        }
      }

      // Circuit traces
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1.5;
      traces.forEach((tr) => {
        ctx.beginPath();
        ctx.moveTo(tr.x1, tr.y1);
        ctx.lineTo(tr.x2, tr.y2);
        ctx.stroke();

        // Pulsing dot on trace
        const traceProgress = (Math.sin(t + tr.x1) + 1) / 2;
        const px = tr.x1 + (tr.x2 - tr.x1) * traceProgress;
        const py = tr.y1 + (tr.y2 - tr.y1) * traceProgress;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Central Device Die
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      const dieSize = 90;
      ctx.fillRect(centerX - dieSize / 2, centerY - dieSize / 2, dieSize, dieSize);
      ctx.strokeRect(centerX - dieSize / 2, centerY - dieSize / 2, dieSize, dieSize);

      // Junction line inside die
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)'; // P-side
      ctx.beginPath();
      ctx.moveTo(centerX - dieSize / 2, centerY);
      ctx.lineTo(centerX, centerY);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(14, 165, 233, 0.7)'; // N-side
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + dieSize / 2, centerY);
      ctx.stroke();

      // Depletion boundary
      ctx.fillStyle = 'rgba(234, 179, 8, 0.18)';
      ctx.fillRect(centerX - 10, centerY - dieSize / 2, 20, dieSize);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('P-TYPE', centerX - 26, centerY - 10);
      ctx.fillText('N-TYPE', centerX + 26, centerY - 10);
      ctx.fillText('PN CHIP', centerX, centerY + 24);

      // Render Electrons & Holes
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        if (p.charge === 'electron') {
          ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha})`; // Cyan electron
          ctx.fill();
          // Glow
          ctx.strokeStyle = `rgba(14, 165, 233, ${p.alpha * 0.4})`;
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgba(244, 63, 94, ${p.alpha})`; // Rose hole
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const explorationCards = [
    {
      id: 'physics',
      title: 'Semiconductor Physics',
      desc: 'Explore Fermi-Dirac statistics, energy bands, drift-diffusion dynamics, conductivity equations, and Hall effect.',
      icon: Atom,
      module: 'MODULE 01',
      stats: '10 Physics Interactive Modules'
    },
    {
      id: 'pn-junction',
      title: 'PN Junction & Zener Lab',
      desc: 'Manipulate bias voltage, observe dynamic depletion width, energy band bending, Shockley diode V-I, and Zener breakdown.',
      icon: Zap,
      module: 'MODULE 02',
      stats: 'Shockley & Zener Dynamic Physics'
    },
    {
      id: 'bjt',
      title: 'Bipolar Junction Transistor',
      desc: 'Common-Emitter input and output families of curves, interactive Q-point on DC load line, and AC small-signal amplifier gain.',
      icon: Cpu,
      module: 'MODULE 02',
      stats: 'CE Characteristics & Load Line'
    },
    {
      id: 'mosfet',
      title: 'MOSFET, JFET & CMOS Lab',
      desc: 'JFET pinch-off locus, NMOS/PMOS quadratic models, MOS capacitor states (Accumulation, Depletion, Inversion), CMOS inverter, and 3D FinFET.',
      icon: Layers,
      module: 'MODULE 03',
      stats: 'Complementary MOS & FinFET'
    },
    {
      id: 'opto',
      title: 'Optoelectronics & Solar Cell',
      desc: 'Direct bandgap LEDs with photon emission, photodiode response, and photovoltaic solar cell I-V/P-V curves with Fill Factor (FF) calculation.',
      icon: SunMedium,
      module: 'MODULE 04',
      stats: 'Photonics, LEDs & Solar MPPT'
    },
    {
      id: 'special-devices',
      title: 'Special Semiconductor Devices',
      desc: 'Explore PIN diode carrier dynamics, Varactor voltage-controlled capacitance, Tunnel diode Negative Differential Resistance (NDR), and Gunn/IMPATT devices.',
      icon: Radio,
      module: 'MODULE 05',
      stats: '5 High-Frequency Microwave Diodes'
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#0b0f17] text-slate-100 overflow-hidden pb-20">
      {/* Background Circuit Grid */}
      <div className="absolute inset-0 bg-circuit-grid opacity-80 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative z-10 pt-12 sm:pt-16 pb-16 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs font-mono text-cyan-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>B.Tech Electronic Devices • PCCEC301</span>
            </div>

            <div className="space-y-3">
              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-none">
                ELECTRON<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400">X</span>
              </h1>
              <p className="font-display text-xl sm:text-2xl text-slate-300 font-medium tracking-wide">
                Explore. Simulate. Understand.
              </p>
            </div>

            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
              An interactive semiconductor laboratory for visualizing device physics, characteristic curves,
              energy bands, and real-world electronic behavior from basic PN junctions to nanometer FinFETs.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                id="hero-enter-lab-primary-btn"
                onClick={() => onEnterLab('dashboard')}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-sm tracking-wide transition shadow-lg shadow-cyan-500/25 flex items-center gap-2.5 cursor-pointer group"
              >
                <span>ENTER THE LAB</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>

              <button
                id="hero-explore-devices-btn"
                onClick={() => onEnterLab('pn-junction')}
                className="px-6 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-slate-200 font-semibold text-sm transition flex items-center gap-2 cursor-pointer"
              >
                <span>EXPLORE DEVICES</span>
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </button>
            </div>

            {/* Philosophy Pill */}
            <div className="pt-4 border-t border-slate-800/80">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
                <span className="text-cyan-400 font-semibold">PHILOSOPHY:</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">LEARN</span>
                <span>→</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">VISUALIZE</span>
                <span>→</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">SIMULATE</span>
                <span>→</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">EXPERIMENT</span>
                <span>→</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">ANALYZE</span>
              </div>
            </div>
          </div>

          {/* Right Hero Visual: Wafer Animation & Floating Labels */}
          <div className="lg:col-span-6 relative w-full h-[360px] sm:h-[420px] rounded-2xl bg-slate-950/70 border border-slate-800/80 shadow-2xl overflow-hidden p-2 flex items-center justify-center">
            <canvas ref={canvasRef} className="w-full h-full block" />

            {/* Floating Device Labels */}
            <div className="absolute top-4 left-4 pointer-events-none">
              <span className="px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-xs border border-cyan-500/40 text-[10px] font-mono text-cyan-300 shadow-md">
                PN JUNCTION
              </span>
            </div>
            <div className="absolute top-4 right-4 pointer-events-none">
              <span className="px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-xs border border-indigo-500/40 text-[10px] font-mono text-indigo-300 shadow-md">
                BJT
              </span>
            </div>
            <div className="absolute bottom-4 left-4 pointer-events-none">
              <span className="px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-xs border border-emerald-500/40 text-[10px] font-mono text-emerald-300 shadow-md">
                MOSFET & FINFET
              </span>
            </div>
            <div className="absolute bottom-4 right-4 pointer-events-none">
              <span className="px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-xs border border-amber-500/40 text-[10px] font-mono text-amber-300 shadow-md">
                OPTOELECTRONICS
              </span>
            </div>
            <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none hidden sm:block">
              <span className="px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-xs border border-rose-500/40 text-[10px] font-mono text-rose-300 shadow-md">
                SPECIAL DEVICES
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* "WHAT CAN YOU EXPLORE?" Section */}
      <section className="relative z-10 py-12 px-4 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
            Interactive Modules
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            WHAT CAN YOU EXPLORE?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Comprehensive syllabus coverage mapped directly to undergraduate basic electronic engineering courses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {explorationCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                id={`explore-card-${card.id}`}
                onClick={() => onEnterLab(card.id as LabViewId)}
                className="rounded-xl p-5 bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/90 transition-all duration-200 group flex flex-col justify-between cursor-pointer relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-cyan-950/70 border border-cyan-800/60 flex items-center justify-center text-cyan-400 group-hover:text-cyan-300 group-hover:scale-105 transition">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {card.module}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-base font-bold text-slate-100 group-hover:text-cyan-300 transition">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-slate-400">
                    {card.stats}
                  </span>
                  <div className="flex items-center gap-1 text-cyan-400 group-hover:translate-x-1 transition font-medium">
                    <span>Open Lab</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* "Why ElectronX?" Section */}
      <section className="relative z-10 py-12 px-4 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-mono uppercase tracking-widest text-indigo-400">
            Platform Capabilities
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Why ElectronX?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Engineered specifically for engineering students and lab instructors to turn dry equations into intuitive physical insight.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              title: 'Interactive Simulations',
              desc: 'Directly adjust bias voltages, doping levels, temperatures, and dimensions with real-time dynamic feedback.',
              icon: Zap,
              color: 'text-cyan-400'
            },
            {
              title: 'Real-time Characteristics',
              desc: 'Watch V-I, output IC-VCE, transfer VTC, and photovoltaic curves plot dynamically with markers and region labeling.',
              icon: LineChart,
              color: 'text-sky-400'
            },
            {
              title: 'Virtual Experiments',
              desc: '8 complete university lab experiments with apparatus lists, live readings tables, auto graphing, and graded submission.',
              icon: FlaskConical,
              color: 'text-emerald-400'
            },
            {
              title: 'Device Comparison',
              desc: 'Side-by-side parametric matrix comparing carrier types, control mechanisms, input impedance, and speed limits.',
              icon: Scale,
              color: 'text-indigo-400'
            },
            {
              title: 'AI Electronics Mentor',
              desc: 'Scientific assistant answering student questions formatted in simple, engineering, formula, visual, and practical application sections.',
              icon: Sparkles,
              color: 'text-amber-400'
            },
            {
              title: 'Engineering Calculations',
              desc: 'Dedicated Formula Vault with step-by-step interactive calculations for conductivity, built-in potential, and gain.',
              icon: Calculator,
              color: 'text-rose-400'
            }
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-start gap-3.5"
              >
                <div className={`p-2 rounded-lg bg-slate-950 border border-slate-800 ${item.color} shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-200">{item.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Syllabus Coverage Section */}
      <section className="relative z-10 py-12 px-4 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
            Academic Curriculum
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Syllabus Coverage (Course Code: PCCEC301)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Fully aligned with university standard B.Tech Basic Electronic Devices curriculum.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            {
              mod: 'MODULE 01',
              title: 'Semiconductor Electronics',
              topics: ['Fermi-Dirac stats', 'Drift & Diffusion', 'Conductivity & Mobility', 'Hall Effect'],
              view: 'physics'
            },
            {
              mod: 'MODULE 02',
              title: 'Junctions & BJT',
              topics: ['PN Diode V-I', 'Zener breakdown', 'BJT CE Input & Output', 'Q-Point & Amplifier'],
              view: 'pn-junction'
            },
            {
              mod: 'MODULE 03',
              title: 'Field Effect Transistors',
              topics: ['JFET pinch-off', 'MOSFET linear/sat', 'CMOS inverter VTC', '3D FinFET concepts'],
              view: 'mosfet'
            },
            {
              mod: 'MODULE 04',
              title: 'Optoelectronic Devices',
              topics: ['Direct bandgap LED', 'Photodiode & APD', 'Solar cell I-V / P-V', 'Fill factor & MPPT'],
              view: 'opto'
            },
            {
              mod: 'MODULE 05',
              title: 'Special Devices',
              topics: ['PIN RF resistor', 'Varactor tuning', 'Tunnel diode NDR', 'Gunn & IMPATT diodes'],
              view: 'special-devices'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => onEnterLab(item.view as LabViewId)}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                  {item.mod}
                </span>
                <h4 className="font-display font-bold text-sm text-slate-200 mt-2.5 group-hover:text-emerald-300 transition">
                  {item.title}
                </h4>
                <ul className="mt-3 space-y-1.5">
                  {item.topics.map((t, ti) => (
                    <li key={ti} className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-cyan-400/80 shrink-0" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-emerald-400 font-mono">
                <span>Enter Module</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="relative z-10 py-16 px-4 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="rounded-2xl p-8 sm:p-12 bg-gradient-to-b from-slate-900 to-[#0c121d] border border-cyan-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

          <h3 className="font-display text-2xl sm:text-4xl font-black text-white tracking-tight">
            Ready to enter the semiconductor lab?
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm mt-3 max-w-lg mx-auto">
            Jump directly to real-time virtual simulations, interactive parameter adjustments, and full laboratory experiment reports.
          </p>

          <div className="mt-6 flex justify-center">
            <button
              id="landing-final-enter-btn"
              onClick={() => onEnterLab('dashboard')}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-sm tracking-wider transition shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer group"
            >
              <span>ENTER THE LAB</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
