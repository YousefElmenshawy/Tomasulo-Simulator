const Instructions = {
Arithmetic_and_Logic:{
    
    ADD:{opcode:0b000 , func:0b0000}, // opcode [15:13], rd [12:10], rs1 [9:7], func [6:3], rs2 [2:0]
    SUB:{opcode:0b000, func:0b0001  }, // opcode [15:13], rd [12:10], rs1 [9:7], func [6:3], rs2 [2:0]
    NAND:{opcode:0b001, func:0b0000}, // opcode [15:13], rd [12:10], rs1 [9:7], func [6:3], rs2 [2:0]
    MUL:{opcode:0b010, func:0b0000} // opcode [15:13], rd [12:10], rs1 [9:7], func [6:3], rs2 [2:0]

},
CallAndReturn: {
    CALL:{opcode:0b011},  //opcode [15:13], func [12:7], imm[6:0] (Label) // x1 = PC +1 , jump to imm
    RET:{opcode:0b100}   //opcode [15:13], func [12:0]  // Jump to address in x1 

},
LoadAndStore: {

    LOAD:{opcode:0b101}, //opcode [15:13], rd [12:10], rs1 [9:7], imm[6:0]
    STORE:{opcode:0b110} //opcode [15:13], rs1 (data) [12:10], rs2 [9:7] (address), imm[6:0] (offset)

},
Branch:{

    BEQ:{opcode:0b111}//opcode [15:13], rs1  [12:10], rs2 [9:7] , imm[6:0] (Jump offset)


}







}