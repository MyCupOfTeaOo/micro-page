import { createContext } from 'react';
import { PluginContext } from 'micro-page-core/es/Plugin';
import { Source, PageRenderThis } from './typings';

export const ListPluginContext = createContext<PluginContext<Source>>(
  {} as any,
);

export const PageRenderContext = createContext<PageRenderThis>({} as any);
