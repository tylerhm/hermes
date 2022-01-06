import useResults, {
  CustomInvocationResultType,
  MultiCaseResultsType,
} from '../../hooks/useResults';
import CustomInvocationResults from './CustomInvocationResults';
import MultiCaseResults from './MultiCaseResults';

type Props = {
  isCustomInvocation: boolean;
};

// Render each result as a bubble button
const Results = ({ isCustomInvocation }: Props) => {
  const { results, judging } = useResults();

  return isCustomInvocation ? (
    <CustomInvocationResults
      results={results as CustomInvocationResultType}
      judging={judging}
    />
  ) : (
    <MultiCaseResults results={results as MultiCaseResultsType} />
  );
};

export default Results;
