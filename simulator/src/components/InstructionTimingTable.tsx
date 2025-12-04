interface Instruction {
  instruction: string;
  issue: number;
  execStart: number;
  execEnd: number;
  write: number;
  commit: number;
}

interface InstructionTimingTableProps {
  instructions: Instruction[];
}

export default function InstructionTimingTable({ instructions }: InstructionTimingTableProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Instruction Timing Table
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Clock cycle timing for each instruction stage
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Instruction
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Issue
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Exec Start
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Exec End
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Write
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Commit
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {instructions.map((instr, index) => (
              <tr 
                key={index}
                className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-900 dark:text-slate-50">
                  {instr.instruction}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-slate-700 dark:text-slate-300">
                  <span className="inline-flex items-center justify-center w-12 h-8 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 font-medium">
                    {instr.issue}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-slate-700 dark:text-slate-300">
                  <span className="inline-flex items-center justify-center w-12 h-8 rounded-md bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 font-medium">
                    {instr.execStart}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-slate-700 dark:text-slate-300">
                  <span className="inline-flex items-center justify-center w-12 h-8 rounded-md bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 font-medium">
                    {instr.execEnd}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-slate-700 dark:text-slate-300">
                  <span className="inline-flex items-center justify-center w-12 h-8 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 font-medium">
                    {instr.write}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-slate-700 dark:text-slate-300">
                  <span className="inline-flex items-center justify-center w-12 h-8 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 font-medium">
                    {instr.commit}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900/30"></span>
            <span className="text-slate-600 dark:text-slate-400">Issue Stage</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-green-100 dark:bg-green-900/30"></span>
            <span className="text-slate-600 dark:text-slate-400">Execute Stage</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-purple-100 dark:bg-purple-900/30"></span>
            <span className="text-slate-600 dark:text-slate-400">Write Stage</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-amber-100 dark:bg-amber-900/30"></span>
            <span className="text-slate-600 dark:text-slate-400">Commit Stage</span>
          </div>
        </div>
      </div>
    </div>
  );
}
