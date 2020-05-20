import React, { useMemo, useEffect, useContext } from 'react';
import MicroPageCore from 'micro-page-core';
import { notification } from 'antd';
import {
  RunTimeEntityContext,
  PageContext,
  RenderContext,
  ServiceContext,
} from './context';
import { useRequest } from './hooks';
import { Loading, NotFound } from './Workbench';

export interface PageRenderProps {
  core: MicroPageCore;
  basePath?: string;
  /**
   * 页面id
   */
  pageId: string;
  /**
   * 实体id
   */
  entityId: string;
}

export const PageRender: React.FC<PageRenderProps> = ({
  core,
  pageId,
  entityId,
  basePath = '',
}) => {
  const serviceContext = useContext(ServiceContext);
  const { data: entity, loading = true } = useRequest(
    core.service.getEntity.bind(serviceContext),
    {
      params: [entityId],
      onError(err) {
        notification.error({
          message: '渲染失败,无法加载实体数据',
          description: err.message,
          placement: 'bottomRight',
        });
      },
      first: true,
    },
  );
  const { data: page, loading: loadingPage = true, run } = useRequest(
    core.service.getPage.bind(serviceContext),
  );
  useEffect(() => {
    run(entityId, pageId);
  }, [entityId, pageId]);

  const renderContext = useMemo(() => {
    return {
      core,
      basePath,
    };
  }, [core, basePath]);
  const pageContext = useMemo(() => {
    return {
      template: core.config.templates.find(
        template => template.key === page?.key,
      )!,
      page: page!,
    };
  }, [core, basePath, page]);
  if (loading || loadingPage) {
    return <Loading />;
  }

  if (!entity) {
    return <NotFound title="找不到实体" />;
  }
  if (!pageContext.template) {
    return <NotFound title="找不到模版" />;
  }
  if (!pageContext.page) {
    return <NotFound title="查询页面信息失败" />;
  }
  return (
    <RenderContext.Provider value={renderContext}>
      <RunTimeEntityContext.Provider value={entity}>
        <PageContext.Provider value={pageContext}>
          <pageContext.template.plugin.pageRender />
        </PageContext.Provider>
      </RunTimeEntityContext.Provider>
    </RenderContext.Provider>
  );
};

export interface EntityRenderProps {
  core: MicroPageCore;
  basePath?: string;
  /**
   * 实体id
   */
  entityId: string;
}

export const EntityRender: React.FC<EntityRenderProps> = () => {
  return <div>EntityRenderProps</div>;
};
