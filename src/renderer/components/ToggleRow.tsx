import { Col, Row, Switch } from 'antd';

type Props = {
  label: string;
  checked: boolean;
  onChange: (newValue: boolean) => void;
};

const ToggleRow = ({ label, checked, onChange }: Props) => {
  return (
    <Row style={{ width: '100%' }}>
      <Col span={10}>{label}</Col>
      <Col span={14}>
        <Switch checked={checked} onChange={onChange} />
      </Col>
    </Row>
  );
};

export default ToggleRow;
