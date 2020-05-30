import { createContext } from 'react';
import MicroPageCore, { ServiceThis } from 'micro-page-core';
import { Page, Template, Entity } from 'micro-page-core/es/typings';
import { EntityStore } from './store';
import { getReactPageRenderText, getReactEntityRenderText } from './utils';

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
  /**
   * 配置期间才能取到
   */
  setPage?: React.Dispatch<React.SetStateAction<Page<any> | undefined>>;
  /**
   * 配置期间才能取到
   */
  updatePage?:((
    args: [string, Page<any>],
    options?:
      | {
          onSuccess?(): void;
          onError?(err: Error): void;
          onFinish?(): void;
        }
      | undefined,
  ) => void) & {
    cancel(): void;
    flush(): void;
  };
}>({} as any);

export const PageConfigContext = createContext<{
  getReactEntityRenderText(entityId: string): string;
  getReactPageRenderText(entityId: string, pageId: string): string;
}>({
  getReactEntityRenderText,
  getReactPageRenderText,
});

export const RunTimeEntityContext = createContext<
  Entity & {
    pages: Omit<Page, 'source'>[];
  }
>({} as any);

export const ServiceContext = createContext<ServiceThis>({});
