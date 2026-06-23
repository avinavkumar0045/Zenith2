import { usePassStore } from '../store/usePassStore';

export const usePassPredictions = () => {
  const { upcomingPasses, selectedPass, loading, error, setSelectedPass } = usePassStore();

  return {
    passes: upcomingPasses,
    nextPass: upcomingPasses.length > 0 ? upcomingPasses[0] : null,
    selectedPass,
    loading,
    error,
    setSelectedPass
  };
};
