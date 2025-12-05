import {RF,RegistersTable,reservationStations,IQ,InstructionCount,CycleCount,MemoryViewer,ROB,ROBEntry,allocateROB}from "./Buffers"
import { Instruction,decodeInst } from "./Instructions";




    
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
private NumCycles = CycleCount
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

private issue(): void {
    const inst = this.Instructions[this.PC / 4];
    if (!inst) return;

    let rs: any; // turns off typechecking here because RS have different objects when it comes to Load/store 

    //  Find a  free reservation station
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

    //  Allocate ROB entry
    const robIndex = allocateROB(inst);
    if (robIndex === -1) return; // Stall if ROB is full

    //  Fill reservation station entry
    rs.busy = true;
    rs.op = inst.opcode;
    rs.qi = robIndex;

    // in case of a LOAD instruction
    if (inst.opcode === "LOAD" && inst.rB !== undefined && inst.rA !== undefined && inst.offset !== undefined) {
        const tag = this.RegTable[inst.rB].ROB;
        if (tag === 0) {
            rs.addr = this.Registers[inst.rB].value + inst.offset;
            rs.qj = null;
        } else if (this.ReOrderBuffer[tag].ready) {
            rs.addr = (this.ReOrderBuffer[tag].value ?? 0) + inst.offset; // ?? 0: returns 0 if the value is null otherwise returns the value
            rs.qj = null;
        } else {
            rs.addr = null;
            rs.qj = tag;
        }
        this.RegTable[inst.rA].ROB = robIndex;
        this.ReOrderBuffer[robIndex].destReg = `R${inst.rA}`;
    }
    // in case of  STORE instruction
    else if (inst.opcode === "STORE" && inst.rA !== undefined && inst.rB !== undefined && inst.offset !== undefined) {
        const tagB = this.RegTable[inst.rB].ROB;
        if (tagB === 0) {
            rs.addr = this.Registers[inst.rB].value + inst.offset;
            rs.qk = null;
        } else if (this.ReOrderBuffer[tagB].ready) {
            rs.addr = (this.ReOrderBuffer[tagB].value ?? 0) + inst.offset; //calculate the address
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
    // in case of  ALU / BEQ  Instructions
    else {
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


    this.PC += 4;
}

private execute(): void
{
// To be done


}
private commit (): void{


// To be done

}
private write() : void{



// To be done

}

step(): void{      // one cycle at a time

this.issue();
this.execute();
this.write();
this.commit();

this.NumCycles++;

}
run():void{      // run the whole program

while (this.Instructions.length>0){

this.step();



}


}










}
