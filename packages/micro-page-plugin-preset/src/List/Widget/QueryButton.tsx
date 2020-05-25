import React, { useEffect, useContext, useCallback, useMemo } from 'react';
import { Button, Select, Input, Switch, Tooltip } from 'antd';
import { ButtonProps } from 'antd/lib/button';
import { observer } from 'mobx-react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useStore, useForm, vertical, Show } from 'teaness';
import { ListPluginContext, PageRenderContext } from '../context';
import { queryFuncMap } from '../GenericFunctions';

export interface QueryButtonConfig {
  name: string;
  func?: string;
  funcProps?: any;
  type?: ButtonProps['type'];
  danger?: boolean;
  size?: ButtonProps['size'];
  isSubmit?: boolean;
}

export interface QueryButtonProps {
  config?: QueryButtonConfig;
  mode: 'dev' | 'prod' | 'config';
}

export const queryFuncOptions = Object.keys(queryFuncMap).map(key => ({
  label: queryFuncMap[key].name,
  value: key,
}));

const QueryButton: React.FC<QueryButtonProps> = props => {
  return props.mode === 'config' ? (
    <QueryButtonConfig {...props} />
  ) : (
    <QueryButtonProd {...props} />
  );
};

const buttonTypeOptions = [
  { value: 'default', label: '默认' },
  { value: 'primary', label: '主题' },
  { value: 'ghost', label: '幽灵' },
  { value: 'dashed', label: '虚线' },
  { value: 'link', label: '链接' },
];

const sizeOptions = [
  { value: 'large', label: '大' },
  { value: 'middle', label: '中' },
  { value: 'small', label: '小' },
];

const QueryButtonConfig: React.FC<QueryButtonProps> = observer(props => {
  const store = useStore<QueryButtonConfig>(
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
      danger: {
        defaultValue: props.config?.danger || false,
      },
      size: {
        defaultValue: props.config?.size || 'middle',
      },
      isSubmit: {
        defaultValue: props.config?.isSubmit,
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
    ? queryFuncMap[store.componentStores.func?.value]?.extra
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
        <Item text="危险按钮" id="danger" valueName="checked">
          <Switch />
        </Item>
        <Item text="按钮大小" id="size">
          <Select options={sizeOptions} allowClear />
        </Item>
        <Item
          text="回车触发"
          renderText={
            <span>
              回车触发{' '}
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
        <Item text="调用函数" id="func">
          <Select options={queryFuncOptions} allowClear />
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
const QueryButtonProd: React.FC<QueryButtonProps> = props => {
  const { name, func, funcProps, isSubmit, ...rest } = props.config || {};
  const pageRenderContext = useContext(PageRenderContext);

  const apply = useCallback(() => {
    if (func) {
      const targetFunc = queryFuncMap[func];
      targetFunc.apply.call({
        ...pageRenderContext,
        config: props.config,
      });
    }
  }, []);
  const htmlType = useMemo<'submit' | undefined>(() => {
    if (props.mode === 'prod') {
      if (isSubmit) {
        return 'submit';
      }
    }
  }, []);
  return (
    <Button
      {...rest}
      htmlType={htmlType}
      onClick={props.mode === 'prod' ? apply : undefined}
    >
      {name}
    </Button>
  );
};

export default QueryButton;
