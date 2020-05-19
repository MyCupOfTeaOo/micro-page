/**
 * 触发器函数实现集
 * @Author: zwd
 * @Date: 2020-05-12 13:58:21
 * @Last Modified by: zwd
 * @Last Modified time: 2020-05-16 16:19:14
 * @Description: 实现了ui event func
 */
import React from 'react';
import lodash from 'lodash';
import { Params } from 'teaness/es/Form/Context/Autowired';
import { Label } from 'teaness';
import {
  QuestionCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { Input, Tooltip, Switch, Select, Modal } from 'antd';
import { Method, AxiosRequestConfig } from 'axios';
import {
  safeParse,
  contextKeyRegExp,
  method,
  methodOptions,
  hasBody,
} from '../Utils/utils';
import { FuncThis } from './typings';

import { OperationConfig } from './Component/DataGridOperation';
import { QueryButtonConfig } from './Widget/QueryButton';

export interface Func {
  /**
   * 下拉名称
   */
  name: string;
  /**
   * 点击调用的方法
   * @param this 函数上下文
   */
  apply(this: FuncThis): void | Promise<any> | boolean;
  /**
   * 函数额外的配置
   */
  extra?: React.ComponentType<any>;
}

/* -------------------------------------------------------------------------- */
/*                                Function Props Type                         */
/* -------------------------------------------------------------------------- */

interface RouterFuncProps {
  url?: string;
  open?: boolean;
}

interface InterfaceFuncProps {
  url?: string;
  method?: Method;
  data?: string;
  reload?: boolean;
  alert?: string;
}

/* -------------------------------------------------------------------------- */
/*                                extra render                                */
/* -------------------------------------------------------------------------- */

const RouterExtra: React.FC<Params> = ({ id, value, onChange }) => {
  return (
    <>
      <Label
        id={`${id}-url`}
        text="跳转地址"
        renderText={
          <span>
            跳转地址{' '}
            <Tooltip
              title={
                <span className="mycode">
                  跳转地址格式:
                  <ol>
                    <li>
                      带<code>/</code> 为绝对路径,不带<code>/</code>为相对路径
                    </li>
                    <li>
                      支持参数注入,注入格式为:
                      <code>/xxxx/${'{上下文参数}'}</code>
                    </li>
                  </ol>
                  可选上下文参数:
                  <ul>
                    <li>
                      <code>queryData</code>(查询条件)
                    </li>
                    <li>
                      <code>rowData</code>(当前行数据,
                      <strong className="danger">只有行操作有</strong>)
                    </li>
                  </ul>
                  例:
                  <code>/test/${'{queryData.name}'}</code>
                </span>
              }
            >
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
        }
      >
        <Input
          value={value?.url}
          onChange={e => {
            onChange({
              ...value,
              url: e.target.value,
            });
          }}
        />
      </Label>
      <Label id={`${id}-open`} text="打开新窗口">
        <Switch
          checked={value?.open}
          onChange={v => {
            onChange({
              ...value,
              open: v,
            });
          }}
        />
      </Label>
    </>
  );
};

const InterfaceExtra: React.FC<Params> = ({ id, value, onChange }) => {
  return (
    <>
      <Label
        id={`${id}-url`}
        text="调用地址"
        renderText={
          <span>
            调用地址{' '}
            <Tooltip
              title={
                <span className="mycode">
                  支持持参数注入,地址格式:
                  <br />
                  <code>/xxxx/${'{上下文参数}'}</code>
                  <br />
                  可选上下文参数:
                  <ul>
                    <li>
                      <code>queryData</code>(查询条件)
                    </li>
                    <li>
                      <code>rowData</code>(当前行数据,
                      <strong className="danger">只有行操作有</strong>)
                    </li>
                  </ul>
                  例:
                  <code>/test/${'{queryData.name}'}</code>
                </span>
              }
            >
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
        }
      >
        <Input
          value={value?.url}
          onChange={e => {
            onChange({
              ...value,
              url: e.target.value,
            });
          }}
        />
      </Label>
      <Label id={`${id}-method`} text="HTTP Method">
        <Select
          value={value?.method || method[0]}
          onChange={v => {
            onChange({
              ...value,
              method: v,
            });
          }}
          options={methodOptions}
        />
      </Label>
      <Label
        id={`${id}-data`}
        text="body/params"
        renderText={
          <span>
            body/params{' '}
            <Tooltip
              overlayStyle={{
                maxWidth: 'initial',
              }}
              title={
                <span className="mycode">
                  可以注入上下文放入调用接口的body/params中(与HTTP
                  Method相关,详见
                  <code>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://www.w3.org/Protocols/rfc2616/rfc2616.html"
                    >
                      HTTP/1.1
                    </a>
                  </code>
                  ),可选上下文参数:
                  <ul>
                    <li>
                      <code>queryData</code>(查询条件)
                    </li>
                    <li>
                      <code>rowData</code>(当前行数据,
                      <strong className="danger">只有行操作有</strong>)
                    </li>
                  </ul>
                  假设行数据(rowData)为
                  <pre>
                    {`{
  "name": "tea",
  "birthday": "1996-01-05"
}`}
                  </pre>
                  <pre>
                    输入:
                    <code>${'{rowData}'}</code>
                    <br />
                    后台接收:
                    <pre>
                      {`{
  "name": "tea",
  "birthday": "1996-01-05"
}`}
                    </pre>
                    输入:
                    <code>{`{"name": \${rowData.name}}`}</code>
                    <br />
                    后台接收:
                    <pre>
                      {`{
  "name": "tea"
}`}
                    </pre>
                  </pre>
                </span>
              }
            >
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
        }
      >
        <Input.TextArea
          value={value?.data}
          autoSize={{ minRows: 3, maxRows: 8 }}
          onChange={e => {
            onChange({
              ...value,
              data: e.target.value,
            });
          }}
        />
      </Label>
      <Label
        id={`${id}-reload`}
        text="刷新列表"
        renderText={
          <span>
            刷新列表{' '}
            <Tooltip title="调用结束后是否刷新列表">
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
        }
      >
        <Switch
          checked={value?.reload}
          onChange={v => {
            onChange({
              ...value,
              reload: v,
            });
          }}
        />
      </Label>
      <Label
        text="重点提示"
        renderText={
          <span>
            重点提示{' '}
            <Tooltip title={<span>操作点击时会弹出modal提示</span>}>
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
        }
        id={`${id}-alert`}
      >
        <Input.TextArea
          value={value?.alert}
          autoSize={{ minRows: 3, maxRows: 8 }}
          onChange={e => {
            onChange({
              ...value,
              alert: e.target.value,
            });
          }}
        />
      </Label>
    </>
  );
};

/* -------------------------------------------------------------------------- */
/*                                queryFunction                               */
/* -------------------------------------------------------------------------- */

export const queryFuncMap: {
  [key: string]: Func;
} = {
  submit: {
    name: '查询',
    apply(this) {
      this.setQueryData(this.store.getValues());
      this.gridRef.current?.fetch({
        page: 1,
      });
    },
  },
  reset: {
    name: '重置',
    apply(this) {
      this.store.setAllValues({});
      this.setQueryData(this.store.getValues());
      this.gridRef.current?.fetch({
        page: 1,
      });
    },
  },
  goback: {
    name: '返回',
    apply(this) {
      this.history.goBack();
    },
  },
  goForward: {
    name: '前进',
    apply(this) {
      this.history.goForward();
    },
  },
  router: {
    name: '路由跳转',
    apply(
      this: FuncThis<OperationConfig | QueryButtonConfig, RouterFuncProps>,
    ) {
      let url = '';
      const context = {
        queryData: this.queryDataRef.current,
        rowData: this.rowData,
      };
      if (this.config?.funcProps?.url) {
        url = (this.config?.funcProps?.url as string).replace(
          contextKeyRegExp,
          matchkey => {
            const key = matchkey.slice(2, -1);
            return lodash.get(context, key, key);
          },
        );
      }
      if (this.config?.funcProps?.open) {
        window.open(url);
      } else {
        this.history.push(url);
      }
    },
    extra: RouterExtra,
  },
  interface: {
    name: '接口调用',
    apply(this: FuncThis<OperationConfig, InterfaceFuncProps>) {
      let url = '';
      const context = {
        queryData: this.queryDataRef.current,
        rowData: this.rowData,
      };
      if (this.config?.funcProps?.url) {
        url = (this.config?.funcProps?.url as string).replace(
          contextKeyRegExp,
          matchkey => {
            const key = matchkey.slice(2, -1);
            return lodash.get(context, key);
          },
        );
      }
      const data = this.config?.funcProps?.data;
      let parseData;
      if (data) {
        parseData = safeParse(
          (data as string).replace(contextKeyRegExp, matchkey => {
            const key = matchkey.slice(2, -1);
            const value = lodash.get(context, key);
            if (value) {
              return JSON.stringify(value);
            }
            return value;
          }),
        );
      }
      const config: AxiosRequestConfig = {
        url,
        method: this.config?.funcProps?.method,
      };
      if (hasBody(config.method)) {
        config.data = parseData;
      } else {
        config.params = parseData;
      }
      const toRequest = () => {
        return this.core
          .request(config)
          .catch(err => {
            console.error(err);
            if (err instanceof Error) {
              Modal.error({
                title: `${this.config?.name}操作失败`,
                content: err.message,
              });
            } else {
              Modal.error({
                title: `${this.config?.name}操作失败`,
                content: err,
              });
            }
          })
          .finally(() => {
            if (this.config?.funcProps?.reload) {
              this.gridRef.current?.fetch();
            }
          });
      };
      if (this.config?.funcProps?.alert) {
        Modal.confirm({
          title: this.config.funcProps.alert,
          icon: <ExclamationCircleOutlined />,
          onOk: () => {
            return toRequest();
          },
        });
      } else {
        toRequest();
      }
    },
    extra: InterfaceExtra,
  },
};

/* -------------------------------------------------------------------------- */
/*                                rowFunction                                 */
/* -------------------------------------------------------------------------- */

export const rowFuncMap: {
  [key: string]: Func;
} = {
  router: queryFuncMap.router,
  interface: queryFuncMap.interface,
};
