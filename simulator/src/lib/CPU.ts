import {RF,RegistersTable,reservationStations,IQ,InstructionCounter,MemoryViewer,ROB,ROBEntry,allocateROB,CycleCounter, CMDB, enqueueCDB, dequeueCDB,FlushROB,DequeueROB,ROBCount,ROB_Size,ROB_Head,ROB_Tail, Actual_IQ}from "./Buffers"
import { Instruction,decodeInst } from "./Instructions";


    
export class CPU
{
public EndProgram  :number|undefined = 0;  
private  PC:number = 0;
private Memory:Int32Array = MemoryViewer; 
private Registers = RF;
private RegTable = RegistersTable;
private AddStations = reservationStations.ADD; 
private LoadStations = reservationStations.LOAD;
private MultStations = reservationStations.MULT;
private NANDStations = reservationStations.NAND;
private CALL_RET_Stations =reservationStations.CALL_RET; 
private StoreStations = reservationStations.STORE; 
private BeqStations = reservationStations.BEQ; 
private Instructions = IQ;
private NumCycles = CycleCounter ;  
private ReOrderBuffer = ROB;
private CommonDataBus = CMDB;
private branchCount = 0;
private branchMispredictions = 0;
private IC = InstructionCounter;
private Actuall_IQ = Actual_IQ;

// Helper to be used 

private freeAllReservationStations(inst:Instruction): void {
    if(inst!== undefined && inst.opcode !== undefined ){
    
                    switch (inst.opcode) {
                        case "ADD":
                        case "SUB":
                            this.AddStations.forEach(rs => {
                               
                                    rs.busy = false;
                                    rs.vj = null;
                                    rs.vk = null;
                                    rs.qj = null;
                                    rs.qk = null;
                                    rs.qi = null;
                            
                            });
                            break;
                        case "MUL":
                            this.MultStations.forEach(rs => {
                               
                                    rs.busy = false;
                                    rs.vj = null;
                                    rs.vk = null;
                                    rs.qj = null;
                                    rs.qk = null;
                                    rs.qi = null;
                                
                            });
                            break;
                        case "NAND":
                            this.NANDStations.forEach(rs => {
                              
                                    rs.busy = false;
                                    rs.vj = null;
                                    rs.vk = null;
                                    rs.qj = null;
                                    rs.qk = null;
                                    rs.qi = null;
                                
                            });
                            break;
                        case "LOAD":
                            this.LoadStations.forEach(rs => {
                               
                                    rs.busy = false;
                                    rs.vj = null;
                                    rs.qj = null;
                                    rs.addr = null;
                                    rs.qi = null;
                                
                            });
                            break;
                        case "STORE":
                            this.StoreStations.forEach(rs => {
                                
                                    rs.busy = false;
                                    rs.vj = null;
                                    rs.vk = null;
                                    rs.qj = null;
                                    rs.qk = null;
                                    rs.qi = null;
                                
                            });
                            break;
                        case "BEQ":
                            this.BeqStations.forEach(rs => {
                               
                                    rs.busy = false;
                                    rs.vj = null;
                                    rs.vk = null;
                                    rs.qj = null;
                                    rs.qk = null;
                                    rs.addr = 0;
                                    rs.qi = null;
                                
                            });
                            break;
                        case "CALL":
                        case "RET":
                            this.CALL_RET_Stations.forEach(rs => {
                                
                                    rs.busy = false;
                                    rs.qi = null;
                                
                            });
                            break;
                    }
        }
    }
  
// Getter for PC
public getPC(): number {
    return this.PC;
}

// Helper to load instruction queue from current PC
private loadInstructionQueue(): void {
    Actual_IQ.length = 0; // Clear the queue
    // Fill with instructions starting from current PC
    for (let i = this.PC; i < this.Instructions.length; i++) {
        if (this.Instructions[i]) {
            Actual_IQ.push(this.Instructions[i]);
        }
    }
}

// Getter for branch misprediction percentage
public getBranchMispredictionRate(): number {
    if (this.branchCount === 0) return 0;
    return (this.branchMispredictions / this.branchCount) * 100;
}

constructor(InstAddress:number ,Memdata: Array<[number,number]>, program: Array<string> ){ // Inputs DataMemory and Starting Address
this.EndProgram = -1;
this.PC = InstAddress;
for ( let i = 0; i<Memdata.length; i++) //Filling Data Memory
{
let addr = Memdata[i][0];
let data = Memdata[i][1];
this.Memory[addr] = data;

}
for(let i = 0; i<program.length;i++)  //filling the program Instructions
{
this.Instructions[i] = decodeInst(program[i]);
}

// Initialize instruction queue from starting address
this.loadInstructionQueue();


}

private issue(inst: Instruction): void {
    // Issue instruction from the front of Actual_IQ
    // The inst parameter should match the front of the queue
   
    if (!inst) return;

    // Check if already issued
    if (inst.issueCycle !== undefined) return;

    // 1. Find a free reservation station
    let rs: any;
    switch (inst.opcode) {
        case "ADD":
        case "SUB":
            rs = this.AddStations.find(s => !s.busy);
            inst.execCyclesNeeded = 2;
            inst.commitCyclesNeeded = 1;
            break;
        case "NAND":
            rs = this.NANDStations.find(s => !s.busy);
            inst.execCyclesNeeded = 1;
            inst.commitCyclesNeeded = 1;
            break;
        case "MUL":
            rs = this.MultStations.find(s => !s.busy);
            inst.execCyclesNeeded = 12;  // 12 cycles for multiplication
            inst.commitCyclesNeeded = 1;
            break;
        case "LOAD":
            rs = this.LoadStations.find(s => !s.busy);
            inst.execCyclesNeeded = 6;  // 2 (compute address) + 4 (read from memory)
            inst.commitCyclesNeeded = 1;
            break;
        case "STORE":
            rs = this.StoreStations.find(s => !s.busy);
            inst.execCyclesNeeded = 2;  // 2 (compute address) + 4 (write to memory)
            inst.commitCyclesNeeded = 4;
            break;
        case "BEQ":
            rs = this.BeqStations.find(s => !s.busy);
            inst.execCyclesNeeded = 1;
            inst.commitCyclesNeeded = 1;
            break;
        case "CALL":
        case "RET":
            rs = this.CALL_RET_Stations.find(s => !s.busy);
            inst.execCyclesNeeded = 1;
            inst.commitCyclesNeeded = 1;
            break;
        default:
            return;
    }


    if (!rs) return; // Stall - no free RS


    //  Allocate ROB entry
    const robIndex = allocateROB(inst);
    if (robIndex === -1) return; // Stall - ROB full

    



    //  Mark RS as busy
    rs.busy = true;
    rs.op = inst.opcode;
    rs.qi = robIndex;

    // in Case of the following instructions (ALU)
    if (inst.opcode === "ADD" || inst.opcode === "SUB" || 
        inst.opcode === "MUL" || inst.opcode === "NAND") {
        
        

        
        // Source 1: rB
        if (inst.rB !== undefined) {

            if (inst.rB === 0) {
                rs.vj = 0;
                rs.qj = null;
            } else {
                const tag = this.RegTable[inst.rB].ROB;
                if (tag === 0) {

                    rs.vj = this.Registers[inst.rB].value;
                    rs.qj = null;
                } else if (this.ReOrderBuffer[tag].ready) {

                    rs.vj = this.ReOrderBuffer[tag].value ?? 0;
                    rs.qj = null;
                } else {

                    rs.vj = null;
                    rs.qj = tag;
                    }
            }
        }


        // Source 2: rC
        if (inst.rC !== undefined) {
            if (inst.rC === 0) {
                rs.vk = 0;
                rs.qk = null;
            } else {
                const tag = this.RegTable[inst.rC].ROB;
                if (tag === 0) {
                    rs.vk = this.Registers[inst.rC].value;
                    rs.qk = null;
                } else if (this.ReOrderBuffer[tag].ready) {
                    rs.vk = this.ReOrderBuffer[tag].value ?? 0;
                    rs.qk = null;
                } else {
                    rs.vk = null;
                    rs.qk = tag;
                }
            }
        }
// Destination 
        if (inst.rA !== undefined) {
            this.RegTable[inst.rA].ROB = robIndex;
            this.ReOrderBuffer[robIndex].destReg = `R${inst.rA}`;
        }
    }
    


    else if (inst.opcode === "LOAD") {
        // Base register: rB
        if (inst.rB !== undefined) {
            if (inst.rB === 0) {
                rs.vj = 0;
                rs.qj = null;
            } else {
                const tag = this.RegTable[inst.rB].ROB;
                if (tag === 0) {
                    rs.vj = this.Registers[inst.rB].value;
                    rs.qj = null;
                } else if (this.ReOrderBuffer[tag].ready) {
                    rs.vj = this.ReOrderBuffer[tag].value ?? 0;
                    rs.qj = null;
                } else {
                    rs.vj = null;
                    rs.qj = tag;
                }
            }
        }
        
        // Offset (immediate)
        rs.addr = inst.offset ?? 0;

        // Destination: rA
        if (inst.rA !== undefined) {
      this.RegTable[inst.rA].ROB = robIndex;
            this.ReOrderBuffer[robIndex].destReg = `R${inst.rA}`;
        }
    }
    

//STORE rA, offset(rB) 
    // rA = value to store, rB = base address, offset = immediate
    else if (inst.opcode === "STORE") {
        // Value to store: rA
        if (inst.rA !== undefined) {
            if (inst.rA === 0) {
                rs.vj = 0;
                rs.qj = null;
            } else {
                const tag = this.RegTable[inst.rA].ROB;
                if (tag === 0) {
                    // No pending write, read directly from register
                    rs.vj = this.Registers[inst.rA].value;
                    rs.qj = null;
                } else if (this.ReOrderBuffer[tag].ready) {
                    // Producer is ready, forward the value from ROB
                    rs.vj = this.ReOrderBuffer[tag].value ?? 0;
                    rs.qj = null;
                } else {
                    // Producer not ready, set dependency
                    rs.vj = null;
                    rs.qj = tag;
                }
            }
        }

        // Base address: rB
        if (inst.rB !== undefined) {
            if (inst.rB === 0) {
                rs.vk = 0;
                rs.qk = null;
            } else {
                const tag = this.RegTable[inst.rB].ROB;
                if (tag === 0) {
                    // No pending write, read directly from register
                    rs.vk = this.Registers[inst.rB].value;
                    rs.qk = null;
                } else if (this.ReOrderBuffer[tag].ready) {
                    // Producer is ready, forward the value from ROB
                    rs.vk = this.ReOrderBuffer[tag].value ?? 0;
                    rs.qk = null;
                } else {
                    // Producer not ready, set dependency
                    rs.vk = null;
                    rs.qk = tag;
                }
            }
        }

        // Offset
        rs.addr = inst.offset ?? 0;

        // STORE doesn't write to registers, but we mark ROB
        this.ReOrderBuffer[robIndex].destReg = "";
    }

//  BEQ rA, rB, offset
    
    else if (inst.opcode === "BEQ") {
        // Source 1: rA
        if (inst.rA !== undefined) {
            if (inst.rA === 0) {
                rs.vj = 0;
                rs.qj = null;
            } else {
                const tag = this.RegTable[inst.rA].ROB;
                if (tag === 0) {
                    rs.vj = this.Registers[inst.rA].value;
                    rs.qj = null;
                } else if (this.ReOrderBuffer[tag].ready) {
                    rs.vj = this.ReOrderBuffer[tag].value ?? 0;
                    rs.qj = null;
                } else {
                    rs.vj = null;
                    rs.qj = tag;
                }
            }
        }

        // Source 2: rB
        if (inst.rB !== undefined) {
            if (inst.rB === 0) {
                rs.vk = 0;
                rs.qk = null;
            } else {
                const tag = this.RegTable[inst.rB].ROB;
                if (tag === 0) {
                    rs.vk = this.Registers[inst.rB].value;
                    rs.qk = null;
                } else if (this.ReOrderBuffer[tag].ready) {
                    rs.vk = this.ReOrderBuffer[tag].value ?? 0;
                    rs.qk = null;
                } else {
                    rs.vk = null;
                    rs.qk = tag;
                }
            }
        }

        // Branch offset
        rs.addr = inst.offset ?? 0;
        

        this.ReOrderBuffer[robIndex].BranchPC = this.PC;
        this.ReOrderBuffer[robIndex].targetPC = (this.PC + rs.addr) + 1;
        this.ReOrderBuffer[robIndex].BranchTaken = false;
        // BEQ doesn't write to registers
        this.ReOrderBuffer[robIndex].destReg = "";
    }






    
else if (inst.opcode === "CALL") {
        // CALL has no source operands, only immediate (label offset)
        rs.addr = inst.offset ?? 0;  // label as 7-bit signed immediate
        
        // Store CALL's PC for calculating return address
        this.ReOrderBuffer[robIndex].BranchPC = this.PC;
        
        // CALL writes return address to R1
        this.RegTable[1].ROB = robIndex;
        this.ReOrderBuffer[robIndex].destReg = "R1";
    }
    
    // RET
    // Branch to address in R1
    else if (inst.opcode === "RET") {
        // Source: R1 (return address)
        const tag = this.RegTable[1].ROB;
        if (tag === 0) {
            rs.vj = this.Registers[1].value;
            rs.qj = null;
        } else if (this.ReOrderBuffer[tag].ready) {
            rs.vj = this.ReOrderBuffer[tag].value ?? 0;
            rs.qj = null;
        } else {
            rs.vj = null;
            rs.qj = tag;
        }
        
        // Store RET's PC (like BEQ stores BranchPC)
        this.ReOrderBuffer[robIndex].BranchPC = this.PC;
        
        // RET doesn't write to registers
        this.ReOrderBuffer[robIndex].destReg = "";
    }
    
   
    // 7. Mark issue cycle
    inst.issueCycle = CycleCounter.value;
    this.PC = this.PC + 1;
    
    // Dequeue from Actual_IQ (remove the issued instruction)
    if (Actual_IQ.length > 0 && Actual_IQ[0] === inst) {
        Actual_IQ.shift();
    }
}





private execute(inst: Instruction): void {
    if (!inst) return;
    
      
    if (inst.execCycleEnd !== undefined) return;  // probably redundant but to be safe
    
    // Find the ROB entry for this instruction
    const robIndex = this.ReOrderBuffer.findIndex(rob => rob.instruction === inst);
    if (robIndex === -1) return;
    
    const robEntry = this.ReOrderBuffer[robIndex];
    
    // Find the reservation station for this instruction
    let rs: any = null;
    switch (inst.opcode) {
        case "ADD":
        case "SUB":
            rs = this.AddStations.find(s => s.busy && s.qi === robIndex);
            break;
        case "NAND":
            rs = this.NANDStations.find(s => s.busy && s.qi === robIndex);
            break;
        case "MUL":
            rs = this.MultStations.find(s => s.busy && s.qi === robIndex);
            break;
        case "LOAD":
            rs = this.LoadStations.find(s => s.busy && s.qi === robIndex);
            break;
        case "STORE":
            rs = this.StoreStations.find(s => s.busy && s.qi === robIndex);
            break;
        case "BEQ":
            rs = this.BeqStations.find(s => s.busy && s.qi === robIndex);
            break;
        case "CALL":
        case "RET":
            rs = this.CALL_RET_Stations.find(s => s.busy && s.qi === robIndex);
            break;
    }
    
    if (!rs) return; // RS not found or already freed


    // Check if operands are ready
    
    // Helper function to check if a ROB entry is ready OR has been committed
    // Only checks ROB entries that are BEFORE the current instruction (older)
    const operandReady = (robTag: number | null): boolean => {
        if (robTag === null || robTag === undefined) return true; // No dependency
        
        const robEntryN = this.ReOrderBuffer[robTag];
        
        // If ROB entry doesn't exist or is not busy, it has been committed
        // In this case, the value is in the register file
        if (!robEntryN || !robEntryN.busy) return true;
        
        // Check if this ROB entry is BEFORE the current instruction in program order
        // In a circular buffer, we need to check if robTag comes before robIndex
        // If robTag is after robIndex, then it's a dependency on a future instruction (impossible!)
        // In that case, treat it as if the value is in the register file
        const isBeforeCurrent = ((robTag - ROB_Head + ROB_Size) % ROB_Size) < 
                                ((robIndex - ROB_Head + ROB_Size) % ROB_Size);
        
        if (!isBeforeCurrent) {
            // This ROB entry is AFTER the current instruction, so we should read from register file
            return true;
        }
        
        // If ROB entry exists, is busy, and is before current instruction, check if it's ready
        return robEntryN.ready === true;
    };

    const operandsReady = operandReady(rs.qj) && operandReady(rs.qk);

    if (!operandsReady) return; // Wait for operands

// If we reach here, update values from ROB if needed, or refresh from register file
if (rs.qj !== null && rs.qj !== undefined) {
    const qjROB = this.ReOrderBuffer[rs.qj];
    if (qjROB && qjROB.busy && qjROB.ready) {
        // ROB entry is still in ROB and ready
        rs.vj = qjROB.value ?? 0;
        rs.qj = null;
    } else {
        // ROB entry was committed, read from register file
        // Determine which register to read based on instruction type
        let regNum: number | undefined;
        
        if (inst.opcode === "STORE" || inst.opcode === "BEQ") {
            // For STORE and BEQ, vj comes from rA
            regNum = inst.rA;
        } else if (inst.opcode === "RET") {
            // For RET, vj comes from R1
            regNum = 1;
        } else {
            // For ALU ops (ADD, SUB, MUL, NAND) and LOAD, vj comes from rB
            regNum = inst.rB;
        }
        
        if (regNum !== undefined) {
            rs.vj = this.Registers[regNum].value;
            rs.qj = null;
        }
    }
} else if (rs.qj === null || rs.qj === undefined) {
    // No dependency tag, but verify vj is correct from register file
    // This handles cases where the tag was cleared/decremented but value may be stale
    let regNum: number | undefined;
    
    if (inst.opcode === "STORE" || inst.opcode === "BEQ") {
        regNum = inst.rA;
    } else if (inst.opcode === "RET") {
        regNum = 1;
    } else if (inst.opcode === "ADD" || inst.opcode === "SUB" || inst.opcode === "MUL" || 
               inst.opcode === "NAND" || inst.opcode === "LOAD") {
        regNum = inst.rB;
    }
    
    if (regNum !== undefined && regNum !== 0) {
        const currentRegValue = this.Registers[regNum].value;
        if (rs.vj !== currentRegValue) {
            rs.vj = currentRegValue;
        }
    }
}

if (rs.qk !== null && rs.qk !== undefined) {
    const qkROB = this.ReOrderBuffer[rs.qk];
    if (qkROB && qkROB.busy && qkROB.ready) {
        // ROB entry is still in ROB and ready
        rs.vk = qkROB.value ?? 0;
        rs.qk = null;
    } else {
        // ROB entry was committed, read from register file
        // Determine which register to read based on instruction type
        let regNum: number | undefined;
        
        if (inst.opcode === "STORE" || inst.opcode === "BEQ") {
            // For STORE and BEQ, vk comes from rB
            regNum = inst.rB;
        } else {
            // For ALU ops (ADD, SUB, MUL, NAND), vk comes from rC
            regNum = inst.rC;
        }
        
        if (regNum !== undefined) {
            rs.vk = this.Registers[regNum].value;
            rs.qk = null;
        }
    }
} else if (rs.qk === null || rs.qk === undefined) {
    // No dependency tag, but verify vk is correct from register file
    // This handles cases where the tag was cleared/decremented but value may be stale
    let regNum: number | undefined;
    
    if (inst.opcode === "STORE" || inst.opcode === "BEQ") {
        regNum = inst.rB;
    } else if (inst.opcode === "ADD" || inst.opcode === "SUB" || inst.opcode === "MUL" || inst.opcode === "NAND") {
        regNum = inst.rC;
    }
    
    if (regNum !== undefined && regNum !== 0) {
        const currentRegValue = this.Registers[regNum].value;
        if (rs.vk !== currentRegValue) {
            rs.vk = currentRegValue;
        }
    }
}
 
    
    // Start execution if not started yet
    if (inst.execCycleStart === undefined) {
        inst.execCycleStart = CycleCounter.value;
       
    }
    
    // Check if execution is complete
    const cyclesElapsed = CycleCounter.value - inst.execCycleStart;
    
    
   
    
    // Perform the operation based on opcode
    let result: number | null = null;
    
    switch (inst.opcode) {
        case "ADD":
            if(cyclesElapsed===2){
                result = (rs.vj ?? 0) + (rs.vk ?? 0);
                inst.execCycleEnd = CycleCounter.value;}
            else
                return;
            break;
            
        case "SUB":
            if(cyclesElapsed===1){
                result = (rs.vj ?? 0) - (rs.vk ?? 0);
                inst.execCycleEnd = CycleCounter.value;}
            else
                return;
            break;
            
        case "MUL":

            if(cyclesElapsed===11){
                result = (rs.vj ?? 0) * (rs.vk ?? 0);
                inst.execCycleEnd = CycleCounter.value;
            }
            else
                return;
            break;
            
        case "NAND": 
            result = ~((rs.vj ?? 0) & (rs.vk ?? 0));
            inst.execCycleEnd = CycleCounter.value;
            break;
            
        case "LOAD":
            // LOAD: 2 cycles to compute address, then 4 cycles to read from memory (total 6)
            
            // After 2 cycles (cyclesElapsed == 1), compute effective address
            if (cyclesElapsed === 1 ) {
                const effectiveAddr = (rs.vj ?? 0) + (rs.addr ?? 0);
                robEntry.addr = effectiveAddr;  // Store for UI to display
                return; // Not done yet, continue execution
            }
            
            // Only on final cycle (cyclesElapsed == 5), read from memory and set result
            if (cyclesElapsed === 5) {
                const loadAddr = robEntry.addr;  // Use computed address
                result = this.Memory[loadAddr] ?? 0;
                inst.execCycleEnd = CycleCounter.value;
            } else {
                return; // Not done yet, don't mark as ready
            }
            break;
            
        case "STORE":
            // STORE: 2 cycles to compute address, then 4 cycles to write to memory (To be done in commit) (total 6)
            
            // After 2 cycles (cyclesElapsed == 1), compute effective address
            if (cyclesElapsed === 1) {
                const effectiveAddr = (rs.vk ?? 0) + (rs.addr ?? 0);
                robEntry.addr = effectiveAddr;  // Store for UI to display
                 result = rs.vj;
            
                 robEntry.value = result;
                 inst.execCycleEnd = CycleCounter.value;
            }
            else {
                return; // Not done yet, don't mark as ready
            }
            
            // Only on final cycle (cyclesElapsed == 5), prepare value for commit
        
            break;
            
        case "BEQ":
            // Compare rA and rB
            const equal = (rs.vj ?? 0) === (rs.vk ?? 0);
            
            // Calculate branch target address
            const branchPC = robEntry.BranchPC ?? this.PC;
            let targetPC: number;
            if (equal) {
                // Branch taken: PC + offset + 1
                const pcPlusOffset = branchPC + (rs.addr ?? 0);
                targetPC = pcPlusOffset + 1;
            } else {
                // Branch not taken: PC + 1
                targetPC = branchPC + 1;
            }
            
            // Store branch result in ROB
            result = equal ? 1 : 0;
            robEntry.BranchTaken = equal;
            robEntry.targetPC = targetPC;
            inst.execCycleEnd = CycleCounter.value;
            break;
        case "CALL":
            
            // Calculate call target address from offset
            const callTarget =  rs.addr; // PC + label offset
            robEntry.targetPC = callTarget; // Store target for commit
         
            result = robEntry.BranchPC + 1; // Return address to store in R1
               inst.execCycleEnd = CycleCounter.value;
            break;
            
        case "RET":
            // Return to address in register
            result = rs.vj ?? 0;
            robEntry.targetPC = result??0; // Store return target PC
            inst.execCycleEnd = CycleCounter.value;
            break;
    }
    
    // Store result in CMDB
    if (result !== null) {
        enqueueCDB(robIndex, result);  //enque to check later if this inst has priority
        rs.busy = false; // Free RS after execution completes
    }
}

private write(): void {

    // Dequeue one entry from CMDB (process first in queue)
    const cdbEntry = dequeueCDB();
    if (!cdbEntry) return; // Queue is empty
    
    const { robIndex, value } = cdbEntry;
    const robEntry = this.ReOrderBuffer[robIndex];
    if (!robEntry) return;

    robEntry.value = value;
    robEntry.ready = true;

    const inst = robEntry.instruction;
    if (!inst) return;

    if(inst.execCycleEnd === undefined) return;
    
    inst.writeCycle = CycleCounter.value;


    
}
private commit(): void {
    // Get ROB head using circular buffer index
    if (ROBCount === 0) return; // ROB is empty
    
    const robEntry = this.ReOrderBuffer[ROB_Head];
    if (!robEntry || !robEntry.ready) return;

    
    const inst = robEntry.instruction;

    
    if (!inst) return;

   
     if (inst.commitCycleStart === undefined) {
        inst.commitCycleStart = CycleCounter.value;
       
    }

    if (inst.commitCyclesNeeded === undefined) {
        inst.commitCyclesNeeded = 1;
       
    }
        


     const cyclesElapsed = CycleCounter.value - inst.commitCycleStart;
    // Handle BEQ: check for branch misprediction
    if (inst.opcode === "BEQ") {
        this.branchCount++;
        const taken = robEntry.BranchTaken;
        if (taken) {
            // Branch was taken - this is a misprediction (we predict not taken)
            this.branchMispredictions++;
            
            // Update PC to correct target
            const branchPCOld = robEntry.BranchPC;
            this.PC = robEntry.targetPC;

            // Clear instructions in the instruction queue between branchPC and targetPC
            // Handle both forward branches (targetPC > branchPCOld) and backward branches (targetPC < branchPCOld)
            const startPC = Math.min(branchPCOld +1, this.PC);
            const endPC = Math.max(branchPCOld, this.PC );
            
            for(let i = startPC; i <= endPC; i++)
            {
                const flushedInst = this.Instructions[i];

                // Clear the flushed instruction's cycle tracking
                if (flushedInst && flushedInst !== inst) {
                    flushedInst.issueCycle = undefined;
                    flushedInst.execCycleStart = undefined;
                    flushedInst.execCycleEnd = undefined;
                    flushedInst.writeCycle = undefined;
                    flushedInst.commitCycleStart = undefined;
                    flushedInst.commitCyclesEnd = undefined;
                }
            }
            
            
            // Flush all speculative instructions from ROB
            // Before flushing, free all reservation stations for flushed ROB entries
            for (let i = 0; i < ROB_Size; i++) {
                // Skip the head (the BEQ instruction that's committing)
                if (i === ROB_Head) continue;
                
                const flushedROB = this.ReOrderBuffer[i];
                if (!flushedROB.busy) continue;
                
                const flushedInst = flushedROB.instruction;
                
                // Free reservation stations for this flushed instruction
                if (flushedInst && flushedInst !== inst) {
                    flushedInst.issueCycle = undefined;
                    flushedInst.execCycleStart = undefined;
                    flushedInst.execCycleEnd = undefined;
                    flushedInst.writeCycle = undefined;
                    flushedInst.commitCycleStart = undefined;
                    flushedInst.commitCyclesEnd = undefined;
                    this.freeAllReservationStations(flushedInst);
                }
                
                // Clear register table entries that were waiting for flushed instructions
                if (flushedROB.destReg && flushedROB.destReg !== "") {
                    const regNum = parseInt(flushedROB.destReg.substring(1));
                    if (this.RegTable[regNum].ROB === i) {
                        this.RegTable[regNum].ROB = 0; // Clear the tag
                    }
                }
            }
            
            // Now flush the ROB (clears all entries except head)
            FlushROB();
            
            // Clear CMDB queue since all flushed instructions are invalid
            this.CommonDataBus.length = 0;
            
            // Reload instruction queue from new PC
            this.loadInstructionQueue();

        }
        // If not taken, PC already correct (incremented normally)
        
        // BEQ doesn't write to registers, just needs to be removed from ROB
        // Fall through to common commit logic below
    }
    // Handle STORE( write to memory)
    else if (inst.opcode === "STORE") {
        if(cyclesElapsed===3){
        const addr = robEntry.addr ?? 0;
        const value = robEntry.value ?? 0;
        console.log(addr);
        console.log(value);


        this.Memory[addr] = value;
        
        }
        else
        {
            return;
        }
    }
    // Handle CALL: update PC to target and flush speculative instructions
    else if (inst.opcode === "CALL") {
        // Before flushing, free all reservation stations for flushed ROB entries
        for (let i = 0; i < ROB_Size; i++) {
            // Skip the head (the CALL instruction that's committing)
            if (i === ROB_Head) continue;
            
            const flushedROB = this.ReOrderBuffer[i];
            if (!flushedROB.busy) continue;
            
            const flushedInst = flushedROB.instruction;
            
            // Free reservation stations for this flushed instruction
            if (flushedInst && flushedInst !== inst) {
                flushedInst.issueCycle = undefined;
                flushedInst.execCycleStart = undefined;
                flushedInst.execCycleEnd = undefined;
                flushedInst.writeCycle = undefined;
                flushedInst.commitCycleStart = undefined;
                flushedInst.commitCyclesEnd = undefined;
                this.freeAllReservationStations(flushedInst);
            }
            
            // Clear register table entries that were waiting for flushed instructions
            if (flushedROB.destReg && flushedROB.destReg !== "") {
                const regNum = parseInt(flushedROB.destReg.substring(1));
                if (this.RegTable[regNum].ROB === i) {
                    this.RegTable[regNum].ROB = 0; // Clear the tag
                }
            }
        }
        
        // Now flush the ROB (clears all entries except head)
        FlushROB();
        
        // Clear CMDB queue since all flushed instructions are invalid
        this.CommonDataBus.length = 0;

        // Write return address to R1
        if (robEntry.destReg === "R1") {
            this.Registers[1].value = robEntry.value ?? 0; // Store PC+1 in R1
            this.RegTable[1].ROB = 0;
        }
        
        // Update PC to call target (computed in execute)
        this.PC = robEntry.targetPC ?? 0;
        
        // Reload instruction queue from new PC
        this.loadInstructionQueue();
    }
    // Handle RET: update PC to return address and flush speculative instructions
    else if (inst.opcode === "RET") {
        // Get RET's PC and return target PC
        const retPC = robEntry.BranchPC ?? 0; // PC where RET was
        const targetPC = robEntry.value ?? 0; // PC to return to (from R1)
        
        // Clear instructions in the instruction queue between RET and return target
        // This handles both forward returns (targetPC > retPC) and backward returns (targetPC < retPC)
        const startPC = Math.min(retPC, targetPC);
        const endPC = Math.max(retPC, targetPC);
        
        for(let i = startPC; i <= endPC; i++) {
            const flushedInst = this.Instructions[i];
            // Skip the RET instruction itself
            if (flushedInst && flushedInst !== inst) {
                flushedInst.issueCycle = undefined;
                flushedInst.execCycleStart = undefined;
                flushedInst.execCycleEnd = undefined;
                flushedInst.writeCycle = undefined;
                flushedInst.commitCycleStart = undefined;
                flushedInst.commitCyclesEnd = undefined;
            }
        }
        
        // Before flushing, free all reservation stations for flushed ROB entries
        for (let i = 0; i < ROB_Size; i++) {
            // Skip the head (the RET instruction that's committing)
            if (i === ROB_Head) continue;
            
            const flushedROB = this.ReOrderBuffer[i];
            if (!flushedROB.busy) continue;
            
            const flushedInst = flushedROB.instruction;
            
            // Free reservation stations for this flushed instruction
            if (flushedInst && flushedInst !== inst) {
                flushedInst.issueCycle = undefined;
                flushedInst.execCycleStart = undefined;
                flushedInst.execCycleEnd = undefined;
                flushedInst.writeCycle = undefined;
                flushedInst.commitCycleStart = undefined;
                flushedInst.commitCyclesEnd = undefined;
                this.freeAllReservationStations(flushedInst);
            }
            
            // Clear register table entries that were waiting for flushed instructions
            if (flushedROB.destReg && flushedROB.destReg !== "") {
                const regNum = parseInt(flushedROB.destReg.substring(1));
                if (this.RegTable[regNum].ROB === i) {
                    this.RegTable[regNum].ROB = 0; // Clear the tag
                }
            }
        }
        
        // Now flush the ROB (clears all entries except head)
        FlushROB();
        
        // Clear CMDB queue since all flushed instructions are invalid
        this.CommonDataBus.length = 0;

        // Write return address to R1
        if (robEntry.destReg === "R1") {
            this.Registers[1].value = robEntry.value ?? 0; // Store PC+1 in R1
            this.RegTable[1].ROB = 0;
        }
        
        this.PC = robEntry.value ?? 0;
        
        // Reload instruction queue from new PC
        this.loadInstructionQueue();

    }
    // Normal register write for other instructions
    else if (robEntry.destReg && robEntry.destReg !== "") {
        const regNum = parseInt(robEntry.destReg.substring(1));
        this.Registers[regNum].value = robEntry.value ?? 0;
        this.RegTable[regNum].ROB = 0; // Clear tag
    }
    inst.commitCyclesEnd = CycleCounter.value;  // Mark as ended 
    this.IC.value++;  // Increment instruction count on commit 
    
// Ret









    // Special case: If this is a backward branch (loop), clear the instruction's cycle tracking
    // so it can be re-executed in the next iteration
    if (inst.opcode === "BEQ" && robEntry.BranchTaken && 
        robEntry.targetPC !== undefined && robEntry.targetPC <= robEntry.BranchPC) {
        // Clear all cycle tracking for the BEQ so it can loop
        inst.issueCycle = undefined;
        inst.execCycleStart = undefined;
        inst.execCycleEnd = undefined;
        inst.writeCycle = undefined;
        inst.commitCycleStart = undefined;
        inst.commitCyclesEnd = undefined;
    }
    
    // Special case: If RET is returning to an earlier PC (backward return in a loop),
    // clear the instruction's cycle tracking so it can be re-executed
    if (inst.opcode === "RET" && robEntry.value !== null && 
        robEntry.BranchPC !== undefined && robEntry.value <= robEntry.BranchPC) {
        // Clear all cycle tracking for the RET so it can loop
        inst.issueCycle = undefined;
        inst.execCycleStart = undefined;
        inst.execCycleEnd = undefined;
        inst.writeCycle = undefined;
        inst.commitCycleStart = undefined;
        inst.commitCyclesEnd = undefined;
    }
    
    // Special case: If CALL has a negative offset (calling backward), 
    // clear the instruction's cycle tracking for safety (recursive/loop scenarios)
    if (inst.opcode === "CALL" && robEntry.targetPC !== undefined && 
        robEntry.BranchPC !== undefined && robEntry.targetPC <= robEntry.BranchPC) {
        // Clear all cycle tracking for the CALL so it can loop
        inst.issueCycle = undefined;
        inst.execCycleStart = undefined;
        inst.execCycleEnd = undefined;
        inst.writeCycle = undefined;
        inst.commitCycleStart = undefined;
        inst.commitCyclesEnd = undefined;
    }
    
    // Remove from ROB using circular buffer dequeue
    DequeueROB();
}
step(): void {
    // One cycle - process all instructions in proper order
    // Order: Commit -> Write -> Execute -> Issue (reverse pipeline order)
    const allDone = () => {
        // Check if all instructions have been issued
        const allIssued = this.PC >= this.Instructions.length;
        
        // Check if ROB is empty (all committed) using circular buffer count
        const robEmpty = ROBCount === 0;
        
        // Done when all instructions issued AND ROB is empty
        return allIssued && robEmpty;
    };

    if (allDone())
    {


        this.EndProgram =CycleCounter.value;
        return;
    }

//here

    // 1. COMMIT - Try to commit the head of ROB (in-order)
    if (ROBCount > 0) {
        const headROB = this.ReOrderBuffer[ROB_Head];
        if (headROB && headROB.ready) {
            const headInst = headROB.instruction;
            if (headInst && headInst.execCycleEnd !== undefined && headInst.commitCyclesEnd === undefined) {
                this.commit();
            }
        }
    }
    
    // 2. WRITE - Broadcast results on CDB
    this.write();
    
    // 3. EXECUTE - All issued instructions that haven't finished execution
    for (let i = 0; i < this.Instructions.length; i++) {
        const inst = this.Instructions[i];
        if (!inst) continue;
        
        // Execute if issued in a previous cycle and not yet finished
        if (inst.issueCycle !== undefined && 
            inst.issueCycle < CycleCounter.value && 
            inst.execCycleEnd === undefined) {
            this.execute(inst);
            
            
        }
    }
    
    // 4. ISSUE - Issue the instruction from front of Actual_IQ (if not already issued)
    if (Actual_IQ.length > 0) {
        const currentInst = Actual_IQ[0];
        if (currentInst && currentInst.issueCycle === undefined) {
            this.issue(currentInst);
        }
    }
    
    CycleCounter.value++;
}

     // run the whole program
   run():void{     
    // Continue running until all instructions are committed
    // Run until: 
    // 1. All instructions have been issued (PC >= program length)
    // 2. ROB is empty (all issued instructions committed)
    
    const MAX_CYCLES = 10000; // Safety limit to prevent infinite loops
    let cycleCount = 0;
    
    const allDone = () => {
        // Check if all instructions have been issued
        const allIssued = this.PC >= this.Instructions.length;
        
        // Check if ROB is empty (all committed) using circular buffer count
        const robEmpty = ROBCount === 0;
        
        // Done when all instructions issued AND ROB is empty
        return allIssued && robEmpty;
    };
    
    // Keep stepping until all instructions are done or safety limit reached
    while (!allDone() && cycleCount < MAX_CYCLES) {
        this.step();
        cycleCount++;
    }
    

    this.EndProgram = cycleCount;
    // Warning if we hit the cycle limit
    if (cycleCount >= MAX_CYCLES) {
        console.warn(`Reached maximum cycle limit (${MAX_CYCLES}). Possible infinite loop.`);
    }
}




}
