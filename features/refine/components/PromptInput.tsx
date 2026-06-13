'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, Wand2, X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Field, FieldError } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import {
  type RefineRequest,
  RefineRequestSchema,
} from '@/features/refine/schema';

export const EXAMPLE_PROMPT =
  'the status dropdown on the results table keeps its value when you switch tabs, it should reset to default. fix it';

interface PromptInputProps {
  onRefine: (data: RefineRequest) => void;
}

export function PromptInput({ onRefine }: PromptInputProps) {
  const form = useForm<RefineRequest>({
    resolver: zodResolver(RefineRequestSchema),
    defaultValues: { prompt: '' },
    mode: 'onChange',
  });

  const promptValue = form.watch('prompt') ?? '';
  const isEmpty = promptValue.trim().length === 0;
  const charCount = promptValue.length;
  const wordCount = promptValue.trim().split(/\s+/).filter(Boolean).length;

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      form.handleSubmit(onRefine)();
    }
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-(--border-strong) bg-card">
      <Controller
        name="prompt"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-0">
            <Textarea
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder='Paste your rough prompt… e.g. "the status dropdown keeps its value when you switch tabs, it should reset. fix it"'
              className="min-h-[200px] resize-none rounded-none border-0 p-5 font-mono text-[14.5px] leading-[1.72] shadow-none focus-visible:ring-0"
              rows={6}
              onKeyDown={handleKeyDown}
            />
            {fieldState.invalid && (
              <FieldError errors={[fieldState.error]} className="px-5 pb-2" />
            )}
          </Field>
        )}
      />

      <div className="flex items-center justify-between border-t border-(--border-strong) px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="select-none text-sm text-muted-foreground">
            {isEmpty
              ? 'No input yet'
              : `${charCount} chars · ${wordCount} words`}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              form.setValue('prompt', EXAMPLE_PROMPT, { shouldValidate: true })
            }
          >
            <Wand2 />
            Use example
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isEmpty}
            onClick={() => form.reset()}
          >
            <X />
            Clear
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <kbd className="inline-flex items-center rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
            ⌘↵
          </kbd>
          <Button
            type="button"
            disabled={!form.formState.isValid}
            onClick={form.handleSubmit(onRefine)}
          >
            <Sparkles />
            Refine
          </Button>
        </div>
      </div>
    </div>
  );
}
