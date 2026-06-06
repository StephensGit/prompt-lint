export const exampleKeys = {
  all: ['examples'] as const,
  lists: () => [...exampleKeys.all, 'list'] as const,
  detail: (id: string) => [...exampleKeys.all, 'detail', id] as const,
};
