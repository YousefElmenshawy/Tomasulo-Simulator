import {RF,RegistersTable,reservationStations,IQ,InstructionCount,CycleCount,MemoryViewer}from "./Buffers"
import { Instruction,decodeInst } from "./Instructions";




    
export class CPU
{
private  PC:number = 0;
private Memory:Int32Array = MemoryViewer;
private Registers = RF;
private Stations = reservationStations; 
private Instructions = IQ;
private NumCycles = CycleCount

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
// To be done

}

private execute(): void
{
// To be done


}
private commit (): void{




}
private write() : void{





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
