import { Project, Page, Field } from './typings';
import { CancellablePromise } from './utils';

/**
 * 新建项目
 */
export type NewProject = (data: {
  name: string;
  desc?: string;
}) => CancellablePromise<{
  id: string;
}>;

/**
 * 删除项目
 */
export type DeleteProject = (projectId: string) => CancellablePromise<void>;

/**
 * 获取指定的项目
 */
export type GetProject = (
  projectId: string,
) => CancellablePromise<
  Project & {
    pages: Omit<Page, 'source'>[];
  }
>;

/**
 * 获取所有的项目
 */
export type GetProjects = () => CancellablePromise<
  Pick<Project, 'id' | 'name' | 'desc'>[]
>;

/**
 * 更新项目名称
 */
export type PatchProject = (
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
  projectId: string,
  data: Field,
) => CancellablePromise<void>;
/**
 * 项目修改字段
 */
export type UpdateField = (
  projectId: string,
  code: string,
  data: Field,
) => CancellablePromise<void>;

/**
 * 删除字段(主键不可以删除)
 */
export type DeleteField = (
  projectId: string,
  code: string,
) => CancellablePromise<void>;

/**
 * 移动字段
 */
export type MoveField = (
  projectId: string,
  from: number,
  to: number,
) => CancellablePromise<void>;

/**
 * 设置表主键
 */
export type SetPrimaryKey = (
  projectId: string,
  code: string,
) => CancellablePromise<void>;

/**
 * 新建页面
 */
export type AddPage = (
  projectId: string,
  data: Omit<Page, 'id'>,
) => CancellablePromise<Page>;

/**
 * 获取页面
 */
export type GetPage = (
  projectId: string,
  pageId: string,
) => CancellablePromise<Page>;

/**
 * 修改页面信息
 */
export type UpdatePage = (
  projectId: string,
  page: Page,
) => CancellablePromise<void>;

/**
 * 删除页面信息
 */
export type DeletePage = (
  projectId: string,
  pageId: string,
) => CancellablePromise<void>;

/**
 * 移动页面
 */
export type MovePage = (
  projectId: string,
  from: number,
  to: number,
) => CancellablePromise<void>;
