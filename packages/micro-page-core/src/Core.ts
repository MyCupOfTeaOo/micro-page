// eslint-disable-next-line
/// <reference path="./image.d.ts" />
import { Config, Template } from './typings';
import coverImg from './assets/cover.jpg';
import { PluginContext } from './Plugin';

/**
 * 核心类
 * @Author: zwd
 * @Date: 2020-04-26 15:28:28
 * @Last Modified by: zwd
 * @Last Modified time: 2020-04-26 15:45:18
 * @Description: 实现了 插件的装载,运行时的渲染 数据描述的持久化
 */
class MicroPageCore {
  private _config: Config;

  _default_template: Partial<Template> = {
    cover: coverImg,
  };

  constructor(config: Config) {
    this._config = this.mergeConfig(config);
  }

  mergeConfig(config: Config) {
    return {
      ...config,
      templates: config.templates.map(template => {
        template.plugin.setContext({
          ...(template.plugin.context as PluginContext<any>),
          config,
        });
        return {
          ...this._default_template,
          ...template,
        };
      }),
    };
  }

  get config(): Config {
    return this._config;
  }

  get service() {
    return this.config.service;
  }

  get request() {
    return this._config.request;
  }
}

export default MicroPageCore;
