"use client";

import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MODE_ICONS } from "@/lib/mode-icons";
import type { Mode } from "@/lib/prompts";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  buildVanishSnapshot,
  prefersReducedMotion,
  runVanishAnimation,
  type VanishAnimationHandle,
} from "@/lib/vanish-particles";

const SPRING_TRANSITION =
  "max-width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), height 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
const SMOOTH_HEIGHT_TRANSITION =
  "max-width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), height 0.15s ease-out";
const SPRING_EASE = "cubic-bezier(0.175, 0.885, 0.32, 1.275)";

const MODES = Object.keys(MODE_ICONS) as Mode[];

function MorphingText({ text }: { text: string }) {
  const [width, setWidth] = useState<number | "auto">("auto");
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (spanRef.current) {
      setWidth(spanRef.current.offsetWidth);
    }
  }, [text]);

  return (
    <span
      className="relative inline-flex items-center justify-center overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
      style={{ width }}
    >
      <span ref={spanRef} className="invisible whitespace-nowrap px-0.5">
        {text}
      </span>
      <span
        key={text}
        className="absolute inset-0 flex items-center justify-center whitespace-nowrap animate-in fade-in zoom-in-95 duration-300"
      >
        {text}
      </span>
    </span>
  );
}

function ArrowUpIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M7 12V2M7 2L2.5 6.5M7 2L11.5 6.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect
        x="5"
        y="1"
        width="4"
        height="7"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M2.75 6.5V7a4.25 4.25 0 0 0 8.5 0v-.5M7 11.25V13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" fill="currentColor" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M7 2.5V11.5M2.5 7H11.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ModeButton({
  mode,
  label,
  isActive,
  disabled,
  onSelect,
}: {
  mode: Mode;
  label: string;
  isActive: boolean;
  disabled?: boolean;
  onSelect: (mode: Mode) => void;
}) {
  const Icon = MODE_ICONS[mode];

  const content = (
    <>
      <Icon
        className={cn(
          "size-3.5 shrink-0 transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
          isActive
            ? "scale-100 text-primary"
            : "scale-[0.92] opacity-80 group-hover:scale-105 group-hover:opacity-100",
        )}
        strokeWidth={isActive ? 2.35 : 1.9}
        aria-hidden="true"
      />
      <span
        className={cn(
          "grid transition-[grid-template-columns,opacity] duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
          isActive ? "grid-cols-[1fr] opacity-100" : "grid-cols-[0fr] opacity-0",
        )}
      >
        <span className="overflow-hidden">
          <span className="block text-xs font-semibold whitespace-nowrap select-none">
            {isActive ? (
              <MorphingText text={label} />
            ) : (
              <span className="px-0.5">{label}</span>
            )}
          </span>
        </span>
      </span>
    </>
  );

  const buttonClassName = cn(
    "group relative flex h-7 shrink-0 items-center overflow-hidden rounded-full outline-none",
    "transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
    "disabled:pointer-events-none disabled:opacity-40",
    isActive
      ? "gap-1.5 bg-primary/15 pr-2.5 pl-2 text-primary shadow-[inset_0_0_0_1px] shadow-primary/30"
      : "w-7 justify-center text-foreground/55 hover:bg-accent/70 hover:text-foreground",
  );

  // Active mode already reveals its label inline — skip redundant tooltip.
  if (isActive) {
    return (
      <button
        type="button"
        disabled={disabled}
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(mode);
        }}
        aria-pressed={isActive}
        aria-label={label}
        className={buttonClassName}
      >
        {content}
      </button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        delay={280}
        closeDelay={80}
        disabled={disabled}
        render={
          <button
            type="button"
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(mode);
            }}
            aria-pressed={isActive}
            aria-label={label}
            className={buttonClassName}
          />
        }
      >
        {content}
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={8}
        className="border border-border/40 px-2 py-1 text-[11px] font-medium tracking-wide shadow-sm"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export interface PromptInputProps {
  onSubmit?: (value: string) => void;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  activeMode?: Mode | null;
  onModeChange?: (mode: Mode) => void;
  getModeLabel?: (mode: Mode) => string;
  isStreaming?: boolean;
  onStop?: () => void;
  canSend?: boolean;
  onAttachClick?: () => void;
  attachDisabled?: boolean;
  /** Custom attach control (e.g. 3D folder). Falls back to the default + button. */
  attachSlot?: React.ReactNode;
  mono?: boolean;
  clearOnSubmit?: boolean;
}

export type PromptInputHandle = {
  focus: () => void;
};

export const PromptInput = React.forwardRef<PromptInputHandle, PromptInputProps>(
  function PromptInput(
    {
      onSubmit,
      placeholder = "Ask anything",
      className,
      defaultValue = "",
      value: controlledValue,
      onChange,
      activeMode = null,
      onModeChange,
      getModeLabel = (mode) => mode,
      isStreaming = false,
      onStop,
      canSend = true,
      onAttachClick,
      attachDisabled = false,
      attachSlot,
      mono = false,
      clearOnSubmit = false,
    },
    ref,
  ) {
    const [expanded, setExpanded] = useState(false);
    const [isSmoothResize, setIsSmoothResize] = useState(false);
    const [localValue, setLocalValue] = useState(defaultValue);

    const [isRecording, setIsRecording] = useState(false);
    const [audioData, setAudioData] = useState<number[]>(new Array(5).fill(0));
    const valueRef = useRef(
      controlledValue !== undefined ? controlledValue : localValue,
    );

    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const rafRef = useRef<number | null>(null);
    const recognitionRef = useRef<{
      stop: () => void;
      start: () => void;
      onresult: ((event: unknown) => void) | null;
      onerror: ((event: unknown) => void) | null;
      onend: (() => void) | null;
      continuous: boolean;
      interimResults: boolean;
    } | null>(null);
    const demoIntervalRef = useRef<number | null>(null);
    const demoTextIntervalRef = useRef<number | null>(null);

    const [textareaHeight, setTextareaHeight] = useState(68);
    const [isScrolling, setIsScrolling] = useState(false);
    const [isVanishing, setIsVanishing] = useState(false);

    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : localValue;
    const hasValue = value.trim() !== "";
    const isOpen =
      expanded || hasValue || isRecording || isStreaming || isVanishing;
    const containerHeight = Math.max(116, textareaHeight + 48);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const vanishCanvasRef = useRef<HTMLCanvasElement>(null);
    const vanishHandleRef = useRef<VanishAnimationHandle | null>(null);
    const internalContainerRef = useRef<HTMLDivElement>(null);
    const topFadeRef = useRef<HTMLDivElement>(null);
    const bottomFadeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      valueRef.current = value;
    }, [value]);

    React.useImperativeHandle(ref, () => ({
      focus: () => {
        setIsSmoothResize(false);
        setExpanded(true);
        requestAnimationFrame(() => {
          textareaRef.current?.focus();
        });
      },
    }));

    const updateFades = () => {
      const el = textareaRef.current;
      if (!el) return;
      const { scrollTop, scrollHeight, clientHeight } = el;
      if (topFadeRef.current) {
        topFadeRef.current.style.opacity = Math.min(scrollTop / 20, 1).toString();
      }
      if (bottomFadeRef.current) {
        const bottomScroll = scrollHeight - clientHeight - scrollTop;
        bottomFadeRef.current.style.opacity = Math.min(
          Math.max(bottomScroll - 16, 0) / 10,
          1,
        ).toString();
      }
    };

    const handleValueChange = useCallback(
      (val: string) => {
        setIsSmoothResize(true);
        if (!isControlled) setLocalValue(val);
        onChange?.(val);
        if (val.trim() !== "") {
          setExpanded(true);
        }
      },
      [isControlled, onChange],
    );

    const expand = () => {
      setIsSmoothResize(false);
      setExpanded(true);
    };

    const stopRecording = useCallback(() => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current) {
        void audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (demoIntervalRef.current) {
        window.clearInterval(demoIntervalRef.current);
        demoIntervalRef.current = null;
      }
      if (demoTextIntervalRef.current) {
        window.clearInterval(demoTextIntervalRef.current);
        demoTextIntervalRef.current = null;
      }
      setIsRecording(false);
      setAudioData(new Array(5).fill(0));
    }, []);

    const startRecording = useCallback(async () => {
      if (isStreaming) return;

      setIsSmoothResize(false);
      setExpanded(true);

      let stream: MediaStream | null = null;
      try {
        if (navigator.mediaDevices?.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        }
      } catch {
        // Fall through to simulated mode when mic is unavailable.
      }

      setIsRecording(true);

      function simulateText() {
        const fakeText =
          "Can you review this function for readability and edge cases?";
        const words = fakeText.split(" ");
        let i = 0;
        let currentBase = valueRef.current;
        demoTextIntervalRef.current = window.setInterval(() => {
          if (i < words.length) {
            currentBase = (currentBase ? `${currentBase} ` : "") + words[i];
            handleValueChange(currentBase);
            i++;
          } else {
            stopRecording();
          }
        }, 300);
      }

      if (stream) {
        streamRef.current = stream;

        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateVisualizer = () => {
          analyser.getByteFrequencyData(dataArray);
          const bands = new Array(5).fill(0);
          const step = Math.floor(dataArray.length / 5);
          for (let i = 0; i < 5; i++) {
            let sum = 0;
            for (let j = 0; j < step; j++) {
              sum += dataArray[i * step + j];
            }
            bands[i] = sum / step / 255;
          }
          setAudioData(bands);
          rafRef.current = requestAnimationFrame(updateVisualizer);
        };
        updateVisualizer();

        const SpeechRecognitionCtor =
          (
            window as unknown as {
              SpeechRecognition?: new () => NonNullable<
                typeof recognitionRef.current
              >;
              webkitSpeechRecognition?: new () => NonNullable<
                typeof recognitionRef.current
              >;
            }
          ).SpeechRecognition ||
          (
            window as unknown as {
              webkitSpeechRecognition?: new () => NonNullable<
                typeof recognitionRef.current
              >;
            }
          ).webkitSpeechRecognition;

        if (SpeechRecognitionCtor) {
          const recognition = new SpeechRecognitionCtor();
          recognition.continuous = true;
          recognition.interimResults = true;

          let baseline = valueRef.current;

          recognition.onresult = (event: unknown) => {
            const speechEvent = event as {
              resultIndex: number;
              results: ArrayLike<{
                isFinal: boolean;
                0: { transcript: string };
              }>;
            };
            let interimTranscript = "";
            let finalTranscript = "";

            for (
              let i = speechEvent.resultIndex;
              i < speechEvent.results.length;
              ++i
            ) {
              if (speechEvent.results[i].isFinal) {
                finalTranscript += speechEvent.results[i][0].transcript;
              } else {
                interimTranscript += speechEvent.results[i][0].transcript;
              }
            }

            if (finalTranscript) {
              baseline += (baseline ? " " : "") + finalTranscript;
            }

            handleValueChange(
              (
                baseline + (interimTranscript ? ` ${interimTranscript}` : "")
              ).trim(),
            );
          };

          recognition.onerror = () => {
            stopRecording();
          };

          recognition.onend = () => {
            stopRecording();
          };

          recognitionRef.current = recognition;
          recognition.start();
        } else {
          simulateText();
        }
      } else {
        demoIntervalRef.current = window.setInterval(() => {
          setAudioData(
            Array.from({ length: 5 }, () => Math.random() * 0.8 + 0.1),
          );
        }, 100);
        simulateText();
      }
    }, [handleValueChange, isStreaming, stopRecording]);

    useEffect(() => {
      if (isRecording && textareaRef.current) {
        textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
      }
    }, [value, isRecording]);

    useEffect(() => {
      return () => {
        stopRecording();
        vanishHandleRef.current?.cancel();
        vanishHandleRef.current = null;
        if (textareaRef.current) {
          textareaRef.current.style.clipPath = "";
        }
      };
    }, [stopRecording]);

    useEffect(() => {
      if (isOpen && !isRecording && !isStreaming && !isVanishing) {
        const timer = setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            const length = textareaRef.current.value.length;
            textareaRef.current.setSelectionRange(length, length);
          }
        }, 50);
        return () => clearTimeout(timer);
      }
    }, [isOpen, isRecording, isStreaming, isVanishing]);

    useEffect(() => {
      if (!textareaRef.current) return;
      const el = textareaRef.current;

      const currentHeight = el.style.height;
      el.style.transition = "none";
      el.style.height = "0px";
      const scrollHeight = el.scrollHeight;
      el.style.height = currentHeight;
      void el.offsetHeight;
      el.style.transition = "";

      const newHeight = Math.max(68, Math.min(scrollHeight, 160));
      el.style.height = `${newHeight}px`;

      setTextareaHeight(newHeight);
      setIsScrolling(scrollHeight > 160);

      setTimeout(updateFades, 0);
    }, [value, isOpen]);

    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
      if (
        internalContainerRef.current &&
        internalContainerRef.current.contains(e.relatedTarget as Node)
      ) {
        return;
      }
      if (value.trim() === "" && !isRecording && !isStreaming) {
        setIsSmoothResize(false);
        setExpanded(false);
      }
    };

    const resetVanishClip = useCallback(() => {
      const el = textareaRef.current;
      if (el) {
        el.style.clipPath = "";
      }
    }, []);

    const applyVanishClip = useCallback((pos: number, bufferWidth: number) => {
      const el = textareaRef.current;
      if (!el || bufferWidth <= 0) return;
      const rightInset = Math.max(
        0,
        Math.min(100, (1 - pos / bufferWidth) * 100),
      );
      el.style.clipPath = `inset(0 ${rightInset}% 0 0)`;
    }, []);

    const finishVanish = useCallback(() => {
      resetVanishClip();
      setIsVanishing(false);
      vanishHandleRef.current = null;
      if (clearOnSubmit) {
        handleValueChange("");
        setExpanded(false);
      }
    }, [clearOnSubmit, handleValueChange, resetVanishClip]);

    const handleSubmit = useCallback(() => {
      if (
        !hasValue ||
        !canSend ||
        isStreaming ||
        isRecording ||
        isVanishing
      ) {
        return;
      }

      const submitted = value;
      setIsSmoothResize(false);
      onSubmit?.(submitted);

      const textarea = textareaRef.current;
      const canvas = vanishCanvasRef.current;

      if (
        prefersReducedMotion() ||
        !textarea ||
        !canvas
      ) {
        if (clearOnSubmit) {
          handleValueChange("");
          setExpanded(false);
        }
        return;
      }

      const snapshot = buildVanishSnapshot(textarea, submitted, {
        accentColor: getComputedStyle(document.documentElement)
          .getPropertyValue("--primary")
          .trim(),
      });

      if (!snapshot) {
        if (clearOnSubmit) {
          handleValueChange("");
          setExpanded(false);
        }
        return;
      }

      vanishHandleRef.current?.cancel();
      setIsVanishing(true);

      // Align the display canvas to the live textarea box.
      canvas.style.width = `${textarea.clientWidth}px`;
      canvas.style.height = `${textarea.clientHeight}px`;

      vanishHandleRef.current = runVanishAnimation(canvas, snapshot, {
        onSweep: applyVanishClip,
        onComplete: finishVanish,
      });
    }, [
      applyVanishClip,
      canSend,
      clearOnSubmit,
      finishVanish,
      handleValueChange,
      hasValue,
      isRecording,
      isStreaming,
      isVanishing,
      onSubmit,
      value,
    ]);

    const showStop = isRecording || isStreaming;
    const showArrow =
      ((hasValue || isStreaming || isVanishing) && !isRecording) && !showStop;
    const showMic = !hasValue && !isRecording && !isStreaming && !isVanishing;
    const actionDisabled =
      isVanishing ||
      (!isRecording &&
        !isStreaming &&
        !(hasValue && canSend) &&
        !showMic);

    const onActionButtonClick = (e: React.MouseEvent) => {
      e.preventDefault();
      if (isStreaming) {
        onStop?.();
        return;
      }
      if (isRecording) {
        stopRecording();
      } else if (hasValue && !isVanishing) {
        handleSubmit();
      } else if (!isVanishing) {
        void startRecording();
      }
    };

    return (
      <div
        ref={internalContainerRef}
        onBlur={handleBlur}
        className={cn("relative flex w-full flex-col", className)}
      >
        <div
            onMouseDown={(e) => {
              const isTextarea = e.target === textareaRef.current;
              if (isOpen && !isTextarea && !isRecording) {
                e.preventDefault();
                textareaRef.current?.focus();
              }
            }}
            style={{
              borderRadius: 24,
              height: isOpen ? containerHeight : 48,
              transition: isSmoothResize
                ? SMOOTH_HEIGHT_TRANSITION
                : SPRING_TRANSITION,
              overflow: isOpen ? "visible" : "hidden",
            }}
            className={cn(
              "relative z-10 w-full border border-border bg-card shadow-sm",
              "focus-within:border-ring/40 focus-within:ring-1 focus-within:ring-ring/20 hover:border-border/80",
              isOpen ? "cursor-text" : "cursor-default",
            )}
          >
          <style
            dangerouslySetInnerHTML={{
              __html: `
              .prompt-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; background: transparent; }
              .prompt-scrollbar::-webkit-scrollbar-track { background: transparent; }
              .prompt-scrollbar::-webkit-scrollbar-thumb { background: transparent; border-radius: 4px; }
              .prompt-scrollbar:hover::-webkit-scrollbar-thumb { background: color-mix(in oklch, var(--muted-foreground) 30%, transparent); }
            `,
            }}
          />

          <canvas
            ref={vanishCanvasRef}
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute top-0 left-0 z-[3] origin-top-left",
              isVanishing ? "opacity-100" : "opacity-0",
            )}
          />

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              if (!isVanishing) handleValueChange(e.target.value);
            }}
            onScroll={updateFades}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !isStreaming &&
                !isVanishing
              ) {
                e.preventDefault();
                handleSubmit();
              }
              if (e.key === "Escape" && value.trim() === "" && !isVanishing) {
                setIsSmoothResize(false);
                setExpanded(false);
              }
            }}
            placeholder={placeholder}
            aria-label="Prompt"
            disabled={isRecording || isStreaming || isVanishing}
            dir="ltr"
            spellCheck={false}
            style={{
              transition: isSmoothResize
                ? "height 0.15s ease-out"
                : `opacity 0.3s ease-out, transform 0.3s ease-out, height 0.4s ${SPRING_EASE}`,
            }}
            className={cn(
              "prompt-scrollbar absolute inset-x-0 top-0 z-[1] w-full resize-none bg-transparent py-3.5 pr-12 pl-4 text-sm leading-[22px] text-foreground outline-none placeholder:font-medium placeholder:text-muted-foreground/80",
              mono && "font-mono text-xs leading-relaxed",
              isOpen
                ? "translate-y-0 scale-100 opacity-100"
                : "pointer-events-none -translate-y-1 scale-95 opacity-0",
              isScrolling ? "overflow-y-auto" : "overflow-y-hidden",
              (isRecording || isStreaming) && "pointer-events-none opacity-70",
              isVanishing && "caret-transparent",
            )}
          />

          <div
            ref={topFadeRef}
            className={cn(
              "pointer-events-none absolute top-0 left-4 z-[2] h-8 bg-gradient-to-b from-card via-card/90 to-transparent right-12",
              isVanishing && "opacity-0!",
            )}
          />
          <div
            ref={bottomFadeRef}
            className={cn(
              "pointer-events-none absolute left-4 z-[2] h-8 bg-gradient-to-t from-card via-card/90 to-transparent right-12",
              isVanishing && "opacity-0!",
            )}
            style={{
              opacity: 0,
              top: `${textareaHeight - 32}px`,
              transition: isSmoothResize
                ? "top 0.15s ease-out"
                : `top 0.4s ${SPRING_EASE}`,
            }}
          />

          <button
            type="button"
            onClick={expand}
            style={{
              transition: isSmoothResize
                ? "none"
                : `all 0.4s ${SPRING_EASE}`,
            }}
            className={cn(
              "absolute inset-x-0 top-0 z-[1] cursor-text py-[15px] pr-12 pl-4 text-left text-sm leading-[17px] font-medium text-muted-foreground/80 outline-none",
              !isOpen
                ? "translate-y-0 scale-100 opacity-100"
                : "pointer-events-none translate-y-1 scale-105 opacity-0",
            )}
            aria-label="Open prompt input"
          >
            {placeholder}
          </button>

          <div
            className={cn(
              "absolute right-12 bottom-2 left-3 z-[10] flex items-center gap-0.5 transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
              isOpen && !isRecording && !isVanishing
                ? "pointer-events-auto translate-y-0 opacity-100 blur-0"
                : "pointer-events-none translate-y-2 opacity-0 blur-sm",
            )}
          >
            <div className="prompt-scrollbar flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto pr-1">
              {MODES.map((mode) => (
                <ModeButton
                  key={mode}
                  mode={mode}
                  label={getModeLabel(mode)}
                  isActive={activeMode === mode}
                  disabled={isStreaming || isVanishing}
                  onSelect={(next) => onModeChange?.(next)}
                />
              ))}
            </div>

            {attachSlot ? (
              <div className="ml-auto shrink-0">{attachSlot}</div>
            ) : onAttachClick ? (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  onAttachClick();
                }}
                disabled={attachDisabled || isStreaming || isVanishing}
                className="ml-auto flex size-7 shrink-0 items-center justify-center rounded-full text-foreground/50 outline-none transition-all duration-200 hover:bg-accent/60 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                aria-label="Attach file"
              >
                <PlusIcon />
              </button>
            ) : null}
          </div>

          <div
            className={cn(
              "absolute right-12 bottom-2 z-[10] flex h-8 items-center justify-end gap-[3px] transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
              isRecording
                ? "w-16 translate-x-0 opacity-100"
                : "pointer-events-none w-0 translate-x-4 opacity-0",
            )}
          >
            {audioData.map((val, i) => (
              <div
                key={i}
                className="w-1 rounded-full bg-primary transition-[height] duration-75 ease-out"
                style={{ height: `${Math.max(4, val * 24)}px` }}
              />
            ))}
          </div>

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={onActionButtonClick}
            disabled={actionDisabled}
            aria-label={
              showStop && isStreaming
                ? "Stop generating"
                : showStop
                  ? "Stop recording"
                  : showArrow
                    ? "Send prompt"
                    : "Use voice input"
            }
            style={{ borderRadius: 9999 }}
            className={cn(
              "absolute right-2 bottom-2 z-[10] flex h-8 w-8 items-center justify-center outline-none transition-all duration-300",
              "focus-visible:ring-2 focus-visible:ring-ring",
              showStop && isStreaming
                ? "bg-destructive text-destructive-foreground hover:opacity-90"
                : "bg-primary text-primary-foreground hover:opacity-90",
              actionDisabled && "opacity-40",
              isVanishing && "scale-95 opacity-80",
            )}
          >
            <span className="relative flex h-full w-full items-center justify-center">
              <span
                className={cn(
                  "absolute inset-0 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
                  showArrow
                    ? "scale-100 rotate-0 opacity-100 blur-none"
                    : "pointer-events-none scale-50 rotate-45 opacity-0 blur-[1px]",
                )}
              >
                <ArrowUpIcon />
              </span>
              <span
                className={cn(
                  "absolute inset-0 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
                  showMic
                    ? "scale-100 rotate-0 opacity-100 blur-none"
                    : "pointer-events-none scale-50 -rotate-45 opacity-0 blur-[1px]",
                )}
              >
                <MicIcon />
              </span>
              <span
                className={cn(
                  "absolute inset-0 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]",
                  showStop
                    ? "scale-100 rotate-0 opacity-100 blur-none"
                    : "pointer-events-none scale-50 rotate-45 opacity-0 blur-[1px]",
                )}
              >
                <StopIcon />
              </span>
            </span>
          </button>
        </div>
      </div>
    );
  },
);

PromptInput.displayName = "PromptInput";
