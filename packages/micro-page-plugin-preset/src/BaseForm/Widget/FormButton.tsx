import React, { useEffect, useContext, useCallback, useMemo } from 'react';
import Button, { ButtonProps } from 'antd/lib/button';
import { observer } from 'mobx-react';
import expectjs from 'expect.js';
import { createFunc } from 'tea-eval';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useStore, useForm, vertical, Select, Show } from 'teaness';
import { Input, Tooltip, Switch } from 'antd';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import { monokai } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { formFuncMap } from '../GenericFunctions';
import { FormPluginContext, PageRenderContext } from '../context';

SyntaxHighlighter.registerLanguage('javascript', js);

export interface FormButtonConfig {
  name: string;
  func?: string;
  funcProps?: any;
  type?: ButtonProps['type'];
  size?: ButtonProps['size'];
  isSubmit?: boolean;
  checked?: boolean;
  assert?: string;
}

export interface FormButtonProps {
  config?: FormButtonConfig;
  mode: 'dev' | 'prod' | 'config';
  loading?: boolean;
}

export const formFuncOptions = Object.keys(formFuncMap).map(key => ({
  label: formFuncMap[key].name,
  value: key,
}));

const FormButton: React.FC<FormButtonProps> = props => {
  return props.mode === 'config' ? (
    <FormButtonConfig {...props} />
  ) : (
    <FormButtonProd {...props} />
  );
};

const buttonTypeOptions = [
  { value: 'default', label: '默认' },
  { value: 'primary', label: '主题' },
  { value: 'ghost', label: '幽灵' },
  { value: 'dashed', label: '虚线' },
  { value: 'danger', label: '危险' },
  { value: 'link', label: '链接' },
];

const sizeOptions = [
  { value: 'large', label: '大' },
  { value: 'middle', label: '中' },
  { value: 'small', label: '小' },
];

const FormButtonConfig: React.FC<FormButtonProps> = observer(props => {
  const store = useStore<FormButtonConfig>(
    {
      name: {
        defaultValue: props.config?.name,
      },
      func: {
        defaultValue: props.config?.func,
      },
      type: {
        defaultValue: props.config?.type || 'default',
      },
      size: {
        defaultValue: props.config?.size || 'middle',
      },
      isSubmit: {
        defaultValue: props.config?.isSubmit,
      },
      checked: {
        defaultValue: props.config?.checked,
      },
      assert: {
        defaultValue: props.config?.assert,
      },
      funcProps: {
        defaultValue: props.config?.funcProps,
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
  const listPluginContext = useContext(FormPluginContext);
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
    ? formFuncMap[store.componentStores.func?.value]?.extra
    : undefined;
  return (
    <div className="panel-form-layout">
      <Form layout={vertical} className="panel-form">
        <Item text="按钮名称" id="name">
          <Input />
        </Item>
        <Item text="按钮类型" id="type">
          <Select options={buttonTypeOptions} allowClear />
        </Item>
        <Item text="按钮大小" id="size">
          <Select options={sizeOptions} allowClear />
        </Item>
        <Item text="调用函数" id="func">
          <Select options={formFuncOptions} allowClear />
        </Item>
        <Item text="是否校验表单" id="checked" valueName="checked">
          <Switch />
        </Item>
        <Item
          text="触发提交"
          renderText={
            <span>
              触发提交{' '}
              <Tooltip title="一个页面最多只能有一个按钮开启">
                <QuestionCircleOutlined />
              </Tooltip>
            </span>
          }
          id="isSubmit"
          valueName="checked"
        >
          <Switch />
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
                        <li>loadData(加载的数据)</li>
                        <li>
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://reacttraining.com/react-router/web/api/Hooks/useparams"
                          >
                            <code>params</code>
                          </a>
                          (路由参数)
                        </li>
                        <li>
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://reacttraining.com/react-router/web/example/query-parameters"
                          >
                            <code>query</code>
                          </a>
                          (路由params)
                        </li>
                      </ul>
                      如果你需要当前行数据的姓名(name)为zouwendi才显示
                      <br />
                    </span>
                    例:
                    <SyntaxHighlighter language="javascript" style={monokai}>
                      this.expect(this.loadData.name).to.be("zouwendi")
                    </SyntaxHighlighter>
                    <strong className="danger">
                      只会在加载数据后断言一次, 异常的代码也会导致按钮消失
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
const FormButtonProd: React.FC<FormButtonProps> = props => {
  const { name, func, funcProps, assert, isSubmit, checked, ...rest } =
    props.config || {};
  const pageRenderContext = useContext(PageRenderContext);

  const apply = useCallback(
    (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      e.preventDefault();
      if (func) {
        if (checked) {
          pageRenderContext.store.submit(({ errs }) => {
            if (errs) {
              return;
            }
            const targetFunc = formFuncMap[func];
            targetFunc.apply.call({
              ...pageRenderContext,
              config: props.config,
            });
          });
        } else {
          const targetFunc = formFuncMap[func];
          targetFunc.apply.call({
            ...pageRenderContext,
            config: props.config,
          });
        }
      }
    },
    [pageRenderContext],
  );
  const show = useMemo(() => {
    if (props.mode === 'prod') {
      if (assert) {
        let assertFunc: Function;
        try {
          assertFunc = createFunc(assert, undefined, {
            loadData: pageRenderContext.data,
            query: pageRenderContext.query,
            params: pageRenderContext.params,
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
  }, [pageRenderContext.data]);
  const htmlType = useMemo<'submit' | undefined>(() => {
    if (props.mode === 'prod') {
      if (isSubmit) {
        return 'submit';
      }
    }
  }, []);
  return (
    <Show actual={show} expect>
      <Button
        {...rest}
        loading={props.loading}
        htmlType={htmlType}
        form={htmlType ? 'myform' : undefined}
        onClick={props.mode === 'prod' ? apply : undefined}
      >
        {name}
      </Button>
    </Show>
  );
};

export default FormButton;
