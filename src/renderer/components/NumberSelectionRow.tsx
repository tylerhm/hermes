import { Row, Col, InputNumber } from 'antd';

type NumberType = 'integer' | 'float';
interface Props {
  label: string;
  type: NumberType;
  min: number;
  max?: number;
  defaultValue: number;
  units?: string | undefined;
  onChange: (newNumber: number) => void;
}

const NumberSelectionRow = ({
  label,
  type,
  min,
  max,
  defaultValue,
  units,
  onChange,
}: Props) => {
  return (
    <Row style={{ width: '100%' }}>
      <Col span={10}>{label}</Col>
      <Col span={14}>
        <InputNumber
          style={{ width: '100%' }}
          min={min}
          max={max}
          stringMode={type === 'float'}
          defaultValue={defaultValue}
          onChange={onChange}
          addonAfter={units}
        />
      </Col>
    </Row>
  );
};

NumberSelectionRow.defaultProps = {
  max: 3600,
  units: undefined,
};

export default NumberSelectionRow;
