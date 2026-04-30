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

// ============ Tree visualization ============
function TreeVisual({ vitality }) {
  const v = Math.max(0, Math.min(1, vitality));
  const appleOpacity = Math.max(0, (v - 0.6) / 0.4);
  const leafOpacity = Math.max(0, (v - 0.3) / 0.4);
  const trunkOpacity = Math.max(0, (v - 0.1) / 0.2);
  const stumpOpacity = 1 - Math.min(1, v / 0.3);

  return (
    <svg viewBox="0 0 300 320" style={{ width: "100%", height: "auto" }}>
      <line
        x1="20"
        y1="290"
        x2="280"
        y2="290"
        stroke="#8B9A7B"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <g opacity={stumpOpacity}>
        <path
          d="M 130 290 Q 128 270 132 255 L 168 255 Q 172 270 170 290 Z"
          fill="#5C3A1F"
        />
        <ellipse
          cx="150"
          cy="255"
          rx="22"
          ry="6"
          fill="#7A5238"
          stroke="#3D2817"
          strokeWidth="1"
        />
        <ellipse
          cx="150"
          cy="255"
          rx="16"
          ry="4"
          fill="none"
          stroke="#3D2817"
          strokeWidth="0.8"
          opacity="0.7"
        />
        <ellipse
          cx="150"
          cy="255"
          rx="9"
          ry="2"
          fill="none"
          stroke="#3D2817"
          strokeWidth="0.8"
          opacity="0.7"
        />
      </g>
      <g opacity={trunkOpacity}>
        <path
          d="M 132 290 Q 128 220 134 150 Q 138 110 142 90 L 158 90 Q 162 110 166 150 Q 172 220 168 290 Z"
          fill="#5C3A1F"
        />
        <path
          d="M 132 290 Q 128 220 134 150 Q 138 110 142 90 L 150 90 Q 146 110 142 150 Q 138 220 142 290 Z"
          fill="#3D2817"
          opacity="0.4"
        />
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
            <ellipse
              cx={cx - 1.5}
              cy={cy - 1.5}
              rx="1.8"
              ry="1.3"
              fill="#E87A5E"
              opacity="0.8"
            />
            <path
              d={`M ${cx + 0.5} ${cy - 5.5} Q ${cx + 1.5} ${cy - 8} ${cx + 3} ${cy - 7.5}`}
              stroke="#3D2817"
              strokeWidth="0.8"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        ))}
      </g>
    </svg>
  );
}

// ============ Main component ============
export default function PrintTracker() {
  const [counts, setCounts] = useState({
    mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0,
  });
  const [hasLoaded, setHasLoaded] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate shape before using
        if (parsed && typeof parsed === "object") {
          setCounts((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch (e) {
      // Storage unavailable or parse error — start fresh
    } finally {
      setHasLoaded(true);
    }
  }, []);

  // Persist on change (after initial load)
  useEffect(() => {
    if (!hasLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
    } catch (e) {
      // Quota exceeded or storage disabled — fail silently
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
        padding: "32px 16px",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <header style={{ marginBottom: 32 }}>
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
              fontSize: 40,
              fontWeight: 700,
              color: FOREST,
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: -0.5,
            }}
          >
            How much are you really printing?
          </h1>
          <p
            style={{
              fontSize: 15,
              color: MUTE,
              fontStyle: "italic",
              marginTop: 12,
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
            padding: "28px 24px",
            marginBottom: 24,
            display: "grid",
            gridTemplateColumns: "1fr 180px",
            gap: 24,
            alignItems: "center",
          }}
        >
          <div>
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
                fontSize: 22,
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
          <div style={{ width: 180 }}>
            <TreeVisual vitality={vitality} />
          </div>
        </section>

        <section
          style={{
            background: "white",
            border: `1px solid ${SAGE}`,
            padding: "24px 24px 20px",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 16,
            }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: FOREST,
                margin: 0,
                fontFamily: "Calibri, Helvetica, sans-serif",
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              This Week
            </h2>
            <div
              style={{
                fontSize: 12,
                color: MUTE,
                fontStyle: "italic",
                fontFamily: "Calibri, Helvetica, sans-serif",
              }}
            >
              Tap −/+ or type a number
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {DAYS.map((day) => (
              <div
                key={day.key}
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 1fr auto",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  background: counts[day.key] > 0 ? "#F0EBDC" : "transparent",
                  borderRadius: 4,
                  transition: "background 200ms ease",
                }}
              >
                <div
                  style={{
                    fontFamily: "Calibri, Helvetica, sans-serif",
                    fontSize: 14,
                    fontWeight: 700,
                    color: FOREST,
                    letterSpacing: 1,
                  }}
                >
                  {day.label}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    onClick={() => updateDay(day.key, -10)}
                    aria-label={`Decrease ${day.full} by 10`}
                    style={{
                      width: 36,
                      height: 36,
                      border: `1px solid ${SAGE}`,
                      background: "white",
                      color: FOREST,
                      borderRadius: 4,
                      cursor: "pointer",
                      fontFamily: "Calibri, Helvetica, sans-serif",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    −10
                  </button>
                  <button
                    onClick={() => updateDay(day.key, -1)}
                    aria-label={`Decrease ${day.full} by 1`}
                    style={{
                      width: 36,
                      height: 36,
                      border: `1px solid ${SAGE}`,
                      background: "white",
                      color: FOREST,
                      borderRadius: 4,
                      cursor: "pointer",
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={counts[day.key]}
                    onChange={(e) => setDay(day.key, e.target.value)}
                    onFocus={(e) => e.target.select()}
                    style={{
                      width: 64,
                      height: 36,
                      textAlign: "center",
                      border: `1px solid ${SAGE}`,
                      borderRadius: 4,
                      fontFamily: "Georgia, serif",
                      fontSize: 18,
                      fontWeight: 700,
                      color: counts[day.key] > 0 ? ACCENT : INK,
                      background: "white",
                    }}
                  />
                  <button
                    onClick={() => updateDay(day.key, 1)}
                    aria-label={`Increase ${day.full} by 1`}
                    style={{
                      width: 36,
                      height: 36,
                      border: `1px solid ${MOSS}`,
                      background: MOSS,
                      color: CREAM,
                      borderRadius: 4,
                      cursor: "pointer",
                      fontSize: 18,
                      fontWeight: 700,
                    }}
                  >
                    +
                  </button>
                  <button
                    onClick={() => updateDay(day.key, 10)}
                    aria-label={`Increase ${day.full} by 10`}
                    style={{
                      width: 36,
                      height: 36,
                      border: `1px solid ${MOSS}`,
                      background: MOSS,
                      color: CREAM,
                      borderRadius: 4,
                      cursor: "pointer",
                      fontFamily: "Calibri, Helvetica, sans-serif",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    +10
                  </button>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: MUTE,
                    fontFamily: "Calibri, Helvetica, sans-serif",
                    fontStyle: "italic",
                    textAlign: "right",
                    minWidth: 50,
                  }}
                >
                  {counts[day.key] > 0 ? `${counts[day.key]} pp` : "—"}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 18,
              paddingTop: 16,
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
                fontSize: 32,
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
            padding: "28px 24px",
            marginBottom: 24,
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
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
              alignItems: "baseline",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 44,
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
                  opacity: 0.7,
                }}
              >
                {weekTotal} pp/wk × 30 wks
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: 44,
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
                  opacity: 0.7,
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
            paddingBottom: 32,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: MUTE,
              fontStyle: "italic",
              fontFamily: "Calibri, Helvetica, sans-serif",
              maxWidth: 380,
            }}
          >
            Sources: Conservatree (sheets/tree); academic-year math from Strategic
            Communication midterm. Data is stored locally on your device only.
          </div>
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              style={{
                padding: "8px 16px",
                background: "transparent",
                border: `1px solid ${MUTE}`,
                color: MUTE,
                fontFamily: "Calibri, Helvetica, sans-serif",
                fontSize: 12,
                cursor: "pointer",
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              Start a new week
            </button>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={reset}
                style={{
                  padding: "8px 16px",
                  background: ACCENT,
                  border: `1px solid ${ACCENT}`,
                  color: CREAM,
                  fontFamily: "Calibri, Helvetica, sans-serif",
                  fontSize: 12,
                  cursor: "pointer",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                Yes, reset
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                style={{
                  padding: "8px 16px",
                  background: "transparent",
                  border: `1px solid ${MUTE}`,
                  color: MUTE,
                  fontFamily: "Calibri, Helvetica, sans-serif",
                  fontSize: 12,
                  cursor: "pointer",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </section>

        <footer
          style={{
            borderTop: `1px solid ${SAGE}`,
            paddingTop: 20,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontStyle: "italic",
              color: FOREST,
              fontFamily: "Georgia, serif",
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
