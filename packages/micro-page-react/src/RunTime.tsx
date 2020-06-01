import React, { useMemo, useEffect, useContext } from 'react';
import MicroPageCore from 'micro-page-core';
import { notification, Result, Button } from 'antd';
import { Decision } from 'teaness';
import { Switch, Route, Redirect, useHistory } from 'react-router-dom';
import {
  RunTimeEntityContext,
  PageContext,
  RenderContext,
  ServiceContext,
} from './context';
import { useRequest } from './hooks';
import { Loading, NotFound } from './Workbench';
import { join } from './utils';

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

export interface RoutesNotFound {}
export const RoutesNotFound: React.FC<RoutesNotFound> = () => {
  const history = useHistory();
  return (
    <Result
      status={404}
      title="404"
      subTitle="找不到该页面,请返回或回到首页"
      extra={
        <React.Fragment>
          <Button type="primary" onClick={() => history.push('/')}>
            回到首页
          </Button>
          <Button type="primary" onClick={() => history.goBack()}>
            返回上一页
          </Button>
        </React.Fragment>
      }
    />
  );
};

export interface EntityRenderProps {
  core: MicroPageCore;
  basePath?: string;
  /**
   * 实体id
   */
  entityId: string;
  /**
   *
   */
  pageRoutesNotFound?: React.ReactNode;
}

const EntityRender: React.FC<EntityRenderProps> = ({
  core,
  basePath = ' ',
  entityId,
  pageRoutesNotFound,
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

  const { data: pageRoutes, loading: loadingRoutes = true } = useRequest(
    core.service.getPageRoutes.bind(serviceContext),
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

  if (loading || loadingRoutes) {
    return <Loading />;
  }

  if (!entity) {
    return <NotFound title="找不到实体" />;
  }
  if (!pageRoutes) {
    return <NotFound title="找不到实体路由" />;
  }

  const filterPageRoutes = pageRoutes.filter(pageRoute => pageRoute.route);
  return (
    <Switch>
      <Decision actual={!filterPageRoutes.length}>
        <Decision.Case expect>{pageRoutesNotFound}</Decision.Case>
        <Decision.Case expect={false}>
          {filterPageRoutes.map(pageRoute => (
            <Route exact path={join(basePath, pageRoute.route?.pathname!)}>
              <PageRender
                basePath={join(basePath, pageRoute.route?.pathname!)}
                core={core}
                entityId={entityId}
                pageId={pageRoute.pageId}
              />
            </Route>
          ))}
          <Redirect
            to={{
              pathname: join(basePath, filterPageRoutes[0].route?.pathname!),
            }}
          />
        </Decision.Case>
      </Decision>
    </Switch>
  );
};

EntityRender.defaultProps = {
  pageRoutesNotFound: RoutesNotFound,
};

export { EntityRender };
