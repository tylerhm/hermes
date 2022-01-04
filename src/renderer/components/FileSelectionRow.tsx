import { Row, Col, Button } from 'antd';

interface Props {
  label: string;
  placeholder?: string;
  value?: string | undefined;
  onClick: () => void;
}

// Row to aide in the file selection process.
const FileSelectionRow = ({ label, placeholder, value, onClick }: Props) => {
  return (
    <Row style={{ width: '100%' }}>
      <Col span={10}>{label}</Col>
      <Col span={14}>
        <Button style={{ width: '100%' }} onClick={onClick}>
          {value ?? placeholder}
        </Button>
      </Col>
    </Row>
  );
};

FileSelectionRow.defaultProps = {
  placeholder: '',
  value: null,
};

export default FileSelectionRow;
