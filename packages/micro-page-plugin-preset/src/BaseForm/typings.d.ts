import * as H from 'history';
import MicroPageCore from 'micro-page-core';
import { FormStore } from 'teaness/es/Form/store';
import { Entity, Page } from 'micro-page-core/es/typings';
import { Dispatch, SetStateAction } from 'react';
import { FormItemConfig } from './Widget/FormItem';
import { FormButtonConfig } from './Widget/FormButton';

export interface LoadItem {
  url?: string;
  assert?: string;
}

export type Load = LoadItem[];

export interface Source {
  title?: string;
  loadData?: Load;
  layout: string;
  formItem: FormItemConfig[];
  formButton: FormButtonConfig[];
}

export interface PageRenderThis {
  core: MicroPageCore;
  store: FormStore<any>;
  entity: Entity & {
    pages: Omit<Page, 'source'>[];
  };
  data?: any;
  page: Page<Source>;
  history: H.History<H.LocationState>;
  location: H.Location<any>;
  params: { [K: string]: string };
  query: { [K: string]: string };
  setLoading: Dispatch<SetStateAction<boolean>>;
}

export interface FuncThis<
  C = {
    [key: string]: any;
  },
  F = any
> extends PageRenderThis {
  config?: Omit<C, 'funcProps'> & {
    funcProps?: F;
  };
}
