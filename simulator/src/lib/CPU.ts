import {RF,RegistersTable,reservationStations,IQ,InstructionCount,MemoryViewer,ROB,ROBEntry,allocateROB}from "./Buffers"
import { Instruction,decodeInst } from "./Instructions";
// Import CycleCount module to modify it directly
import * as Buffers from "./Buffers";
import { buffer } from "stream/consumers";




    
export class CPU
{
private  PC:number = 0;
private Memory:Int32Array = MemoryViewer;   //Note to Kareem : that this is a reference not a copy so Buffers in Buffers.ts changes when CPU Buffers change.
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
// Removed: private NumCycles = CycleCount  This was copying the value
private ReOrderBuffer = ROB;

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

    // Start tracking issue time if not started
    if (inst.execCycleStart === undefined) {
        inst.execCycleStart = Buffers.CycleCounter.value;
        
        // Find a free reservation station
        let rs: any;
        switch (inst.opcode) {
            case "ADD":
            case "SUB":
                rs = this.AddStations.find(s => !s.busy);
                break;
            case "NAND":
                rs = this.NANDStations.find(s => !s.busy);
                break;
            case "MUL":
                rs = this.MultStations.find(s => !s.busy);
                break;
            case "LOAD":
                rs = this.LoadStations.find(s => !s.busy);
                break;
            case "STORE":
                rs = this.StoreStations.find(s => !s.busy);
                break;
            case "BEQ":
                rs = this.BeqStations.find(s => !s.busy);
                break;
            case "CALL":
            case "RET":
                rs = this.CALL_RET_Stations.find(s => !s.busy);
                break;
            default:
                console.error("Unknown opcode:", inst.opcode);
                return;
        }

        if (!rs) return; // Stall if no free RS

        // Allocate ROB entry
        const robIndex = allocateROB(inst);
        if (robIndex === -1) return; // Stall if ROB is full

        // Mark reservation station as busy and allocate ROB
        rs.busy = true;
        rs.op = inst.opcode;
        rs.qi = robIndex;
        
        // For Load/store: return early to compute address next cycle
        // For other instructions: continue to fill operands immediately
        const needsAddressComputation = inst.opcode === "LOAD" || inst.opcode === "STORE";
        if (needsAddressComputation) {
            return; // Exit early, will continue next cycle
        }
        
        
    } else {
        // This is a continuation from a previous cycle (LOAD/STORE address computation)
        const cyclesPassed = Buffers.CycleCounter.value - inst.execCycleStart;
        
        if (cyclesPassed < 1) {
            return; // Still computing address, stall
        }

        // Find the SAME reservation station that was marked busy
        const robIndex = this.ReOrderBuffer.findIndex(rob => rob.instruction === inst);
        if (robIndex === -1) {
            console.error("ROB entry not found for instruction");
            return;
        }

        // Find the RS that has this ROB index
        let rs: any;
        switch (inst.opcode) {
            case "LOAD":
                rs = this.LoadStations.find(s => s.busy && s.qi === robIndex);
                break;
            case "STORE":
                rs = this.StoreStations.find(s => s.busy && s.qi === robIndex);
                break;
        }

        if (!rs) {
            console.error("Reservation station not found for instruction");
            return;
        }

        // Mark the issue cycle (address computation is done)
        inst.issueCycle = Buffers.CycleCounter.value;

        // LOAD instruction
        if (inst.opcode === "LOAD" && inst.rB !== undefined && inst.rA !== undefined && inst.offset !== undefined) {
            const tag = this.RegTable[inst.rB].ROB;
            if (tag === 0) {
                rs.addr = this.Registers[inst.rB].value + inst.offset;
                rs.qj = null;
            } else if (this.ReOrderBuffer[tag].ready) {
                rs.addr = (this.ReOrderBuffer[tag].value ?? 0) + inst.offset;
                rs.qj = null;
            } else {
                rs.addr = null;
                rs.qj = tag;
            }
            this.RegTable[inst.rA].ROB = robIndex;
            this.ReOrderBuffer[robIndex].destReg = `R${inst.rA}`;
        }
        // STORE instruction
        else if (inst.opcode === "STORE" && inst.rA !== undefined && inst.rB !== undefined && inst.offset !== undefined) {
            const tagB = this.RegTable[inst.rB].ROB;
            if (tagB === 0) {
                rs.addr = this.Registers[inst.rB].value + inst.offset;
                rs.qk = null;
            } else if (this.ReOrderBuffer[tagB].ready) {
                rs.addr = (this.ReOrderBuffer[tagB].value ?? 0) + inst.offset;
                rs.qk = null;
            } else {
                rs.addr = null;
                rs.qk = tagB;
            }

            const tagA = this.RegTable[inst.rA].ROB;
            if (tagA === 0) {
                rs.vj = this.Registers[inst.rA].value;
                rs.qj = null;
            } else if (this.ReOrderBuffer[tagA].ready) {
                rs.vj = this.ReOrderBuffer[tagA].value ?? 0;
                rs.qj = null;
            } else {
                rs.vj = null;
                rs.qj = tagA;
            }
        }
        
        return; // Done with LOAD/STORE issue
    }

   
    const robIndex = this.ReOrderBuffer.findIndex(rob => rob.instruction === inst);
    if (robIndex === -1) {
        console.error("ROB entry not found for instruction");
        return;
    }

    let rs: any;
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
        case "BEQ":
            rs = this.BeqStations.find(s => s.busy && s.qi === robIndex);
            break;
        case "CALL":
        case "RET":
            rs = this.CALL_RET_Stations.find(s => s.busy && s.qi === robIndex);
            break;
    }

    if (!rs) {
        console.error("Reservation station not found for instruction");
        return;
    }

    // Mark the issue cycle immediately for ALU instructions
    inst.issueCycle = Buffers.CycleCounter.value;

    // Fill operands for ALU / BEQ Instructions
    if (inst.rA !== undefined) {
        const tag1 = this.RegTable[inst.rA].ROB;
        if (tag1 === 0) {
            rs.vj = this.Registers[inst.rA].value;
            rs.qj = null;
        } else if (this.ReOrderBuffer[tag1].ready) {
            rs.vj = this.ReOrderBuffer[tag1].value ?? 0;
            rs.qj = null;
        } else {
            rs.vj = null;
            rs.qj = tag1;
        }
    }

    if (inst.rB !== undefined) {
        const tag2 = this.RegTable[inst.rB].ROB;
        if (tag2 === 0) {
            rs.vk = this.Registers[inst.rB].value;
            rs.qk = null;
        } else if (this.ReOrderBuffer[tag2].ready) {
            rs.vk = this.ReOrderBuffer[tag2].value ?? 0;
            rs.qk = null;
        } else {
            rs.vk = null;
            rs.qk = tag2;
        }
    } else if (inst.offset !== undefined) {
        rs.vk = inst.offset;
        rs.qk = null;
    }

    if (inst.rC !== undefined && inst.opcode !== "BEQ") {
        this.RegTable[inst.rC].ROB = robIndex;
        this.ReOrderBuffer[robIndex].destReg = `R${inst.rC}`;
    }
}

private execute(): void
{
// To be done


}

private write() : void{



// To be done

}

private commit (): void{


// To be done
}

step(): void {
    // Calculate how many instructions we should process
    // Include all instructions that have started issuing (even if not fully issued yet)
    const maxInstructionIndex = Math.min(Math.floor(this.PC / 4) + 1, this.Instructions.length);
    
    // Iterate through all instructions up to (and including) the one we're trying to issue
    for (let i = 0; i < maxInstructionIndex; i++) {
        const inst = this.Instructions[i];
        if (!inst) continue;
        
        // Process based on instruction state
        
        // 4. Try to commit (written but not committed)
        if (inst.writeCycle !== undefined && inst.writeCycle < Buffers.CycleCounter.value) {
            this.commit();
        }
        
        // 3. Try to write (executed but not written)
        else if (inst.execCycle !== undefined && inst.execCycle < Buffers.CycleCounter.value && inst.writeCycle === undefined) {
            this.write();
        }
        
        // 2. Try to execute (issued but not executed)
        else if (inst.issueCycle !== undefined && inst.issueCycle < Buffers.CycleCounter.value && inst.execCycle === undefined) {
            this.execute();
        }
        
        // 1. Try to issue (either not started OR still computing address)
        else if (i === Math.floor(this.PC / 4)) {
             // This is the instruction at PC and it hasn't been issued yet
            // issue() will handle setting execCycleStart and everything else
            this.issue(inst);
        }
    }
    
    // Only increment PC if current instruction was successfully issued
    const currentInst = this.Instructions[Math.floor(this.PC / 4)];
    if (currentInst && currentInst.issueCycle !== undefined) {
        this.PC += 4;
    }
    
    Buffers.CycleCounter.value++;
}
run():void{      // run the whole program

while (this.Instructions.length>0){

this.step();



}


}










}
