import {
  type RefinedSection,
  type SectionKey,
  splitSections,
} from '@/features/refine/utils/refined-prompt';
import { cn } from '@/lib/utils';

interface SectionStyle {
  /** Left accent bar colour. */
  bar: string;
  /** Uppercase label colour. */
  label: string;
  /** Soft hue tint behind the block (light / dark). */
  tint: string;
}

// Per the design comps, only Scope / Acceptance / Guardrail carry a hue (left
// 3px bar + tinted box). Goal and Constraints render bare — a muted label and
// plain body, no bar or tint.
const HUE_STYLES: Partial<Record<SectionKey, SectionStyle>> = {
  scope: {
    bar: 'border-l-[hsl(var(--hue1))]',
    label: 'text-[hsl(var(--hue1))]',
    tint: 'bg-[hsl(var(--hue1)/0.10)] dark:bg-[hsl(var(--hue1)/0.16)]',
  },
  acceptance: {
    bar: 'border-l-[hsl(var(--hue2))]',
    label: 'text-[hsl(var(--hue2))]',
    tint: 'bg-[hsl(var(--hue2)/0.10)] dark:bg-[hsl(var(--hue2)/0.16)]',
  },
  guardrail: {
    bar: 'border-l-[hsl(var(--hue3))]',
    label: 'text-[hsl(var(--hue3))]',
    tint: 'bg-[hsl(var(--hue3)/0.10)] dark:bg-[hsl(var(--hue3)/0.16)]',
  },
};

interface RefinedPromptProps {
  /** The refined prompt text decoded so far (may be partial mid-stream). */
  text: string;
  /** Whether tokens are still arriving — drives the trailing caret. */
  isStreaming: boolean;
}

/** A blinking caret at the live end of the stream (guarded for reduced motion). */
function Caret() {
  return (
    <span
      aria-hidden
      className="ml-0.5 inline-block h-[1.05em] w-[8px] translate-y-[2px] bg-primary align-baseline motion-safe:animate-pulse"
    />
  );
}

export function RefinedPrompt({ text, isStreaming }: RefinedPromptProps) {
  const { preamble, sections } = splitSections(text);

  // Before the first heading lands, show the raw stream so the user sees
  // immediate progress — no JSON wrapper, just the decoded text + caret.
  if (sections.length === 0) {
    return (
      <div className="max-w-[70ch] whitespace-pre-wrap font-mono text-[14.5px] leading-[1.72] text-foreground">
        {preamble}
        {isStreaming && <Caret />}
      </div>
    );
  }

  return (
    <div className="flex max-w-[70ch] flex-col gap-3">
      {sections.map((section, index) => (
        <SectionBlock
          key={section.key}
          section={section}
          showCaret={isStreaming && index === sections.length - 1}
        />
      ))}
    </div>
  );
}

function SectionBlock({
  section,
  showCaret,
}: {
  section: RefinedSection;
  showCaret: boolean;
}) {
  const style = HUE_STYLES[section.key];
  return (
    <section
      className={
        style
          ? cn('rounded-md border-l-[3px] p-4', style.bar, style.tint)
          : undefined
      }
    >
      <h3
        className={cn(
          'mb-2 text-[11px] font-semibold uppercase tracking-[0.06em]',
          style ? style.label : 'text-muted-foreground',
        )}
      >
        {section.label}
      </h3>
      <div className="whitespace-pre-wrap font-mono text-[14.5px] leading-[1.72] text-foreground">
        {section.body}
        {showCaret && <Caret />}
      </div>
    </section>
  );
}
