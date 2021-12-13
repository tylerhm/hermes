import { Row, Col, Button } from 'antd';
import { FileKeyType } from './Types';

interface Props {
  fileKey: FileKeyType;
  name: string | undefined;
  onClick: (key: FileKeyType) => void;
  isDir?: boolean;
}

const FileSelectionRow = ({ fileKey, name, onClick, isDir }: Props) => {
  const capitalizeFirstLetter = (word: string) => {
    if (word == null) return null;
    return word.charAt(0).toUpperCase() + word.slice(1);
  };

  const fileType = isDir ? 'Directory' : 'File';

  return (
    <Row className="align-items-center" style={{ margin: '0.1em' }}>
      <Col xs={5}>{`${capitalizeFirstLetter(fileKey)} ${fileType}:`}</Col>
      <Col xs={7}>
        <Button
          value="small"
          style={{ width: '100%' }}
          onClick={() => onClick(fileKey)}
        >
          {name ?? `Select ${fileType}`}
        </Button>
      </Col>
    </Row>
  );
};

FileSelectionRow.defaultProps = {
  isDir: false,
};

export default FileSelectionRow;
