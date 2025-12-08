import {RF,RegistersTable,reservationStations,IQ,InstructionCount,MemoryViewer,ROB,ROBEntry,allocateROB,CycleCounter, CMDB, enqueueCDB, dequeueCDB}from "./Buffers"
import { Instruction,decodeInst } from "./Instructions";


    
export class CPU
{
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

constructor(InstAddress:number ,Memdata: Array<[number,number]>, program: Array<string> ){ // Inputs DataMemory and Starting Address

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


}

private issue(inst: Instruction): void {
 
   
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

 // Base address: rB
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
        
        // Store ROB Branch entries
        this.ReOrderBuffer[robIndex].BranchPC = this.PC;
        this.ReOrderBuffer[robIndex].targetPC = this.PC + rs.addr;
        this.ReOrderBuffer[robIndex].BranchTaken = false;
        // BEQ doesn't write to registers
        this.ReOrderBuffer[robIndex].destReg = "";
    }






    
else if (inst.opcode === "CALL") {
        // CALL has no source operands, only immediate (label offset)
        rs.addr = inst.offset ?? 0;  // label as 7-bit signed immediate
        
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
        
        // RET doesn't write to registers
        this.ReOrderBuffer[robIndex].destReg = "";
    }
    
   
    // 7. Mark issue cycle
    inst.issueCycle = CycleCounter.value;
    this.PC = this.PC + 1 ;
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


    const InROB = (robTag: number | null): boolean => { //helper func to ease next part
    if (robTag === null || robTag === undefined) return false;
    
    const robEntryN = this.ReOrderBuffer[robTag];
    return robEntryN && robEntryN.ready === true;  //to differentiate between robEntry
}


    const operandsReady = (rs.qj === null || rs.qj === undefined || InROB(rs.qj)) && 
                      (rs.qk === null || rs.qk === undefined || InROB(rs.qk));

if (!operandsReady) return; // Wait for operands

// If we reach here, update values from ROB if needed
if (rs.qj !== null && rs.qj !== undefined && InROB(rs.qj)) {
    rs.vj = this.ReOrderBuffer[rs.qj].value ?? 0;
    rs.qj = null;
}

if (rs.qk !== null && rs.qk !== undefined && InROB(rs.qk)) {
    rs.vk = this.ReOrderBuffer[rs.qk].value ?? 0;
    rs.qk = null;
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
            const targetPC = (!equal) ? (branchPC + 1) :(branchPC+ rs.addr+1);
            
            // Store branch result in ROB
            result = equal ? 1 : 0;
            robEntry.BranchTaken = equal;
            robEntry.targetPC = targetPC;
            inst.execCycleEnd = CycleCounter.value;
            break;
            
        case "CALL":
            // CALL: Store return address (PC+1), compute call target
            result = this.PC + 1; // Return address to store in R1
            
            // Calculate call target address from offset
            const callTarget = this.PC + rs.addr; // PC + label offset
            robEntry.targetPC = callTarget; // Store target for commit
            inst.execCycleEnd = CycleCounter.value;
            break;
            
        case "RET":
            // Return to address in register
            result = rs.vj ?? 0;
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
    // Get ROB head (first element in our array)
    
    const robEntry = this.ReOrderBuffer[0];
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
        const taken = robEntry.BranchTaken;
        if (taken) {
            // in case of misprediction
            // Update PC to correct target
            this.PC = robEntry.targetPC;
            
            //  Flush all speculative instructions from ROB
            const FlushInstructions = this.ReOrderBuffer.slice(1); // after the Branch
            
            for (let i = 0; i < FlushInstructions.length; i++) {
                const flushedROB = FlushInstructions[i];
                const flushedInst = flushedROB.instruction;
                
                // Clear the flushed instruction's cycle tracking
                if (flushedInst) {
                    flushedInst.issueCycle = undefined;
                    flushedInst.execCycleStart = undefined;
                    flushedInst.execCycleEnd = undefined;
                    flushedInst.commitCycleStart = undefined;
                    flushedInst.commitCyclesEnd = undefined;
                }
                
                const robIndex = this.ReOrderBuffer.indexOf(flushedROB); // get the ROB index
                
                // Free reservation stations for flushed instructions based on their opcode
                if (flushedInst) {
                    switch (flushedInst.opcode) {
                        case "ADD":
                        case "SUB":
                            this.AddStations.forEach(rs => {
                                if (rs.qi === robIndex) {
                                    rs.busy = false;
                                    rs.vj = null;
                                    rs.vk = null;
                                    rs.qj = null;
                                    rs.qk = null;
                                    rs.qi = null;
                                }
                            });
                            break;
                        case "MUL":
                            this.MultStations.forEach(rs => {
                                if (rs.qi === robIndex) {
                                    rs.busy = false;
                                    rs.vj = null;
                                    rs.vk = null;
                                    rs.qj = null;
                                    rs.qk = null;
                                    rs.qi = null;
                                }
                            });
                            break;
                        case "NAND":
                            this.NANDStations.forEach(rs => {
                                if (rs.qi === robIndex) {
                                    rs.busy = false;
                                    rs.vj = null;
                                    rs.vk = null;
                                    rs.qj = null;
                                    rs.qk = null;
                                    rs.qi = null;
                                }
                            });
                            break;
                        case "LOAD":
                            this.LoadStations.forEach(rs => {
                                if (rs.qi === robIndex) {
                                    rs.busy = false;
                                    rs.vj = null;
                                    rs.qj = null;
                                    rs.addr = null;
                                    rs.qi = null;
                                }
                            });
                            break;
                        case "STORE":
                            this.StoreStations.forEach(rs => {
                                if (rs.qi === robIndex) {
                                    rs.busy = false;
                                    rs.vj = null;
                                    rs.vk = null;
                                    rs.qj = null;
                                    rs.qk = null;
                                    rs.qi = null;
                                }
                            });
                            break;
                        case "BEQ":
                            this.BeqStations.forEach(rs => {
                                if (rs.qi === robIndex) {
                                    rs.busy = false;
                                    rs.vj = null;
                                    rs.vk = null;
                                    rs.qj = null;
                                    rs.qk = null;
                                    rs.qi = null;
                                }
                            });
                            break;
                        case "CALL":
                        case "RET":
                            this.CALL_RET_Stations.forEach(rs => {
                                if (rs.qi === robIndex) {
                                    rs.busy = false;
                                    rs.qi = null;
                                }
                            });
                            break;
                    }
                }
                
                // Clear register table entries that were waiting for flushed instructions
                if (flushedROB.destReg && flushedROB.destReg !== "") {
                    const regNum = parseInt(flushedROB.destReg.substring(1));
                    if (this.RegTable[regNum].ROB === robIndex) {
                        this.RegTable[regNum].ROB = 0; // Clear the tag
                    }
                }
            }
            this.ReOrderBuffer.splice(1); //remove all flushed Entries of ROB

            // Clear CMDB queue since all flushed instructions
            this.CommonDataBus.length = 0;

        }
        // If not taken, PC already correct (incremented normally)
    }
    // Handle STORE( write to memory)
    else if (inst.opcode === "STORE") {
        if(cyclesElapsed===3){
        const addr = robEntry.addr ?? 0;
        const value = robEntry.value ?? 0;
        this.Memory[addr] = value;
        
        }
        else
        {
            return;
        }
    }
    // Handle CALL(update PC to target)
    else if (inst.opcode === "CALL") {
        // Write return address to R1
        if (robEntry.destReg === "R1") {
            this.Registers[1].value = robEntry.value ?? 0; // Store PC+1 in R1
            this.RegTable[1].ROB = 0;
        }
        // Update PC to call target (computed in execute)
        this.PC = robEntry.targetPC ?? 0;
    }
    // Handle RET: update PC to return address
    else if (inst.opcode === "RET") {
        this.PC = robEntry.value ?? 0;
    }
    // Normal register write for other instructions
    else if (robEntry.destReg && robEntry.destReg !== "") {
        const regNum = parseInt(robEntry.destReg.substring(1));
        this.Registers[regNum].value = robEntry.value ?? 0;
        this.RegTable[regNum].ROB = 0; // Clear tag
    }
    inst.commitCyclesEnd = CycleCounter.value;  // Mark as ended 
    // Remove from ROB
    this.ReOrderBuffer.shift(); //note: shift() removes and return the first element in the array
   
     //Update all ROB indices in reservation stations and register table
    //After shift, all indices decrease by 1
    
    // Update reservation stations
    this.AddStations.forEach(rs => {
        if (rs.qi !== null && rs.qi > 0) rs.qi--;
        if (rs.qj !== null && rs.qj > 0) rs.qj--;
        if (rs.qk !== null && rs.qk > 0) rs.qk--;
    });
    
    this.MultStations.forEach(rs => {
        if (rs.qi !== null && rs.qi > 0) rs.qi--;
        if (rs.qj !== null && rs.qj > 0) rs.qj--;
        if (rs.qk !== null && rs.qk > 0) rs.qk--;
    });
    
    this.NANDStations.forEach(rs => {
        if (rs.qi !== null && rs.qi > 0) rs.qi--;
        if (rs.qj !== null && rs.qj > 0) rs.qj--;
        if (rs.qk !== null && rs.qk > 0) rs.qk--;
    });
    
    this.LoadStations.forEach(rs => {
        if (rs.qi !== null && rs.qi > 0) rs.qi--;
        if (rs.qj !== null && rs.qj > 0) rs.qj--;
    });
    
    this.StoreStations.forEach(rs => {
        if (rs.qi !== null && rs.qi > 0) rs.qi--;
        if (rs.qj !== null && rs.qj > 0) rs.qj--;
        if (rs.qk !== null && rs.qk > 0) rs.qk--;
    });
    
    this.BeqStations.forEach(rs => {
        if (rs.qi !== null && rs.qi > 0) rs.qi--;
        if (rs.qj !== null && rs.qj > 0) rs.qj--;
        if (rs.qk !== null && rs.qk > 0) rs.qk--;
    });
    
    this.CALL_RET_Stations.forEach(rs => {
        if (rs.qi !== null && rs.qi > 0) rs.qi--;
        
    });
    
    // Update register table
    this.RegTable.forEach(reg => {
        if (reg.ROB > 0) reg.ROB--;
    });

    // Update CMDB queue - decrement all ROB indices
    this.CommonDataBus.forEach(entry => {
        if (entry.robIndex > 0) entry.robIndex--;
    });

    // Remove the committed instruction from the Instructions array
    //removed for now bc uses ui issues

    /*
    const instIndex = this.Instructions.indexOf(inst);
    if (instIndex !== -1) {
        this.Instructions.splice(instIndex, 1);
    }

    */
    
}

step(): void {
    // One cycle - process all instructions in proper order
    // Order: Commit -> Write -> Execute -> Issue (reverse pipeline order)
    
    // 1. COMMIT - Try to commit the head of ROB (in-order)
    const headROB = this.ReOrderBuffer[0];
    if (headROB && headROB.ready) {
        const headInst = headROB.instruction;
        if (headInst && headInst.execCycleEnd !== undefined && headInst.commitCyclesEnd === undefined) {
            this.commit();
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
    
    // 4. ISSUE - Issue the instruction at PC (if not already issued)
    const currentInst = this.Instructions[Math.floor(this.PC)];
    if (currentInst && currentInst.issueCycle === undefined) {
        this.issue(currentInst);
    }
    
    CycleCounter.value++;
}


run():void{      // run the whole program


    
while (this.Instructions.length>0){

this.step();
CycleCounter.value++;


}
}
}


