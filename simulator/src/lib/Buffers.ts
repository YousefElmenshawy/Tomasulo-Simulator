import { Instruction } from "./Instructions";

// Register File 
export const RF = [
  { name: "R0", value: 0 },
  { name: "R1", value: 0 },
  { name: "R2", value: 0 },
  { name: "R3", value: 0 },
  { name: "R4", value: 0 },
  { name: "R5", value: 0 },
  { name: "R6", value: 0 },
  { name: "R7", value: 0 }
]

// Registers Status Table 
export const RegistersTable = [
  { ROB: 0 },
  { ROB: 0 },
  { ROB: 0 },
  { ROB: 0 },
  { ROB: 0 },
  { ROB: 0 },
  { ROB: 0 },
  { ROB: 0 }
]

// Memory

const Memory = new  ArrayBuffer(65536) ; // 64kb
export const MemoryViewer = new Int32Array(Memory).fill(0); // Word Addressable 

// rESERVATions Stations     // null as number| null to start with a null value then can become a number
 export let reservationStations = {
  ADD: Array(4).fill(null).map(() => ({ busy: false, op: '', vj: null as number | null, vk: null as number | null, qj: null as number | null, qk: null as number | null, dest: '' ,qi:null as number | null})),
  NAND: Array(2).fill(null).map(() => ({ busy: false, op: '', vj: null as number | null, vk: null as number | null, qj: null as number | null, qk: null as number | null, dest: '',qi:null as number | null })),
  MULT: Array(1).fill(null).map(() => ({ busy: false, op: '', vj: null as number | null, vk: null as number | null, qj: null as number | null, qk: null as number | null, dest: '',qi:null as number | null})),
  LOAD: Array(2).fill(null).map(() => ({ busy: false, op: '', vj: null as number | null, qj: null as number | null, addr: null as number | null, dest: '', qi: null as number | null })),
  STORE: Array(1).fill(null).map(() => ({ busy: false, op: '', vj: null as number | null, vk: null as number | null, qj: null as number | null, qk: null as number | null, dest: '', qi: null as number | null })),
  BEQ: Array(2).fill(null).map(() => ({ busy: false, op: '', vj: null as number | null, vk: null as number | null, qj: null as number | null, qk: null as number | null, dest: '' ,qi:null as number | null})),
  CALL_RET: Array(1).fill(null).map(() => ({ busy: false, op: '', dest: '',qi:null as number | null }))
};
export interface ROBEntry {
  busy: boolean;
  instruction: Instruction | null;
  destReg: string | null; // destination register
  value: number | null;   // result
  ready: boolean; 
}

export let ROB: ROBEntry[] = Array(8).fill(null).map(() => ({
  busy: false,
  instruction: null,
  destReg: null,
  value: null,
  ready: false
}));

// ROB helper function

// Allocate a free ROB entry for an instruction
export function allocateROB(inst: Instruction): number {
    for (let i = 0; i < ROB.length; i++) {
        if (!ROB[i].busy) {
            ROB[i].busy = true;
            ROB[i].instruction = inst;
            ROB[i].ready = false;
            ROB[i].value = null;
            ROB[i].destReg = null;
            return i;
        }
    }
    return -1; // ROB full
}




// Cycle counter - using an object so it can be modified by reference
export const CycleCounter = { value: 1 };
// Export getter for backward compatibility
export const getCycleCount = () => CycleCounter.value;
export let InstructionCount = 0;  // Number of Instructions


export let IQ:Array<Instruction> = []; // Instruction Queue to be filled Later

// Reset function to clear all state
export function resetSimulator(): void {
  // Reset registers
  RF.forEach(reg => reg.value = 0);
  
  // Reset register status table
  RegistersTable.forEach(reg => reg.ROB = 0);
  
  // Reset memory
  MemoryViewer.fill(0);
  
  // Reset reservation stations
  reservationStations.ADD.forEach(rs => {
    rs.busy = false;
    rs.op = '';
    rs.vj = null;
    rs.vk = null;
    rs.qj = null;
    rs.qk = null;
    rs.dest = '';
    rs.qi = null;
  });
  
  reservationStations.NAND.forEach(rs => {
    rs.busy = false;
    rs.op = '';
    rs.vj = null;
    rs.vk = null;
    rs.qj = null;
    rs.qk = null;
    rs.dest = '';
    rs.qi = null;
  });
  
  reservationStations.MULT.forEach(rs => {
    rs.busy = false;
    rs.op = '';
    rs.vj = null;
    rs.vk = null;
    rs.qj = null;
    rs.qk = null;
    rs.dest = '';
    rs.qi = null;
  });
  
  reservationStations.LOAD.forEach(rs => {
    rs.busy = false;
    rs.op = '';
    rs.vj = null;
    rs.qj = null;
    rs.addr = null;
    rs.dest = '';
    rs.qi = null;
  });
  
  reservationStations.STORE.forEach(rs => {
    rs.busy = false;
    rs.op = '';
    rs.vj = null;
    rs.vk = null;
    rs.qj = null;
    rs.qk = null;
    rs.dest = '';
    rs.qi = null;
  });
  
  reservationStations.BEQ.forEach(rs => {
    rs.busy = false;
    rs.op = '';
    rs.vj = null;
    rs.vk = null;
    rs.qj = null;
    rs.qk = null;
    rs.dest = '';
    rs.qi = null;
  });
  
  reservationStations.CALL_RET.forEach(rs => {
    rs.busy = false;
    rs.op = '';
    rs.dest = '';
    rs.qi = null;
  });
  
  // Reset ROB
  ROB.forEach(entry => {
    entry.busy = false;
    entry.instruction = null;
    entry.destReg = null;
    entry.value = null;
    entry.ready = false;
  });
  
  // Reset counters
  CycleCounter.value = 1;
  InstructionCount = 0;
  
  // Clear instruction queue
  IQ.length = 0;
}


