import { useCallback, useEffect, useRef, useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

interface Heart {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  emoji: string;
}

interface Sparkle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  symbol: string;
  color: string;
}

type YesState = 0 | 1 | 2 | 3 | 4;

// ── Helpers ────────────────────────────────────────────────────────────────

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

const HEART_EMOJIS = ["💗", "💓", "💕", "💖", "🩷", "❤️", "💝"];
const SPARKLE_SYMBOLS = ["✦", "✧", "⋆", "★", "✨", "✸", "⁎"];

function generateHearts(count: number): Heart[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: randomBetween(0, 100),
    size: randomBetween(0.8, 2.2),
    duration: randomBetween(7, 16),
    delay: randomBetween(0, 10),
    emoji: HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)],
  }));
}

function generateSparkles(count: number): Sparkle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: randomBetween(0, 100),
    delay: randomBetween(0, 8),
    duration: randomBetween(5, 12),
    size: randomBetween(6, 14),
    symbol: SPARKLE_SYMBOLS[Math.floor(Math.random() * SPARKLE_SYMBOLS.length)],
    color: `oklch(${randomBetween(0.75, 0.88).toFixed(2)} 0.18 ${randomBetween(75, 95).toFixed(0)})`,
  }));
}

// ── Floating Hearts Background ──────────────────────────────────────────────

function FloatingHearts({ hearts }: { hearts: Heart[] }) {
  return (
    <>
      {hearts.map((h) => (
        <span
          key={h.id}
          className="heart"
          style={{
            left: `${h.left}%`,
            bottom: "-2rem",
            fontSize: `${h.size}rem`,
            animationDuration: `${h.duration}s`,
            animationDelay: `${h.delay}s`,
          }}
        >
          {h.emoji}
        </span>
      ))}
    </>
  );
}

// ── Butterfly ─────────────────────────────────────────────────────────────

function Butterfly({ className }: { className?: string }) {
  return (
    <div
      className={`butterfly-container pointer-events-none select-none ${className ?? ""}`}
    >
      <span className="butterfly-wing" style={{ fontSize: "2.2rem" }}>
        🦋
      </span>
    </div>
  );
}

// ── Golden Sparkles ────────────────────────────────────────────────────────

function GoldenSparkles({ sparkles }: { sparkles: Sparkle[] }) {
  return (
    <>
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="sparkle"
          style={{
            left: `${s.left}%`,
            top: "-20px",
            fontSize: `${s.size}px`,
            color: s.color,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          }}
        >
          {s.symbol}
        </span>
      ))}
    </>
  );
}

// ── Photo Frame ────────────────────────────────────────────────────────────

const STICKER_POSITIONS = [
  { top: -14, left: -14 },
  { top: -14, right: -14 },
  { bottom: -14, left: -14 },
  { bottom: -14, right: -14 },
] as const;

const COUNTDOWN_DOTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

function PhotoFrame({
  src,
  label,
  stickers,
  frameRef,
  rotate = 0,
}: {
  src: string;
  label: string;
  stickers: string[];
  frameRef?: React.RefObject<HTMLDivElement | null>;
  rotate?: number;
}) {
  return (
    <div
      ref={frameRef}
      className="photo-frame relative"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {/* Outer glow frame */}
      <div
        className="relative rounded-2xl overflow-visible"
        style={{
          boxShadow:
            "0 0 0 4px oklch(0.85 0.12 350), 0 0 0 8px oklch(0.80 0.18 85 / 0.5), 0 8px 32px oklch(0.55 0.22 355 / 0.3)",
        }}
      >
        {/* Frame border gradient */}
        <div
          className="rounded-2xl p-[4px]"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.82 0.18 85), oklch(0.80 0.22 355), oklch(0.82 0.18 85))",
          }}
        >
          <div
            className="rounded-xl overflow-hidden"
            style={{ width: 220, height: 280 }}
          >
            <img
              src={src}
              alt={label}
              className="w-full h-full object-cover"
              style={{ display: "block" }}
            />
          </div>
        </div>
      </div>

      {/* Stickers at corners */}
      {stickers.slice(0, 4).map((s, i) => (
        <span
          key={s}
          className="absolute text-2xl pointer-events-none select-none"
          style={{
            ...STICKER_POSITIONS[i % STICKER_POSITIONS.length],
            zIndex: 10,
          }}
        >
          {s}
        </span>
      ))}

      {/* Label */}
      <p
        className="text-center mt-3 font-semibold text-sm"
        style={{
          color: "oklch(0.55 0.22 355)",
          fontFamily: "Figtree, sans-serif",
        }}
      >
        {label}
      </p>
    </div>
  );
}

// ── SVG Rope ───────────────────────────────────────────────────────────────

function RopeConnector({
  containerRef,
  frame1Ref,
  frame2Ref,
  frame3Ref,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  frame1Ref: React.RefObject<HTMLDivElement | null>;
  frame2Ref: React.RefObject<HTMLDivElement | null>;
  frame3Ref: React.RefObject<HTMLDivElement | null>;
}) {
  const [path, setPath] = useState<string>("");

  useEffect(() => {
    function calcPath() {
      const container = containerRef.current;
      const f1 = frame1Ref.current;
      const f2 = frame2Ref.current;
      const f3 = frame3Ref.current;
      if (!container || !f1 || !f2 || !f3) return;

      const cr = container.getBoundingClientRect();
      const r1 = f1.getBoundingClientRect();
      const r2 = f2.getBoundingClientRect();
      const r3 = f3.getBoundingClientRect();

      const p1 = {
        x: r1.right - cr.left,
        y: r1.top + r1.height / 2 - cr.top,
      };
      const p2 = {
        x: r2.left + r2.width / 2 - cr.left,
        y: r2.bottom - cr.top,
      };
      const p3 = {
        x: r3.left - cr.left,
        y: r3.top + r3.height / 2 - cr.top,
      };

      const cp1x = (p1.x + p2.x) / 2;
      const cp1y = p1.y + 50;
      const cp2x = (p2.x + p3.x) / 2;
      const cp2y = p2.y - 40;

      setPath(
        `M ${p1.x} ${p1.y} Q ${cp1x} ${cp1y} ${p2.x} ${p2.y} Q ${cp2x} ${cp2y} ${p3.x} ${p3.y}`,
      );
    }

    calcPath();
    window.addEventListener("resize", calcPath);
    return () => window.removeEventListener("resize", calcPath);
  }, [containerRef, frame1Ref, frame2Ref, frame3Ref]);

  if (!path) return null;

  return (
    <svg
      className="absolute inset-0 pointer-events-none rope-glow"
      aria-label="Red rope connecting photos"
      role="img"
      style={{ width: "100%", height: "100%", overflow: "visible", zIndex: 0 }}
    >
      <path
        d={path}
        fill="none"
        stroke="oklch(0.42 0.22 22)"
        strokeWidth="3"
        strokeLinecap="round"
        className="rope-path"
      />
    </svg>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────

export default function App() {
  const [hearts] = useState<Heart[]>(() => generateHearts(20));
  const [sparkles] = useState<Sparkle[]>(() => generateSparkles(28));
  const [yesState, setYesState] = useState<YesState>(0);
  const [yesPos, setYesPos] = useState<{ x: number; y: number } | null>(null);
  const [reallyPos, setReallyPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [noShaking, setNoShaking] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [blackScreen, setBlackScreen] = useState(false);
  const [showReallyText, setShowReallyText] = useState(false);
  const [showThinkText, setShowThinkText] = useState(false);
  const [showYesAgain, setShowYesAgain] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const frame1Ref = useRef<HTMLDivElement>(null);
  const frame2Ref = useRef<HTMLDivElement>(null);
  const frame3Ref = useRef<HTMLDivElement>(null);

  // ── Yes button dodge logic ────────────────────────────────────────────────

  const getRandomPos = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const btnW = 140;
    const btnH = 52;
    const margin = 20;
    const x = randomBetween(margin, vw - btnW - margin);
    const y = randomBetween(margin, vh - btnH - margin);
    return { x, y };
  }, []);

  const handleYesDodge = useCallback(() => {
    if (yesState === 4) return;
    setYesPos(getRandomPos());

    if (yesState === 0) {
      setYesState(1);
      setTimeout(() => setShowReallyText(true), 300);
    } else if (yesState === 3) {
      setYesState(4);
      setShowModal(true);
    }
  }, [yesState, getRandomPos]);

  const handleReallyDodge = useCallback(() => {
    setReallyPos(getRandomPos());
    if (yesState === 1) {
      setYesState(2);
      setTimeout(() => setShowThinkText(true), 600);
      setTimeout(() => {
        setShowYesAgain(true);
        setYesState(3);
        setYesPos(getRandomPos());
      }, 2200);
    }
  }, [yesState, getRandomPos]);

  // ── Countdown timer ───────────────────────────────────────────────────────

  useEffect(() => {
    if (!showModal) return;
    setCountdown(10);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setShowModal(false);
          setBlackScreen(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showModal]);

  const handleNoClick = () => {
    setNoShaking(true);
    setTimeout(() => setNoShaking(false), 600);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (blackScreen) {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center"
        style={{ backgroundColor: "#000", zIndex: 9999 }}
      >
        <p
          className="final-text text-4xl md:text-5xl font-bold text-center px-8"
          style={{
            color: "#fff",
            fontFamily: "Fraunces, serif",
            textShadow:
              "0 0 30px rgba(255,255,255,0.5), 0 0 80px rgba(255,200,200,0.4)",
          }}
        >
          Return to DM 😚
        </p>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ backgroundColor: "var(--love-pink-light)" }}
    >
      {/* Floating hearts */}
      <FloatingHearts hearts={hearts} />

      {/* ── Section 1: Hero ─────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16"
        style={{ zIndex: 1 }}
      >
        {/* Butterflies in corners */}
        <div className="fixed top-4 left-4" style={{ zIndex: 50 }}>
          <Butterfly />
        </div>
        <div className="fixed bottom-8 right-4" style={{ zIndex: 50 }}>
          <Butterfly />
        </div>
        <div className="fixed top-24 right-8" style={{ zIndex: 50 }}>
          <Butterfly />
        </div>

        {/* Floating photo thumbnails */}
        <div
          className="fixed top-16 left-8 rounded-2xl overflow-hidden pointer-events-none"
          style={{
            width: 70,
            height: 88,
            boxShadow: "0 4px 20px oklch(0.55 0.22 355 / 0.3)",
            border: "3px solid oklch(0.82 0.18 85)",
            animation: "butterfly-float 5s ease-in-out infinite",
            zIndex: 5,
          }}
        >
          <img
            src="/assets/generated/photo-placeholder-1.dim_300x380.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div
          className="fixed bottom-24 left-12 rounded-2xl overflow-hidden pointer-events-none"
          style={{
            width: 60,
            height: 76,
            boxShadow: "0 4px 20px oklch(0.55 0.22 355 / 0.3)",
            border: "3px solid oklch(0.78 0.15 350)",
            animation: "butterfly-float 6s ease-in-out infinite 1s",
            zIndex: 5,
          }}
        >
          <img
            src="/assets/generated/photo-placeholder-2.dim_300x380.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div
          className="fixed top-32 right-12 rounded-2xl overflow-hidden pointer-events-none"
          style={{
            width: 65,
            height: 82,
            boxShadow: "0 4px 20px oklch(0.55 0.22 355 / 0.3)",
            border: "3px solid oklch(0.82 0.18 85)",
            animation: "butterfly-float 4.5s ease-in-out infinite 2s",
            zIndex: 5,
          }}
        >
          <img
            src="/assets/generated/photo-placeholder-3.dim_300x380.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        {/* Main love message card */}
        <div
          className="relative max-w-xl w-full mx-auto fade-in-up"
          style={{ zIndex: 10 }}
        >
          {/* Outer glow ring */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.82 0.18 85 / 0.4), oklch(0.80 0.22 355 / 0.4))",
              filter: "blur(12px)",
              transform: "scale(1.04)",
            }}
          />

          <div
            className="relative rounded-3xl p-8 md:p-10"
            style={{
              background:
                "linear-gradient(160deg, oklch(1 0.01 355 / 0.88), oklch(0.97 0.04 350 / 0.92))",
              backdropFilter: "blur(20px)",
              border: "1.5px solid oklch(0.82 0.12 355 / 0.6)",
              boxShadow:
                "0 8px 40px oklch(0.55 0.22 355 / 0.18), inset 0 1px 0 oklch(1 0 0 / 0.6)",
            }}
          >
            {/* Decorative top hearts */}
            <div className="flex justify-center gap-2 mb-4 text-lg">
              💗 💕 💗
            </div>

            <p
              className="text-center leading-relaxed text-base md:text-lg"
              style={{
                fontFamily: "Fraunces, serif",
                color: "oklch(0.32 0.12 355)",
                fontWeight: 500,
                letterSpacing: "0.01em",
              }}
            >
              meri cute{" "}
              <span
                className="glow-text"
                style={{ color: "oklch(0.52 0.25 355)", fontWeight: 700 }}
              >
                jashan darling
              </span>{" "}
              I luvv you so much buggu 💕
            </p>

            <p
              className="text-center mt-4 leading-relaxed text-base md:text-lg"
              style={{
                fontFamily: "Instrument Serif, serif",
                color: "oklch(0.38 0.10 355)",
                fontStyle: "italic",
              }}
            >
              Loving you isn&apos;t a choice anymore…
              <br />
              it&apos;s the most natural thing my heart knows how to do 🌸
            </p>

            <p
              className="text-center mt-4 leading-relaxed text-sm md:text-base"
              style={{
                fontFamily: "Fraunces, serif",
                color: "oklch(0.42 0.12 355)",
              }}
            >
              tuhi bahut sohne oo tusi bahut good hearted person oo really 🤍
            </p>

            <p
              className="text-center mt-4 leading-relaxed text-base md:text-lg"
              style={{
                fontFamily: "Instrument Serif, serif",
                color: "oklch(0.38 0.10 355)",
                fontStyle: "italic",
              }}
            >
              I don&apos;t know what the future holds, but I know one thing —
              <br />
              if you&apos;re with me,{" "}
              <span style={{ color: "oklch(0.50 0.25 355)", fontWeight: 700 }}>
                every moment will feel like home.
              </span>{" "}
              🤍
            </p>

            {/* Decorative bottom hearts */}
            <div className="flex justify-center gap-2 mt-5 text-lg">
              💝 💖 💝
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div
          className="mt-10 flex flex-col items-center gap-2"
          style={{ zIndex: 10 }}
        >
          <p
            className="scroll-hint text-sm font-semibold tracking-widest uppercase"
            style={{
              color: "oklch(0.58 0.22 355)",
              fontFamily: "Figtree, sans-serif",
            }}
          >
            please scroll me ↓
          </p>
        </div>
      </section>

      {/* ── Section 2: Photo Gallery ─────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.95 0.04 350) 0%, oklch(0.97 0.02 355) 100%)",
          zIndex: 1,
        }}
      >
        {/* Golden sparkles */}
        <GoldenSparkles sparkles={sparkles} />

        <h2
          className="text-2xl md:text-3xl font-bold text-center mb-4 fade-in"
          style={{
            fontFamily: "Fraunces, serif",
            color: "oklch(0.45 0.20 355)",
            zIndex: 5,
            position: "relative",
          }}
        >
          🌸 Our Beautiful Memories 🌸
        </h2>

        <p
          className="text-center mb-10 text-sm"
          style={{
            color: "oklch(0.58 0.15 355)",
            fontFamily: "Figtree, sans-serif",
            zIndex: 5,
            position: "relative",
          }}
        >
          Every photo tells a story of us ✨
        </p>

        {/* Photo frames + rope */}
        <div
          ref={containerRef}
          className="relative flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 w-full max-w-3xl"
          style={{ zIndex: 5 }}
        >
          {/* Rope overlay */}
          <RopeConnector
            containerRef={containerRef}
            frame1Ref={frame1Ref}
            frame2Ref={frame2Ref}
            frame3Ref={frame3Ref}
          />

          <PhotoFrame
            src="/assets/generated/photo-placeholder-1.dim_300x380.jpg"
            label="💕 Jashan's Photo 1 💕"
            stickers={["🌸", "✨", "💕", "🎀"]}
            frameRef={frame1Ref}
            rotate={-3}
          />

          <PhotoFrame
            src="/assets/generated/photo-placeholder-2.dim_300x380.jpg"
            label="🦋 Jashan's Photo 2 🦋"
            stickers={["🦋", "💖", "🌟", "🎀"]}
            frameRef={frame2Ref}
            rotate={2}
          />

          <PhotoFrame
            src="/assets/generated/photo-placeholder-3.dim_300x380.jpg"
            label="🌺 Jashan's Photo 3 🌺"
            stickers={["🌺", "💝", "⭐", "✨"]}
            frameRef={frame3Ref}
            rotate={-2}
          />
        </div>

        {/* Scroll down hint */}
        <p
          className="scroll-hint mt-14 text-sm font-semibold tracking-widest uppercase"
          style={{
            color: "oklch(0.58 0.22 355)",
            fontFamily: "Figtree, sans-serif",
            zIndex: 5,
            position: "relative",
          }}
        >
          keep going ↓ 💗
        </p>
      </section>

      {/* ── Section 3: The Question ──────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.94 0.06 350) 0%, oklch(0.97 0.03 0) 100%)",
          zIndex: 1,
        }}
      >
        <div
          className="relative max-w-lg w-full mx-auto flex flex-col items-center gap-8"
          style={{ zIndex: 10 }}
        >
          {/* Question text */}
          <h2
            className="text-3xl md:text-4xl font-bold text-center"
            style={{
              fontFamily: "Fraunces, serif",
              color: "oklch(0.38 0.20 355)",
              textShadow: "0 2px 12px oklch(0.80 0.15 355 / 0.3)",
            }}
          >
            Can u be my love forever? 💕
          </h2>

          <p
            className="text-center text-sm"
            style={{
              color: "oklch(0.55 0.15 355)",
              fontFamily: "Figtree, sans-serif",
            }}
          >
            Choose carefully... 🥺
          </p>

          {/* Button area */}
          <div className="relative w-full flex flex-col items-center gap-4">
            {/* NO button — fixed in layout */}
            <button
              type="button"
              data-ocid="no.secondary_button"
              className={`px-8 py-3 rounded-full font-semibold text-base transition-all ${noShaking ? "no-shake" : ""}`}
              style={{
                background: "oklch(0.88 0.06 350)",
                color: "oklch(0.50 0.15 355)",
                border: "2px solid oklch(0.75 0.12 350)",
                fontFamily: "Figtree, sans-serif",
                cursor: "pointer",
              }}
              onClick={handleNoClick}
            >
              No 😢
            </button>

            {/* Think again text */}
            {showThinkText && (
              <p
                className="fade-in text-base font-semibold"
                style={{
                  color: "oklch(0.48 0.18 355)",
                  fontFamily: "Fraunces, serif",
                  fontStyle: "italic",
                }}
              >
                Think again. 🤔
              </p>
            )}

            {/* Really? button — floating */}
            {showReallyText && yesState >= 1 && yesState <= 2 && (
              <button
                type="button"
                data-ocid="really.primary_button"
                className="px-8 py-3 rounded-full font-semibold text-base"
                style={{
                  position: reallyPos ? "fixed" : "relative",
                  left: reallyPos ? reallyPos.x : undefined,
                  top: reallyPos ? reallyPos.y : undefined,
                  background:
                    "linear-gradient(135deg, oklch(0.82 0.18 85), oklch(0.75 0.22 355))",
                  color: "white",
                  border: "none",
                  fontFamily: "Fraunces, serif",
                  cursor: "pointer",
                  zIndex: 200,
                  boxShadow: "0 4px 16px oklch(0.55 0.22 355 / 0.4)",
                  transition: "none",
                }}
                onClick={handleReallyDodge}
                onMouseEnter={handleReallyDodge}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleReallyDodge();
                }}
              >
                Really? 🥺
              </button>
            )}

            {/* YES button — floating or fixed */}
            {(yesState === 0 || yesState === 3 || yesState === 4) && (
              <button
                type="button"
                data-ocid={
                  yesState === 3 || yesState === 4
                    ? "yes_final.primary_button"
                    : "yes.primary_button"
                }
                className={`px-8 py-3 rounded-full font-bold text-base ${yesState === 3 ? "yes-pulse" : ""}`}
                style={{
                  position: yesPos ? "fixed" : "relative",
                  left: yesPos ? yesPos.x : undefined,
                  top: yesPos ? yesPos.y : undefined,
                  background:
                    "linear-gradient(135deg, oklch(0.65 0.25 355), oklch(0.55 0.28 350))",
                  color: "white",
                  border: "none",
                  fontFamily: "Fraunces, serif",
                  cursor: "pointer",
                  zIndex: 200,
                  boxShadow: "0 4px 20px oklch(0.55 0.25 355 / 0.5)",
                  fontSize: yesState === 3 ? "1.1rem" : undefined,
                  transition: "none",
                }}
                onClick={handleYesDodge}
                onMouseEnter={() => {
                  if (yesState !== 3 && yesState !== 4) handleYesDodge();
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleYesDodge();
                }}
              >
                {yesState === 3 ? "Yes? 💕" : "Yes 💕"}
              </button>
            )}

            {/* Yes? text hint when it's the final state */}
            {showYesAgain && yesState === 3 && (
              <p
                className="fade-in text-xs text-center"
                style={{
                  color: "oklch(0.62 0.18 355)",
                  fontFamily: "Figtree, sans-serif",
                }}
              >
                (psst... catch it! 🌸)
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Modal Popup ──────────────────────────────────────────────────── */}
      {showModal && (
        <div
          data-ocid="popup.modal"
          className="fixed inset-0 flex items-center justify-center"
          style={{
            zIndex: 9999,
            backgroundColor: "oklch(0 0 0 / 0.5)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            className="modal-pop relative rounded-3xl p-10 max-w-sm w-full mx-4 flex flex-col items-center text-center gap-6"
            style={{
              background:
                "linear-gradient(160deg, oklch(1 0.01 355), oklch(0.95 0.06 350))",
              boxShadow:
                "0 12px 60px oklch(0.55 0.25 355 / 0.5), inset 0 1px 0 oklch(1 0 0 / 0.8)",
              border: "2px solid oklch(0.82 0.12 355 / 0.5)",
            }}
          >
            {/* Floating hearts inside modal */}
            <div className="text-3xl flex gap-2 animate-pulse">💕 🫶🏻 💕</div>

            <h3
              className="text-2xl font-bold"
              style={{
                fontFamily: "Fraunces, serif",
                color: "oklch(0.40 0.22 355)",
              }}
            >
              Thanks a lot, myy jann 🫶🏻
            </h3>

            <p
              style={{
                color: "oklch(0.52 0.15 355)",
                fontFamily: "Instrument Serif, serif",
                fontStyle: "italic",
              }}
            >
              You made my heart so happy 💖
            </p>

            {/* Countdown */}
            <div
              className="flex flex-col items-center gap-1"
              style={{ zIndex: 1 }}
            >
              <div
                className="text-6xl font-bold glow-text"
                style={{
                  fontFamily: "Fraunces, serif",
                  color: "oklch(0.52 0.25 355)",
                }}
              >
                {countdown}
              </div>
              <p
                className="text-xs font-medium tracking-wider uppercase"
                style={{
                  color: "oklch(0.62 0.15 355)",
                  fontFamily: "Figtree, sans-serif",
                }}
              >
                seconds of love ✨
              </p>
            </div>

            {/* Progress dots */}
            <div className="flex gap-1.5">
              {COUNTDOWN_DOTS.map((n) => (
                <div
                  key={n}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: 8,
                    height: 8,
                    backgroundColor:
                      n <= countdown
                        ? "oklch(0.65 0.25 355)"
                        : "oklch(0.88 0.05 350)",
                  }}
                />
              ))}
            </div>

            <p
              className="text-xs"
              style={{
                color: "oklch(0.65 0.12 355)",
                fontFamily: "Figtree, sans-serif",
              }}
            >
              Going somewhere special...
            </p>
          </div>
        </div>
      )}

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer
        className="relative text-center py-6 px-4"
        style={{
          background: "oklch(0.92 0.05 350)",
          zIndex: 1,
          borderTop: "1px solid oklch(0.85 0.08 350)",
        }}
      >
        <p
          className="text-xs"
          style={{
            color: "oklch(0.60 0.15 355)",
            fontFamily: "Figtree, sans-serif",
          }}
        >
          Made with 💗 for{" "}
          <span style={{ color: "oklch(0.52 0.22 355)", fontWeight: 700 }}>
            Jashan
          </span>{" "}
          • © {new Date().getFullYear()} •{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              typeof window !== "undefined" ? window.location.hostname : "",
            )}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: "oklch(0.55 0.20 355)" }}
          >
            Built with love using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
