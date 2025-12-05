
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
      
        case "ADD":
        case "SUB":
        case "NAND":
        case "MUL": {
            
            const [rA, rB, rC] = rest.split(",").map(s => parseInt(s.replace("R", "").trim()));
            return { opcode, rA, rB, rC };
        }

       
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

      
        case "BEQ": {
            
            const [rA, rB, offset] = rest.split(",").map(s => s.trim());
            return {
                opcode,
                rA: parseInt(rA.replace("R", "")),
                rB: parseInt(rB.replace("R", "")),
                offset: parseInt(offset)
            };
        }

        
        case "CALL": {
            // assume Label is an offset (atleast for now)
            const imm = parseInt(rest.trim());
            return { opcode, offset: imm };
        }

     
        case "RET":
            return { opcode };

        default:
            throw new Error(`Unknown opcode: ${opcode}`);
    }
    
    }
