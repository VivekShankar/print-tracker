import React, { useState, useEffect, useMemo } from "react";

// ============ Color palette (matches deck) ============
const FOREST = "#1F3A2B";
const MOSS = "#5A7D3F";
const SAGE = "#A8C09A";
const CREAM = "#F5F1E8";
const WARM = "#FAF6ED";
const INK = "#1A1A1A";
const MUTE = "#6B7270";
const ACCENT = "#C84B31";

// ============ Math constants ============
const SHEETS_PER_TREE = 8333; // Conservatree's standard
const WEEKS_PER_YEAR_ACADEMIC = 30; // 3 quarters × 10 weeks (matches deck math)

const DAYS = [
  { key: "mon", label: "Mon", full: "Monday" },
  { key: "tue", label: "Tue", full: "Tuesday" },
  { key: "wed", label: "Wed", full: "Wednesday" },
  { key: "thu", label: "Thu", full: "Thursday" },
  { key: "fri", label: "Fri", full: "Friday" },
  { key: "sat", label: "Sat", full: "Saturday" },
  { key: "sun", label: "Sun", full: "Sunday" },
];

const STORAGE_KEY = "print-tracker:current-week";

// ============ Hook: track viewport width ============
function useIsMobile(breakpoint = 600) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < breakpoint;
  });
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);
  return isMobile;
}

// ============ Press-feedback button ============
// Renders a button that visibly responds to taps (scale + brightness change)
// even on mobile where :hover doesn't fire.
function TapButton({ children, onClick, ariaLabel, variant = "primary", style = {} }) {
  const [pressed, setPressed] = useState(false);

  const baseStyle = {
    minHeight: 44, // iOS / Material guideline
    minWidth: 44,
    border: 0,
    borderRadius: 6,
    cursor: "pointer",
    fontFamily: "Calibri, Helvetica, sans-serif",
    fontWeight: 700,
    fontSize: 16,
    transition: "transform 80ms ease-out, background 120ms, box-shadow 120ms",
    transform: pressed ? "scale(0.94)" : "scale(1)",
    userSelect: "none",
    WebkitTapHighlightColor: "transparent",
    touchAction: "manipulation",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const variants = {
    primary: {
      background: pressed ? "#3F5A2A" : MOSS,
      color: CREAM,
      boxShadow: pressed ? "inset 0 2px 4px rgba(0,0,0,0.2)" : "none",
    },
    secondary: {
      background: pressed ? "#E8DEC8" : "white",
      color: FOREST,
      border: `1px solid ${SAGE}`,
      boxShadow: pressed ? "inset 0 2px 4px rgba(0,0,0,0.1)" : "none",
    },
    accent: {
      background: pressed ? "#A53A26" : ACCENT,
      color: CREAM,
    },
    ghost: {
      background: pressed ? "rgba(0,0,0,0.05)" : "transparent",
      color: MUTE,
      border: `1px solid ${MUTE}`,
    },
  };

  return (
    <button
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      aria-label={ariaLabel}
      style={{ ...baseStyle, ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
}

// ============ Tree visualization ============
function TreeVisual({ vitality }) {
  const v = Math.max(0, Math.min(1, vitality));
  const appleOpacity = Math.max(0, (v - 0.6) / 0.4);
  const leafOpacity = Math.max(0, (v - 0.3) / 0.4);
  const trunkOpacity = Math.max(0, (v - 0.1) / 0.2);
  const stumpOpacity = 1 - Math.min(1, v / 0.3);

  return (
    <svg viewBox="0 0 300 320" style={{ width: "100%", height: "auto", display: "block" }}>
      <line x1="20" y1="290" x2="280" y2="290" stroke="#8B9A7B" strokeWidth="1.5" strokeLinecap="round" />
      <g opacity={stumpOpacity}>
        <path d="M 130 290 Q 128 270 132 255 L 168 255 Q 172 270 170 290 Z" fill="#5C3A1F" />
        <ellipse cx="150" cy="255" rx="22" ry="6" fill="#7A5238" stroke="#3D2817" strokeWidth="1" />
        <ellipse cx="150" cy="255" rx="16" ry="4" fill="none" stroke="#3D2817" strokeWidth="0.8" opacity="0.7" />
        <ellipse cx="150" cy="255" rx="9" ry="2" fill="none" stroke="#3D2817" strokeWidth="0.8" opacity="0.7" />
      </g>
      <g opacity={trunkOpacity}>
        <path d="M 132 290 Q 128 220 134 150 Q 138 110 142 90 L 158 90 Q 162 110 166 150 Q 172 220 168 290 Z" fill="#5C3A1F" />
        <path d="M 132 290 Q 128 220 134 150 Q 138 110 142 90 L 150 90 Q 146 110 142 150 Q 138 220 142 290 Z" fill="#3D2817" opacity="0.4" />
      </g>
      <g opacity={leafOpacity}>
        <ellipse cx="150" cy="80" rx="80" ry="60" fill="#7A9B5A" opacity="0.8" />
        <ellipse cx="105" cy="100" rx="40" ry="35" fill="#7A9B5A" opacity="0.8" />
        <ellipse cx="195" cy="100" rx="40" ry="35" fill="#7A9B5A" opacity="0.8" />
        <ellipse cx="150" cy="75" rx="72" ry="52" fill={MOSS} />
        <ellipse cx="110" cy="95" rx="34" ry="30" fill={MOSS} />
        <ellipse cx="190" cy="95" rx="34" ry="30" fill={MOSS} />
        <ellipse cx="125" cy="105" rx="25" ry="15" fill="#3F5A2A" opacity="0.4" />
        <ellipse cx="170" cy="110" rx="28" ry="17" fill="#3F5A2A" opacity="0.4" />
      </g>
      <g opacity={appleOpacity}>
        {[
          [115, 70], [145, 55], [175, 65], [200, 80], [125, 90],
          [165, 95], [195, 100], [105, 100], [150, 110], [180, 115],
        ].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="6" fill={ACCENT} />
            <ellipse cx={cx - 1.5} cy={cy - 1.5} rx="1.8" ry="1.3" fill="#E87A5E" opacity="0.8" />
            <path
              d={`M ${cx + 0.5} ${cy - 5.5} Q ${cx + 1.5} ${cy - 8} ${cx + 3} ${cy - 7.5}`}
              stroke="#3D2817" strokeWidth="0.8" fill="none" strokeLinecap="round"
            />
          </g>
        ))}
      </g>
    </svg>
  );
}

// ============ Day row — responsive layout ============
function DayRow({ day, count, onDelta, onSet, isMobile }) {
  const isActive = count > 0;

  return (
    <div
      style={{
        padding: isMobile ? "8px 8px" : "10px 12px",
        background: isActive ? "#F0EBDC" : "transparent",
        borderRadius: 6,
        transition: "background 200ms ease",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {/* Top line: day name + summary */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <div
          style={{
            fontFamily: "Calibri, Helvetica, sans-serif",
            fontSize: 14,
            fontWeight: 700,
            color: FOREST,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          {day.label}
        </div>
        <div
          style={{
            fontSize: 12,
            color: isActive ? ACCENT : MUTE,
            fontFamily: "Calibri, Helvetica, sans-serif",
            fontStyle: isActive ? "normal" : "italic",
            fontWeight: isActive ? 700 : 400,
          }}
        >
          {isActive ? `${count} pages` : "no prints yet"}
        </div>
      </div>

      {/* Controls row: full-width flex */}
      <div
        style={{
          display: "flex",
          gap: isMobile ? 4 : 6,
          alignItems: "stretch",
        }}
      >
        <TapButton
          onClick={() => onDelta(-10)}
          ariaLabel={`Decrease ${day.full} by 10`}
          variant="secondary"
          style={{ flex: "0 0 auto", minWidth: isMobile ? 40 : 48, fontSize: 13 }}
        >
          −10
        </TapButton>
        <TapButton
          onClick={() => onDelta(-1)}
          ariaLabel={`Decrease ${day.full} by 1`}
          variant="secondary"
          style={{ flex: "0 0 auto", minWidth: isMobile ? 36 : 44, fontSize: 20, fontWeight: 700 }}
        >
          −
        </TapButton>
        <input
          type="number"
          inputMode="numeric"
          min="0"
          value={count}
          onChange={(e) => onSet(e.target.value)}
          onFocus={(e) => e.target.select()}
          aria-label={`${day.full} page count`}
          style={{
            flex: "1 1 auto",
            minWidth: 0,
            minHeight: 44,
            textAlign: "center",
            border: `1px solid ${SAGE}`,
            borderRadius: 6,
            fontFamily: "Georgia, serif",
            fontSize: 18,
            fontWeight: 700,
            color: isActive ? ACCENT : INK,
            background: "white",
            padding: "0 4px",
            WebkitAppearance: "none",
            MozAppearance: "textfield",
          }}
        />
        <TapButton
          onClick={() => onDelta(1)}
          ariaLabel={`Increase ${day.full} by 1`}
          variant="primary"
          style={{ flex: "0 0 auto", minWidth: isMobile ? 36 : 44, fontSize: 22, fontWeight: 700 }}
        >
          +
        </TapButton>
        <TapButton
          onClick={() => onDelta(10)}
          ariaLabel={`Increase ${day.full} by 10`}
          variant="primary"
          style={{ flex: "0 0 auto", minWidth: isMobile ? 40 : 48, fontSize: 13 }}
        >
          +10
        </TapButton>
      </div>
    </div>
  );
}

// ============ Main component ============
export default function PrintTracker() {
  const isMobile = useIsMobile(640);

  const [counts, setCounts] = useState({
    mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0,
  });
  const [hasLoaded, setHasLoaded] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          setCounts((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch (e) {
      // start fresh
    } finally {
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
    } catch (e) {
      // fail silently
    }
  }, [counts, hasLoaded]);

  const weekTotal = useMemo(
    () => Object.values(counts).reduce((a, b) => a + b, 0),
    [counts]
  );

  const projectedAnnual = weekTotal * WEEKS_PER_YEAR_ACADEMIC;
  const projectedTrees = projectedAnnual / SHEETS_PER_TREE;

  const vitality = useMemo(() => {
    if (projectedAnnual === 0) return 1.0;
    const maxRefPages = 10000;
    return Math.max(0, 1 - projectedAnnual / maxRefPages);
  }, [projectedAnnual]);

  const treeStatus = useMemo(() => {
    if (weekTotal === 0) return "Tree is thriving.";
    if (projectedTrees < 0.25) return "A few apples have dropped.";
    if (projectedTrees < 0.5) return "The leaves are thinning.";
    if (projectedTrees < 0.75) return "The branches are bare.";
    if (projectedTrees < 1.0) return "Half a tree, gone.";
    if (projectedTrees < 1.5) return "A full tree, every year.";
    return "More than a tree, every year.";
  }, [weekTotal, projectedTrees]);

  const updateDay = (key, delta) => {
    setCounts((prev) => {
      const next = Math.max(0, prev[key] + delta);
      return { ...prev, [key]: next };
    });
  };

  const setDay = (key, value) => {
    const num = parseInt(value, 10);
    setCounts((prev) => ({
      ...prev,
      [key]: isNaN(num) || num < 0 ? 0 : num,
    }));
  };

  const reset = () => {
    setCounts({ mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 });
    setShowResetConfirm(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: CREAM,
        fontFamily: "Georgia, 'Times New Roman', serif",
        color: INK,
        padding: isMobile ? "20px 12px" : "32px 16px",
        overflowX: "hidden",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <header style={{ marginBottom: isMobile ? 24 : 32 }}>
          <div
            style={{
              fontSize: 11,
              fontFamily: "Calibri, Helvetica, sans-serif",
              letterSpacing: 3,
              color: MOSS,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            PRINT LESS · WEEKLY TRACKER
          </div>
          <h1
            style={{
              fontSize: isMobile ? 28 : 40,
              fontWeight: 700,
              color: FOREST,
              margin: 0,
              lineHeight: 1.15,
              letterSpacing: -0.5,
            }}
          >
            How much are you really printing?
          </h1>
          <p
            style={{
              fontSize: isMobile ? 14 : 15,
              color: MUTE,
              fontStyle: "italic",
              marginTop: 12,
              marginBottom: 0,
              fontFamily: "Calibri, Helvetica, sans-serif",
            }}
          >
            Log your prints each day this week. Watch the projection update live.
          </p>
        </header>

        <section
          style={{
            background: WARM,
            border: `1px solid ${SAGE}`,
            borderLeft: `4px solid ${weekTotal === 0 ? MOSS : ACCENT}`,
            padding: isMobile ? "20px 18px" : "28px 24px",
            marginBottom: isMobile ? 16 : 24,
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 180px",
            gap: isMobile ? 16 : 24,
            alignItems: "center",
          }}
        >
          <div style={{ order: isMobile ? 2 : 1 }}>
            <div
              style={{
                fontSize: 11,
                fontFamily: "Calibri, Helvetica, sans-serif",
                letterSpacing: 2.5,
                color: MOSS,
                fontWeight: 700,
                marginBottom: 6,
              }}
            >
              YOUR TREE
            </div>
            <div
              style={{
                fontSize: isMobile ? 20 : 22,
                fontWeight: 700,
                color: FOREST,
                fontStyle: "italic",
                lineHeight: 1.2,
                marginBottom: 12,
              }}
            >
              {treeStatus}
            </div>
            <div
              style={{
                fontSize: 13,
                color: MUTE,
                fontFamily: "Calibri, Helvetica, sans-serif",
                lineHeight: 1.5,
              }}
            >
              {weekTotal === 0
                ? "No prints logged yet. Add some below to see what your habit costs."
                : `Each tree produces about ${SHEETS_PER_TREE.toLocaleString()} sheets of copy paper. At your current pace, you're personally responsible for ${projectedTrees.toFixed(2)} ${projectedTrees === 1 ? "tree" : "trees"} every academic year.`}
            </div>
          </div>
          <div
            style={{
              width: isMobile ? "60%" : 180,
              maxWidth: 220,
              margin: isMobile ? "0 auto" : 0,
              order: isMobile ? 1 : 2,
            }}
          >
            <TreeVisual vitality={vitality} />
          </div>
        </section>

        <section
          style={{
            background: "white",
            border: `1px solid ${SAGE}`,
            padding: isMobile ? "18px 14px 16px" : "24px 24px 20px",
            marginBottom: isMobile ? 16 : 24,
            borderRadius: 4,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 14,
              flexWrap: "wrap",
              gap: 6,
            }}
          >
            <h2
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: FOREST,
                margin: 0,
                fontFamily: "Calibri, Helvetica, sans-serif",
                letterSpacing: 1.5,
                textTransform: "uppercase",
              }}
            >
              This Week
            </h2>
            <div
              style={{
                fontSize: 11,
                color: MUTE,
                fontStyle: "italic",
                fontFamily: "Calibri, Helvetica, sans-serif",
              }}
            >
              Tap −/+ or type a number
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {DAYS.map((day) => (
              <DayRow
                key={day.key}
                day={day}
                count={counts[day.key]}
                onDelta={(delta) => updateDay(day.key, delta)}
                onSet={(value) => setDay(day.key, value)}
                isMobile={isMobile}
              />
            ))}
          </div>

          <div
            style={{
              marginTop: 16,
              paddingTop: 14,
              borderTop: `1px solid ${SAGE}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <div
              style={{
                fontFamily: "Calibri, Helvetica, sans-serif",
                fontSize: 13,
                color: MUTE,
                letterSpacing: 1,
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              Week Total
            </div>
            <div
              style={{
                fontSize: isMobile ? 28 : 32,
                fontWeight: 700,
                color: weekTotal > 0 ? ACCENT : FOREST,
                fontFamily: "Georgia, serif",
              }}
            >
              {weekTotal}{" "}
              <span
                style={{
                  fontSize: 14,
                  color: MUTE,
                  fontStyle: "italic",
                  fontWeight: 400,
                }}
              >
                pages
              </span>
            </div>
          </div>
        </section>

        <section
          style={{
            background: FOREST,
            color: CREAM,
            padding: isMobile ? "20px 18px" : "28px 24px",
            marginBottom: isMobile ? 16 : 24,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontFamily: "Calibri, Helvetica, sans-serif",
              letterSpacing: 3,
              color: SAGE,
              fontWeight: 700,
              marginBottom: 14,
            }}
          >
            AT THIS PACE — ANNUAL PROJECTION
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: isMobile ? 18 : 24,
              alignItems: "baseline",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: isMobile ? 36 : 44,
                  fontWeight: 700,
                  color: CREAM,
                  fontFamily: "Georgia, serif",
                  lineHeight: 1,
                }}
              >
                {projectedAnnual.toLocaleString()}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  color: SAGE,
                  fontFamily: "Calibri, Helvetica, sans-serif",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                pages / year
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 11,
                  fontFamily: "Calibri, Helvetica, sans-serif",
                  fontStyle: "italic",
                  color: SAGE,
                  opacity: 0.75,
                }}
              >
                {weekTotal} pp/wk × 30 wks/year (3 quarters × 10 weeks)
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: isMobile ? 36 : 44,
                  fontWeight: 700,
                  color: ACCENT,
                  fontFamily: "Georgia, serif",
                  lineHeight: 1,
                }}
              >
                {projectedTrees < 0.01
                  ? "0"
                  : projectedTrees.toFixed(projectedTrees < 1 ? 2 : 1)}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  color: SAGE,
                  fontFamily: "Calibri, Helvetica, sans-serif",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                {projectedTrees === 1 ? "tree / year" : "trees / year"}
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 11,
                  color: SAGE,
                  fontFamily: "Calibri, Helvetica, sans-serif",
                  fontStyle: "italic",
                  opacity: 0.75,
                }}
              >
                ÷ {SHEETS_PER_TREE.toLocaleString()} sheets/tree
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 8,
            paddingBottom: 24,
            flexWrap: "wrap",
            gap: 14,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: MUTE,
              fontStyle: "italic",
              fontFamily: "Calibri, Helvetica, sans-serif",
              maxWidth: 380,
              flex: "1 1 200px",
              lineHeight: 1.5,
            }}
          >
            Sources: Conservatree (sheets/tree); academic-year math from Strategic
            Communication midterm. Data is stored locally on your device only.
          </div>
          {!showResetConfirm ? (
            <TapButton
              onClick={() => setShowResetConfirm(true)}
              ariaLabel="Start a new week"
              variant="ghost"
              style={{
                padding: "10px 16px",
                fontSize: 12,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              Start a new week
            </TapButton>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <TapButton
                onClick={reset}
                ariaLabel="Confirm reset"
                variant="accent"
                style={{
                  padding: "10px 16px",
                  fontSize: 12,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                Yes, reset
              </TapButton>
              <TapButton
                onClick={() => setShowResetConfirm(false)}
                ariaLabel="Cancel reset"
                variant="ghost"
                style={{
                  padding: "10px 16px",
                  fontSize: 12,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                Cancel
              </TapButton>
            </div>
          )}
        </section>

        <footer
          style={{
            borderTop: `1px solid ${SAGE}`,
            paddingTop: 18,
            paddingBottom: 8,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: isMobile ? 14 : 16,
              fontStyle: "italic",
              color: FOREST,
              fontFamily: "Georgia, serif",
              lineHeight: 1.5,
            }}
          >
            Every page you don't print{" "}
            <span style={{ color: ACCENT, fontWeight: 700 }}>
              is a tree that's still standing.
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
