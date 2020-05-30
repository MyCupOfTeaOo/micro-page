import React, {
  useState,
  useContext,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import {
  Button,
  Modal,
  Input,
  PageHeader,
  notification,
  Spin,
  message,
  Space,
  Drawer,
  Row,
  Radio,
  Tooltip,
  Result,
} from 'antd';
import CopyToClipboard from 'react-copy-to-clipboard';
import { ResultProps } from 'antd/lib/result';
import { useSpring, useTransition, animated, useChain } from 'react-spring';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import lodash from 'lodash-es';
import {
  PlusOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ArrowLeftOutlined,
  ShareAltOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import {
  Switch,
  Route,
  Redirect,
  useHistory,
  useParams,
  Link,
} from 'react-router-dom';
import { Decision, useStore, useForm, vertical, Show, Select } from 'teaness';
import MicroPageCore from 'micro-page-core';
import { UpdatePage } from 'micro-page-core/es/Service';
import { Page, Template, Field, FieldType } from 'micro-page-core/es/typings';
import { typeOptions } from 'micro-page-core/es/constant';
import './image';
import { join } from './utils';
import Stringsvg from './assets/string.svg';
import Numbersvg from './assets/number.svg';
import Datesvg from './assets/date.svg';
import Timesvg from './assets/time.svg';
import Imagesvg from './assets/image.svg';
import Filesvg from './assets/file.svg';
import Richtextsvg from './assets/richtext.svg';
import coverImg from './assets/cover.jpg';
import {
  useModal,
  useRequest,
  useDrawer,
  useLocalStorage,
  useCore,
  useBasePath,
  useTemplates,
  useSearchTemplate,
  useEntityStore,
} from './hooks';
import {
  RenderContext,
  EntityContext,
  PageContext,
  ServiceContext,
  PageConfigContext,
} from './context';
import { EntityStore } from './store';
import { PageRender } from './RunTime';

export const fieldSvgTable: { [key in FieldType]: any } = {
  string: Stringsvg,
  number: Numbersvg,
  date: Datesvg,
  time: Timesvg,
  image: Imagesvg,
  file: Filesvg,
  richtext: Richtextsvg,
};

export interface RenderProps {
  basePath?: string;
  core: MicroPageCore;
}

const Render: React.FC<RenderProps> = ({ core, basePath = '/' }) => {
  return (
    <RenderContext.Provider
      value={{
        core,
        basePath,
      }}
    >
      <div className="micro-layout">
        <Switch>
          <Route exact path={basePath}>
            <EntityList />
          </Route>

          <Route path={join(basePath, ':id')}>
            <EntityEdit />
          </Route>
          <Redirect
            to={{
              pathname: basePath,
            }}
          />
        </Switch>
      </div>
    </RenderContext.Provider>
  );
};

export interface HeaderProps {
  title?: string;
}
export const Header: React.FC<HeaderProps> = props => {
  return <div className="micro-header">{props.title}</div>;
};

export interface EntityListProps {}

export interface NewEntityForm {
  name: string;
  desc?: string;
}

export const EntityList: React.FC<EntityListProps> = () => {
  const { setVisible, ...modalProps } = useModal();
  const store = useStore<NewEntityForm>({
    name: {
      rules: {
        required: true,
        message: '实体名称不能为空',
      },
    },
    desc: {},
  });
  const { Form, Item } = useForm(store);
  const core = useCore();
  const history = useHistory();
  const basePath = useBasePath();
  const serviceContext = useContext(ServiceContext);

  const { data: entities, loading: loadingEntities } = useRequest(
    core.service.getEntities.bind(serviceContext),
    {
      onError(err) {
        notification.error({
          message: '查询实体列表失败',
          description: err.message,
          placement: 'bottomRight',
        });
      },
      first: true,
    },
  );
  const { run, loading } = useRequest(
    core.service.newEntity.bind(serviceContext),
    {
      onSuccess(res) {
        setVisible(false);
        history.push({
          pathname: join(basePath, res.id),
        });
      },
      onError(err) {
        notification.error({
          message: '新建实体失败',
          description: err.message,
          placement: 'bottomRight',
        });
      },
    },
  );
  if (loadingEntities) {
    return <Loading tip="加载实体列表中" />;
  }
  return (
    <div className="micro-main">
      <Decision actual={!!entities?.length}>
        <Decision.Case expect>
          <div className="micro-entity-list">
            <PageHeader
              className="micro-header"
              title="全部实体"
              subTitle="创建与编辑实体"
              extra={
                <Button
                  type="primary"
                  onClick={() => {
                    store.reset();

                    setVisible(true);
                  }}
                >
                  新建
                  <PlusOutlined />
                </Button>
              }
            />
            <div className="micro-body">
              {entities?.map(entity => (
                <div
                  key={entity.id}
                  className="micro-card"
                  onClick={() => {
                    history.push({
                      pathname: join(basePath, entity.id),
                    });
                  }}
                >
                  <img className="cover" alt="封面" src={coverImg} />
                  <div className="content center">
                    <h4 className="ellipsis">{entity.name}</h4>
                    <div className="ellipsis desc">
                      {entity.desc || '暂无描述'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Decision.Case>
        <Decision.Case expect={false}>
          <div className="micro-empty-list">
            <Button
              type="primary"
              onClick={() => {
                store.reset();

                setVisible(true);
              }}
            >
              新建实体
              <PlusOutlined />
            </Button>
          </div>
        </Decision.Case>
      </Decision>

      <Modal
        {...modalProps}
        okButtonProps={{
          loading,
        }}
        centered
        onOk={() => {
          store.submit(({ values, errs }) => {
            if (!errs) {
              run(values as NewEntityForm);
            }
          });
        }}
        title="新建实体"
      >
        <Form layout={vertical}>
          <Item id="name" text="实体名">
            <Input />
          </Item>
          <Item id="desc" text="实体描述">
            <Input.TextArea
              autoSize={{
                minRows: 5,
              }}
            />
          </Item>
        </Form>
      </Modal>
    </div>
  );
};

export interface EntityEditProps {}

export interface LoadingProps {
  tip?: string;
}
export const Loading: React.FC<LoadingProps> = ({ tip }) => {
  return (
    <div className="micro-loading">
      <Spin tip={tip} />
    </div>
  );
};

export interface NotFoundProps extends ResultProps {}
export const NotFound: React.FC<NotFoundProps> = props => {
  const history = useHistory();
  const extra = useMemo(() => {
    return (
      <Button
        type="primary"
        onClick={() => {
          history.goBack();
        }}
      >
        返回上一步
      </Button>
    );
  }, [props.extra]);
  return (
    <div className="micro-notfound">
      <Result status="error" extra={extra} {...props} />
    </div>
  );
};
NotFound.defaultProps = {
  title: '加载失败',
};

export const EntityEdit: React.FC<EntityEditProps> = observer(() => {
  const core = useCore();
  const { id } = useParams<{ id: string }>();
  const store = useMemo(() => {
    return new EntityStore({ core, id });
  }, [id]);
  const basePath = useBasePath();
  const serviceContext = useContext(ServiceContext);
  const { run, loading = true } = useRequest(
    core.service.getEntity.bind(serviceContext),
    {
      onSuccess(res) {
        store.loadEntity(res);
      },
      onError(err) {
        notification.error({
          message: '加载实体失败',
          description: err.message,
          placement: 'bottomRight',
        });
      },
    },
  );
  useEffect(() => {
    run(id);
  }, [id]);
  if (loading) {
    return <Loading />;
  }
  return (
    <EntityContext.Provider
      value={{
        store,
      }}
    >
      <div className="micro-main micro-main-entity">
        <Switch>
          <Route path={join(basePath, id)} exact>
            <EntityEditHeader />
            <EntityContent />
          </Route>
          <Route path={join(basePath, id, ':id/preview')} exact>
            <Preview />
          </Route>
          <Route path={join(basePath, id, ':id')} exact>
            <PageEdit />
          </Route>
        </Switch>
      </div>
    </EntityContext.Provider>
  );
});

export interface SelectTemplateProps {
  onChange?(key?: string, template?: Template): void;
  value?: string;
  disabled?: boolean;
}

export const SelectTemplate: React.FC<SelectTemplateProps> = props => {
  const templates = useTemplates();
  const { setVisible, ...modalProps } = useModal();
  const [template, setTemplate] = useState<Template>();
  const onChange = useCallback((temp: Template) => {
    setTemplate(temp);
    props.onChange?.(temp.key, temp);
    setVisible(false);
  }, []);
  useEffect(() => {
    if (props.value) {
      const targetTemplate = templates.find(item => item.key === props.value);
      if (!targetTemplate) {
        props.onChange?.();
      }
      setTemplate(targetTemplate);
    } else {
      setTemplate(undefined);
    }
  }, [props.value, templates]);
  useEffect(() => {
    if (modalProps.visible && template?.key) {
      const node = document.querySelector(`[data-template=${template?.key}]`);
      if (node) {
        node.scrollIntoView(true);
      }
    }
  }, [modalProps.visible]);
  return (
    <div className="select-template">
      <Decision actual={!!template}>
        <Decision.Case expect>
          <div
            className="micro-card micro-card-small margin-none"
            onClick={() => setVisible(true)}
          >
            <img className="cover" alt="封面" src={template?.cover} />
            <div className="content center">
              <h4 className="ellipsis">{template?.name}</h4>
            </div>
          </div>
        </Decision.Case>
        <Decision.Case expect={false}>
          <div
            className="micro-card micro-card-small margin-none center"
            onClick={() => {
              if (!props.disabled) {
                setVisible(true);
              }
            }}
          >
            <div>
              选择模版 <PlusOutlined />
            </div>
          </div>
        </Decision.Case>
      </Decision>
      <Modal
        className="select-template-select-area"
        title="选择模版"
        {...modalProps}
        footer={null}
        width="846px"
      >
        {templates.map(temp => (
          <div
            key={temp.key}
            data-template={temp.key}
            className={classnames('micro-card', {
              'micro-card-selected': temp.key === template?.key,
            })}
            onClick={() => {
              onChange(temp);
            }}
          >
            <img className="cover" alt="封面" src={temp.cover} />
            <div className="content center">
              <h4 className="ellipsis">{temp.name}</h4>
              <div className="ellipsis desc">{temp.desc || '暂无描述'}</div>
            </div>
          </div>
        ))}
      </Modal>
    </div>
  );
};

export interface NewPageForm {
  /**
   * 页面标题
   */
  title: string;
  /**
   * 使用的页面模版key
   */
  key: string;
  /**
   * 页面描述
   */
  desc?: string;
}

export interface EntityContentProps {}
export const EntityContent: React.FC<EntityContentProps> = observer(() => {
  const entityStore = useEntityStore();
  return (
    <div className="micro-entity-content">
      <EntityFieldLayout />
      <Show actual={!!entityStore.fields.length} expect>
        <PageList />
      </Show>
    </div>
  );
});

export interface EntityFieldLayoutProps {}

export const EntityFieldLayout: React.FC<EntityFieldLayoutProps> = observer(
  () => {
    const entityStore = useEntityStore();
    const core = useCore();
    const [curField, setCurField] = useState<Field>();
    const { setVisible, ...drawerProps } = useDrawer();

    const store = useStore<Field>(
      {
        code: {
          defaultValue: curField?.code,
          rules: [
            {
              required: true,
              message: '字段编码不能为空',
            },
            {
              validator(_, value) {
                if (
                  value &&
                  value !== curField?.code &&
                  entityStore.fields.find(field => field.code === value)
                ) {
                  return new Error('该字段已存在,请修改编码');
                }
                return true;
              },
            },
          ],
        },
        name: {
          defaultValue: curField?.name,
          rules: [
            {
              required: true,
              message: '字段名不能为空',
            },
          ],
        },
        type: {
          defaultValue: curField?.type,
          rules: [
            {
              required: true,
              message: '字段类型不能为空',
            },
          ],
        },

        desc: { defaultValue: curField?.desc },
      },
      [curField, drawerProps.visible],
    );
    const { Form, Item } = useForm(store);
    const newField = useCallback(() => {
      setCurField(undefined);
      store.reset();
      setVisible(true);
    }, []);
    const serviceContext = useContext(ServiceContext);
    const { run: setPrimaryKey } = useRequest(
      core.service.setPrimaryKey.bind(serviceContext),
      {
        onError(err) {
          notification.error({
            message: '设置字段主键失败',
            description: err.message,
            placement: 'bottomRight',
          });
        },
      },
    );
    const { run: addField, loading: adding } = useRequest(
      core.service.addField.bind(serviceContext),
      {
        onSuccess(_, params) {
          if (!entityStore.fields.length) {
            setPrimaryKey(entityStore.id, params[1].code);
            entityStore.fields.push({
              ...params[1],
              primary: true,
            });
          } else {
            entityStore.fields.push(params[1]);
          }
          setVisible(false);
          store.reset();
        },
        onError(err) {
          notification.error({
            message: '创建字段失败',
            description: err.message,
            placement: 'bottomRight',
          });
        },
      },
    );

    const { run: updateField, loading: updating } = useRequest(
      core.service.updateField.bind(serviceContext),
      {
        onSuccess(_, params) {
          const field = entityStore.fields.find(
            item => item.code === params[1],
          );
          if (field) {
            Object.assign(field, params[2]);
          }
          setVisible(false);
        },
        onError(err) {
          notification.error({
            message: '更新字段失败',
            description: err.message,
            placement: 'bottomRight',
          });
        },
      },
    );
    const submitting = adding || updating;
    const submitField = useCallback(() => {
      store.submit(({ values, errs }) => {
        if (!errs) {
          if (curField) {
            updateField(entityStore.id, curField.code, values as Field);
          } else {
            addField(entityStore.id, values as Field);
          }
        }
      });
    }, [curField]);
    return (
      <div className="micro-field-layout">
        <Decision actual={!entityStore.fields.length}>
          <Decision.Case expect>
            <div className="micro-empty-list">
              <Button type="primary" onClick={newField}>
                新建字段 <PlusOutlined />
              </Button>
            </div>
          </Decision.Case>
          <Decision.Case expect={false}>
            <Radio.Group
              value={entityStore.fields.find(field => field.primary)?.code}
              onChange={e => {
                entityStore.setPrimary(e.target.value);
                setPrimaryKey(entityStore.id, e.target.value);
              }}
              className="micro-field-list"
            >
              <div
                className={classnames('micro-field', 'micro-empty-list')}
                onClick={() => {
                  setCurField(undefined);
                  store.reset();
                  setVisible(true);
                }}
              >
                <span>
                  新建字段 <PlusOutlined />
                </span>
              </div>
              {entityStore.fields.map(field => (
                <FieldRender
                  key={field.code}
                  field={field}
                  onClick={() => {
                    setCurField(field);
                    store.reset();
                    setVisible(true);
                  }}
                  isPrimary={field.primary}
                />
              ))}
            </Radio.Group>
          </Decision.Case>
        </Decision>
        <Drawer
          width={360}
          {...drawerProps}
          title={
            curField ? (
              <span>
                编辑字段{' '}
                <Decision actual={!!curField.primary}>
                  <Decision.Case expect>
                    <span className="warning small-text">(主键不可删除)</span>
                  </Decision.Case>
                  <Decision.Case expect={false}>
                    <DeleteOutlined
                      className="danger pointer"
                      onClick={() => {
                        Modal.confirm({
                          icon: <ExclamationCircleOutlined />,
                          title: (
                            <span>
                              确定要删除字段 &nbsp;
                              <strong className="danger">
                                {curField.name}
                                <sup>({curField.code})</sup>
                              </strong>{' '}
                              吗
                            </span>
                          ),
                          onOk: () => {
                            return core.service.deleteField
                              .call(
                                serviceContext,
                                entityStore.id,
                                curField.code,
                              )
                              .then(() => {
                                notification.success({
                                  placement: 'bottomRight',
                                  message: (
                                    <span>
                                      字段
                                      <span className="success">
                                        {curField.name}
                                        <sup>{curField.code}</sup>
                                      </span>
                                      删除成功
                                    </span>
                                  ),
                                });
                                setVisible(false);
                                entityStore.fields.splice(
                                  entityStore.fields.findIndex(
                                    field => field.code === curField.code,
                                  ),
                                  1,
                                );
                              })
                              .catch((err: Error) => {
                                notification.error({
                                  message: '删除字段失败',
                                  description: err.message,
                                  placement: 'bottomRight',
                                });
                                return Promise.reject(err);
                              });
                          },
                          okText: '删除',
                          okButtonProps: {
                            danger: true,
                            type: 'primary',
                          },
                          content:
                            '一旦删除后无法还原,对应的页面设置关联项也会清除',
                        });
                      }}
                    />
                  </Decision.Case>
                </Decision>
              </span>
            ) : (
              '创建字段'
            )
          }
          footer={
            <div
              style={{
                textAlign: 'right',
              }}
            >
              <Button
                style={{ marginRight: 8 }}
                onClick={() => {
                  setVisible(false);
                  store.reset();
                }}
              >
                取消
              </Button>
              <Button type="primary" loading={submitting} onClick={submitField}>
                提交
              </Button>
            </div>
          }
        >
          <Form layout={vertical}>
            <Item id="code" text="字段编码">
              <Input />
            </Item>
            <Item id="name" text="字段名">
              <Input />
            </Item>
            <Row />
            <Item id="type" text="字段类型">
              <Select options={typeOptions} />
            </Item>
            <Item id="desc" text="字段描述">
              <Input.TextArea rows={5} />
            </Item>
          </Form>
        </Drawer>
      </div>
    );
  },
);

export interface FieldRenderProps extends React.DOMAttributes<HTMLDivElement> {
  field: Field;
  isPrimary?: boolean;
}

export const FieldRender: React.FC<FieldRenderProps> = ({
  field,
  isPrimary = false,
  ...divProps
}) => {
  const FieldBadge = fieldSvgTable[field.type];
  return (
    <div
      key={field.code}
      className={classnames('micro-field', {
        'micro-field-primary': isPrimary,
      })}
      {...divProps}
    >
      <div>
        <Tooltip trigger="hover" title="设为主键">
          <Radio value={field.code} onClick={e => e.stopPropagation()} />
        </Tooltip>
        <span className="ellipsis">
          {field.name}
          <sup>({field.code})</sup>
        </span>
      </div>
      <div className="micro-field-badge">
        <FieldBadge />
      </div>
    </div>
  );
};

export interface PageListProps {}
export const PageList: React.FC<PageListProps> = observer(() => {
  const entityStore = useEntityStore();
  const core = useCore();
  const store = useStore<NewPageForm>({
    title: {
      rules: {
        required: true,
        message: '页面名称不能为空',
      },
    },
    key: {
      rules: {
        required: true,
        message: '请选择模版',
      },
    },
    desc: {},
  });
  const { Form, Item } = useForm(store);
  const { setVisible, ...modalProps } = useModal();

  const newPage = useCallback(() => {
    store.reset();
    setVisible(true);
  }, []);
  const basePath = useBasePath();
  const history = useHistory();
  const serviceContext = useContext(ServiceContext);
  const pageConfigContext = useContext(PageConfigContext);
  const { run: addPage, loading } = useRequest(
    core.service.addPage.bind(serviceContext),
    {
      onError: err => {
        notification.error({
          message: '新增页面失败',
          description: err.message,
          placement: 'bottomRight',
        });
      },
      onSuccess: (data, params) => {
        setVisible(false);
        entityStore.addPage(data);
        notification.success({
          placement: 'bottomRight',
          message: '新增页面成功',
          description: (
            <span>
              页面
              <a
                onClick={() => history.push(join(basePath, params[0], data.id))}
              >
                {params[1].title}
              </a>
              已添加
            </span>
          ),
        });
      },
    },
  );
  return (
    <div className="micro-page-list-layout">
      <Decision actual={!entityStore.pages?.length}>
        <Decision.Case expect>
          <div className="micro-empty-list">
            <Button type="primary" onClick={newPage}>
              新建页面
              <PlusOutlined />
            </Button>
          </div>
        </Decision.Case>
        <Decision.Case expect={false}>
          <div className="micro-card center" onClick={newPage}>
            <div>
              新建页面 <PlusOutlined />
            </div>
          </div>
          <div className="micro-page-list">
            {entityStore.pages?.map(page => (
              <div key={page.id} className="micro-mask-layout">
                <div
                  className="micro-card"
                  onClick={() => {
                    history.push(join(basePath, entityStore.id, page.id));
                  }}
                >
                  <img
                    className="cover"
                    alt="封面"
                    src={page.template?.cover}
                  />
                  <div className="content center">
                    <h4 className="ellipsis">{page.title}</h4>
                    <div className="ellipsis desc">
                      {page.desc || '暂无描述'}
                    </div>
                  </div>
                </div>
                <div className="micro-card-btns">
                  <Button
                    block
                    onClick={() => {
                      let { title } = page;
                      Modal.confirm({
                        icon: <ExclamationCircleOutlined />,
                        title: `复制页面: ${title}`,
                        content: (
                          <label htmlFor="page-title">
                            <div>页面标题:</div>
                            <Input
                              id="page-title"
                              defaultValue={page.title}
                              onChange={e => {
                                title = e.target.value;
                              }}
                            />
                          </label>
                        ),
                        onOk() {
                          if (!title) {
                            message.error('页面标题不能为空');
                            return Promise.reject();
                          }
                          return core.service.copyPage
                            .call(serviceContext, entityStore.id, page.id, {
                              title,
                            })
                            .then((data: Page) => {
                              entityStore.addPage(data);
                              notification.success({
                                placement: 'bottomRight',
                                message: '复制页面成功',
                                description: (
                                  <span>
                                    页面
                                    <a
                                      onClick={() =>
                                        history.push(
                                          join(
                                            basePath,
                                            entityStore.id,
                                            data.id,
                                          ),
                                        )
                                      }
                                    >
                                      {title}
                                    </a>
                                    已添加
                                  </span>
                                ),
                              });
                            })
                            .catch((err: Error) => {
                              notification.error({
                                message: '复制页面失败',
                                description: err.message,
                                placement: 'bottomRight',
                              });
                              return Promise.reject(err);
                            });
                        },
                      });
                    }}
                    icon={<CopyOutlined />}
                  />
                  <CopyToClipboard
                    text={pageConfigContext.getReactPageRenderText(
                      entityStore.id,
                      page.id,
                    )}
                    onCopy={() => {
                      message.success('拷贝成功');
                    }}
                  >
                    <Button block icon={<ShareAltOutlined />} />
                  </CopyToClipboard>

                  <Button
                    block
                    type="primary"
                    danger
                    onClick={() => {
                      Modal.confirm({
                        icon: <ExclamationCircleOutlined />,
                        content: (
                          <span>
                            确定要删除页面
                            <strong className="dnager">{page.title}</strong>吗
                          </span>
                        ),
                        onOk() {
                          return core.service.deletePage
                            .call(serviceContext, entityStore.id, page.id)
                            .then(() => {
                              entityStore.deletePage(page.id);
                              notification.success({
                                message: '删除页面成功',
                                placement: 'bottomRight',
                                description: (
                                  <span>
                                    页面
                                    <strong className="danger">
                                      {page.title}
                                    </strong>
                                    已被删除
                                  </span>
                                ),
                              });
                            })
                            .catch((err: Error) => {
                              notification.error({
                                message: '删除页面失败',
                                description: err.message,
                                placement: 'bottomRight',
                              });
                              return Promise.reject(err);
                            });
                        },
                      });
                    }}
                    icon={<DeleteOutlined />}
                  />
                </div>
              </div>
            ))}
          </div>
        </Decision.Case>
      </Decision>

      <Modal
        {...modalProps}
        okButtonProps={{
          loading,
        }}
        centered
        onOk={() => {
          store.submit(({ values, errs }) => {
            if (errs) {
              return;
            }
            const target = core.config.templates.find(
              template => values.key === template.key,
            );
            const page = {
              ...values,
              source: target?.plugin.getDefaultValue(entityStore.fields),
            };
            addPage(entityStore.id, page as Omit<Page, 'id'>);
          });
        }}
        title="新建页面"
      >
        <Form layout={vertical}>
          <Item id="title" text="页面标题">
            <Input />
          </Item>
          <Item id="key" text="页面模版">
            <SelectTemplate />
          </Item>
          <Item id="desc" text="页面描述">
            <Input.TextArea
              autoSize={{
                minRows: 5,
              }}
            />
          </Item>
        </Form>
      </Modal>
    </div>
  );
});

export interface EntityEditHeaderProps {}

export const EntityEditHeader: React.FC<EntityEditHeaderProps> = observer(
  () => {
    const history = useHistory();
    const entityStore = useEntityStore();
    const core = useCore();
    const basePath = useBasePath();
    const [edited, setEdited] = useState(false);
    const serviceContext = useContext(ServiceContext);

    const { run: patchEntity, loading } = useRequest(
      core.service.patchEntity.bind(serviceContext),
      {
        onError(err) {
          notification.error({
            placement: 'bottomRight',
            message: '修改简介失败',
            description: err.message,
          });
        },
        onSuccess() {
          setEdited(false);
        },
      },
    );

    const submit = useCallback(() => {
      if (!entityStore.name) {
        entityStore.resetName();
        message.error('实体名称不能为空');
        return;
      }
      patchEntity(entityStore.id, {
        name: entityStore.name,
        desc: entityStore.desc,
      });
    }, [entityStore]);
    const springRef = useRef(null);
    const transRef = useRef(null);
    const transitions = useTransition(edited, null, {
      ref: transRef,
      from: { opacity: 0 },
      enter: { opacity: 1 },
      leave: { opacity: 0 },
      config: {
        duration: 200,
      },
    });
    const spring = useSpring({
      ref: springRef,
      from: {
        opacity: edited ? 0 : 1,
        transform: edited ? 'translateX(-100px)' : 'translateX(0px)',
      },
      to: {
        opacity: edited ? 1 : 0,
        transform: edited ? 'translateX(0px)' : 'translateX(-100px)',
      },
      config: {
        duration: 200,
      },
    });
    useChain(edited ? [springRef, transRef] : [transRef, springRef], [0, 0.4]);

    return (
      <PageHeader
        className="micro-header"
        onBack={() => history.goBack()}
        extra={transitions.map(({ item, key, props, state }) => {
          return item ? (
            <animated.div
              key="done"
              style={{
                ...props,
                ...(state === 'leave' ? undefined : spring),
                display: state === 'leave' ? 'none' : undefined,
              }}
            >
              <Button
                className="done"
                type="primary"
                onClick={submit}
                loading={loading}
              >
                完成
              </Button>
            </animated.div>
          ) : (
            <animated.div
              key={key}
              style={{
                ...props,
                display: state === 'leave' ? 'none' : undefined,
              }}
            >
              <Button
                type="primary"
                style={{
                  marginRight: 8,
                }}
                onClick={() => {
                  setEdited(true);
                }}
              >
                修改简介
              </Button>
              <Button
                danger
                type="primary"
                onClick={() => {
                  let input: string;
                  Modal.confirm({
                    okButtonProps: {
                      type: 'primary',
                      danger: true,
                    },
                    okText: '确认并删除',
                    onOk() {
                      if (input !== entityStore.name) {
                        message.error('输入实体名称不一致');
                        return Promise.reject();
                      }
                      return core.service.deleteEntity
                        .call(serviceContext, entityStore.id)
                        .then(() => {
                          notification.success({
                            placement: 'bottomRight',
                            message: (
                              <span>
                                实体
                                <span className="success">
                                  {entityStore.name}
                                </span>
                                删除成功
                              </span>
                            ),
                          });
                          history.push(basePath);
                        })
                        .catch((err: Error) => {
                          notification.error({
                            placement: 'bottomRight',
                            message: '删除实体失败',
                            description: err.message,
                          });
                          return Promise.reject(err);
                        });
                    },
                    content: (
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <span>
                          确定删除
                          <span className="danger"> {entityStore.name} </span>
                          吗, 请确认实体名称
                        </span>
                        <Input
                          onChange={e => {
                            input = e.target.value;
                          }}
                        />
                      </Space>
                    ),
                  });
                }}
              >
                删除
                <DeleteOutlined />
              </Button>
            </animated.div>
          );
        })}
        title={
          <Decision actual={edited}>
            <Decision.Case expect>
              <Input
                size="small"
                value={entityStore.name}
                onChange={e => entityStore.setName(e.target.value)}
              />
            </Decision.Case>
            <Decision.Case expect={false}>{entityStore.name}</Decision.Case>
          </Decision>
        }
      >
        <div className="micro-header-img">
          <img src={coverImg} alt="content" width="100%" />
        </div>
        <div className="micro-desc">
          <Decision actual={edited}>
            <Decision.Case expect>
              <Input.TextArea
                value={entityStore.desc}
                onChange={e => entityStore.setDesc(e.target.value)}
                autoSize={{
                  minRows: 4,
                }}
              />
            </Decision.Case>
            <Decision.Case expect={false}>
              <div className="text-muti-line">{entityStore.desc}</div>
            </Decision.Case>
          </Decision>
        </div>
      </PageHeader>
    );
  },
);

export interface PageEditProps {}

const PageEdit: React.FC<PageEditProps> = () => {
  const core = useCore();
  const history = useHistory();
  const entityStore = useEntityStore();
  const { id } = useParams<{ id: string }>();
  const serviceContext = useContext(ServiceContext);

  const { data: page, setData: setPage, loading = true } = useRequest(
    core.service.getPage.bind(serviceContext),
    {
      params: [entityStore.id, id],
      first: true,
    },
  );
  const updatePage = useMemo(() => {
    return lodash.debounce(
      (
        args: Parameters<UpdatePage>,
        options?: {
          onSuccess?(): void;
          onError?(err: Error): void;
          onFinish?(): void;
        },
      ) => {
        core.service.updatePage
          .call(serviceContext, ...args)
          .then(() => {
            if (options?.onSuccess) {
              options?.onSuccess();
            } else {
              notification.success({
                message: '页面设置已自动保存',
                placement: 'bottomRight',
              });
            }
          })
          .catch(err => {
            if (options?.onError) {
              options?.onError(err);
            } else {
              notification.error({
                placement: 'bottomRight',
                message: '保存页面设置失败',
                description: err.message,
              });
            }
          })
          .finally(() => {
            options?.onFinish?.();
          });
      },
      2000,
    );
  }, []);

  const [shrink, setShrink] = useLocalStorage('pageheader', false);
  const template = useSearchTemplate(page?.key);
  const pageConfigContext = useContext(PageConfigContext);

  // 注入上下文
  useEffect(() => {
    if (template) {
      template.plugin.setContext({
        ...template.plugin.context!,
        // 进入下次事件循环,类似process.nextTick
        flush: () => {
          setTimeout(updatePage.flush);
        },
        cancel: () => {
          setTimeout(updatePage.cancel);
        },
        saveConfig(dispatch, options = {}) {
          const { refresh = true, ...ohterOptions } = options;
          setPage(prevPage => {
            if (prevPage) {
              // 优化性能
              Object.assign(prevPage, {
                source: dispatch(prevPage?.source),
              });
              updatePage([entityStore.id, prevPage], ohterOptions);
            }
            if (refresh && prevPage) {
              return { ...prevPage };
            }
            return prevPage;
          });
        },
      });
    }
  }, [template, setPage]);
  if (loading) {
    return <Loading tip="加载页面信息中..." />;
  }
  if (!template) {
    return <NotFound title="找不到页面对应的模版" />;
  }
  return (
    <div className="micro-page-content-layout">
      <PageContext.Provider
        value={{
          template,
          page: page as Page,
          setPage,
          updatePage,
        }}
      >
        <PageHeader
          className={classnames('micro-header', {
            'micro-header-shrink': shrink,
          })}
          title={page?.title}
          subTitle={template.name}
          onBack={() => history.goBack()}
        >
          <Show actual={shrink} expect>
            <Button
              size="large"
              onClick={() => history.goBack()}
              type="link"
              icon={<ArrowLeftOutlined />}
              className="micro-header-goback-btn"
            />
          </Show>
          <Button
            size="large"
            onClick={() => {
              setShrink((prev: boolean) => !prev);
            }}
            type="link"
            icon={shrink ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            className="micro-header-shrink-btn"
          />
          <CopyToClipboard
            text={pageConfigContext.getReactPageRenderText(entityStore.id, id)}
            onCopy={() => {
              message.success('拷贝成功');
            }}
          >
            <Button
              size="large"
              type="link"
              icon={<ShareAltOutlined />}
              className="micro-header-share-btn"
            />
          </CopyToClipboard>
          <div className="micro-desc">
            <div className="text-muti-line">{page?.desc}</div>
          </div>
          <div className="micro-header-img">
            <img src={template.cover} alt="content" width="100%" />
          </div>
        </PageHeader>
        <PageContent />
      </PageContext.Provider>
    </div>
  );
};

export interface PageContentProps {}

export const PageContent: React.FC<PageContentProps> = () => {
  const { template } = useContext(PageContext);
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  return (
    <div className="micro-page-content">
      <div className="micro-page-extra">
        <Input
          addonBefore="/"
          className="micro-page-route"
          placeholder="路由地址"
        />
        <Button.Group>
          <Link to={join(history.location.pathname, 'preview')}>
            <Button type="primary">预览</Button>
          </Link>
          <Button
            type="primary"
            onClick={() => {
              setLoading(true);
              template.plugin.context?.saveConfig(prevSource => prevSource, {
                onSuccess() {
                  notification.success({
                    placement: 'bottomRight',
                    message: '保存成功',
                  });
                },
                onFinish() {
                  setLoading(false);
                },
              });
              template.plugin.context?.flush();
            }}
            loading={loading}
          >
            立即保存
          </Button>
        </Button.Group>
      </div>

      <template.plugin.workBenchRender />
    </div>
  );
};
export interface PreviewProps {}

export const Preview: React.FC<PreviewProps> = () => {
  const core = useCore();
  const entityStore = useEntityStore();
  const { id } = useParams<{ id: string }>();
  return <PageRender core={core} entityId={entityStore.id} pageId={id} />;
};

export default Render;
