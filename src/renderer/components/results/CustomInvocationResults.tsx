import { Row, Input, Spin, Col } from 'antd';
import { CustomInvocationResultType } from '../../hooks/useResults';

const { TextArea } = Input;

type Props = {
  results: CustomInvocationResultType;
  judging: boolean;
};

const CustomInvocationResults = ({ results, judging }: Props) => {
  const metaComponent = () => {
    if (judging) {
      return results.stdout == null ? (
        <Spin />
      ) : (
        <>
          <Col span={24}>
            <TextArea rows={5} value={results.stdout} disabled />
          </Col>
          <Col span={24}>{results.response?.verdict}</Col>
        </>
      );
    }
    return null;
  };

  return (
    <Row
      style={{
        width: '100%',
        marginTop: '2em',
        marginBottom: '1em',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
      }}
    >
      {metaComponent()}
    </Row>
  );
};

export default CustomInvocationResults;
