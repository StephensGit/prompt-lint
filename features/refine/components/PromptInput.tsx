'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Sparkles, Wand2, X } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Field, FieldError } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import type { RefineStatus } from '@/features/refine/hooks/useRefineStream';
import {
  type RefineRequest,
  RefineRequestSchema,
} from '@/features/refine/schema';
import { EXAMPLES } from '@/lib/examples';

interface PromptInputProps {
  onRefine: (data: RefineRequest, exampleId: string | null) => void;
  onClear?: () => void;
  status?: RefineStatus;
}

export function PromptInput({
  onRefine,
  onClear,
  status = 'idle',
}: PromptInputProps) {
  const isLoading = status === 'loading' || status === 'streaming';
  const [selectedExampleId, setSelectedExampleId] = useState<string | null>(
    null,
  );

  const form = useForm<RefineRequest>({
    resolver: zodResolver(RefineRequestSchema),
    defaultValues: { prompt: '' },
    mode: 'onChange',
  });

  const promptValue = form.watch('prompt') ?? '';
  const isEmpty = promptValue.trim().length === 0;
  const charCount = promptValue.length;
  const wordCount = promptValue.trim().split(/\s+/).filter(Boolean).length;

  function handleExampleClick(exampleId: string) {
    const example = EXAMPLES.find((e) => e.id === exampleId);
    if (!example) {
      return;
    }
    setSelectedExampleId(exampleId);
    form.setValue('prompt', example.input, { shouldValidate: true });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      form.handleSubmit((data) => onRefine(data, selectedExampleId))();
    }
  }

  function handleClear() {
    setSelectedExampleId(null);
    form.reset();
    onClear?.();
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-(--border-strong) bg-card shadow-sm transition-[border-color,box-shadow] focus-within:border-primary/70 focus-within:ring-[3px] focus-within:ring-ring/16">
      <Controller
        name="prompt"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-0">
            <Textarea
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder='Paste your rough prompt…  e.g. "the status dropdown keeps its value when you switch tabs, it should reset. fix it"'
              className="min-h-[172px] resize-none rounded-none border-0 px-[22px] py-[18px] font-mono text-[14.5px] leading-[1.72] shadow-none focus-visible:ring-0"
              rows={6}
              onKeyDown={handleKeyDown}
              onChange={(e) => {
                field.onChange(e);
                // Typing after selecting an example means the user has diverged — clear demo flag.
                setSelectedExampleId(null);
              }}
            />
            {fieldState.invalid && (
              <FieldError
                errors={[fieldState.error]}
                className="px-[22px] pb-2"
              />
            )}
          </Field>
        )}
      />

      <div className="flex flex-col gap-1.5 border-t border-border pl-[22px] pr-3 pb-3 pt-2.5">
        {/* Chip row: stat text + example chips (or clear), wraps naturally */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="select-none whitespace-nowrap text-[12px] text-muted-foreground tabular-nums">
            {isEmpty
              ? 'No input yet'
              : `${charCount} chars · ${wordCount} words`}
          </span>

          {/* Four example chips — shown only when the composer is empty */}
          {isEmpty &&
            EXAMPLES.map((example) => (
              <Button
                key={example.id}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleExampleClick(example.id)}
              >
                <Wand2 />
                {example.label}&nbsp;·&nbsp;{example.tag}
              </Button>
            ))}

          {/* Clear — shown when there is text and not loading */}
          {!isEmpty && !isLoading && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
            >
              <X />
              Clear
            </Button>
          )}
        </div>

        {/* Action row: kbd hint + Refine, always sits below on its own line */}
        <div className="flex items-center justify-end gap-2.5">
          <kbd className="inline-flex items-center rounded-[5px] border border-border bg-muted px-1.5 py-0.5 font-mono text-[10.5px] text-muted-foreground">
            ⌘↵
          </kbd>
          <Button
            type="button"
            disabled={!form.formState.isValid || isLoading}
            onClick={form.handleSubmit((data) =>
              onRefine(data, selectedExampleId),
            )}
            className="relative h-11 gap-2 overflow-hidden px-[18px] text-[13.5px] font-[550]"
          >
            {/* Diagonal shimmer sweep while the request is in flight */}
            {isLoading && (
              <span
                className="pointer-events-none absolute inset-0 -translate-x-full animate-[sweep_1.15s_ease-in-out_infinite]"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, hsl(0 0% 100% / 0.18), transparent)',
                }}
                aria-hidden="true"
              />
            )}
            {status === 'loading' ? (
              <>
                <Loader2 className="h-[15px] w-[15px] animate-[spin_0.7s_linear_infinite]" />
                Analysing…
              </>
            ) : status === 'streaming' ? (
              <>
                <Loader2 className="h-[15px] w-[15px] animate-[spin_0.7s_linear_infinite]" />
                Refining…
              </>
            ) : (
              <>
                <Sparkles className="h-[15px] w-[15px]" />
                Refine
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
