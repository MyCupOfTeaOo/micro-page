import React from 'react';
import classnames from 'classnames';
import { MenuUnfoldOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import './Panel.scss';

export interface PanelProps {
  visible: boolean;
  onHide(): void;
  title?: string;
  subtitle?: string;
  destroyOnClose?: boolean;
}

const Panel: React.FC<PanelProps> = ({
  children,
  visible,
  title,
  subtitle,
  onHide,
  destroyOnClose,
}) => {
  if (destroyOnClose && !visible) {
    return <></>;
  }
  return (
    <div
      className={classnames('micro-com-panel', {
        'micro-com-panel-hide': !visible,
      })}
    >
      <Button
        className="panel-hide-btn"
        type="link"
        icon={<MenuUnfoldOutlined />}
        onClick={onHide}
      />
      {title && <h3 className="panel-title ellipsis">{title}</h3>}
      {subtitle && <h4 className="panel-subtitle ellipsis">{subtitle}</h4>}
      <section className="panel-content">{children}</section>
    </div>
  );
};

export default Panel;
