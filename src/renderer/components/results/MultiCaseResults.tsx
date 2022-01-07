import { MultiCaseResultsType } from '../../hooks/useResults';
import ResultButton from './ResultButton';

type Props = {
  results: MultiCaseResultsType;
};

// Render each result as a bubble button
const MultiCaseResults = ({ results }: Props) => {
  return (
    <div
      style={{
        marginTop: '2em',
        marginBottom: '1em',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '1em',
      }}
    >
      {Object.entries(results).map(([caseID, result]) => (
        <ResultButton
          identifier={caseID}
          response={result}
          shape="circle"
          isCustomInvocation={false}
        />
      ))}
    </div>
  );
};

export default MultiCaseResults;
