import { Col, Row, Input } from 'antd';
import { debounce } from '../utils/utils';

const { TextArea } = Input;

type Props = {
  label: string;
  defaultValue: string | undefined;
  onChange: (newContent: string) => void;
};

const TextInputRow = ({ label, defaultValue, onChange }: Props) => {
  const debouncedOnChange = debounce(onChange);

  return (
    <Row style={{ width: '100%' }}>
      <Col span={10}>{label}</Col>
      <Col span={14}>
        <TextArea
          style={{ width: '100%' }}
          rows={5}
          allowClear
          defaultValue={defaultValue}
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
