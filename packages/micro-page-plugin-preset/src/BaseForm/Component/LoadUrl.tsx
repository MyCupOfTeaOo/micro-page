/**
 * 表单页数据加载器
 * @Author: zwd
 * @Date: 2020-05-28 09:49:08
 * @Last Modified by: zwd
 * @Last Modified time: 2020-05-28 15:23:07
 * @Description: 用来处理表单页的数据加载逻辑
 */
import React from 'react';
import {
  PlusOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { Input, Button, Popconfirm, Tooltip } from 'antd';
import { Label } from 'teaness';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import { monokai } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Load } from '../typings';

SyntaxHighlighter.registerLanguage('javascript', js);

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

          <Label
            text="加载路径"
            renderText={
              <span>
                加载路径{' '}
                <Tooltip
                  placement="rightTop"
                  overlayStyle={{
                    maxWidth: 'inherit',
                  }}
                  title={
                    <span className="mycode">
                      支持参数注入,注入格式为:
                      <code>/xxxx/${'{上下文参数}'}</code>
                      <br />
                      可选上下文参数:
                      <ul>
                        <li>
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://reacttraining.com/react-router/web/api/Hooks/useparams"
                          >
                            <code>params</code>
                          </a>
                        </li>
                        <li>
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            href="https://reacttraining.com/react-router/web/example/query-parameters"
                          >
                            <code>query</code>
                          </a>
                        </li>
                      </ul>
                      例:&nbsp;
                      <code>/test?id=${'{query.id}'}</code>
                      <br />
                      <strong className="danger">
                        只支持get加载,接口自行处理好加载逻辑,比如没有id则为new,有id则为get
                      </strong>
                    </span>
                  }
                >
                  <QuestionCircleOutlined />
                </Tooltip>
              </span>
            }
          >
            <Input
              value={item.url}
              onChange={e => {
                // eslint-disable-next-line
                item.url = e.target.value;
                props.onChange?.(props.value);
              }}
            />
          </Label>
          <Label
            text="断言"
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
                          <li>
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              href="https://reacttraining.com/react-router/web/api/Hooks/useparams"
                            >
                              <code>params</code>
                            </a>
                          </li>
                          <li>
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              href="https://reacttraining.com/react-router/web/example/query-parameters"
                            >
                              <code>query</code>
                            </a>
                          </li>
                        </ul>
                        如果你需要根据当前query有id才使用该路径url加载数据
                        <br />
                      </span>
                      例:
                      <SyntaxHighlighter language="javascript" style={monokai}>
                        this.expect(this.query.id).not.to.be(undefined)
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
