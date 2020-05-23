import { createContext } from 'react';
import { PluginContext } from 'micro-page-core/es/Plugin';
import { Source, PageRenderThis } from './typings';
import { ListPluginOptions } from './List';

export const ListPluginContext = createContext<
  PluginContext<Source> & { options?: ListPluginOptions }
>({} as any);

export const PageRenderContext = createContext<PageRenderThis>({} as any);
