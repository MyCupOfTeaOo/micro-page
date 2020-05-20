import * as H from 'history';
import { DataGridRef } from 'teaness/es/DataGrid/typings';
import { FormStore } from 'teaness/es/Form/store';
import { Entity, Page } from 'micro-page-core/es/typings';
import MicroPageCore from 'micro-page-core';
import { QueryButtonConfig } from './Widget/QueryButton';
import { QueryItemConfig } from './Widget/QueryItem';
import { DataGridConfig } from './Widget/DataGrid';

export interface Source {
  queryItem: QueryItemConfig[];
  queryButton: QueryButtonConfig[];
  grid: DataGridConfig;
}

export interface PageRenderThis {
  core: MicroPageCore;
  gridRef: import('react').RefObject<DataGridRef>;
  setQueryData: (data: Partial<any>) => void;
  queryDataRef: import('react').MutableRefObject<Partial<any>>;
  store: FormStore<any>;
  entity: Entity & {
    pages: Omit<Page, 'source'>[];
  };
  page: Page<Source>;
  history: H.History<H.LocationState>;
  location: H.Location<any>;
}

export interface FuncThis<
  C = {
    [key: string]: any;
  },
  F = any
> extends PageRenderThis {
  rowData?: any;
  config?: Omit<C, 'funcProps'> & {
    funcProps?: F;
  };
}
