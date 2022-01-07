import { Col, Row, Input } from 'antd';
import { debounce } from '../utils/utils';

const { TextArea } = Input;

type Props = {
  label: string;
  onChange: (newContent: string) => void;
};

const TextInputRow = ({ label, onChange }: Props) => {
  const debouncedOnChange = debounce(onChange);
  return (
    <Row style={{ width: '100%' }}>
      <Col span={10}>{label}</Col>
      <Col span={14}>
        <TextArea
          id={label}
          style={{ width: '100%' }}
          rows={5}
          allowClear
          onChange={(event) => {
            event.preventDefault();
            debouncedOnChange(event.target.value);
          }}
        />
      </Col>
    </Row>
  );
};

export default TextInputRow;
