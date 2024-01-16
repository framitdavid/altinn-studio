import React, { useMemo } from 'react';
import { TextRow } from './TextRow';
import type {
  TextResourceEntryDeletion,
  TextResourceIdMutation,
  UpsertTextResourceMutation,
} from './types';
import { filterFunction, getLangName } from './utils';
import { TextTableRow } from './types';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@digdir/design-system-react';
import { APP_NAME } from 'app-shared/constants';

export type TextListProps = {
  resourceRows: TextTableRow[];
  searchQuery: string;
  selectedLanguages: string[];
  upsertTextResource: (entry: UpsertTextResourceMutation) => void;
  removeEntry: ({ textId }: TextResourceEntryDeletion) => void;
  updateEntryId: ({ oldId, newId }: TextResourceIdMutation) => void;
};
export const TextList = ({
  resourceRows,
  searchQuery,
  selectedLanguages,
  ...rest
}: TextListProps) => {
  const textIds = useMemo(() => resourceRows.map((row) => row.textKey), [resourceRows]);
  const idExists = (textId: string): boolean => textIds.includes(textId);
  const getTableHeaderCellId = (language: string): string => `header-lang${language}`;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableCell></TableCell>
          {selectedLanguages.map((language) => (
            <TableCell id={getTableHeaderCellId(language)} key={getTableHeaderCellId(language)}>
              {getLangName({ code: language })}
            </TableCell>
          ))}
          <TableCell>Tekstnøkkel</TableCell>
          <TableCell>Variabler</TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {resourceRows
          .filter((row) => filterFunction(row.textKey, row.translations, searchQuery))
          .map((row) => (
            <TextRow
              key={`${row.translations[0].lang}.${row.textKey}`}
              textId={row.textKey}
              idExists={idExists}
              textRowEntries={row.translations}
              variables={row.variables || []}
              selectedLanguages={selectedLanguages}
              showButton={row.textKey !== APP_NAME}
              {...rest}
            />
          ))}
      </TableBody>
    </Table>
  );
};
