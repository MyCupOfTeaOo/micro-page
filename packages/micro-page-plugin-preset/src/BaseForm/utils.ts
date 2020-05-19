import { horizontal, vertical, oneline, inline } from 'teaness';
import { RowProps } from 'teaness/es/Grid/typings';
import { LabelProps } from 'teaness/es/Label/typings';

export const layouts = [
  { label: 'horizontal', value: 'horizontal', layout: horizontal },
  { label: 'vertical', value: 'vertical', layout: vertical },
  { label: 'oneline', value: 'oneline', layout: oneline },
  { label: 'inline', value: 'inline', layout: inline },
];

export const layoutMap = layouts.reduce<{
  [key: string]: {
    row?: RowProps;
    label?: LabelProps;
  };
}>((map, layout) => {
  // eslint-disable-next-line
  map[layout.value] = layout.layout;
  return map;
}, {});
