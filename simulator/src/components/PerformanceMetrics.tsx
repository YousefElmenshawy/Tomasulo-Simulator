interface PerformanceMetricsProps {
  data: {
    totalCycles: number;
    ipc: number;
    branchMispredictionPercentage: number;
    instructionsCompleted: number;
    conditionalBranches: number;
    branchMispredictions: number;
  };
}

export default function PerformanceMetrics({ data }: PerformanceMetricsProps) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 mb-6">
      <div className="border-b border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 px-4 py-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          Performance Metrics
        </h2>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
          <div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              Total Execution Time
            </div>
            <div className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
              {data.totalCycles} <span className="text-base font-normal text-slate-500">cycles</span>
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              IPC
            </div>
            <div className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
              {data.ipc.toFixed(2)}
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              Branch Misprediction
            </div>
            <div className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
              {data.branchMispredictionPercentage.toFixed(1)}%
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              Instructions Completed
            </div>
            <div className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
              {data.instructionsCompleted}
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              Conditional Branches
            </div>
            <div className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
              {data.conditionalBranches}
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              Branch Mispredictions
            </div>
            <div className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
              {data.branchMispredictions}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
