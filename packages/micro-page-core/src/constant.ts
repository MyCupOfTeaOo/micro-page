import { FieldType } from './typings';

export const typeOptions: {
  value: FieldType;
  label: string;
}[] = [
  {
    value: 'string',
    label: '字符串',
  },
  {
    value: 'number',
    label: '数字',
  },
  {
    value: 'date',
    label: '日期',
  },
  {
    value: 'time',
    label: '时间',
  },
  {
    value: 'image',
    label: '图片',
  },
  {
    value: 'file',
    label: '文件',
  },
  {
    value: 'richtext',
    label: '富文本',
  },
];
