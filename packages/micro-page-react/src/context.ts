import { createContext } from 'react';
import MicroPageCore, { ServiceThis } from 'micro-page-core';
import { Page, Template, Project } from 'micro-page-core/es/typings';
import { ProjectStore } from './store';

export const RenderContext = createContext<{
  core: MicroPageCore;
  basePath: string;
}>({} as any);

export const ProjectContext = createContext<{
  store: ProjectStore;
}>({} as any);

export const PageContext = createContext<{
  page: Page;
  template: Template;
}>({} as any);

export const RunTimeProjectContext = createContext<
  Project & {
    pages: Omit<Page, 'source'>[];
  }
>({} as any);

export const ServiceContext = createContext<ServiceThis>({});
