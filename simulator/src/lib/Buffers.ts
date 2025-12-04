// Regsiter File
export const RF = {
  x0: { name: "x0", value: 0 },
  x1: { name: "x1", value: 0 },
  x2: { name: "x2", value: 0 },
  x3: { name: "x3", value: 0 },
  x4: { name: "x4", value: 0 },
  x5: { name: "x5", value: 0 },
  x6: { name: "x6", value: 0 },
  x7: { name: "x7", value: 0 }
};



// Registers Status Table (RF  + Occupuied Unit Index )
export const RegistersTable = {
    x0:{name: "x0" ,ROB_ENTRY : 0},
    x1:{ name: "x1" ,ROB_ENTRY : 0 },
    x2:{ name: "x2", ROB_ENTRY : 0},
    x3:{ name: "x3", ROB_ENTRY : 0},
    x4:{ name: "x4", ROB_ENTRY : 0},
    x5:{ name: "x5", ROB_ENTRY : 0},
    x6:{ name: "x6", ROB_ENTRY : 0},
    x7:{ name: "x7", ROB_ENTRY : 0}

};

// Memory

const Memory = new  ArrayBuffer(65536) ; // 64kb
const MemoryViewer = new Int32Array(Memory).fill(0); // Word Addressable 


 export const reservationStations = {
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
  };

export let CycleCount = 0; //Number of Cycles
export let InstructionCount = 0;  // Number of Instructions


export let IQ = { // Instruction Queue to be filled Later







}