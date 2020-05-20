import { Project, Page, Field } from './typings';
import { CancellablePromise } from './utils';

export interface ServiceThis {
  [key: string]: any;
}

/**
 * 新建项目
 */
export type NewProject = (
  this: ServiceThis,
  data: {
    name: string;
    desc?: string;
  },
) => CancellablePromise<{
  id: string;
}>;

/**
 * 删除项目
 */
export type DeleteProject = (
  this: ServiceThis,
  projectId: string,
) => CancellablePromise<void>;

/**
 * 获取指定的项目
 */
export type GetProject = (
  this: ServiceThis,
  projectId: string,
) => CancellablePromise<
  Project & {
    pages: Omit<Page, 'source'>[];
  }
>;

/**
 * 获取所有的项目
 */
export type GetProjects = (
  this: ServiceThis,
) => CancellablePromise<Pick<Project, 'id' | 'name' | 'desc'>[]>;

/**
 * 更新项目名称
 */
export type PatchProject = (
  this: ServiceThis,
  projectId: string,
  data: {
    name: string;
    desc?: string;
  },
) => CancellablePromise<void>;

/**
 * 项目新增字段
 */
export type AddField = (
  this: ServiceThis,
  projectId: string,
  data: Field,
) => CancellablePromise<void>;
/**
 * 项目修改字段
 */
export type UpdateField = (
  this: ServiceThis,
  projectId: string,
  code: string,
  data: Field,
) => CancellablePromise<void>;

/**
 * 删除字段(主键不可以删除)
 */
export type DeleteField = (
  this: ServiceThis,
  projectId: string,
  code: string,
) => CancellablePromise<void>;

/**
 * 移动字段
 */
export type MoveField = (
  this: ServiceThis,
  projectId: string,
  from: number,
  to: number,
) => CancellablePromise<void>;

/**
 * 设置表主键
 */
export type SetPrimaryKey = (
  this: ServiceThis,
  projectId: string,
  code: string,
) => CancellablePromise<void>;

/**
 * 新建页面
 */
export type AddPage = (
  this: ServiceThis,
  projectId: string,
  data: Omit<Page, 'id'>,
) => CancellablePromise<Page>;

/**
 * 获取页面
 */
export type GetPage = (
  this: ServiceThis,
  projectId: string,
  pageId: string,
) => CancellablePromise<Page>;

/**
 * 修改页面信息
 */
export type UpdatePage = (
  this: ServiceThis,
  projectId: string,
  page: Page,
) => CancellablePromise<void>;

/**
 * 删除页面信息
 */
export type DeletePage = (
  this: ServiceThis,
  projectId: string,
  pageId: string,
) => CancellablePromise<void>;

/**
 * 移动页面
 */
export type MovePage = (
  this: ServiceThis,
  projectId: string,
  from: number,
  to: number,
) => CancellablePromise<void>;
