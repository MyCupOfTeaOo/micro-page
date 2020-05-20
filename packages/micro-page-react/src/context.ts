import { createContext } from 'react';
import MicroPageCore, { ServiceThis } from 'micro-page-core';
import { Page, Template, Entity } from 'micro-page-core/es/typings';
import { EntityStore } from './store';

export const RenderContext = createContext<{
  core: MicroPageCore;
  basePath: string;
}>({} as any);

export const EntityContext = createContext<{
  store: EntityStore;
}>({} as any);

export const PageContext = createContext<{
  page: Page;
  template: Template;
}>({} as any);

export const RunTimeEntityContext = createContext<
  Entity & {
    pages: Omit<Page, 'source'>[];
  }
>({} as any);

export const ServiceContext = createContext<ServiceThis>({});
