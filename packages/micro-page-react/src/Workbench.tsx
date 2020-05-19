
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
} from '@ant-design/icons';
import {
  Switch,
  Route,
  Redirect,
  useHistory,
  useParams,
} from 'react-router-dom';
import { Decision, useStore, useForm, vertical, Show, Select } from 'teaness';
import MicroPageCore from 'micro-page-core';
import { UpdatePage } from 'micro-page-core/es/Service';
import { Page, Template, Field, FieldType } from 'micro-page-core/es/typings';
import { typeOptions } from 'micro-page-core/es/constant';
import './image'
import { ReactComponent as Stringsvg } from './assets/string.svg';
import { ReactComponent as Numbersvg } from './assets/number.svg';
import { ReactComponent as Datesvg } from './assets/date.svg';
import { ReactComponent as Timesvg } from './assets/time.svg';
import { ReactComponent as Imagesvg } from './assets/image.svg';
import { ReactComponent as Filesvg } from './assets/file.svg';
import { ReactComponent as Richtextsvg } from './assets/richtext.svg';
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
  useProjectStore,
} from './hooks';
import { RenderContext, ProjectContext, PageContext } from './context';
import { ProjectStore } from './store';
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

const Render: React.FC<RenderProps> = ({ core, basePath = '' }) => {
  return (
    <RenderContext.Provider
      value={{
        core,
        basePath,
      }}
    >
      <div className="micro-layout">
        <Switch>
          <Route exact path={`${basePath}/`}>
            <ProjectList />
          </Route>

          <Route path={`${basePath}/:id`}>
            <ProjectEdit />
          </Route>
          <Redirect
            to={{
              pathname: `${basePath}/`,
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

export interface ProjectListProps {}

export interface NewProjectForm {
  name: string;
  desc?: string;
}

export const ProjectList: React.FC<ProjectListProps> = () => {
  const { setVisible, ...modalProps } = useModal();
  const store = useStore<NewProjectForm>({
    name: {
      rules: {
        required: true,
        message: '项目名称不能为空',
      },
    },
    desc: {},
  });
  const { Form, Item } = useForm(store);
  const core = useCore();
  const history = useHistory();
  const basePath = useBasePath();
  const { data: projects, loading: loadingProjects } = useRequest(
    core.service.getProjects,
    {
      onError(err) {
        notification.error({
          message: '查询项目列表失败',
          description: err.message,
          placement: 'bottomRight',
        });
      },
      first: true,
    },
  );
  const { run, loading } = useRequest(core.service.newProject, {
    onSuccess(res) {
      setVisible(false);
      history.push({
        pathname: `${basePath}/${res.id}`,
      });
    },
    onError(err) {
      notification.error({
        message: '新建项目失败',
        description: err.message,
        placement: 'bottomRight',
      });
    },
  });
  if (loadingProjects) {
    return <Loading tip="加载项目列表中" />;
  }
  return (
    <div className="micro-main">
      <Decision actual={!!projects?.length}>
        <Decision.Case expect>
          <div className="micro-project-list">
            <PageHeader
              className="micro-header"
              title="全部项目"
              subTitle="创建与编辑项目"
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
              {projects?.map(project => (
                <div
                  key={project.id}
                  className="micro-card"
                  onClick={() => {
                    history.push({
                      pathname: `${basePath}/${project.id}`,
                    });
                  }}
                >
                  <img className="cover" alt="封面" src={coverImg} />
                  <div className="content center">
                    <h4 className="ellipsis">{project.name}</h4>
                    <div className="ellipsis desc">
                      {project.desc || '暂无描述'}
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
              新建项目
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
              run(values as NewProjectForm);
            }
          });
        }}
        title="新建项目"
      >
        <Form layout={vertical}>
          <Item id="name" text="项目名">
            <Input />
          </Item>
          <Item id="desc" text="项目描述">
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

export interface ProjectEditProps {}

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

export const ProjectEdit: React.FC<ProjectEditProps> = observer(() => {
  const core = useCore();
  const { id } = useParams<{ id: string }>();
  const store = useMemo(() => {
    return new ProjectStore({ core, id });
  }, [id]);
  const basePath = useBasePath();
  const { run, loading = true } = useRequest(core.service.getProject, {
    onSuccess(res) {
      store.loadProject(res);
    },
    onError(err) {
      notification.error({
        message: '加载项目失败',
        description: err.message,
        placement: 'bottomRight',
      });
    },
  });
  useEffect(() => {
    run(id);
  }, [id]);
  if (loading) {
    return <Loading />;
  }
  return (
    <ProjectContext.Provider
      value={{
        store,
      }}
    >
      <div className="micro-main micro-main-project">
        <Switch>
          <Route path={`${basePath}/${id}`} exact>
            <ProjectEditHeader />
            <ProjectContent />
          </Route>
          <Route path={`${basePath}/${id}/:id/preview`} exact>
            <Preview />
          </Route>
          <Route path={`${basePath}/${id}/:id`} exact>
            <PageEdit />
          </Route>
        </Switch>
      </div>
    </ProjectContext.Provider>
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

export interface ProjectContentProps {}
export const ProjectContent: React.FC<ProjectContentProps> = observer(() => {
  const projectStore = useProjectStore();
  return (
    <div className="micro-project-content">
      <ProjectFieldLayout />
      <Show actual={!!projectStore.fields.length} expect>
        <PageList />
      </Show>
    </div>
  );
});

export interface ProjectFieldLayoutProps {}

export const ProjectFieldLayout: React.FC<ProjectFieldLayoutProps> = observer(
  () => {
    const projectStore = useProjectStore();
    const core = useCore();
    const [curField, setCurField] = useState<Field>();
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
                  projectStore.fields.find(field => field.code === value)
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
      [curField],
    );
    const { Form, Item } = useForm(store);
    const { setVisible, ...drawerProps } = useDrawer();
    const newField = useCallback(() => {
      setCurField(undefined);
      store.reset();
      setVisible(true);
    }, []);
    const { run: setPrimaryKey } = useRequest(core.service.setPrimaryKey, {
      onError(err) {
        notification.error({
          message: '设置字段主键失败',
          description: err.message,
          placement: 'bottomRight',
        });
      },
    });

    const { run: addField, loading: adding } = useRequest(
      core.service.addField,
      {
        onSuccess(_, params) {
          if (!projectStore.fields.length) {
            setPrimaryKey(projectStore.id, params[1].code);
            projectStore.fields.push({
              ...params[1],
              primary: true,
            });
          } else {
            projectStore.fields.push(params[1]);
          }

          setVisible(false);
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
      core.service.updateField,
      {
        onSuccess(_, params) {
          const field = projectStore.fields.find(
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
            updateField(projectStore.id, curField.code, values as Field);
          } else {
            addField(projectStore.id, values as Field);
          }
        }
      });
    }, [curField]);
    return (
      <div className="micro-field-layout">
        <Decision actual={!projectStore.fields.length}>
          <Decision.Case expect>
            <div className="micro-empty-list">
              <Button type="primary" onClick={newField}>
                新建字段 <PlusOutlined />
              </Button>
            </div>
          </Decision.Case>
          <Decision.Case expect={false}>
            <Radio.Group
              value={projectStore.fields.find(field => field.primary)?.code}
              onChange={e => {
                projectStore.setPrimary(e.target.value);
                setPrimaryKey(projectStore.id, e.target.value);
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
              {projectStore.fields.map(field => (
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
                            return core.service
                              .deleteField(projectStore.id, curField.code)
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
  const projectStore = useProjectStore();
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
  const { run: addPage, loading } = useRequest(core.service.addPage, {
    onError: err => {
      notification.error({
        message: '新增页面失败',
        description: err.message,
        placement: 'bottomRight',
      });
    },
    onSuccess: (data, params) => {
      setVisible(false);
      projectStore.addPage(data);
      notification.success({
        placement: 'bottomRight',
        message: '新增页面成功',
        description: (
          <span>
            页面
            <a
              onClick={() =>
                history.push(`${basePath}/${params[0]}/${data.id}`)
              }
            >
              {params[1].title}
            </a>
            已添加
          </span>
        ),
      });
    },
  });
  return (
    <div className="micro-page-list-layout">
      <Decision actual={!projectStore.pages?.length}>
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
            {projectStore.pages?.map(page => (
              <div
                key={page.id}
                className="micro-card"
                onClick={() => {
                  history.push(`${basePath}/${projectStore.id}/${page.id}`);
                }}
              >
                <img className="cover" alt="封面" src={page.template?.cover} />
                <div className="content center">
                  <h4 className="ellipsis">{page.title}</h4>
                  <div className="ellipsis desc">{page.desc || '暂无描述'}</div>
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
              source: target?.plugin.getDefaultValue(projectStore.fields),
            }
            addPage(projectStore.id, page as Omit<Page, 'id'>);
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

export interface ProjectEditHeaderProps {}

export const ProjectEditHeader: React.FC<ProjectEditHeaderProps> = observer(
  () => {
    const history = useHistory();
    const projectStore = useProjectStore();
    const core = useCore();
    const basePath = useBasePath();
    const [edited, setEdited] = useState(false);
    const { run: patchProject, loading } = useRequest(
      core.service.patchProject,
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
      if (!projectStore.name) {
        projectStore.resetName();
        message.error('项目名称不能为空');
        return;
      }
      patchProject(projectStore.id, {
        name: projectStore.name,
        desc: projectStore.desc,
      });
    }, [projectStore]);
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
                onClick={() => {
                  let input: string;
                  Modal.confirm({
                    okButtonProps: {
                      danger: true,
                    },
                    okText: '确认并删除',
                    onOk() {
                      if (input !== projectStore.name) {
                        message.error('输入项目名称不一致');
                        return Promise.reject();
                      }
                      return core.service
                        .deleteProject(projectStore.id)
                        .then(() => {
                          notification.success({
                            placement: 'bottomRight',
                            message: (
                              <span>
                                项目
                                <span className="success">
                                  {projectStore.name}
                                </span>
                                删除成功
                              </span>
                            ),
                          });
                          history.push(`${basePath}/`);
                        })
                        .catch((err: Error) => {
                          notification.error({
                            placement: 'bottomRight',
                            message: '删除项目失败',
                            description: err.message,
                          });
                          return Promise.reject(err);
                        });
                    },
                    content: (
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <span>
                          确定删除
                          <span className="danger"> {projectStore.name} </span>
                          吗, 请确认项目名称
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
                value={projectStore.name}
                onChange={e => projectStore.setName(e.target.value)}
              />
            </Decision.Case>
            <Decision.Case expect={false}>{projectStore.name}</Decision.Case>
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
                value={projectStore.desc}
                onChange={e => projectStore.setDesc(e.target.value)}
                autoSize={{
                  minRows: 4,
                }}
              />
            </Decision.Case>
            <Decision.Case expect={false}>
              <div className="text-muti-line">{projectStore.desc}</div>
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
  const projectStore = useProjectStore();
  const { id } = useParams<{ id: string }>();
  const { data: page, setData: setPage, loading = true } = useRequest(
    core.service.getPage,
    {
      params: [projectStore.id, id],
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
        core.service
          .updatePage(...args)
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
              updatePage([projectStore.id, prevPage], ohterOptions);
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
          <Button
            size="large"
            onClick={() => {
              setShrink((prev: boolean) => !prev);
            }}
            type="link"
            icon={shrink ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            className="micro-header-shrink-btn"
          />
          <Show actual={shrink} expect>
            <Button
              size="large"
              onClick={() => history.goBack()}
              type="link"
              icon={<ArrowLeftOutlined />}
              className="micro-header-goback-btn"
            />
          </Show>
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

  return (
    <div className="micro-page-content">
      <template.plugin.workBenchRender />
    </div>
  );
};
export interface PreviewProps {}

export const Preview: React.FC<PreviewProps> = () => {
  const core = useCore();
  const projectStore = useProjectStore();
  const { id } = useParams<{ id: string }>();
  return <PageRender core={core} projectId={projectStore.id} pageId={id} />;
};

export default Render;
