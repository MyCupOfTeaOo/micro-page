/**
 * 表单域的基本控件库
 * @Author: zwd
 * @Date: 2020-05-16 09:46:47
 * @Last Modified by: zwd
 * @Last Modified time: 2020-05-16 16:14:11
 * @Description: 实现了基本的表单域控件,你可以自己混入需要添加的表单域控件
 */
import React from 'react';
import { Field, FieldType } from 'micro-page-core/es/typings';
import { FormConfig } from 'teaness/es/Form/typings';
import { Input, InputNumber, DatePicker, Switch } from 'antd';
import { Select, Label } from 'teaness';
import moment from 'moment';
import { DateFormat } from 'teaness/es/utils';
import { Params } from 'teaness/es/Form/Context/Autowired';

/* -------------------------------------------------------------------------- */
/*                                    Extra                                   */
/* -------------------------------------------------------------------------- */

export interface InputExtraProps {
  type?:
    | 'button'
    | 'checkbox'
    | 'color'
    | 'date'
    | 'datetime-local'
    | 'email'
    | 'file'
    | 'hidden'
    | 'image'
    | 'month'
    | 'number'
    | 'password'
    | 'radio'
    | 'range'
    | 'reset'
    | 'search'
    | 'submit'
    | 'tel'
    | 'text'
    | 'time'
    | 'url'
    | 'week';
}

export const InputTypeOptions = [
  { value: 'button', label: 'button' },
  { value: 'checkbox', label: 'checkbox' },
  { value: 'color', label: 'color' },
  { value: 'date', label: 'date' },
  { value: 'datetime-local', label: 'datetime-local' },
  { value: 'email', label: 'email' },
  { value: 'file', label: 'file' },
  { value: 'hidden', label: 'hidden' },
  { value: 'image', label: 'image' },
  { value: 'month', label: 'month' },
  { value: 'number', label: 'number' },
  { value: 'password', label: 'password' },
  { value: 'radio', label: 'radio' },
  { value: 'range', label: 'range' },
  { value: 'reset', label: 'reset' },
  { value: 'search', label: 'search' },
  { value: 'submit', label: 'submit' },
  { value: 'tel', label: 'tel' },
  { value: 'text', label: 'text' },
  { value: 'time', label: 'time' },
  { value: 'url', label: 'url' },
  { value: 'week', label: 'week' },
];

export const InputExtra: React.FC<Params> = ({ id, value, onChange }) => {
  return (
    <>
      <Label id={`${id}-type`} text="类型">
        <Select
          options={InputTypeOptions}
          value={value?.type}
          onChange={v => {
            onChange({
              ...value,
              type: v,
            });
          }}
        />
      </Label>
    </>
  );
};

export interface DatePickerExtraProps {
  bordered?: boolean;
}

export const DatepickerExtra: React.FC<Params> = ({ id, value, onChange }) => {
  return (
    <>
      <Label id={`${id}-bordered`} text="是否有边框">
        <Switch
          checked={value?.bordered}
          onChange={v => {
            onChange({
              ...value,
              bordered: v,
            });
          }}
        />
      </Label>
    </>
  );
};

/* -------------------------------------------------------------------------- */
/*                                    Componet                                */
/* -------------------------------------------------------------------------- */

export type Config<
  E = {
    [key: string]: any;
  },
  C = {
    [key: string]: any;
  }
> = Omit<C, 'extra'> & {
  extra?: E;
};

/**
 * 优先级 exclude > include > test
 * 如果 include test 都为空,但是没有匹配在exclude里则为显示
 */
export interface Componet {
  /**
   * 下拉名称
   */
  name: string;
  /**
   * 组件
   */
  com: React.ComponentType<any>;
  /**
   * 默认配置
   * @param field 字段
   */
  getDefaultConfig?(field: Field): { [key: string]: any };
  /**
   * 额外配置,配置后的数据会展开后传给com
   */
  extra?: React.ComponentType<any>;
  /**
   * teaness form 配置,运行时调用
   * @param field 字段
   */
  getFormConfig?(config: Config, field: Field): FormConfig<any>;
  /**
   * 包含则不显示
   */
  exclude?: FieldType[];
  /**
   * 包含则显示
   */
  include?: FieldType[];
  /**
   *  包含则显示
   */
  test?: RegExp;
  /**
   * 绑定表单的trigger
   */
  trigger?: string;
  /**
   * 绑定表单的valueName
   */
  valueName?: string;
  /**
   * 下拉排序
   */
  order?: number;
}

export const baseComMap: {
  [key: string]: Componet;
} = {
  input: {
    name: '输入框',
    com: Input,
    getDefaultConfig() {
      return {
        placeholder: '请输入',
      };
    },
  },
  inputnumber: {
    name: '数字输入框',
    include: ['number'],
    com: InputNumber,
    getDefaultConfig() {
      return {
        placeholder: '请输入',
      };
    },
    extra: InputExtra,
  },
  select: {
    name: '下拉框',
    include: ['string', 'date'],
    com: Select,
    getDefaultConfig() {
      return {
        placeholder: '请选择',
      };
    },
  },
  datepicker: {
    name: '日期选择器',
    include: ['date', 'time'],
    com: DatePicker,
    getDefaultConfig() {
      return {
        placeholder: '请选择日期',
        extra: {
          bordered: true,
        },
      };
    },
    getFormConfig(config: Config<DatePickerExtraProps>, field) {
      return {
        parse(value?: moment.Moment | string) {
          if (moment.isMoment(value)) {
            return value?.format(
              field.type === 'date' ? DateFormat.day : DateFormat.sec,
            );
          }
          return value;
        },
        format(value?: string) {
          return value ? moment(value) : null;
        },
      };
    },
    extra: DatepickerExtra,
  },
  timepicker: {
    name: '时间选择器',
    include: ['time'],
    com: DatePicker.TimePicker,
    getDefaultConfig() {
      return {
        placeholder: '请选择时间',
      };
    },
    getFormConfig() {
      return {
        parse(value?: moment.Moment | string) {
          if (moment.isMoment(value)) {
            return value?.format(DateFormat.sec);
          }
          return value;
        },
        format(value?: string) {
          return value ? moment(value) : value;
        },
      };
    },
  },
};

export function getComponentOptions(type: FieldType) {
  return Object.keys(baseComMap)
    .filter(key => {
      const component = baseComMap[key];
      if (component.exclude?.includes(type)) {
        return false;
      }
      if (component.include?.includes(type)) {
        return true;
      }
      if (component.test?.test(type)) {
        return true;
      }
      if (!component.include && !component.test) {
        return true;
      }
      return false;
    })
    .sort(
      (prev, next) =>
        (baseComMap[prev].order || 0) - (baseComMap[next].order || 0),
    )
    .map(key => ({
      label: baseComMap[key].name,
      value: key,
    }));
}
