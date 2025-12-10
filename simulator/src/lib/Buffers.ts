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
  BEQ: Array(2).fill(null).map(() => ({ busy: false, op: '', vj: null as number | null, vk: null as number | null, qj: null as number | null, qk: null as number | null, addr: null as number | null, dest: '', qi: null as number | null })),
  CALL_RET: Array(1).fill(null).map(() => ({ busy: false, op: '', vj: null as number | null, qj: null as number | null, addr: null as number | null, dest: '', qi: null as number | null }))
};

export let ROBCount =0;
export const ROB_Size = 8;
export let ROB_Head = 0;
export let ROB_Tail = 0;
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

export let ROB: ROBEntry[] = Array(ROB_Size).fill(null).map(() => ({
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

export function DequeueROB(): ROBEntry | null {
if(ROBCount ===0)
{

return null; // ROB is empty

}
const entry = ROB[ROB_Head];

entry.busy = false;
entry.instruction = null;
entry.destReg = null;
entry.value = null;
entry.ready = false;
entry.BranchPC = -1;
entry.BranchTaken = false;
entry.targetPC = 0;
entry.addr = 0;

// update Head Pointer

ROB_Head = (ROB_Head +1)%ROB_Size;

ROBCount--; // update number of entries

return entry;

}


export function FlushROB():void{ // for BEQ, CALL, RET
for(let i = 0;i<ROB_Size; i++)


  {
if (i !== ROB_Head && ROB[i].busy) {
      ROB[i].busy = false;
      ROB[i].instruction = null;
      ROB[i].destReg = null;
      ROB[i].value = null;
      ROB[i].ready = false;
      ROB[i].BranchPC = 0;
      ROB[i].BranchTaken = false;
      ROB[i].targetPC = 0;
      ROB[i].addr = 0;
    }

  }

 // Reset tail to right after head, count to 1 (only head remains)
  ROB_Tail = (ROB_Head + 1) % ROB_Size;
  ROBCount = ROB[ROB_Head].busy ? 1 : 0;


}

// ROB helper function

// Allocate a free ROB entry for an instruction
export function allocateROB(inst: Instruction): number {
  


    if(ROBCount>=ROB_Size)
      return -1; // ROB is full

    const i = ROB_Tail;
    const ROB_entry = ROB[i];
      
            ROB[i].busy = true;
            ROB[i].instruction = inst;
            ROB[i].ready = false;
            ROB[i].value = null;
            ROB[i].destReg = null;
            ROB[i].addr = 0;
            ROB[i].BranchPC=0;
            ROB[i].targetPC=0;
            ROB[i].BranchTaken = false;
     // update ROB tail pointer
     
     ROB_Tail =(ROB_Tail+1)% ROB_Size;
     ROBCount ++; // update number of entries
          
     return i;  
   
}




// Cycle counter - using an object so it can be modified by reference
export const CycleCounter = { value: 1 };
export const InstructionCounter = { value: 0 };

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
export const getInstructionCount = () => InstructionCounter.value; // Number of Instructions


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
    BEQ: Array(2).fill(null).map(() => ({ busy: false, op: '', vj: null as number | null, vk: null as number | null, qj: null as number | null, qk: null as number | null, addr: null as number | null, dest: '', qi: null as number | null })),
    CALL_RET: Array(1).fill(null).map(() => ({ busy: false, op: '', vj: null as number | null, qj: null as number | null, addr: null as number | null, dest: '', qi: null as number | null }))
  };
  
  // Recreate ROB from scratch
  ROB = Array(ROB_Size).fill(null).map(() => ({
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
  ROB_Head =0;
  ROB_Tail = 0;
  
  // Reset counters
  CycleCounter.value = 1;
  InstructionCounter.value = 0;
  
  // Reset CMDB
  clearCDB();
  
  // Clear instruction queue
  IQ = [];

  // Reset ROB number of entries

  ROBCount =0;
}