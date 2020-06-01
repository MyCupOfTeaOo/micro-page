import { RuleItem } from 'async-validator';
import { AxiosInstance } from 'axios';
import { PagePlugin } from './Plugin';
import {
  NewEntity,
  GetEntity,
  PatchEntity,
  GetEntities,
  AddField,
  UpdateField,
  SetPrimaryKey,
  DeleteField,
  DeleteEntity,
  AddPage,
  GetPage,
  UpdatePage,
  DeletePage,
  MovePage,
  CopyPage,
  GetPageRoutes,
} from './Service';

/**
 * 运行时使用
 * @summary 持久化的数据描述
 */
export interface Entity {
  /**
   * 实体id
   */
  id: string;
  /**
   * 实体名
   */
  name: string;
  /**
   * 实体描述
   */
  desc?: string;
  /**
   * 存储最基本的信息,该结构最重要的基础
   * @summary 字段
   */
  fields: Field[];

  /**
   * 页面
   */
  pages: Page[];
}

/**
 * 运行前初始化使用
 * 包含了
 * - 模版注册
 * - 域插件注册
 * @summary 初始化函数配置
 */
export interface Config {
  /**
   * 页面模版
   */
  templates: Template[];
  /**
   * 内部接口的实现
   */
  service: {
    newEntity: NewEntity;
    deleteEntity: DeleteEntity;
    getEntity: GetEntity;
    getEntities: GetEntities;
    patchEntity: PatchEntity;
    addField: AddField;
    deleteField: DeleteField;
    updateField: UpdateField;
    // MoveField: MoveField;
    setPrimaryKey: SetPrimaryKey;
    addPage: AddPage;
    getPage: GetPage;
    updatePage: UpdatePage;
    deletePage: DeletePage;
    movePage: MovePage;
    copyPage: CopyPage;
    getPageRoutes: GetPageRoutes;
  };
  request: AxiosInstance;
}

export interface Template {
  /**
   * 模版key
   */
  key: string;
  /**
   * 模版名(与创建页面显示的名称相关),建议不要重复
   */
  name: string;
  /**
   * 模版封面
   */
  cover?: string;
  /**
   * 模版描述
   */
  desc?: string;
  /**
   * 配置页面插件
   */
  plugin: PagePlugin<any, any>;
}

export interface Page<S = any> {
  /**
   * 页面id
   */
  id: string;
  /**
   * 页面标题
   */
  title: string;
  /**
   * 页面描述
   */
  desc?: string;
  /**
   * 页面模版key,运行前初始化配置时填入的key
   */
  key: string;
  /**
   * 页面模版配置描述
   */
  source: S;
  /**
   * 路由
   */
  route?: MyRoute;
}

export interface MyRoute {
  pathname: string;
}

export interface Field {
  /**
   * 字段编码
   */
  code: string;
  /**
   * 字段名
   */
  name: string;
  /**
   * 字段类型
   */
  type: FieldType;
  /**
   * 是否主键
   */
  primary?: boolean;
  /**
   * 字段描述
   */
  desc?: string;
}

export type FieldType =
  | 'string'
  | 'number'
  | 'date'
  | 'time'
  | 'image'
  | 'richtext'
  | 'file';

/**
 * async-validator 的规则
 * @see {@link https://github.com/yiminghe/async-validator}
 */
export interface Rule extends RuleItem {}

export interface PageRoute {
  pageId: string;
  route?: MyRoute;
}
