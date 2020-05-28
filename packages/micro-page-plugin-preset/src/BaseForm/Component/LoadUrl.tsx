/**
 * 表单页数据加载器
 * @Author: zwd
 * @Date: 2020-05-28 09:49:08
 * @Last Modified by: zwd
 * @Last Modified time: 2020-05-28 10:06:15
 * @Description: 用来处理表单页的数据加载逻辑
 */
import React from 'react';
import { Load } from '../typings';

export interface LoadUrlProps {
  value?: Load;
  onChange?: (value: Load) => void;
}

const LoadUrl: React.FC<LoadUrlProps> = () => {
  return <div>123</div>;
};

export default LoadUrl;
