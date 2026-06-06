import { useQuery } from '@tanstack/react-query';
import { exampleKeys } from './keys';

export interface Example {
  id: string;
  name: string;
}

// Async fetcher — use in Server Components. Replace the body with a real source
// (route handler, server action, external API). Never call fetch inside a component.
export async function getExamples(): Promise<Example[]> {
  return [
    { id: '1', name: 'First example' },
    { id: '2', name: 'Second example' },
  ];
}

// Client hook — use only when a screen is genuinely client-state-heavy.
export function useExamples() {
  return useQuery({
    queryKey: exampleKeys.lists(),
    queryFn: getExamples,
  });
}
