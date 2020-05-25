import { Entity, Page, Field } from './typings';
import { CancellablePromise } from './utils';

export interface ServiceThis {
  [key: string]: any;
}

/**
 * 新建实体
 */
export type NewEntity = (
  this: ServiceThis,
  data: {
    name: string;
    desc?: string;
  },
) => CancellablePromise<{
  id: string;
}>;

/**
 * 删除实体
 */
export type DeleteEntity = (
  this: ServiceThis,
  entityId: string,
) => CancellablePromise<void>;

/**
 * 获取指定的实体
 */
export type GetEntity = (
  this: ServiceThis,
  entityId: string,
) => CancellablePromise<
  Entity & {
    pages: Omit<Page, 'source'>[];
  }
>;

/**
 * 获取所有的实体
 */
export type GetEntities = (
  this: ServiceThis,
) => CancellablePromise<Pick<Entity, 'id' | 'name' | 'desc'>[]>;

/**
 * 更新实体名称
 */
export type PatchEntity = (
  this: ServiceThis,
  entityId: string,
  data: {
    name: string;
    desc?: string;
  },
) => CancellablePromise<void>;

/**
 * 实体新增字段
 */
export type AddField = (
  this: ServiceThis,
  entityId: string,
  data: Field,
) => CancellablePromise<void>;
/**
 * 实体修改字段
 */
export type UpdateField = (
  this: ServiceThis,
  entityId: string,
  code: string,
  data: Field,
) => CancellablePromise<void>;

/**
 * 删除字段(主键不可以删除)
 */
export type DeleteField = (
  this: ServiceThis,
  entityId: string,
  code: string,
) => CancellablePromise<void>;

/**
 * 移动字段
 */
export type MoveField = (
  this: ServiceThis,
  entityId: string,
  from: number,
  to: number,
) => CancellablePromise<void>;

/**
 * 设置表主键
 */
export type SetPrimaryKey = (
  this: ServiceThis,
  entityId: string,
  code: string,
) => CancellablePromise<void>;

/**
 * 新建页面
 */
export type AddPage = (
  this: ServiceThis,
  entityId: string,
  data: Omit<Page, 'id'>,
) => CancellablePromise<Page>;

/**
 * 拷贝页面
 */
export type CopyPage = (
  this: ServiceThis,
  entityId: string,
  fromPageId: string,
  data: Partial<Page>,
) => CancellablePromise<Page>;

/**
 * 获取页面
 */
export type GetPage = (
  this: ServiceThis,
  entityId: string,
  pageId: string,
) => CancellablePromise<Page>;

/**
 * 修改页面信息
 */
export type UpdatePage = (
  this: ServiceThis,
  entityId: string,
  page: Page,
) => CancellablePromise<void>;

/**
 * 删除页面信息
 */
export type DeletePage = (
  this: ServiceThis,
  entityId: string,
  pageId: string,
) => CancellablePromise<void>;

/**
 * 移动页面
 */
export type MovePage = (
  this: ServiceThis,
  entityId: string,
  from: number,
  to: number,
) => CancellablePromise<void>;
