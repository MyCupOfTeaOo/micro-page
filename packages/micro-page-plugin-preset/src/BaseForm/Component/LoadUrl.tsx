/**
 * 表单页数据加载器
 * @Author: zwd
 * @Date: 2020-05-28 09:49:08
 * @Last Modified by: zwd
 * @Last Modified time: 2020-05-28 14:49:05
 * @Description: 用来处理表单页的数据加载逻辑
 */
import React from 'react';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Input, Button, Popconfirm } from 'antd';
import { Label } from 'teaness';
import { Load } from '../typings';

export interface LoadUrlProps {
  value?: Load;
  onChange?: (value?: Load) => void;
}

const LoadUrl: React.FC<LoadUrlProps> = props => {
  return (
    <ul className="baseform-load">
      {props.value?.map((item, i) => (
        <li key={i}>
          <Popconfirm
            onConfirm={() => {
              props.value?.splice(i, 1);
              props.onChange?.(props.value);
            }}
            title="确定要删除该加载策略吗"
          >
            <Button
              className="baseform-load-remove"
              type="primary"
              shape="circle"
              danger
            >
              <DeleteOutlined />
            </Button>
          </Popconfirm>

          <Label text="加载路径">
            <Input
              value={item.url}
              onChange={e => {
                // eslint-disable-next-line
                item.url = e.target.value;
                props.onChange?.(props.value);
              }}
            />
          </Label>
          <Label text="断言">
            <Input
              value={item.assert}
              onChange={e => {
                // eslint-disable-next-line
                item.assert = e.target.value;
                props.onChange?.(props.value);
              }}
            />
          </Label>
        </li>
      ))}
      <Button
        className="baseform-load-add"
        type="dashed"
        block
        onClick={() => {
          props.onChange?.(props.value?.concat({}) || [{}]);
        }}
      >
        新增加载策略 <PlusOutlined />
      </Button>
    </ul>
  );
};

export default LoadUrl;
