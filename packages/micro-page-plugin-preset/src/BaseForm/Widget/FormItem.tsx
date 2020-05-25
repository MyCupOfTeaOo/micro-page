import React, { useMemo, useEffect, useContext } from 'react';
import { Params } from 'teaness/es/Form/Context/Autowired';
import { observer } from 'mobx-react';
import { Field } from 'micro-page-core/es/typings';
import { Input, Switch } from 'antd';
import { vertical, Select, useForm, useStore, Show } from 'teaness';
import { FormPluginContext } from '../context';
import { baseComMap, getComponentOptions } from '../../Utils/comMap';

export interface FormItemConfig {
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

export interface FormItemProps extends Partial<Params> {
  config?: FormItemConfig;
  mode: 'dev' | 'prod' | 'config';
  field: Field;
}

const FormItem: React.FC<FormItemProps> = props => {
  return props.mode === 'config' ? (
    <FormItemConfig {...props} />
  ) : (
    <FormItemProd {...props} />
  );
};

const FormItemConfig: React.FC<FormItemProps> = observer(
  ({ config, field }) => {
    const options = useMemo(() => {
      return getComponentOptions(field.type);
    }, [field.type]);
    const formPluginContext = useContext(FormPluginContext);
    const store = useStore<FormItemConfig>(
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
        formPluginContext.saveConfig(prevSource => {
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

const FormItemProd: React.FC<FormItemProps> = ({
  config,
  field,
  mode,
  errors,
  checkresult,
  ...props
}) => {
  const { type, fieldCode, extra, ...rest } = config || ({} as FormItemConfig);
  const com = useMemo(() => {
    if (type) {
      return baseComMap[type];
    } else {
      return baseComMap.input;
    }
  }, [config?.type]);
  return (
    <com.com
      {...props}
      {...rest}
      {...extra}
      disabled={props.disabled || rest.disabled}
    />
  );
};

export default FormItem;
