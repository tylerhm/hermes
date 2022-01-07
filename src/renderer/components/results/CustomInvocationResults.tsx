import { Row, Input, Spin, Col } from 'antd';
import { CustomInvocationResultType } from '../../hooks/useResults';
import ResultButton from './ResultButton';

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
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <h4>Stdout:</h4>
              <TextArea
                rows={5}
                value={results.stdout}
                contentEditable={false}
              />
            </div>
          </Col>
          {results.response == null ? null : (
            <Col span={24}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  marginTop: '1em',
                }}
              >
                <h4>Verdict:</h4>
                <ResultButton
                  identifier={results.id}
                  response={results.response}
                  shape="default"
                  style={{ width: '100%' }}
                  isCustomInvocation
                />
              </div>
            </Col>
          )}
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
