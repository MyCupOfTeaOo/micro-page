/* eslint-disable
no-param-reassign,
react-hooks/rules-of-hooks,
@typescript-eslint/no-use-before-define,
no-use-before-define,
class-methods-use-this,
react/no-array-index-key
*/
import React, {
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
} from 'react';
import { Field } from 'micro-page-core/es/typings';
import lodash from 'lodash';
import { PagePlugin } from 'micro-page-core/es/Plugin';
import { Decision, Select, Form, Item, useStore, Label } from 'teaness';
import {
  Card,
  Button,
  notification,
  Input,
  Col,
  Modal,
  message,
  Tooltip,
  Radio,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  UnorderedListOutlined,
  EditOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { Link, useHistory, useParams } from 'react-router-dom';

import {
  usePage,
  useModal,
  useEntityStore,
  useEntity,
  useCore,
  useQuery,
} from 'micro-page-react/es/hooks';
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from 'react-sortable-hoc';
import { ItemProps } from 'teaness/es/Form/Item';
import { FormConfigs } from 'teaness/es/Form/typings';
import arrayMove from 'array-move';
import { RadioChangeEvent } from 'antd/lib/radio';
import Axios from 'axios';
import { Source, PageRenderThis } from './typings';
import { join, contextKeyRegExp } from '../Utils/utils';
import FormItem, { FormItemConfig } from './Widget/FormItem';
import { FormPluginContext, PageRenderContext } from './context';
import FormButton, { FormButtonConfig } from './Widget/FormButton';
import Panel from '../Utils/Panel';
import { layoutMap, layouts } from './utils';
import { baseComMap } from '../Utils/comMap';

const SortableForm = SortableContainer((props: any) => {
  return (
    <Form store={props.store} layout={props.layout}>
      {props.children}
    </Form>
  );
});
const SortableDivContainer = SortableContainer((props: any) => {
  return <div {...props} />;
});
const SortableDiv = SortableElement((props: any) => {
  return <div {...props} />;
});

const SortableItem = SortableElement<ItemProps>((props: ItemProps) => (
  <Item {...props} />
));

const DragHandle = SortableHandle(() => (
  <div
    className="micro-item-draghandle"
    style={{
      position: 'absolute',
      right: 0,
    }}
  >
    <UnorderedListOutlined />
  </div>
));

const DragHandleBtn = SortableHandle(() => (
  <div
    className="micro-item-draghandle"
    style={{
      border: 'none',
    }}
  >
    <UnorderedListOutlined />
  </div>
));

export interface BaseFormPluginOptions {}
export interface WorkBenchRenderProps {}
export interface PageRender {}

export default class BaseForm extends PagePlugin<
  BaseFormPluginOptions,
  Source
> {
  getDefaultValue(): Source {
    return {
      title: '详情标题',
      formItem: [],
      formButton: [],
      layout: 'horizontal',
    };
  }

  workBenchRender: React.FC<WorkBenchRenderProps> = () => {
    const history = useHistory();
    const [loading, setLoading] = useState(false);
    const entityStore = useEntityStore();
    const { source } = usePage<Source>();
    const fieldMap = useMemo(
      () =>
        entityStore.fields.reduce<{
          [key: string]: Field;
        }>((map, field) => {
          map[field.code] = field;
          return map;
        }, {}) || {},
      [entityStore.fields],
    );
    const setTitle = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      this.context?.saveConfig(prevSource => {
        prevSource.title = value;
        return prevSource;
      });
    }, []);
    const setLoadUrl = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      this.context?.saveConfig(prevSource => {
        prevSource.loadUrl = value;
        return prevSource;
      });
    }, []);
    const setLayout = useCallback((e: RadioChangeEvent) => {
      const { value } = e.target;
      this.context?.saveConfig(prevSource => {
        prevSource.layout = value;
        return prevSource;
      });
    }, []);
    const { setVisible: setNewVisible, ...modalProps } = useModal();
    const newFieldCode = useRef<string>();
    const queryItemMap = useMemo(
      () =>
        source.formItem.reduce<{
          [key: string]: FormItemConfig;
        }>((map, config) => {
          map[config.fieldCode] = config;
          return map;
        }, {}),
      [source.formItem.length],
    );

    const store = useStore(
      entityStore.fields.reduce<FormConfigs<{ [key: string]: any }>>(
        (config, field) => {
          config[field.code] = {};
          return config;
        },
        {},
      ),
      [],
    );

    const [curFormItem, setCurFormItem] = useState<FormItemConfig>();
    const [curFormButton, setCurFormButton] = useState<FormButtonConfig>();
    const editFormItem = useCallback((formItemConfig: FormItemConfig) => {
      setCurFormButton(undefined);
      setCurFormItem(formItemConfig);
    }, []);
    const editFormBtn = useCallback((formButtonConfig: FormButtonConfig) => {
      setCurFormItem(undefined);
      setCurFormButton(formButtonConfig);
    }, []);
    const onSortItemEnd = useCallback(
      ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
        this.context?.saveConfig(prevSource => {
          if (Array.isArray(prevSource?.formItem)) {
            arrayMove.mutate(prevSource?.formItem!, oldIndex, newIndex);
          }
          return prevSource;
        });
      },
      [],
    );
    const onSortFormBtnEnd = useCallback(
      ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
        this.context?.saveConfig(prevSource => {
          if (Array.isArray(prevSource?.formButton)) {
            arrayMove.mutate(prevSource?.formButton!, oldIndex, newIndex);
          }
          return prevSource;
        });
      },
      [],
    );
    return (
      <FormPluginContext.Provider value={this.context!}>
        <div className="micro-plugin-baseform-layout">
          <div className="micro-plugin-baseform-content">
            <div className="micro-plugin-baseform-extra">
              <Button.Group>
                <Link to={join(history.location.pathname, 'preview')}>
                  <Button type="primary">预览</Button>
                </Link>
                <Button
                  type="primary"
                  onClick={() => {
                    setLoading(true);
                    this.context?.saveConfig(prevSource => prevSource, {
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
                    this.context?.flush();
                  }}
                  loading={loading}
                >
                  立即保存
                </Button>
              </Button.Group>
            </div>
            <Card title="基本配置" className="baseform-baseconfig">
              <Label
                id="url"
                renderText={
                  <span>
                    数据加载路径{' '}
                    <Tooltip
                      placement="rightTop"
                      overlayStyle={{
                        maxWidth: 'inherit',
                      }}
                      title={
                        <span className="mycode">
                          支持参数注入,注入格式为:
                          <code>/xxxx/${'{上下文参数}'}</code>
                          <br />
                          可选上下文参数:
                          <ul>
                            <li>
                              <a
                                target="_blank"
                                rel="noopener noreferrer"
                                href="https://reacttraining.com/react-router/web/api/Hooks/useparams"
                              >
                                <code>params</code>
                              </a>
                            </li>
                            <li>
                              <a
                                target="_blank"
                                rel="noopener noreferrer"
                                href="https://reacttraining.com/react-router/web/example/query-parameters"
                              >
                                <code>query</code>
                              </a>
                            </li>
                          </ul>
                          例:&nbsp;
                          <code>/test?id=${'{query.id}'}</code>
                          <br />
                          <strong className="danger">
                            只支持get加载,接口自行处理好加载逻辑,比如没有id则为new,有id则为get
                          </strong>
                        </span>
                      }
                    >
                      <QuestionCircleOutlined />
                    </Tooltip>
                  </span>
                }
              >
                <Input value={source.loadUrl} onChange={setLoadUrl} />
              </Label>
            </Card>
            <Card
              className="baseform-form-edit-layout"
              title={<Input value={source.title} onChange={setTitle} />}
            >
              <Radio.Group
                buttonStyle="solid"
                value={source.layout}
                onChange={setLayout}
                className="baseform-layout-radio"
              >
                {layouts.map(layout => (
                  <Radio.Button key={layout.value} value={layout.value}>
                    {layout.label}
                  </Radio.Button>
                ))}
              </Radio.Group>
              <SortableForm
                store={store}
                axis="xy"
                useDragHandle
                onSortEnd={onSortItemEnd}
                layout={layoutMap[source.layout]}
              >
                {source.formItem
                  .filter(({ fieldCode }) => fieldMap[fieldCode])
                  .map((config, index) => {
                    const field = fieldMap[config.fieldCode];
                    return (
                      <SortableItem
                        index={index}
                        key={field.code}
                        id={field.code}
                        text={field.name}
                      >
                        {params => (
                          <div className="micro-plugin-baseform-mask">
                            <FormItem
                              {...params}
                              config={config}
                              mode="dev"
                              field={field}
                            />
                            <div className="micro-plugin-baseform-mask-btn">
                              <Button.Group>
                                <Button
                                  type="primary"
                                  icon={<EditOutlined />}
                                  onClick={() => {
                                    editFormItem(config);
                                  }}
                                />
                                <Button
                                  danger
                                  type="primary"
                                  icon={<DeleteOutlined />}
                                  onClick={() => {
                                    Modal.confirm({
                                      title: '确定要删除吗',
                                      content: (
                                        <span>
                                          删除对
                                          <strong className="danger">
                                            {field.name}
                                          </strong>
                                          的设置后将不可恢复
                                        </span>
                                      ),
                                      onOk: () => {
                                        return new Promise(
                                          (resolve, reject) => {
                                            this.context?.saveConfig(
                                              prevSource => {
                                                prevSource.formItem?.splice(
                                                  index,
                                                  1,
                                                );
                                                return prevSource;
                                              },
                                              {
                                                onError(err) {
                                                  notification.error({
                                                    placement: 'bottomRight',
                                                    message: (
                                                      <span>
                                                        删除表单字段
                                                        <strong className="danger">
                                                          {field.name}
                                                        </strong>
                                                        失败
                                                      </span>
                                                    ),
                                                    description: err.message,
                                                  });
                                                  reject();
                                                },
                                                onSuccess() {
                                                  setCurFormItem(
                                                    prevFormItem => {
                                                      if (
                                                        prevFormItem?.fieldCode ===
                                                        field.code
                                                      ) {
                                                        return undefined;
                                                      }
                                                      return prevFormItem;
                                                    },
                                                  );
                                                  notification.success({
                                                    placement: 'bottomRight',
                                                    message: (
                                                      <span>
                                                        删除字段
                                                        <strong className="success">
                                                          {field.name}
                                                        </strong>
                                                        成功
                                                      </span>
                                                    ),
                                                  });
                                                  resolve();
                                                },
                                              },
                                            );
                                            this.context?.flush();
                                          },
                                        );
                                      },
                                    });
                                  }}
                                />
                              </Button.Group>
                              <DragHandle />
                            </div>
                          </div>
                        )}
                      </SortableItem>
                    );
                  })}
              </SortableForm>
              <Decision
                actual={entityStore.fields.length !== source.formItem.length}
              >
                <Decision.Case expect>
                  <Col span={24}>
                    <Button
                      block
                      type="dashed"
                      className="micro-plugin-baseform-add"
                      onClick={() => {
                        newFieldCode.current = undefined;
                        setNewVisible(true);
                      }}
                    >
                      添加表单项 <PlusOutlined />
                    </Button>
                  </Col>
                </Decision.Case>
              </Decision>
            </Card>
            <SortableDivContainer
              axis="x"
              useDragHandle
              className="baseform-footer-toolbar"
              onSortEnd={onSortFormBtnEnd}
            >
              {source.formButton.map((config, i) => (
                <SortableDiv className="footbar-btns-div" key={i} index={i}>
                  <div className="micro-plugin-baseform-mask">
                    <FormButton config={config} mode="dev" />
                    <div className="micro-plugin-baseform-mask-btn">
                      <Button.Group>
                        <Button
                          type="primary"
                          icon={<EditOutlined />}
                          onClick={() => {
                            editFormBtn(config);
                          }}
                        />
                        <Button
                          danger
                          type="primary"
                          icon={<DeleteOutlined />}
                          onClick={() => {
                            Modal.confirm({
                              title: '确定要删除吗',
                              content: (
                                <span>
                                  删除
                                  <strong className="danger">
                                    {config.name}
                                  </strong>
                                  按钮后将不可恢复
                                </span>
                              ),
                              onOk: () => {
                                return new Promise((resolve, reject) => {
                                  this.context?.saveConfig(
                                    prevSource => {
                                      prevSource.formButton?.splice(i, 1);
                                      return prevSource;
                                    },
                                    {
                                      onError(err) {
                                        notification.error({
                                          placement: 'bottomRight',
                                          message: (
                                            <span>
                                              删除按钮
                                              <strong className="danger">
                                                {config.name}
                                              </strong>
                                              失败
                                            </span>
                                          ),
                                          description: err.message,
                                        });
                                        reject();
                                      },
                                      onSuccess() {
                                        setCurFormButton(prevFormBtn => {
                                          if (prevFormBtn === config) {
                                            return undefined;
                                          }
                                          return prevFormBtn;
                                        });
                                        notification.success({
                                          placement: 'bottomRight',
                                          message: (
                                            <span>
                                              删除字段
                                              <strong className="success">
                                                {config.name}
                                              </strong>
                                              成功
                                            </span>
                                          ),
                                        });
                                        resolve();
                                      },
                                    },
                                  );
                                  this.context?.flush();
                                });
                              },
                            });
                          }}
                        />
                      </Button.Group>
                    </div>
                  </div>
                  <DragHandleBtn />
                </SortableDiv>
              ))}
              <Button
                type="dashed"
                onClick={() => {
                  this.context?.saveConfig(prevSource => {
                    prevSource.formButton.push({
                      name: '待配置按钮',
                    });
                    return prevSource;
                  });
                }}
              >
                添加操作 <PlusOutlined />
              </Button>
            </SortableDivContainer>
          </div>
          <Panel
            title={curFormItem && fieldMap[curFormItem?.fieldCode].code}
            subtitle={`(${curFormItem?.fieldCode})`}
            visible={!!curFormItem}
            onHide={() => setCurFormItem(undefined)}
          >
            {curFormItem && (
              <FormItem
                field={fieldMap[curFormItem.fieldCode]}
                mode="config"
                config={curFormItem}
              />
            )}
          </Panel>
          <Panel
            title="操作按钮"
            visible={!!curFormButton}
            onHide={() => setCurFormButton(undefined)}
          >
            {curFormButton && (
              <FormButton config={curFormButton} mode="config" />
            )}
          </Panel>
          <Modal
            {...modalProps}
            title="添加表单项"
            centered
            destroyOnClose
            onOk={() => {
              if (newFieldCode.current) {
                this.context?.saveConfig(prevSource => {
                  prevSource.formItem.push({
                    fieldCode: newFieldCode.current!,
                  });
                  return prevSource;
                });
                setNewVisible(false);
              } else {
                message.error('请选择要添加的表单项');
              }
            }}
          >
            <Select
              onChange={v => {
                newFieldCode.current = v;
              }}
              options={entityStore.fields
                .filter(field => !queryItemMap[field.code])
                .map(field => ({
                  label: `${field.name}(${field.code})`,
                  value: field.code,
                }))}
            />
          </Modal>
        </div>
      </FormPluginContext.Provider>
    );
  };

  pageRender: React.FC<PageRender> = () => {
    const entity = useEntity();
    const core = useCore();
    const page = usePage<Source>();
    const query = useQuery();
    const { source } = page;
    const fieldMap = useMemo(
      () =>
        entity.fields.reduce<{
          [key: string]: Field;
        }>((map, field) => {
          map[field.code] = field;
          return map;
        }, {}) || {},
      [entity],
    );
    const history = useHistory();
    const params = useParams();
    const [data, setData] = useState<{ [key: string]: any }>({});
    const store = useStore(
      source.formItem.reduce<FormConfigs<{ [key: string]: any }>>(
        (config, item) => {
          if (!fieldMap[item.fieldCode]) {
            return config;
          }
          const itemConfig = baseComMap[item.type || 'input'];
          config[item.fieldCode] = {
            defaultValue: data?.[item.fieldCode],
            ...itemConfig.getFormConfig?.(item, fieldMap[item.fieldCode]),
          };

          return config;
        },
        {},
      ),
      [data],
    );
    const [loading, setLoading] = useState(true);

    const pageRenderThis = useMemo<PageRenderThis>(
      () => ({
        setLoading,
        query,
        params,
        entity,
        store,
        page,
        history,
        data,
        location: history.location,
        core,
      }),
      [query, params, entity, store, page, core, data],
    );

    useEffect(() => {
      const context = {
        params,
        query,
      };
      const lodaUrl = (source.loadUrl || '').replace(
        contextKeyRegExp,
        matchkey => {
          const key = matchkey.slice(2, -1);
          return lodash.get(context, key, key);
        },
      );
      const s = Axios.CancelToken.source();
      let isCancel = false;
      core.request
        .get(lodaUrl, {
          cancelToken: s.token,
        })
        .then(req => {
          setData(req);
        })
        .catch((err: Error) => {
          if (!isCancel) {
            Modal.error({
              title: '加载信息失败',
              content: err.message,
            });
          }
        })
        .finally(() => {
          if (!isCancel) setLoading(false);
        });
      return () => {
        isCancel = true;
        s.cancel();
      };
    }, []);

    return (
      <PageRenderContext.Provider value={pageRenderThis}>
        <div className="micro-plugin-baseform-layout">
          <div className="micro-plugin-baseform-content">
            <Card title={source.title}>
              <Spin spinning={loading}>
                <Form
                  id="myform"
                  store={store}
                  layout={layoutMap[source.layout]}
                >
                  {source.formItem
                    .filter(({ fieldCode }) => fieldMap[fieldCode])
                    .map(config => {
                      const field = fieldMap[config.fieldCode];
                      const com = config.type
                        ? baseComMap[config.type]
                        : undefined;
                      return (
                        <Item
                          key={field.code}
                          id={field.code}
                          text={field.name}
                          trigger={com?.trigger}
                          valueName={com?.valueName}
                        >
                          <FormItem config={config} mode="prod" field={field} />
                        </Item>
                      );
                    })}
                </Form>
              </Spin>
            </Card>
            <div className="baseform-footer-toolbar baseform-footer-toolbar-prod">
              {source.formButton.map((config, i) => (
                <FormButton
                  loading={loading}
                  key={i}
                  config={config}
                  mode="prod"
                />
              ))}
            </div>
          </div>
        </div>
      </PageRenderContext.Provider>
    );
  };
}
