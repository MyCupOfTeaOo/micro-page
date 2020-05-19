import React, { useEffect, useContext, useCallback, useMemo } from 'react';
import { useStore, useForm, Show, vertical } from 'teaness';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import expectjs from 'expect.js';
import { Input, Select, Tooltip } from 'antd';
import { createFunc } from 'tea-eval';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import { monokai } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { rowFuncMap } from '../GenericFunctions';
import { ListPluginContext, PageRenderContext } from '../context';

SyntaxHighlighter.registerLanguage('javascript', js);

export interface OperationConfig {
  name: string;
  func?: string;
  funcProps?: any;
  type?: 'danger' | 'warning' | 'link' | undefined;
  assert?: string;
}

export interface OperationProps {
  config: OperationConfig;
  rowData?: any;
  mode: 'dev' | 'prod' | 'config';
}

export const rowFuncOptions = Object.keys(rowFuncMap).map(key => ({
  label: rowFuncMap[key].name,
  value: key,
}));

const buttonTypeOptions = [
  { value: 'primary', label: '主题' },
  { value: 'danger', label: '危险' },
  { value: 'warning', label: '警告' },
  { value: 'link', label: '链接' },
];

const Operation: React.FC<OperationProps> = props => {
  return props.mode === 'config' ? (
    <OperationConfig {...props} />
  ) : (
    <OperationProd {...props} />
  );
};

const OperationConfig: React.FC<OperationProps> = observer(props => {
  const store = useStore<OperationConfig>(
    {
      name: {
        defaultValue: props.config?.name,
      },
      func: {
        defaultValue: props.config?.func,
      },
      type: {
        defaultValue: props.config?.type,
      },
      funcProps: {
        defaultValue: props.config?.funcProps,
      },
      assert: {
        defaultValue: props.config?.assert,
      },
    },
    [props.config],
    {
      autoHandle: [
        {
          listenKey: ['func'],
          effect(_, formStore) {
            // func 变动清除 props
            formStore.setValue('funcProps', undefined);
          },
        },
      ],
    },
  );
  const { Form, Item } = useForm(store);
  const listPluginContext = useContext(ListPluginContext);
  useEffect(() => {
    store.onChange = () => {
      listPluginContext.saveConfig(prevSource => {
        Object.assign(props.config!, store.getValues());
        return prevSource;
      });
    };
  }, [props.config]);
  useEffect(() => {
    store.reset();
  }, [props.config]);
  const Extra = store.componentStores.func?.value
    ? rowFuncMap[store.componentStores.func?.value]?.extra
    : undefined;
  return (
    <div className="panel-form-layout">
      <Form layout={vertical} className="panel-form">
        <Item text="操作名称" id="name">
          <Input />
        </Item>
        <Item text="操作类型" id="type">
          <Select options={buttonTypeOptions} allowClear />
        </Item>
        <Item text="调用函数" id="func">
          <Select options={rowFuncOptions} allowClear />
        </Item>

        <Item
          text="断言"
          id="assert"
          renderText={
            <span>
              断言{' '}
              <Tooltip
                overlayStyle={{
                  maxWidth: 'initial',
                }}
                title={
                  <span>
                    <span className="mycode">
                      可以通过
                      <code>
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          href="https://github.com/Automattic/expect.js"
                        >
                          expect.js
                        </a>
                      </code>
                      进行断言,不通过则隐藏按钮
                      <br />
                      可使用工具函数:
                      <ul>
                        <li>expect(即expect.js)</li>
                      </ul>
                      可使用上下文对象(this):
                      <ul>
                        <li>rowData(行数据)</li>
                      </ul>
                      如果你需要当前行数据的姓名(name)为zouwendi才显示
                      <br />
                    </span>
                    例:
                    <SyntaxHighlighter language="javascript" style={monokai}>
                      this.expect(this.rowData.name).to.be("zouwendi")
                    </SyntaxHighlighter>
                    <strong className="danger">
                      异常的代码也会导致按钮消失
                    </strong>
                  </span>
                }
              >
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          }
        >
          <Input.TextArea autoSize={{ minRows: 3, maxRows: 8 }} />
        </Item>
        <Show expect actual={!!Extra}>
          <Item id="funcProps" text="函数额外配置">
            {Extra && <Extra />}
          </Item>
        </Show>
      </Form>
    </div>
  );
});

const OperationProd: React.FC<OperationProps> = props => {
  const { name, func, funcProps, type, assert, ...rest } = props.config || {};
  const pageRenderContext = useContext(PageRenderContext);

  const apply = useCallback(() => {
    if (func) {
      const targetFunc = rowFuncMap[func];
      targetFunc.apply.call({
        ...pageRenderContext,
        config: props.config,
        rowData: props.rowData,
      });
    }
  }, []);
  const show = useMemo(() => {
    if (props.mode === 'prod') {
      if (assert) {
        let assertFunc: Function;
        try {
          assertFunc = createFunc(assert, undefined, {
            rowData: props.rowData,
            expect: expectjs,
          });
        } catch (error) {
          console.error('创建断言函数失败');
          console.error(error);
          return false;
        }
        try {
          if (assertFunc) {
            assertFunc();
          }
        } catch (error) {
          // eslint-disable-next-line
          console.log((error as Error).message);
          return false;
        }
      }
    }
    return true;
  }, [props.rowData]);

  return (
    <Show actual={show} expect>
      <span
        {...rest}
        title={name}
        className={classnames(type, 'ellipsis', 'virtual-operate-prod')}
        onClick={props.mode === 'prod' ? apply : undefined}
      >
        {name}
      </span>
    </Show>
  );
};
export default Operation;
