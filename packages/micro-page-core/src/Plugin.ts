/* eslint-disable react/static-property-placement,max-classes-per-file */
import { Config, Field } from './typings';

export interface PluginContext<S> {
  /**
   * 内核配置
   */
  config: Config;
  /**
   * 保存该页面的配置
   */
  saveConfig: (
    value: (prevState: S) => S | undefined,
    options?: {
      onSuccess?(): void;
      onError?(err: Error): void;
      onFinish?(): void;
      /**
       * 是否刷新render
       * @default true
       */
      refresh?: boolean;
    },
  ) => void;
  /**
   * 如果有调用的saveConfig则立即调用
   */
  flush: () => void;
  /**
   *  如果有调用的saveConfig则立即取消
   */
  cancel: () => void;
  [key: string]: any;
}

abstract class PagePlugin<O, S> {
  context?: PluginContext<S>;

  options: O;

  constructor(options: O) {
    this.options = options;
  }

  setContext(context: PluginContext<S>) {
    this.context = context;
  }

  /**
   * 配置工作台渲染
   */
  workBenchRender: (...args: any) => any = () => {};

  /**
   * 目标页面渲染
   */
  pageRender: (...args: any) => any = () => {};

  /**
   * 模版默认配置
   * @param field 字段类型
   */
  abstract getDefaultValue(field: Field[]): S;
}

export { PagePlugin };
