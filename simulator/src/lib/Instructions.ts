export const InstructionFormats = {
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

export interface Instruction {
    opcode: string;
    rA?: number;
    rB?: number;
    rC?: number;
    offset?: number;
}

export function decodeInst(line:string):Instruction  
{

    // Remove any whitespaces before and after the instruction itself
    line = line.trim();
    const [opcode, rest] = line.split(/\s+(.+)/); // splits at first whitespace

    switch (opcode.toUpperCase()) {
        //  Arithmetic and Logic 
        case "ADD":
        case "SUB":
        case "NAND":
        case "MUL": {
            
            const [rA, rB, rC] = rest.split(",").map(s => parseInt(s.replace("R", "").trim()));
            return { opcode, rA, rB, rC };
        }

        // Load 
        case "LOAD": {
            const match = rest.match(/R(\d+),\s*(-?\d+)\(R(\d+)\)/);
            if (!match) throw new Error(`Invalid LOAD format: ${line}`);
            return {
                opcode,
                rA: parseInt(match[1]),
                offset: parseInt(match[2]),
                rB: parseInt(match[3])
            };
        }

        // Store 
        case "STORE": {
           
            const match = rest.match(/R(\d+),\s*(-?\d+)\(R(\d+)\)/);
            if (!match) throw new Error(`Invalid STORE format: ${line}`);
            return {
                opcode,
                rA: parseInt(match[1]), // value to store
                offset: parseInt(match[2]),
                rB: parseInt(match[3])  // base address
            };
        }

        // Branch 
        case "BEQ": {
            
            const [rA, rB, offset] = rest.split(",").map(s => s.trim());
            return {
                opcode,
                rA: parseInt(rA.replace("R", "")),
                rB: parseInt(rB.replace("R", "")),
                offset: parseInt(offset)
            };
        }

        // Call 
        case "CALL": {
            // assume Label is an offset (atleast for now)
            const imm = parseInt(rest.trim());
            return { opcode, offset: imm };
        }

        //  Return 
        case "RET":
            return { opcode };

        default:
            throw new Error(`Unknown opcode: ${opcode}`);
    }
    
    }
