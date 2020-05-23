/* eslint-disable no-param-reassign */

import React, {
  useCallback,
  useContext,
  useMemo,
  useState,
  useRef,
  useEffect,
} from 'react';
import {
  useDataGrid,
  DataGrid as Grid,
  useStore,
  useForm,
  vertical,
  Decision,
  BaseGrid,
  useValue,
} from 'teaness';
import classnames from 'classnames';
import {
  Checkbox,
  Input,
  Tooltip,
  Switch,
  Alert,
  Button,
  Popconfirm,
  AutoComplete,
} from 'antd';
import { ColDef } from 'ag-grid-community/dist/lib/entities/colDef';
import {
  SearchOutlined,
  QuestionCircleOutlined,
  TableOutlined,
  PlusOutlined,
  UnorderedListOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import {
  useEntityStore,
  usePage,
  useLocalStorage,
  useEntity,
} from 'micro-page-react/es/hooks';
import './dataGrid.scss';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { Field } from 'micro-page-core/es/typings';
import {
  ColumnDefs,
  Sorter,
  ResponseData,
  DataGridRef,
  Location,
} from 'teaness/es/DataGrid/typings';
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from 'react-sortable-hoc';
import { CancellablePromise } from 'micro-page-core/es/utils';
import arrayMove from 'array-move';
import { SelectProps } from 'antd/es/select';
import { Source } from '../typings';
import { ListPluginContext } from '../context';
import Operation, { OperationConfig } from '../Component/DataGridOperation';

const SortableDivContainer = SortableContainer((props: any) => {
  return <div {...props} />;
});
const SortableDiv = SortableElement((props: any) => {
  return <div {...props} />;
});

const DragHandle = SortableHandle(() => (
  <div className="vitual-operate-draghandle">
    <UnorderedListOutlined />
  </div>
));

const virtualField: Field = {
  code: '$virtualField',
  name: '操作 (虚拟列)',
  type: 'string',
};

function requestHook() {
  const r = (Promise.resolve({
    total: 1,
    list: [{}],
  }) as any) as CancellablePromise<ResponseData<{}>>;
  r.cancel = () => {};
  return r;
}

export interface BaseConfig {
  /**
   * 请求地址
   */
  fetchUrl: string;
  /**
   * 路由记忆
   */
  historyMemory: boolean;
}

export interface DataGridConfig {
  columnDefs: ({
    field: string;
  } & ColDef)[];
  base?: Partial<BaseConfig>;
  pageSize?: number;
  sorters?: Sorter[];
  operationConfig?: OperationConfig[];
}

export interface DataGridProps {
  mode: 'dev' | 'prod' | 'config';
  gridProps: {
    ref: import('react').RefObject<DataGridRef>;
    historyId: string | undefined;
    queryDataRef: any;
    location: Location<any> | undefined;
  };
  gridRef: import('react').RefObject<DataGridRef>;
  queryDataRef: import('react').MutableRefObject<any>;
  setQueryData: (data: any) => void;
}
const DataGrid: React.FC<DataGridProps> = props => {
  if (props.mode === 'config') return <DataGridConfig {...props} />;
  else return <DataGridProd {...props} />;
};

const DataGridConfig: React.FC<DataGridProps> = () => {
  const entityStore = useEntityStore();
  const { source } = usePage<Source>();
  const { columnDefs } = source.grid;
  const pinned = useRef(false);
  const moved = useRef(false);
  const resized = useRef(false);
  const [visibleKey, setVisibleKey] = useLocalStorage<
    'base' | 'col' | 'vitualCol' | undefined
  >('visibleKey', undefined);
  const [curVistualOperate, setCurVistualOperate] = useState<OperationConfig>();
  const { gridRef, gridProps } = useDataGrid();
  const listPluginContext = useContext(ListPluginContext);
  const fieldMap = entityStore.fields.reduce<{
    [key: string]: Field;
  }>(
    (map, field) => {
      map[field.code] = field;
      return map;
    },
    { [virtualField.code]: virtualField },
  );
  const selectCol = useCallback((event: CheckboxChangeEvent) => {
    const fieldCode = (event.target as any)['data-code'] as string;
    if (event.target.checked) {
      listPluginContext.saveConfig(prevSource => {
        prevSource.grid.columnDefs.push({
          field: fieldCode,
        });
        return prevSource;
      });
    } else {
      listPluginContext.saveConfig(prevSource => {
        prevSource.grid.columnDefs.splice(
          prevSource.grid.columnDefs.findIndex(col => col.field === fieldCode),
          1,
        );
        return prevSource;
      });
    }
  }, []);
  const [search, setSearch] = useState<string>();
  const colSideBar = useMemo(() => {
    return entityStore.fields
      .concat([virtualField])
      .filter(
        field =>
          !search || field.code.includes(search) || field.name.includes(search),
      )
      .sort((prevField, nextField) => {
        const prevIndex = columnDefs.findIndex(
          col => col.field === prevField.code,
        );
        const nextIndex = columnDefs.findIndex(
          col => col.field === nextField.code,
        );

        if (prevIndex < 0) {
          return 1;
        }
        if (nextIndex < 0) {
          return -1;
        }

        return prevIndex - nextIndex;
      })
      .map(field => (
        <Checkbox
          key={field.code}
          onChange={selectCol}
          data-code={field.code}
          className={classnames({
            operationCol: field.code === virtualField.code,
          })}
          checked={columnDefs.some(col => col.field === field.code)}
        >
          {field.name}
        </Checkbox>
      ));
  }, [entityStore.fields, search, columnDefs.length, columnDefs]);
  const formatColumnDefs = useMemo<ColumnDefs>(() => {
    return columnDefs.map(col => {
      if (col.field === virtualField.code) {
        return {
          ...col,
          headerClass: 'operationCol',
          headerName: fieldMap[col.field!].name,
          cellRendererFramework({ data }: { data: any }) {
            const { source: mySource } = usePage<Source>();
            return (
              <span className="list-btn-group">
                {mySource.grid.operationConfig?.map((config, i) => (
                  <Operation
                    key={i}
                    mode="dev"
                    config={config}
                    rowData={data}
                  />
                ))}
              </span>
            );
          },
        };
      }

      return {
        ...col,
        headerName: fieldMap[col.field!].name,
      };
    });
  }, [columnDefs.length, columnDefs]);
  const baseStore = useStore<BaseConfig>(
    {
      fetchUrl: {
        defaultValue: source.grid.base?.fetchUrl,
      },
      historyMemory: {
        defaultValue: source.grid.base?.historyMemory,
      },
    },
    [],
  );
  const { Form, Item } = useForm(baseStore);

  const saveListDefaultQuery = useCallback(() => {
    const query = gridRef.current?.getSearch();
    if (
      source.grid.pageSize === query?.pageSize &&
      source.grid.sorters === query?.sorters
    ) {
      return;
    }
    listPluginContext.saveConfig(prevSource => {
      prevSource.grid.pageSize = query?.pageSize;
      prevSource.grid.sorters = query?.sorters;
      return prevSource;
    });
  }, []);

  const onSortSearchBtnEnd = useCallback(
    ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
      listPluginContext?.saveConfig(prevSource => {
        if (Array.isArray(prevSource.grid.operationConfig)) {
          arrayMove.mutate(prevSource.grid.operationConfig, oldIndex, newIndex);
        }
        return prevSource;
      });
    },
    [],
  );

  useEffect(() => {
    baseStore.onChange = () => {
      listPluginContext.saveConfig(prevSource => {
        prevSource.grid.base = baseStore.getValues();
        return prevSource;
      });
    };
  }, []);

  const urlOptions = useValue<SelectProps<string>['options']>();

  useEffect(() => {
    const req = listPluginContext.options?.completeRequest?.url?.();
    req
      ?.then(res => {
        urlOptions.value = res;
      })
      .catch(err => console.error(err));
    return req?.cancel;
  }, []);
  return (
    <div className="list-datagrid">
      <Grid
        {...gridProps}
        onColumnMoved={() => {
          moved.current = true;
        }}
        onColumnPinned={() => {
          pinned.current = true;
        }}
        request={requestHook}
        fetchSuccessCallback={saveListDefaultQuery}
        fetchErrorCallback={saveListDefaultQuery}
        defaultPageSize={source.grid.pageSize}
        defaultSorters={source.grid.sorters}
        onColumnResized={() => {
          resized.current = true;
        }}
        onDragStopped={({ columnApi }) => {
          const displayCols = columnApi.getAllDisplayedColumns();

          listPluginContext.saveConfig(prevSource => {
            // 列移动
            if (moved.current) {
              moved.current = false;
              prevSource.grid.columnDefs.sort(
                (prevCol, nextCol) =>
                  displayCols.findIndex(
                    displayCol =>
                      displayCol.getColDef().field === prevCol.field,
                  ) -
                  displayCols.findIndex(
                    displayCol =>
                      displayCol.getColDef().field === nextCol.field,
                  ),
              );
              prevSource.grid.columnDefs = prevSource.grid.columnDefs.concat(
                [],
              );
            }
            if (resized.current) {
              resized.current = false;
              prevSource.grid.columnDefs.forEach(col => {
                col.width = displayCols
                  .find(
                    displayCol => displayCol.getColDef().field === col.field,
                  )
                  ?.getActualWidth();
              });
            }
            if (pinned.current) {
              pinned.current = false;
              prevSource.grid.columnDefs.forEach(col => {
                col.pinned = displayCols
                  .find(
                    displayCol => displayCol.getColDef().field === col.field,
                  )
                  ?.getPinned();
              });
            }
            return prevSource;
          });
        }}
        fetchUrl={source.grid.base?.fetchUrl || ''}
        columnDefs={formatColumnDefs}
      />
      <div className="datagrid-sidebar">
        <div
          className={classnames('datagrid-sidebar-content', {
            'datagrid-sidebar-content-hide': visibleKey !== 'base',
          })}
        >
          <div
            className="sidebar-title"
            style={{
              height: (BaseGrid.defaultProps?.headerHeight || 56) + 1,
              lineHeight: (BaseGrid.defaultProps?.headerHeight || 56) + 1,
            }}
          >
            基础设置
          </div>
          <section>
            <Form layout={vertical}>
              <Item
                id="fetchUrl"
                text="请求路径"
                renderText={
                  <span>
                    请求路径{' '}
                    <Tooltip title="需要实现 teaness {DataGridRegister.request}">
                      <QuestionCircleOutlined />
                    </Tooltip>
                  </span>
                }
              >
                <AutoComplete
                  options={urlOptions.value}
                  filterOption={listPluginContext.options?.completeFilter?.url}
                />
              </Item>
              <Item
                id="historyMemory"
                valueName="checked"
                text="路由记忆"
                renderText={
                  <span>
                    路由记忆{' '}
                    <Tooltip title="后退或前进到该页面时,会默认使用上次的查询条件">
                      <QuestionCircleOutlined />
                    </Tooltip>
                  </span>
                }
              >
                <Switch />
              </Item>
            </Form>
          </section>
        </div>
        <div
          className={classnames('datagrid-sidebar-content', {
            'datagrid-sidebar-content-hide': visibleKey !== 'col',
          })}
        >
          <div
            className="sidebar-title"
            style={{
              height: (BaseGrid.defaultProps?.headerHeight || 56) + 1,
              lineHeight: (BaseGrid.defaultProps?.headerHeight || 56) + 1,
            }}
          >
            展示列
          </div>
          <span>
            <Input
              prefix={<SearchOutlined />}
              onChange={e => {
                setSearch(e.target.value);
              }}
              placeholder="输入要查找的字段名、编码"
            />
          </span>
          <section>{colSideBar}</section>
        </div>
        <div
          className={classnames('datagrid-sidebar-content', {
            'datagrid-sidebar-content-hide':
              !curVistualOperate || visibleKey !== 'vitualCol',
          })}
        >
          <div className="sidebar-title">
            <span className="ellipsis">{curVistualOperate?.name}</span>
            <MenuUnfoldOutlined
              onClick={() => {
                setCurVistualOperate(undefined);
              }}
              className="sidebar-title-extra"
            />
          </div>
          <section>
            {curVistualOperate && (
              <Operation mode="config" config={curVistualOperate} />
            )}
          </section>
        </div>
        <div
          className={classnames('datagrid-sidebar-content', {
            'datagrid-sidebar-content-hide': visibleKey !== 'vitualCol',
          })}
        >
          <div
            className="sidebar-title"
            style={{
              height: (BaseGrid.defaultProps?.headerHeight || 56) + 1,
              lineHeight: (BaseGrid.defaultProps?.headerHeight || 56) + 1,
            }}
          >
            虚拟列设置
          </div>
          <Decision
            actual={columnDefs.every(col => col.field !== virtualField.code)}
          >
            <Decision.Case expect>
              <Alert showIcon type="warning" message="当前未启用虚拟列" />
            </Decision.Case>
            <Decision.Case expect={false}>
              <Alert showIcon type="success" message="当前已启用虚拟列" />
            </Decision.Case>
          </Decision>
          <section>
            <SortableDivContainer
              axis="y"
              useDragHandle
              className="vitual-operate-layout"
              onSortEnd={onSortSearchBtnEnd}
            >
              {source.grid.operationConfig?.map((config, i) => (
                <SortableDiv className="vitual-operate" key={i} index={i}>
                  <DragHandle />
                  <Operation mode="dev" config={config} />
                  <Button.Group className="vitual-operate-btn-group">
                    <span
                      className="primary"
                      onClick={() => {
                        setCurVistualOperate(config);
                      }}
                    >
                      编辑
                    </span>
                    <Popconfirm
                      className="danger"
                      onConfirm={() => {
                        listPluginContext.saveConfig(prevSource => {
                          prevSource.grid.operationConfig?.splice(i, 1);
                          return prevSource;
                        });
                      }}
                      title={
                        <span>
                          确定要删除
                          <strong className="danger">{config.name}</strong>吗
                        </span>
                      }
                    >
                      <span>删除</span>
                    </Popconfirm>
                  </Button.Group>
                </SortableDiv>
              ))}
            </SortableDivContainer>
            <Button
              type="dashed"
              onClick={() => {
                listPluginContext.saveConfig(prevSource => {
                  if (!prevSource.grid.operationConfig) {
                    prevSource.grid.operationConfig = [];
                  }
                  prevSource.grid.operationConfig?.push({
                    name: '待配置操作',
                  });
                  return prevSource;
                });
              }}
            >
              添加操作 <PlusOutlined />
            </Button>
          </section>
        </div>
        <div className="datagrid-sidebar-toolbar">
          <span
            onClick={() => {
              setVisibleKey(prev => (prev === 'base' ? undefined : 'base'));
            }}
          >
            Base
          </span>
          <span
            onClick={() => {
              setVisibleKey(prev => (prev === 'col' ? undefined : 'col'));
            }}
          >
            <TableOutlined />
            Columns
          </span>
          <span
            onClick={() => {
              setVisibleKey(prev =>
                (prev === 'vitualCol' ? undefined : 'vitualCol'),
              );
            }}
          >
            VitualCol
          </span>
        </div>
      </div>
    </div>
  );
};

const DataGridProd: React.FC<DataGridProps> = ({ gridProps }) => {
  const { source } = usePage<Source>();
  const entity = useEntity();
  const fieldMap = entity.fields.reduce<{
    [key: string]: Field;
  }>(
    (map, field) => {
      map[field.code] = field;
      return map;
    },
    { [virtualField.code]: virtualField },
  );
  const columnDefs = useMemo<ColumnDefs>(() => {
    return source.grid.columnDefs.map(col => {
      if (col.field === virtualField.code) {
        return {
          ...col,
          cellRendererFramework({ data }: { data: any }) {
            return (
              <span className="list-btn-group">
                {source.grid.operationConfig?.map((config, i) => (
                  <Operation
                    key={i}
                    mode="prod"
                    config={config}
                    rowData={data}
                  />
                ))}
              </span>
            );
          },
          headerName: '操作',
        };
      }

      return {
        ...col,
        headerName: fieldMap[col.field!].name,
      };
    });
  }, []);
  return (
    <Grid
      {...gridProps}
      defaultPageSize={source.grid.pageSize}
      defaultSorters={source.grid.sorters}
      fetchUrl={source.grid.base?.fetchUrl || ''}
      columnDefs={columnDefs}
    />
  );
};

export default DataGrid;
