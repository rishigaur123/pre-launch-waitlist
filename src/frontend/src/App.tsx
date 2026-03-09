import { useCallback, useEffect, useRef, useState } from "react";
import { useActor } from "./hooks/useActor";

const WORDS = [
  "HARD",
  "EASY",
  "LONG",
  "FAST",
  "SLOW",
  "SHORT",
  "TRAILS",
  "HILLS",
  "BEACH",
  "RAIN",
  "SNOW",
  "SUN",
  "WIND",
  "EARLY",
  "LATE",
  "SMILING",
  "CRYING",
  "LAUGHING",
  "SOLO",
  "TOGETHER",
  "HERE",
  "THERE",
  "UP",
  "DOWN",
  "TODAY",
] as const;

type InputState = "idle" | "loading" | "success" | "error";

// Controls the fade-in/out of the animated word for smooth transitions
const FADE_DURATION_MS = 150;

function randomInterval() {
  return Math.floor(Math.random() * 200 + 200); // 200–400ms
}

export default function App() {
  const { actor } = useActor();
  const [wordIndex, setWordIndex] = useState(0);
  const [wordVisible, setWordVisible] = useState(true);
  const [email, setEmail] = useState("");
  const [inputState, setInputState] = useState<InputState>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cycling phrases with randomized interval + fade transition
  useEffect(() => {
    function schedule() {
      timerRef.current = setTimeout(() => {
        // Fade out, swap word, fade in
        setWordVisible(false);
        setTimeout(() => {
          setWordIndex((prev) => (prev + 1) % WORDS.length);
          setWordVisible(true);
        }, FADE_DURATION_MS);
        schedule();
      }, randomInterval());
    }
    schedule();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim() || inputState !== "idle" || !actor) return;

      setInputState("loading");

      try {
        await actor.addEmail(email.trim());
        setInputState("success");
        setTimeout(() => {
          setEmail("");
          setInputState("idle");
        }, 2000);
      } catch {
        setInputState("error");
        setTimeout(() => {
          setInputState("idle");
        }, 1800);
      }
    },
    [email, inputState, actor],
  );

  const inputClassName = [
    "waitlist-input",
    inputState === "success" ? "waitlist-input--success" : "",
    inputState === "error" ? "waitlist-input--error" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const placeholderText =
    inputState === "success"
      ? "You're in."
      : inputState === "error"
        ? "Something went wrong."
        : "Your community is waiting.";

  const isDisabled = inputState === "loading" || inputState === "success";

  // The longest word in the list is "LAUGHING" / "TOGETHER" (8 chars).
  // "WE DO TOGETHER" = 14 chars + gaps. We need all three to fit on one line.
  // Using min(13vw, 20vh) keeps every word visible at any viewport ratio.
  const BG_FONT_SIZE = "min(13vw, 20vh)";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#000000",
        overflow: "hidden",
      }}
    >
      {/* Centered column: horizontal text row + email input below */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2.5rem",
          width: "100vw",
        }}
      >
        {/* Horizontal text row: WE DO [CYCLING WORD] */}
        <div
          aria-hidden="true"
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "baseline",
            gap: "0.18em",
            width: "100%",
            overflow: "visible",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          <span
            style={{
              color: "#222222",
              fontSize: BG_FONT_SIZE,
              fontWeight: 900,
              fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            WE
          </span>
          <span
            style={{
              color: "#222222",
              fontSize: BG_FONT_SIZE,
              fontWeight: 900,
              fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            DO
          </span>
          <span
            style={{
              color: "#222222",
              fontSize: BG_FONT_SIZE,
              fontWeight: 900,
              fontFamily: "'Cabinet Grotesk', system-ui, sans-serif",
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
              lineHeight: 1,
              whiteSpace: "nowrap",
              display: "inline-block",
              opacity: wordVisible ? 1 : 0,
              transition: `opacity ${FADE_DURATION_MS}ms ease`,
              // Reserve space for the longest word so layout doesn't shift
              minWidth: "0",
            }}
          >
            {WORDS[wordIndex]}
          </span>
        </div>

        {/* Email input below the text row */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
          data-ocid="waitlist.panel"
        >
          <div
            style={{ position: "relative" }}
            data-ocid={
              inputState === "success"
                ? "waitlist.success_state"
                : inputState === "error"
                  ? "waitlist.error_state"
                  : undefined
            }
          >
            <input
              type="email"
              required
              value={inputState === "success" ? "" : email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholderText}
              disabled={isDisabled}
              className={inputClassName}
              data-ocid="waitlist.input"
              autoComplete="email"
              style={{
                display: "block",
                width: "clamp(260px, 36vw, 480px)",
                background:
                  inputState === "success"
                    ? "rgba(0, 20, 10, 0.6)"
                    : "rgba(0, 0, 0, 0.35)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                color:
                  inputState === "success"
                    ? "rgba(100, 255, 150, 0.9)"
                    : "#ffffff",
                fontSize: "1rem",
                fontFamily: "'General Sans', system-ui, sans-serif",
                fontWeight: 400,
                letterSpacing: "0.01em",
                padding: "0.85rem 1.4rem",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "6px",
                outline: "none",
                cursor: isDisabled ? "default" : "text",
                transition: "background 0.4s ease, color 0.3s ease",
              }}
            />
          </div>

          {/* Hidden submit button for form semantics / Enter key handling */}
          <button
            type="submit"
            data-ocid="waitlist.submit_button"
            disabled={isDisabled}
            style={{
              position: "absolute",
              width: 0,
              height: 0,
              opacity: 0,
              pointerEvents: "none",
              overflow: "hidden",
            }}
            aria-hidden="true"
            tabIndex={-1}
          />
        </form>
      </div>
    </div>
  );
}
