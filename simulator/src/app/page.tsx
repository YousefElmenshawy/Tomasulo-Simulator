"use client";

import { useState } from "react";
import InstructionTimingTable from "@/components/InstructionTimingTable";
import PerformanceMetrics from "@/components/PerformanceMetrics";

export default function Home() {
  const [currentCycle, setCurrentCycle] = useState(0);

  // Placeholder data - will be replaced with backend data
  const instructionData = [
    { instruction: "LOAD R1, 0(R2)", issue: 0, execStart: 0, execEnd: 0, write: 0, commit: 0 },
    { instruction: "ADD R3, R1, R4", issue: 0, execStart: 0, execEnd: 0, write: 0, commit: 0 },
    { instruction: "MUL R5, R3, R6", issue: 0, execStart: 0, execEnd: 0, write: 0, commit: 0 },
    { instruction: "STORE R5, 4(R2)", issue: 0, execStart: 0, execEnd: 0, write: 0, commit: 0 },
    { instruction: "BEQ R1, R3, 5", issue: 0, execStart: 0, execEnd: 0, write: 0, commit: 0 },
    { instruction: "SUB R7, R3, R1", issue: 0, execStart: 0, execEnd: 0, write: 0, commit: 0 },
    { instruction: "NAND R2, R7, R5", issue: 0, execStart: 0, execEnd: 0, write: 0, commit: 0 },
    { instruction: "CALL 10", issue: 0, execStart: 0, execEnd: 0, write: 0, commit: 0 },
  ];

  const performanceData = {
    totalCycles: 0,
    ipc: 0,
    branchMispredictionPercentage: 0,
    instructionsCompleted: 0,
    conditionalBranches: 0,
    branchMispredictions: 0,
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 pb-4 border-b border-slate-300 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-1">
                Tomasulo Simulator Results
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Out-of-order execution without speculation of Tomasulo&apos;s algorithm
              </p>
            </div>
            
            {/* Cycle Controls */}
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Current Cycle: <span className="font-semibold text-slate-900 dark:text-slate-50 text-lg">{currentCycle}</span>
              </div>
              <div className="flex gap-2">
                
                <button
                  onClick={() => setCurrentCycle(currentCycle + 1)}
                  className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
                >
                  Next Cycle
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <PerformanceMetrics data={performanceData} />

        {/* Instruction Timing Table */}
        <InstructionTimingTable instructions={instructionData} />
      </div>
    </div>
  );
}
