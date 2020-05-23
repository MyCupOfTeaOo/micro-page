import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  useStore,
  Form,
  Item,
  FoldCard,
  horizontal,
  Col,
  Select,
  Decision,
  useDataGrid,
} from 'teaness';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from 'react-sortable-hoc';
import arrayMove from 'array-move';
import { PagePlugin } from 'micro-page-core/es/Plugin';
import { Field } from 'micro-page-core/es/typings';
import {
  useEntityStore,
  usePage,
  useModal,
  useEntity,
  useCore,
} from 'micro-page-react/es/hooks';
import { Button, Modal, message, notification } from 'antd';
import { SelectProps } from 'antd/es/select/index';
import { FormConfigs } from 'teaness/es/Form/typings';
import { ItemProps } from 'teaness/es/Form/Item';
import { useHistory, Link, useLocation } from 'react-router-dom';
import { CancellablePromise } from 'mobx/lib/api/flow';
import QueryItem, { QueryItemConfig } from './Widget/QueryItem';
import Panel from '../Utils/Panel';
import { ListPluginContext, PageRenderContext } from './context';
import QueryButton, { QueryButtonConfig } from './Widget/QueryButton';
import { Source, PageRenderThis } from './typings';
import DataGrid from './Widget/DataGrid';
import { join } from '../Utils/utils';
import { baseComMap } from '../Utils/comMap';

/* eslint-disable
no-param-reassign,
react-hooks/rules-of-hooks,
@typescript-eslint/no-use-before-define,
no-use-before-define,
class-methods-use-this,
react/no-array-index-key
*/

const SortableForm = SortableContainer((props: any) => {
  return (
    <Form store={props.store} layout={horizontal}>
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

export interface ListPluginOptions {
  completeRequest?: {
    url?(): CancellablePromise<SelectProps<string>['options']>;
  };
  completeFilter?: {
    url?: SelectProps<string>['filterOption'];
  };
}
export interface WorkBenchRenderProps {}
export interface PageRender {}

export default class List extends PagePlugin<ListPluginOptions, Source> {
  getDefaultValue(): Source {
    return {
      queryItem: [],
      queryButton: [],
      grid: {
        columnDefs: [],
      },
    };
  }

  workBenchRender: React.FC<WorkBenchRenderProps> = () => {
    const { setVisible: setNewVisible, ...modalProps } = useModal();
    const entityStore = useEntityStore();
    const history = useHistory();
    const newFieldCode = useRef<string>();
    const { source } = usePage<Source>();
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
    const [curQueryItem, setCurQueryItem] = useState<QueryItemConfig>();
    const [curQueryBtn, setCurQueryBtn] = useState<QueryButtonConfig>();
    const editQueryItem = useCallback((queryItemConfig: QueryItemConfig) => {
      setCurQueryBtn(undefined);
      setCurQueryItem(queryItemConfig);
    }, []);
    const editQueryBtn = useCallback((queryButtonConfig: QueryButtonConfig) => {
      setCurQueryItem(undefined);
      setCurQueryBtn(queryButtonConfig);
    }, []);
    const [loading, setLoading] = useState(false);
    const queryItemMap = useMemo(
      () =>
        source.queryItem.reduce<{
          [key: string]: QueryItemConfig;
        }>((map, config) => {
          map[config.fieldCode] = config;
          return map;
        }, {}),
      [source.queryItem.length],
    );
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
    const onSortItemEnd = useCallback(
      ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
        this.context?.saveConfig(prevSource => {
          if (Array.isArray(prevSource?.queryItem)) {
            arrayMove.mutate(prevSource?.queryItem!, oldIndex, newIndex);
          }
          return prevSource;
        });
      },
      [],
    );
    const onSortSearchBtnEnd = useCallback(
      ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
        this.context?.saveConfig(prevSource => {
          if (Array.isArray(prevSource?.queryButton)) {
            arrayMove.mutate(prevSource?.queryButton!, oldIndex, newIndex);
          }
          return prevSource;
        });
      },
      [],
    );

    const { gridRef, setQueryData, queryDataRef, gridProps } = useDataGrid();
    const listPluginContext = useMemo(
      () => ({
        ...this.context!,
        options: this.options,
      }),
      [this.context, this.options],
    );
    return (
      <ListPluginContext.Provider value={listPluginContext}>
        <div className="micro-plugin-list-layout">
          <div className="micro-plugin-list-content">
            <div className="micro-plugin-list-extra">
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
            <FoldCard title="查询条件" className="micro-plugin-list-search">
              <SortableForm
                store={store}
                useDragHandle
                axis="xy"
                onSortEnd={onSortItemEnd}
              >
                {source.queryItem
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
                          <div className="micro-plugin-list-mask">
                            <QueryItem
                              {...params}
                              config={config}
                              mode="dev"
                              field={field}
                            />
                            <div className="micro-plugin-list-mask-btn">
                              <Button.Group>
                                <Button
                                  type="primary"
                                  icon={<EditOutlined />}
                                  onClick={() => {
                                    editQueryItem(config);
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
                                                prevSource?.queryItem?.splice(
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
                                                  setCurQueryItem(
                                                    prevQueryItem => {
                                                      if (
                                                        prevQueryItem === config
                                                      ) {
                                                        return undefined;
                                                      }
                                                      return prevQueryItem;
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
                <Decision
                  actual={entityStore.fields.length !== source.queryItem.length}
                >
                  <Decision.Case expect>
                    <Col span={24}>
                      <Button
                        block
                        type="dashed"
                        className="micro-plugin-list-add"
                        onClick={() => {
                          newFieldCode.current = undefined;
                          setNewVisible(true);
                        }}
                      >
                        添加查询条件 <PlusOutlined />
                      </Button>
                    </Col>
                  </Decision.Case>
                </Decision>
                <Col span={24}>
                  <SortableDivContainer
                    axis="x"
                    useDragHandle
                    className="search-btns"
                    onSortEnd={onSortSearchBtnEnd}
                  >
                    {source.queryButton.map((btnConfig, i) => (
                      <SortableDiv
                        key={i}
                        index={i}
                        className="search-btn-layout"
                      >
                        <div className="micro-plugin-list-mask">
                          <QueryButton config={btnConfig} mode="dev" />
                          <div className="micro-plugin-list-mask-btn">
                            <Button.Group>
                              <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() => {
                                  editQueryBtn(btnConfig);
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
                                          {btnConfig.name}
                                        </strong>
                                        按钮后将不可恢复
                                      </span>
                                    ),
                                    onOk: () => {
                                      return new Promise((resolve, reject) => {
                                        this.context?.saveConfig(
                                          prevSource => {
                                            prevSource?.queryButton?.splice(
                                              i,
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
                                                    删除按钮
                                                    <strong className="danger">
                                                      {btnConfig.name}
                                                    </strong>
                                                    失败
                                                  </span>
                                                ),
                                                description: err.message,
                                              });
                                              reject();
                                            },
                                            onSuccess() {
                                              setCurQueryBtn(prevQueryBtn => {
                                                if (curQueryBtn === btnConfig) {
                                                  return undefined;
                                                }
                                                return prevQueryBtn;
                                              });
                                              notification.success({
                                                placement: 'bottomRight',
                                                message: (
                                                  <span>
                                                    删除字段
                                                    <strong className="success">
                                                      {btnConfig.name}
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
                          prevSource.queryButton.push({
                            name: '待配置按钮',
                          });
                          return prevSource;
                        });
                      }}
                    >
                      添加操作 <PlusOutlined />
                    </Button>
                  </SortableDivContainer>
                </Col>
              </SortableForm>
            </FoldCard>
            <DataGrid
              gridRef={gridRef}
              setQueryData={setQueryData}
              queryDataRef={queryDataRef}
              gridProps={gridProps}
              mode="config"
            />
          </div>
          <Panel
            title={curQueryItem && fieldMap[curQueryItem?.fieldCode].code}
            subtitle={`(${curQueryItem?.fieldCode})`}
            visible={!!curQueryItem}
            onHide={() => setCurQueryItem(undefined)}
          >
            {curQueryItem && (
              <QueryItem
                field={fieldMap[curQueryItem.fieldCode]}
                mode="config"
                config={curQueryItem}
              />
            )}
          </Panel>
          <Panel
            title="操作按钮(查询区)"
            visible={!!curQueryBtn}
            onHide={() => setCurQueryBtn(undefined)}
          >
            {curQueryBtn && <QueryButton config={curQueryBtn} mode="config" />}
          </Panel>
          <Modal
            {...modalProps}
            title="添加查询条件"
            centered
            destroyOnClose
            onOk={() => {
              if (newFieldCode.current) {
                this.context?.saveConfig(prevSource => {
                  prevSource.queryItem.push({
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
      </ListPluginContext.Provider>
    );
  };

  pageRender: React.FC<PageRender> = () => {
    const entity = useEntity();
    const core = useCore();
    const page = usePage<Source>();
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
    const location = useLocation() as any;
    const useGridOption = useMemo(() => {
      if (source.grid.base?.historyMemory) {
        return { location, historyId: 'grid' };
      }
    }, []);
    const { gridRef, setQueryData, queryDataRef, gridProps } = useDataGrid(
      useGridOption,
    );

    const store = useStore(
      source.queryItem.reduce<FormConfigs<{ [key: string]: any }>>(
        (config, item) => {
          if (!fieldMap[item.fieldCode]) {
            return config;
          }
          const queryConfig = baseComMap[item.type || 'input'];
          config[item.fieldCode] = {
            ...queryConfig.getFormConfig?.(item, fieldMap[item.fieldCode]),
          };

          return config;
        },
        {},
      ),
      [],
    );
    const pageRenderThis = useRef<PageRenderThis>({
      gridRef,
      setQueryData,
      queryDataRef,
      entity,
      store,
      page,
      history,
      location,
      core,
    });

    return (
      <PageRenderContext.Provider value={pageRenderThis.current}>
        <div className="micro-plugin-list-layout">
          <div className="micro-plugin-list-content">
            <FoldCard title="查询条件" className="micro-plugin-list-search">
              <Form store={store} layout={horizontal}>
                {source.queryItem
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
                        <QueryItem config={config} mode="prod" field={field} />
                      </Item>
                    );
                  })}
                <Col span={24}>
                  <div className="search-btns">
                    {source.queryButton.map((config, i) => (
                      <QueryButton key={i} config={config} mode="prod" />
                    ))}
                  </div>
                </Col>
              </Form>
            </FoldCard>
            <DataGrid
              mode="prod"
              gridRef={gridRef}
              setQueryData={setQueryData}
              queryDataRef={queryDataRef}
              gridProps={gridProps}
            />
          </div>
        </div>
      </PageRenderContext.Provider>
    );
  };
}
