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
  busy: boolean
  instruction: Instruction | null
  destReg: string | null // destination register
  value: number | null   // result
  ready: boolean
  BranchPC: number
  addr:number
  BranchTaken:boolean
  targetPC: number
  
}

export let ROB: ROBEntry[] = Array(8).fill(null).map(() => ({
  busy: false,
  instruction: null,
  destReg: null,
  value: null,
  ready: false,
  BranchPC:0, // For BEQ
  BranchTaken: false,        
  targetPC: 0,
  addr:0
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
            ROB[i].addr = 0;
            ROB[i].BranchPC=0;
            ROB[i].targetPC=0;
            ROB[i].BranchTaken = false;

            return i;
        }
    }
    return -1; // ROB full
}




// Cycle counter - using an object so it can be modified by reference
export const CycleCounter = { value: 1 };

// Common Data Bus
export const CMDB: Array<{ robIndex: number; value: number }> = []; //has to be queue to store (as if result saved in executing)

export function enqueueCDB(robIndex: number, value: number): void {
    CMDB.push({ robIndex, value });
}

export function dequeueCDB(): { robIndex: number; value: number } | null {
    return CMDB.shift() || null;
}

export function clearCDB(): void {  //for reset
    CMDB.length = 0;
}

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
  
  // Recreate reservation stations from scratch
  reservationStations = {
    ADD: Array(4).fill(null).map(() => ({ busy: false, op: '', vj: null as number | null, vk: null as number | null, qj: null as number | null, qk: null as number | null, dest: '', qi: null as number | null })),
    NAND: Array(2).fill(null).map(() => ({ busy: false, op: '', vj: null as number | null, vk: null as number | null, qj: null as number | null, qk: null as number | null, dest: '', qi: null as number | null })),
    MULT: Array(1).fill(null).map(() => ({ busy: false, op: '', vj: null as number | null, vk: null as number | null, qj: null as number | null, qk: null as number | null, dest: '', qi: null as number | null })),
    LOAD: Array(2).fill(null).map(() => ({ busy: false, op: '', vj: null as number | null, qj: null as number | null, addr: null as number | null, dest: '', qi: null as number | null })),
    STORE: Array(1).fill(null).map(() => ({ busy: false, op: '', vj: null as number | null, vk: null as number | null, qj: null as number | null, qk: null as number | null, dest: '', qi: null as number | null })),
    BEQ: Array(2).fill(null).map(() => ({ busy: false, op: '', vj: null as number | null, vk: null as number | null, qj: null as number | null, qk: null as number | null, dest: '', qi: null as number | null })),
    CALL_RET: Array(1).fill(null).map(() => ({ busy: false, op: '', dest: '', qi: null as number | null }))
  };
  
  // Recreate ROB from scratch
  ROB = Array(8).fill(null).map(() => ({
    busy: false,
    instruction: null,
    destReg: null,
    value: null,
    ready: false,
    BranchPC: 0,
    BranchTaken: false,
    targetPC: 0,
    addr: 0
  }));
  
  // Reset counters
  CycleCounter.value = 1;
  InstructionCount = 0;
  
  // Reset CMDB
  clearCDB();
  
  // Clear instruction queue
  IQ = [];
}


