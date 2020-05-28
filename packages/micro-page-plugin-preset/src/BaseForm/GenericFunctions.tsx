/**
 * 触发器函数实现集
 * @Author: zwd
 * @Date: 2020-05-14 14:16:36
 * @Last Modified by: zwd
 * @Last Modified time: 2020-05-16 16:18:16
 * @Description: 实现了ui event func
 */
import React from 'react';
import lodash from 'lodash';
import {
  QuestionCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { Params } from 'teaness/es/Form/Context/Autowired';
import { Label, Select } from 'teaness';
import { Tooltip, Input, Switch, Modal } from 'antd';

import { Method, AxiosRequestConfig } from 'axios';
import {
  safeParse,
  contextKeyRegExp,
  hasBody,
  method,
  methodOptions,
  isSpreadRegExp,
  fixTempPosition,
  fixSpreadValue,
} from '../Utils/utils';
import { FuncThis } from './typings';

import { FormButtonConfig } from './Widget/FormButton';

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
  replace?: string;
  goback?: boolean;
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
                      <code>loadData</code>(加载的数据)
                    </li>
                    <li>
                      <code>formData</code>(当前表单数据)
                    </li>
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
                  例:
                  <code>/test/${'{loadData.name}'}</code>
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
                  地址格式:
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
                      <code>loadData</code>(加载的数据)
                    </li>
                    <li>
                      <code>formData</code>(当前表单数据)
                    </li>
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
                  例:
                  <code>/test/${'{loadData.name}'}</code>
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
                      <code>loadData</code>(加载的数据)
                    </li>
                    <li>
                      <code>formData</code>(当前表单数据)
                    </li>
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
                  假设表单数据(formData)为
                  <pre>
                    {`{
  "name": "tea",
  "birthday": "1996-01-05"
}`}
                  </pre>
                  加载数据(loadData)为
                  <pre>
                    {`{
  "id": "123",
  "birthday": "1996-01-01"
}`}
                  </pre>
                  <pre>
                    输入:
                    <code>${'{formData}'}</code>
                    <br />
                    后台接收:
                    <pre>
                      {`{
  "name": "tea",
  "birthday": "1996-01-05"
}`}
                    </pre>
                    输入:
                    <code>{`{"name": \${formData.name}}`}</code>
                    <br />
                    后台接收:
                    <pre>
                      {`{
  "name": "tea"
}`}
                    </pre>
                    输入:
                    <code>{`{\${...loadData},"name": \${formData.name}}`}</code>
                    <br />
                    后台接收:
                    <pre>
                      {`{
  "id": "123",
  "birthday": "1996-01-01",
  "name": "tea"
}`}
                    </pre>
                    输入:
                    <code>{`{\${...loadData},\${...formData}}`}</code>
                    <br />
                    后台接收:
                    <pre>
                      {`{
  "id": "123",
  "name": "tea",
  "birthday": "1996-01-05"
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
        id={`${id}-replace`}
        text="url替换"
        renderText={
          <span>
            url替换{' '}
            <Tooltip
              title={
                <span className="mycode">
                  替换地址格式:
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
                      <code>loadData</code>(加载的数据)
                    </li>
                    <li>
                      <code>formData</code>(当前表单数据)
                    </li>
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
                  例:
                  <code>/test/${'{loadData.name}'}</code>
                </span>
              }
            >
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
        }
      >
        <Input
          checked={value?.replace}
          onChange={e => {
            onChange({
              ...value,
              replace: e.target.value,
            });
          }}
        />
      </Label>
      <Label
        id={`${id}-goback`}
        text="自动返回"
        renderText={
          <span>
            自动返回{' '}
            <Tooltip title="调用结束后是否自动返回上一页,优先级比url替换高">
              <QuestionCircleOutlined />
            </Tooltip>
          </span>
        }
      >
        <Switch
          checked={value?.goback}
          onChange={v => {
            onChange({
              ...value,
              goback: v,
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
/*                                FormFunction                                */
/* -------------------------------------------------------------------------- */

export const formFuncMap: {
  [key: string]: Func;
} = {
  reset: {
    name: '重置',
    apply(this) {
      this.store.reset();
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
    apply(this: FuncThis<FormButtonConfig, RouterFuncProps>) {
      let url = '';
      const context = {
        params: this.params,
        query: this.query,
        loadData: this.data,
        formData: this.store.getValues(),
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
    apply(this: FuncThis<FormButtonConfig, InterfaceFuncProps>) {
      let url = '';
      const context = {
        params: this.params,
        query: this.query,
        loadData: this.data,
        formData: this.store.getValues(),
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
      const { data } = this.config?.funcProps || {};
      let parseData;
      if (data) {
        parseData = safeParse(
          fixSpreadValue(
            (data as string).replace(contextKeyRegExp, matchkey => {
              const isSpread = isSpreadRegExp.test(matchkey);
              const key = matchkey.slice(2, -1);
              if (isSpread) {
                const value = lodash.get(context, key.slice(3));
                if (value) {
                  const waitParseValue = JSON.stringify(value).slice(1, -1);
                  if (!waitParseValue) {
                    return fixTempPosition;
                  }
                  return waitParseValue;
                }
                return value;
              } else {
                const value = lodash.get(context, key);
                if (value) {
                  return JSON.stringify(value);
                }
                return value;
              }
            }),
          ),
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
        this.setLoading(true);
        return this.core
          .request(config)
          .then(() => {
            if (this.config?.funcProps?.goback) {
              this.history.goBack();
              return;
            }
            if (this.config?.funcProps?.replace) {
              const replaceUrl = this.config.funcProps.replace.replace(
                contextKeyRegExp,
                matchkey => {
                  const key = matchkey.slice(2, -1);
                  return lodash.get(context, key);
                },
              );
              this.history.replace(replaceUrl);
            }
          })
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
            this.setLoading(false);
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
