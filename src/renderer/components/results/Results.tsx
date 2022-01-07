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

  if (isCustomInvocation && results.type === 'custom')
    return (
      <CustomInvocationResults
        results={results.results as CustomInvocationResultType}
        judging={judging}
      />
    );

  if (!isCustomInvocation && results.type === 'multi')
    return (
      <MultiCaseResults results={results.results as MultiCaseResultsType} />
    );

  return null;
};

export default Results;
