import type { MultiSelectOption, SingleSelectOption } from './types';
import { compareMatch, orderByKeywords } from 'app-shared/components/Select/ds/utils';

export const optionSearch = <T extends SingleSelectOption | MultiSelectOption>(
  options: T[],
  search: string,
): T[] => {
  const keywordMap = new Map<string, string[] | undefined>(
    options.map(({ label, value, keywords }) => [value, keywords ? [label, ...keywords] : [label]]),
  );
  return orderByKeywords(keywordMap, compareMatch(search)).map(
    (key) => options.find((option) => option.value === key)!,
  );
};
