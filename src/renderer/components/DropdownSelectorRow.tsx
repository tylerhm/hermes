import { DownOutlined } from '@ant-design/icons';
import { Menu, Dropdown, Button, Row, Col } from 'antd';

type Props = {
  label: string;
  choices: Array<string>;
  placeholder?: string;
  value?: string;
  onSelect: (value: string) => void;
};

// Row with a dropdown selection option
const DropdownSelectorRow = ({
  label,
  choices,
  placeholder,
  value,
  onSelect,
}: Props) => {
  const choose = (newValue: string) => {
    onSelect(newValue);
  };

  // Create menu
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
      <Col span={14}>
        <Dropdown overlay={menu} trigger={['click']}>
          <Button>
            {value ?? placeholder} <DownOutlined />
          </Button>
        </Dropdown>
      </Col>
    </Row>
  );
};

DropdownSelectorRow.defaultProps = {
  placeholder: undefined,
  value: undefined,
};

export default DropdownSelectorRow;
