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




export let CycleCount = 0; //Number of Cycles
export let InstructionCount = 0;  // Number of Instructions


export let IQ:Array<Instruction> = []; // Instruction Queue to be filled Later


