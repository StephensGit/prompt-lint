import { useMemo, useState } from 'react';
import type { Example } from '../api/examples';

export function useExampleFilter(examples: Example[]) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed === '') {
      return examples;
    }
    return examples.filter((example) => example.name.toLowerCase().includes(trimmed));
  }, [examples, query]);

  return { query, setQuery, filtered };
}
