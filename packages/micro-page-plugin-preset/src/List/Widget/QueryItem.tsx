import React, { useMemo, useContext, useEffect } from 'react';
import { Params } from 'teaness/es/Form/Context/Autowired';
import { observer } from 'mobx-react';
import { Field } from 'micro-page-core/es/typings';
import { Input, Switch } from 'antd';
import { Select, useStore, useForm, vertical, Show } from 'teaness';
import { baseComMap, getComponentOptions } from '../../Utils/comMap';
import { ListPluginContext } from '../context';

export interface QueryItemConfig {
  fieldCode: string;
  /**
   * baseComMap key
   */
  type?: string;
  disabled?: boolean;
  placeholder?: string;
  /**
   * 额外配置
   */
  extra?: {
    [key: string]: any;
  };
}

export interface QueryItemProps extends Partial<Params> {
  config?: QueryItemConfig;
  mode: 'dev' | 'prod' | 'config';
  field: Field;
}

const QueryItem: React.FC<QueryItemProps> = props => {
  return props.mode === 'config' ? (
    <QueryItemConfig {...props} />
  ) : (
    <QueryItemProd {...props} />
  );
};

const QueryItemConfig: React.FC<QueryItemProps> = observer(
  ({ config, field }) => {
    const options = useMemo(() => {
      return getComponentOptions(field.type);
    }, [field.type]);
    const listPluginContext = useContext(ListPluginContext);
    const store = useStore<QueryItemConfig>(
      {
        fieldCode: {
          defaultValue: config?.fieldCode,
        },
        type: {
          defaultValue: config?.type || 'input',
        },
        disabled: {
          defaultValue: config?.disabled ?? false,
        },
        placeholder: {
          defaultValue:
            config?.placeholder ??
            baseComMap[config?.type || 'input']?.getDefaultConfig?.(field)
              .placeholder,
        },
        extra: {
          defaultValue:
            config?.extra ??
            baseComMap[config?.type || 'input']?.getDefaultConfig?.(field)
              .extra,
        },
      },
      [config],
      {
        autoHandle: [
          {
            listenKey: ['type'],
            effect(values, formStore) {
              const com = baseComMap[values.type!];
              const defaultConfig = com.getDefaultConfig?.(field) || {};
              formStore.componentStores.placeholder?.setDefaultValue(
                defaultConfig.placeholder,
              );
              formStore.componentStores.extra?.setDefaultValue(
                defaultConfig.extra,
              );
              formStore.setValue('extra', defaultConfig.extra);
            },
          },
        ],
      },
    );
    const { Form, Item } = useForm(store);
    useEffect(() => {
      store.onChange = () => {
        listPluginContext.saveConfig(prevSource => {
          Object.assign(config!, store.getValues());
          return prevSource;
        });
      };
    }, [config]);
    useEffect(() => {
      store.reset();
    }, [config]);
    const Extra = store.componentStores.type?.value
      ? baseComMap[store.componentStores.type?.value]?.extra
      : undefined;
    return (
      <div className="panel-form-layout">
        <Form layout={vertical} className="panel-form">
          <Item text="控件类型" id="type">
            <Select options={options} />
          </Item>
          <Item text="禁止输入" id="disabled" valueName="checked">
            <Switch />
          </Item>
          <Item text="提示语" id="placeholder">
            <Input />
          </Item>
          <Show expect actual={!!Extra}>
            <Item text="额外配置" id="extra">
              {Extra && <Extra />}
            </Item>
          </Show>
        </Form>
      </div>
    );
  },
);

const QueryItemProd: React.FC<QueryItemProps> = ({
  config,
  field,
  mode,
  errors,
  checkresult,
  ...props
}) => {
  const { type, fieldCode, extra, ...rest } = config || {};
  const com = useMemo(() => {
    if (type) {
      return baseComMap[type];
    } else {
      return baseComMap.input;
    }
  }, [config?.type]);
  return <com.com {...props} {...rest} {...extra} />;
};

export default QueryItem;
