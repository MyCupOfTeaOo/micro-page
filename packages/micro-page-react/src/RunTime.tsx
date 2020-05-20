import React, { useMemo, useEffect, useContext } from 'react';
import MicroPageCore from 'micro-page-core';
import { notification } from 'antd';
import {
  RunTimeProjectContext,
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
   * 项目id
   */
  projectId: string;
}

export const PageRender: React.FC<PageRenderProps> = ({
  core,
  pageId,
  projectId,
  basePath = '',
}) => {
  const serviceContext = useContext(ServiceContext);
  const { data: project, loading = true } = useRequest(
    core.service.getProject.bind(serviceContext),
    {
      params: [projectId],
      onError(err) {
        notification.error({
          message: '渲染业务加载失败',
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
    run(projectId, pageId);
  }, [projectId, pageId]);

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

  if (!project) {
    return <NotFound title="找不到项目" />;
  }
  if (!pageContext.template) {
    return <NotFound title="找不到模版" />;
  }
  if (!pageContext.page) {
    return <NotFound title="查询页面信息失败" />;
  }
  return (
    <RenderContext.Provider value={renderContext}>
      <RunTimeProjectContext.Provider value={project}>
        <PageContext.Provider value={pageContext}>
          <pageContext.template.plugin.pageRender />
        </PageContext.Provider>
      </RunTimeProjectContext.Provider>
    </RenderContext.Provider>
  );
};

export interface ProjectRenderProps {
  core: MicroPageCore;
  basePath?: string;
  /**
   * 项目id
   */
  projectId: string;
}

export const ProjectRender: React.FC<ProjectRenderProps> = () => {
  return <div>ProjectRenderProps</div>;
};
