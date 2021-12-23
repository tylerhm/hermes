import { DownOutlined } from '@ant-design/icons';
import { Menu, Dropdown, Button, Row, Col } from 'antd';
import { useState } from 'react';

type Props = {
  label: string;
  choices: Array<string>;
  onSelect: (value: string) => void;
};

const DropdownSelectorRow = ({ label, choices, onSelect }: Props) => {
  const [value, setValue] = useState<string>(choices[0]);

  const choose = (newValue: string) => {
    setValue(newValue);
    onSelect(newValue);
  };

  const menu = (
    <Menu>
      {choices.map((choice) => (
        <Menu.Item key={choice} onClick={() => choose(choice)}>
          {choice}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Row style={{ width: '100%' }}>
      <Col span={10}>{label}</Col>
      <Col span={12}>
        <Dropdown overlay={menu} trigger={['click']}>
          <Button>
            {value} <DownOutlined />
          </Button>
        </Dropdown>
      </Col>
    </Row>
  );
};

export default DropdownSelectorRow;
