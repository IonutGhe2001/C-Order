import React from 'react';
import { useTranslation } from 'react-i18next';
import { Table, VisibilityState } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

interface ColumnsMenuProps {
  table: Table<any>;
  visibility: VisibilityState;
  children?: React.ReactNode;
}

export default function ColumnsMenu({ table, visibility, children }: ColumnsMenuProps) {
  const { t } = useTranslation();
  const columns = table
    .getAllLeafColumns()
    .filter((column) => column.id !== 'select' && column.id !== 'menu');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children ? (
          children
        ) : (
          <Button size="sm" variant="outline">
            {t('labels.columns')}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {columns.map((column) => {
          const header =
            typeof column.columnDef.header === 'string'
              ? column.columnDef.header
              : column.id;
          return (
            <DropdownMenuItem
              key={column.id}
              className="flex items-center gap-2"
              onSelect={(e) => e.preventDefault()}
            >
              <Checkbox
                checked={visibility[column.id] !== false}
                onCheckedChange={(value: boolean) =>
                  column.toggleVisibility(Boolean(value))
                }
              />
              <span>{header}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}