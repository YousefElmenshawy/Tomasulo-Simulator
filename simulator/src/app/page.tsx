'use client';
import Image from "next/image";
// AI prompt(Claude) : Generate the Home page for a tomosulo algorithm Simulator 

import { useState, useEffect } from 'react';
import { CPU } from '@/lib/CPU';
import { 
  RF, 
  RegistersTable, 
  reservationStations, 
  IQ, 
  CycleCount, 
  MemoryViewer, 
  ROB,
  InstructionCount
} from '@/lib/Buffers';

export default function Home() {
  const [cpu, setCpu] = useState<CPU | null>(null);
  const [, forceUpdate] = useState(0);

  // Initialize CPU
  useEffect(() => {
    const memData: Array<[number, number]> = [
      [0, 0],
      [34, 1.5],
      [45, 2.5],
      [50, 3.0],
      [100, 4.2],
    ];
    
    const program = [
      "LOAD R6, 34(R2)",
      "LOAD R2, 45(R3)",
      "MUL R0, R2, R4",
      "SUB R5, R6, R2",
      "ADD R6, R4, R2",
    ];
    
    const cpuInstance = new CPU(0, memData, program);
    setCpu(cpuInstance);
  }, []);

  const handleStep = () => {
    if (cpu) {
      cpu.step();
      forceUpdate(prev => prev + 1);
    }
  };

  const handleRun = () => {
    if (cpu) {
      cpu.run();
      forceUpdate(prev => prev + 1);
    }
  };

  const handleReset = () => {
    const memData: Array<[number, number]> = [
      [0, 0],
      [34, 1.5],
      [45, 2.5],
      [50, 3.0],
      [100, 4.2],
    ];
    
    const program = [
      "LOAD R6, 34(R2)",
      "LOAD R2, 45(R3)",
      "MUL R0, R2, R4",
      "SUB R2, R6, R2",
      "ADD R6, R2, R2",
    ];
    
    const cpuInstance = new CPU(0, memData, program);
    setCpu(cpuInstance);
    forceUpdate(prev => prev + 1);
  };

  // Expose handlers to window for Navbar to access
  useEffect(() => {
    (window as any).simulatorHandlers = {
      handleStep,
      handleRun,
      handleReset
    };
  }, [cpu]);

  // Map IQ to program format for display
  const program = IQ.slice(0, 6).map((inst, idx) => {
    if (!inst) return { inst: '-', dest: '-', src1: '-', src2: '-', issue: null, exec: null, write: null };
    
    const { opcode, rA, rB, rC, offset } = inst;
    let instStr = opcode;
    let dest = '-';
    let src1 = '-';
    let src2 = '-';
    
    if (opcode === 'LOAD') {
      instStr = 'L.D';
      dest = `F${rA}`;
      src1 = offset?.toString() || '-';
      src2 = `R${rB}`;
    } else if (opcode === 'STORE') {
      instStr = 'S.D';
      dest = `F${rA}`;
      src1 = offset?.toString() || '-';
      src2 = `R${rB}`;
    } else if (opcode === 'MUL') {
      instStr = 'MUL.D';
      dest = `F${rC}`;
      src1 = `F${rA}`;
      src2 = `F${rB}`;
    } else if (opcode === 'ADD') {
      instStr = 'ADD.D';
      dest = `F${rC}`;
      src1 = `F${rA}`;
      src2 = `F${rB}`;
    } else if (opcode === 'SUB') {
      instStr = 'SUB.D';
      dest = `F${rC}`;
      src1 = `F${rA}`;
      src2 = `F${rB}`;
    }
    
    return { inst: instStr, dest, src1, src2, issue: null, exec: null, write: null };
  });

  // Map reservation stations to the format expected by UI
  const reservationStationsUI = {
    add: reservationStations.ADD.map((rs, idx) => ({
      name: `Add${idx + 1}`,
      busy: rs.busy,
      op: rs.op || '',
      vj: rs.vj?.toString() || '',
      vk: rs.vk?.toString() || '',
      qj: rs.qj?.toString() || '',
      qk: rs.qk?.toString() || '',
      dest: ''
    })),
    mult: reservationStations.MULT.map((rs, idx) => ({
      name: `Mult${idx + 1}`,
      busy: rs.busy,
      op: rs.op || '',
      vj: rs.vj?.toString() || '',
      vk: rs.vk?.toString() || '',
      qj: rs.qj?.toString() || '',
      qk: rs.qk?.toString() || '',
      dest: ''
    })),
    load: reservationStations.LOAD.map((rs, idx) => ({
      name: `Load${idx + 1}`,
      busy: rs.busy,
      op: rs.op || '',
      addr: rs.addr?.toString() || '',
      dest: ''
    })),
  };

  // Map register status to R0-R7 format
  const registerStatus = {
    R0: RegistersTable[0]?.ROB ? `ROB${RegistersTable[0].ROB}` : '',
    R1: RegistersTable[1]?.ROB ? `ROB${RegistersTable[1].ROB}` : '',
    R2: RegistersTable[2]?.ROB ? `ROB${RegistersTable[2].ROB}` : '',
    R3: RegistersTable[3]?.ROB ? `ROB${RegistersTable[3].ROB}` : '',
    R4: RegistersTable[4]?.ROB ? `ROB${RegistersTable[4].ROB}` : '',
    R5: RegistersTable[5]?.ROB ? `ROB${RegistersTable[5].ROB}` : '',
    R6: RegistersTable[6]?.ROB ? `ROB${RegistersTable[6].ROB}` : '',
    R7: RegistersTable[7]?.ROB ? `ROB${RegistersTable[7].ROB}` : '',
  };

  // Map register file values
  const registerFile = {
    R0: RF[0]?.value || 0,
    R1: RF[1]?.value || 0,
    R2: RF[2]?.value || 0,
    R3: RF[3]?.value || 0,
    R4: RF[4]?.value || 0,
    R5: RF[5]?.value || 0,
    R6: RF[6]?.value || 0,
    R7: RF[7]?.value || 0,
  };

  // Map memory values
  const memory: Record<number, number> = {
    0: MemoryViewer[0],
    34: MemoryViewer[34],
    45: MemoryViewer[45],
    50: MemoryViewer[50],
    100: MemoryViewer[100],
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 p-6">
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
                {reservationStationsUI.add.map((rs: any, idx: number) => (
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
                {reservationStationsUI.mult.map((rs: any, idx: number) => (
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
                {reservationStationsUI.load.map((rs: any, idx: number) => (
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
      </div>
    </div>
  );
}