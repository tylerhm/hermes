import { Row, Col, Button } from 'antd';

interface Props {
  label: string;
  placeholder?: string;
  value?: string | undefined;
  onClick: () => void;
}

const FileSelectionRow = ({ label, placeholder, value, onClick }: Props) => {
  return (
    <Row style={{ width: '100%' }}>
      <Col span={10}>{label}</Col>
      <Col span={14}>
        <Button value="small" style={{ width: '100%' }} onClick={onClick}>
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
