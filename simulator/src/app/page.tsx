'use client';
import Image from "next/image";
// AI prompt(Claude) : Generate the Home page for a tomosulo algorithm Simulator 

import { useState, useEffect, useCallback } from 'react';
import { CPU } from '@/lib/CPU';
import { 
  RF, 
  RegistersTable, 
  reservationStations, 
  IQ, 
  CycleCounter, 
  MemoryViewer, 
  ROB,
  InstructionCount,
  resetSimulator
} from '@/lib/Buffers';

export default function Home() {
  const [cpu, setCpu] = useState<CPU | null>(null);
  const [, forceUpdate] = useState(0);
  

  const [programStrings, setProgramStrings] = useState([
    "LOAD R2, 0(R0)",      // PC=0: Load value 5 into R2
    "LOAD R3, 34(R0)",     // PC=1: Load value 10 into R3
    "CALL 5",              // PC=2: Call subroutine at PC=5 (R1 = PC+1 = 3)
    "STORE R4, 45(R0)",    // PC=3: Store result after return
    "BEQ R0, R0, 4",       // PC=4: End program (infinite loop or halt)
    "ADD R4, R2, R3",      // PC=5: Subroutine - Add R2 + R3 -> R4
    "RET"       ,    
        "ADD R4, R2, R3",      // PC=5: Subroutine - Add R2 + R3 -> R4
            "ADD R4, R2, R3",      // PC=5: Subroutine - Add R2 + R3 -> R4
    "ADD R4, R2, R3",      // PC=5: Subroutine - Add R2 + R3 -> R4
    "ADD R4, R2, R3",      // PC=5: Subroutine - Add R2 + R3 -> R4

  ]);

  // Initialize CPU
  useEffect(() => {
    const memData: Array<[number, number]> = [
      [0, 5],
      [34, 10],
      [45, 0],
      [50, 3.0],
      [100, 4.2],
    ];
    
    const cpuInstance = new CPU(0, memData, programStrings);
    setCpu(cpuInstance);
    // Force a re-render after CPU is initialized
    forceUpdate(prev => prev + 1);
  }, [programStrings]);

  const handleStep = useCallback(() => {
    if (cpu) {
      cpu.step();
      forceUpdate(prev => prev + 1);
    }
  }, [cpu]);

  const handleRun = useCallback(() => {
    if (cpu) {
      cpu.run();
      forceUpdate(prev => prev + 1);
    }
  }, [cpu]);

  const handleReset = useCallback(() => {
    // Reset all shared state first
    resetSimulator();
    
    const memData: Array<[number, number]> = [
      [0, 5],
      [34, 10],
      [45, 0],
      [50, 3.0],
      [100, 4.2],
    ];
    
    
    const cpuInstance = new CPU(0, memData, programStrings);
    setCpu(cpuInstance);
    forceUpdate(prev => prev + 1);
  }, [programStrings]);

  // Handler for loading a new program
  const handleProgramLoad = useCallback((newProgramStrings: string[]) => {
    setProgramStrings(newProgramStrings);
  }, []);

  // Expose handlers to window for Navbar to access
  useEffect(() => {
    (window as any).simulatorHandlers = {
      handleStep,
      handleRun,
      handleReset,
      handleProgramLoad
    };
  }, [cpu, handleStep, handleRun, handleReset, handleProgramLoad]);

  // Map program strings to display format
  //NOTE: FOllOWING FUNCTION AI GENERATED


  const program = programStrings.map((instStr, idx) => {
    const inst = IQ[idx]; // Get the parsed instruction for timing info if available
    
    // Parse the instruction string to extract components
    let dest = '-', src1 = '-', src2 = '-';
    
    // Match pattern: OPCODE dest, src1(src2) for LOAD/STORE
    // or OPCODE dest, src1, src2 for ALU ops
    const loadStoreMatch = instStr.match(/(\w+)\s+R(\d+),\s*(-?\d+)\(R(\d+)\)/);
    const aluMatch = instStr.match(/(\w+)\s+R(\d+),\s*R(\d+),\s*R(\d+)/);
    const beqMatch = instStr.match(/BEQ\s+(R\d+|\d+),\s*(R\d+|\d+),\s*(-?\d+)/);
    const callMatch = instStr.match(/CALL\s+(-?\d+)/);
    const retMatch = instStr.match(/RET/);
    
    if (loadStoreMatch) {
      // LOAD/STORE format: LOAD R6, 34(R2)
      dest = `R${loadStoreMatch[2]}`;
      src1 = loadStoreMatch[3]; // offset
      src2 = `R${loadStoreMatch[4]}`;
    } else if (beqMatch) {
      // BEQ format: BEQ R0, 0, 8 or BEQ R0, R1, 8
      dest = beqMatch[1]; 
      src1 = beqMatch[2]; 
      src2 = beqMatch[3]; 
    } else if (callMatch) {
      // CALL format: CALL 5
      dest = '-';
      src1 = callMatch[1]; // Label/offset
      src2 = '-';
    } else if (retMatch) {
      // RET format: RET (no operands)
      dest = '-';
      src1 = '-';
      src2 = '-';
    } else if (aluMatch) {
      // ALU format: ADD R6, R4, R2
      dest = `R${aluMatch[2]}`;
      src1 = `R${aluMatch[3]}`;
      src2 = `R${aluMatch[4]}`;
    }
    
    return {
      inst: instStr,
      dest,
      src1,
      src2,
      issue: inst?.issueCycle || null,
      exec: inst?.execCycleStart && inst?.execCycleEnd 
        ? `${inst.execCycleStart} → ${inst.execCycleEnd}` 
        : inst?.execCycleStart 
        ? `${inst.execCycleStart} →` 
        : null,
      write: inst?.writeCycle || null,
      commit: inst?.commitCycleStart && inst?.commitCyclesEnd 
        ? (inst.commitCycleStart === inst.commitCyclesEnd 
            ? `${inst.commitCycleStart}` 
            : `${inst.commitCycleStart} → ${inst.commitCyclesEnd}`)
        : inst?.commitCycleStart 
        ? `${inst.commitCycleStart} →` 
        : null
    };
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
    nand: reservationStations.NAND.map((rs, idx) => ({
      name: `NAND${idx + 1}`,
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
    store: reservationStations.STORE.map((rs, idx) => ({
      name: `Store${idx + 1}`,
      busy: rs.busy,
      op: rs.op || '',
      vj: rs.vj?.toString() || '',
      vk: rs.vk?.toString() || '',
      qj: rs.qj?.toString() || '',
      qk: rs.qk?.toString() || '',
      dest: ''
    })),
    beq: reservationStations.BEQ.map((rs, idx) => ({
      name: `BEQ${idx + 1}`,
      busy: rs.busy,
      op: rs.op || '',
      vj: rs.vj?.toString() || '',
      vk: rs.vk?.toString() || '',
      qj: rs.qj?.toString() || '',
      qk: rs.qk?.toString() || '',
      dest: ''
    })),
    callRet: reservationStations.CALL_RET.map((rs, idx) => ({
      name: `Call/Ret${idx + 1}`,
      busy: rs.busy,
      op: rs.op || '',
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

  // Map ROB entries for display - always show 8 entries
  const robEntries = Array.from({ length: 8 }, (_, idx) => {
    const entry = ROB[idx];
    if (entry) {
      return {
        index: idx,
        busy: entry.busy,
        instruction: entry.instruction?.opcode || '-',
        destReg: entry.destReg || '-',
        value: entry.value !== null ? entry.value.toString() : '-',
        ready: entry.ready
      };
    }
    return {
      index: idx,
      busy: false,
      instruction: '-',
      destReg: '-',
      value: '-',
      ready: false
    };
  });

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

        {/* Reorder Buffer (ROB) */}
        <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
          <h2 className="text-xl font-semibold mb-3 text-gray-200">ROB</h2>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-zinc-900">
                <tr className="border-b border-zinc-700">
                  <th className="text-left p-2 text-gray-400">Entry</th>
                  <th className="text-left p-2 text-gray-400">Busy</th>
                  <th className="text-left p-2 text-gray-400">Inst</th>
                  <th className="text-left p-2 text-gray-400">Dest</th>
                  <th className="text-left p-2 text-gray-400">Val</th>
                  <th className="text-left p-2 text-gray-400">Rdy</th>
                </tr>
              </thead>
              <tbody>
                {robEntries.map((entry, idx) => (
                  <tr key={idx} className={`border-b border-zinc-800 ${entry.busy ? 'bg-purple-950/30' : ''}`}>
                    <td className="p-2 font-mono text-purple-400">ROB{entry.index}</td>
                    <td className="p-2">{entry.busy ? '✓' : '-'}</td>
                    <td className="p-2">{entry.instruction}</td>
                    <td className="p-2">{entry.destReg}</td>
                    <td className="p-2">{entry.value}</td>
                    <td className="p-2">{entry.ready ? '✓' : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
        </div>


        {/* Current Cycle Display */}
        <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
          <h2 className="text-xl font-semibold mb-3 text-gray-200">Current Cycle</h2>
          <div className="flex items-center justify-center h-full">
            <div className="text-6xl font-bold text-blue-400">{CycleCounter.value - 1}</div>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
          <h2 className="text-xl font-semibold mb-3 text-gray-200">PC</h2>
          <div className="flex items-center justify-center h-full">
            <div className="text-6xl font-bold text-blue-400">{ (cpu?.getPC() ?? 0) - 1}</div>
          </div>
        </div>

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
                  <th className="text-left p-2 text-gray-400">Commit</th>
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
                    <td className="p-2">{inst.commit || '-'}</td>
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

        {/* Store Buffers */}
        <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Store Buffers</h2>
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
                  <th className="text-left p-2 text-gray-400">Addr</th>
                </tr>
              </thead>
              <tbody>
                {reservationStationsUI.store.map((rs: any, idx: number) => (
                  <tr key={idx} className={`border-b border-zinc-800 ${rs.busy ? 'bg-green-950/30' : ''}`}>
                    <td className="p-2 font-mono">{rs.name}</td>
                    <td className="p-2">{rs.busy ? '✓' : '-'}</td>
                    <td className="p-2">{rs.op || '-'}</td>
                    <td className="p-2">{rs.vj || '-'}</td>
                    <td className="p-2">{rs.vk || '-'}</td>
                    <td className="p-2">{rs.qj || '-'}</td>
                    <td className="p-2">{rs.qk || '-'}</td>
                    <td className="p-2">{rs.addr || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* NAND Reservation Stations */}
        <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">NAND Reservation Stations</h2>
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
                {reservationStationsUI.nand.map((rs: any, idx: number) => (
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

        {/* BEQ Reservation Stations */}
        <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">BEQ Reservation Stations</h2>
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
                {reservationStationsUI.beq.map((rs: any, idx: number) => (
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

        {/* CALL/RET Reservation Stations */}
        <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">CALL/RET Reservation Stations</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left p-2 text-gray-400">Name</th>
                  <th className="text-left p-2 text-gray-400">Busy</th>
                  <th className="text-left p-2 text-gray-400">Op</th>
                </tr>
              </thead>
              <tbody>
                {reservationStationsUI.callRet.map((rs: any, idx: number) => (
                  <tr key={idx} className={`border-b border-zinc-800 ${rs.busy ? 'bg-green-950/30' : ''}`}>
                    <td className="p-2 font-mono">{rs.name}</td>
                    <td className="p-2">{rs.busy ? '✓' : '-'}</td>
                    <td className="p-2">{rs.op || '-'}</td>
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