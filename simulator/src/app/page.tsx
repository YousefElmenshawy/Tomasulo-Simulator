<<<<<<< HEAD
'use client';
import Image from "next/image";
=======
"use client";

import { useState } from "react";
import InstructionTimingTable from "@/components/InstructionTimingTable";
import PerformanceMetrics from "@/components/PerformanceMetrics";
>>>>>>> 654e4c42a2373a65eaea9f9c636fac80075d352b


import { useState } from 'react';

export default function Home() {
<<<<<<< HEAD



  const [program] = useState([
    { inst: 'L.D', dest: 'F6', src1: '34', src2: 'R2', issue: null, exec: null, write: null },
    { inst: 'L.D', dest: 'F2', src1: '45', src2: 'R3', issue: null, exec: null, write: null },
    { inst: 'MUL.D', dest: 'F0', src1: 'F2', src2: 'F4', issue: null, exec: null, write: null },
    { inst: 'SUB.D', dest: 'F8', src1: 'F6', src2: 'F2', issue: null, exec: null, write: null },
    { inst: 'DIV.D', dest: 'F10', src1: 'F0', src2: 'F6', issue: null, exec: null, write: null },
    { inst: 'ADD.D', dest: 'F6', src1: 'F8', src2: 'F2', issue: null, exec: null, write: null },
  ]);

  const [reservationStations] = useState({
    add: [
      { name: 'Add1', busy: false, op: '', vj: '', vk: '', qj: '', qk: '', dest: '' },
      { name: 'Add2', busy: false, op: '', vj: '', vk: '', qj: '', qk: '', dest: '' },
      { name: 'Add3', busy: false, op: '', vj: '', vk: '', qj: '', qk: '', dest: '' },
    ],
    mult: [
      { name: 'Mult1', busy: false, op: '', vj: '', vk: '', qj: '', qk: '', dest: '' },
      { name: 'Mult2', busy: false, op: '', vj: '', vk: '', qj: '', qk: '', dest: '' },
    ],
    load: [
      { name: 'Load1', busy: false, op: '', addr: '', dest: '' },
      { name: 'Load2', busy: false, op: '', addr: '', dest: '' },
    ],
  });

  const [registerStatus] = useState({
    F0: '', F2: '', F4: '', F6: '', F8: '', F10: '', F12: '', F14: '',
  });

  const [registerFile] = useState({
    F0: 0, F2: 0, F4: 0, F6: 0, F8: 0, F10: 0, F12: 0, F14: 0,
  });

  const [memory] = useState({
    0: 0, 34: 1.5, 45: 2.5, 50: 3.0, 100: 4.2,
  });

  return (
    <div className="min-h-screen bg-black text-gray-100 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-4xl font-bold mb-2 text-gray-100">
          Tomasulo Algorithm Simulator
        </h1>
        <p className="text-gray-400">Educational GUI for cycle-by-cycle processor simulation</p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Instruction Status */}
        <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Instruction Status</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left p-2 text-gray-400">Instruction</th>
                  <th className="text-left p-2 text-gray-400">Dest</th>
                  <th className="text-left p-2 text-gray-400">Src1</th>
                  <th className="text-left p-2 text-gray-400">Src2</th>
                  <th className="text-left p-2 text-gray-400">Issue</th>
                  <th className="text-left p-2 text-gray-400">Exec</th>
                  <th className="text-left p-2 text-gray-400">Write</th>
                </tr>
              </thead>
              <tbody>
                {program.map((inst, idx) => (
                  <tr key={idx} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                    <td className="p-2 font-mono text-blue-400">{inst.inst}</td>
                    <td className="p-2">{inst.dest}</td>
                    <td className="p-2">{inst.src1}</td>
                    <td className="p-2">{inst.src2}</td>
                    <td className="p-2">{inst.issue || '-'}</td>
                    <td className="p-2">{inst.exec || '-'}</td>
                    <td className="p-2">{inst.write || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Register Status */}
        <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Register Status Table</h2>
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(registerStatus).map(([reg, station]) => (
              <div key={reg} className="bg-zinc-800 rounded p-3">
                <div className="text-xs text-gray-500 mb-1">{reg}</div>
                <div className="font-mono text-sm text-gray-300">{station || 'Free'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Reservation Stations - Add/Sub */}
        <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Add/Sub Reservation Stations</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left p-2 text-gray-400">Name</th>
                  <th className="text-left p-2 text-gray-400">Busy</th>
                  <th className="text-left p-2 text-gray-400">Op</th>
                  <th className="text-left p-2 text-gray-400">Vj</th>
                  <th className="text-left p-2 text-gray-400">Vk</th>
                  <th className="text-left p-2 text-gray-400">Qj</th>
                  <th className="text-left p-2 text-gray-400">Qk</th>
                </tr>
              </thead>
              <tbody>
                {reservationStations.add.map((rs, idx) => (
                  <tr key={idx} className={`border-b border-zinc-800 ${rs.busy ? 'bg-green-950/30' : ''}`}>
                    <td className="p-2 font-mono">{rs.name}</td>
                    <td className="p-2">{rs.busy ? '✓' : '-'}</td>
                    <td className="p-2">{rs.op || '-'}</td>
                    <td className="p-2">{rs.vj || '-'}</td>
                    <td className="p-2">{rs.vk || '-'}</td>
                    <td className="p-2">{rs.qj || '-'}</td>
                    <td className="p-2">{rs.qk || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reservation Stations - Mult/Div */}
        <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Mult/Div Reservation Stations</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left p-2 text-gray-400">Name</th>
                  <th className="text-left p-2 text-gray-400">Busy</th>
                  <th className="text-left p-2 text-gray-400">Op</th>
                  <th className="text-left p-2 text-gray-400">Vj</th>
                  <th className="text-left p-2 text-gray-400">Vk</th>
                  <th className="text-left p-2 text-gray-400">Qj</th>
                  <th className="text-left p-2 text-gray-400">Qk</th>
                </tr>
              </thead>
              <tbody>
                {reservationStations.mult.map((rs, idx) => (
                  <tr key={idx} className={`border-b border-zinc-800 ${rs.busy ? 'bg-green-950/30' : ''}`}>
                    <td className="p-2 font-mono">{rs.name}</td>
                    <td className="p-2">{rs.busy ? '✓' : '-'}</td>
                    <td className="p-2">{rs.op || '-'}</td>
                    <td className="p-2">{rs.vj || '-'}</td>
                    <td className="p-2">{rs.vk || '-'}</td>
                    <td className="p-2">{rs.qj || '-'}</td>
                    <td className="p-2">{rs.qk || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Load Buffers */}
        <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Load Buffers</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left p-2 text-gray-400">Name</th>
                  <th className="text-left p-2 text-gray-400">Busy</th>
                  <th className="text-left p-2 text-gray-400">Op</th>
                  <th className="text-left p-2 text-gray-400">Address</th>
                </tr>
              </thead>
              <tbody>
                {reservationStations.load.map((rs, idx) => (
                  <tr key={idx} className={`border-b border-zinc-800 ${rs.busy ? 'bg-green-950/30' : ''}`}>
                    <td className="p-2 font-mono">{rs.name}</td>
                    <td className="p-2">{rs.busy ? '✓' : '-'}</td>
                    <td className="p-2">{rs.op || '-'}</td>
                    <td className="p-2">{rs.addr || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Register File */}
        <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Register File (Values)</h2>
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(registerFile).map(([reg, value]) => (
              <div key={reg} className="bg-zinc-800 rounded p-3">
                <div className="text-xs text-gray-500 mb-1">{reg}</div>
                <div className="font-mono text-sm text-green-400">{value.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Memory */}
        <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Memory</h2>
          <div className="grid grid-cols-5 gap-3">
            {Object.entries(memory).map(([addr, value]) => (
              <div key={addr} className="bg-zinc-800 rounded p-3">
                <div className="text-xs text-gray-500 mb-1">Mem[{addr}]</div>
                <div className="font-mono text-sm text-blue-400">{value.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="max-w-7xl mx-auto mt-6 bg-zinc-900 rounded-lg p-4 border border-zinc-800">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">Performance Metrics</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-zinc-800 rounded p-4">
            <div className="text-sm text-gray-500">Total Cycles</div>
            <div className="text-2xl font-bold text-blue-400">0</div>
          </div>
          <div className="bg-zinc-800 rounded p-4">
            <div className="text-sm text-gray-500">Instructions Completed</div>
            <div className="text-2xl font-bold text-green-400">0</div>
          </div>
          <div className="bg-zinc-800 rounded p-4">
            <div className="text-sm text-gray-500">IPC</div>
            <div className="text-2xl font-bold text-purple-400">0.00</div>
          </div>
          <div className="bg-zinc-800 rounded p-4">
            <div className="text-sm text-gray-500">Stalls</div>
            <div className="text-2xl font-bold text-yellow-400">0</div>
          </div>
        </div>
=======
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
>>>>>>> 654e4c42a2373a65eaea9f9c636fac80075d352b
      </div>
    </div>
  );
}