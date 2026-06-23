import { useReportStore } from '../store/useReportStore';

export const useReport = () => {
  const { report, loading, setReport } = useReportStore();

  return {
    report,
    loading,
    setReport
  };
};
