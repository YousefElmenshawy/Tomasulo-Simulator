# Tomasulo Algorithm Simulator

A comprehensive, interactive web-based simulator for the **Tomasulo Algorithm**, implementing dynamic instruction scheduling with out-of-order execution. This project provides real-time visualization of CPU components, reservation stations, reorder buffer (ROB), and detailed instruction lifecycle tracking.

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

---

## 🎯 Features

### **Core Tomasulo Algorithm Implementation**
- **Dynamic Instruction Scheduling**: Out-of-order execution with in-order commit
- **Register Renaming**: Eliminates false dependencies (WAR, WAW hazards)
- **Reservation Stations**: Separate stations for different instruction types
- **Reorder Buffer (ROB)**: Maintains precise exception handling and in-order commit
- **Common Data Bus (CDB)**: Broadcasts results to waiting instructions
- **Branch Prediction**: Predict-not-taken policy with misprediction handling
- **Control Flow Instructions**: Full support for BEQ, CALL, and RET instructions

### **Supported Instructions**
| Instruction | Type | Execution Cycles | Description |
|------------|------|------------------|-------------|
| `ADD` | ALU | 2 | Addition |
| `SUB` | ALU | 2 | Subtraction |
| `MUL` | ALU | 12 | Multiplication |
| `NAND` | ALU | 1 | Bitwise NAND |
| `LOAD` | Memory | 6 | Load from memory |
| `STORE` | Memory | 3 | Store to memory |
| `BEQ` | Branch | 1 | Branch if equal |
| `CALL` | Control | 1 | Subroutine call |
| `RET` | Control | 1 | Return from subroutine |

### **Real-Time Visualization**
- **Instruction Status Table**: Shows Issue, Execute, Write, and Commit cycles
- **Reservation Stations**: Displays operand values, dependencies, and busy status
- **Reorder Buffer**: 8-entry ROB with instruction tracking
- **Register File**: 8 general-purpose registers (R0-R7)
- **Register Status Table**: Shows ROB dependencies for each register
- **Memory View**: Configurable memory locations and values
- **Performance Metrics**:
  - Total execution cycles
  - Instructions completed
  - Instructions Per Cycle (IPC)
  - Branch misprediction rate

### **Program Loading Modes**
1. **Instruction Builder**: Visual drag-and-drop interface for building programs
2. **Text Editor**: Directly write assembly code
3. **File Import**: Load programs from `.txt` or `.asm` files
4. **Custom Configuration**:
   - Starting address (PC)
   - Initial memory data (16-bit values)

### **Execution Controls**
- **Step**: Execute one cycle at a time
- **Run**: Execute entire program automatically
- **Reset**: Reset simulator state
- **Load Program**: Configure and load new programs

---

## 🏗️ Architecture

### **Technology Stack**
- **Frontend Framework**: Next.js 16 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Code Quality**: Biome (linting & formatting)

### **Project Structure**
```
Tomasulo-Simulator/
├── simulator/                    # Main Next.js application
│   ├── src/
│   │   ├── app/                  # Next.js app directory
│   │   │   ├── layout.tsx        # Root layout
│   │   │   ├── page.tsx          # Main simulator page
│   │   │   └── globals.css       # Global styles
│   │   ├── components/
│   │   │   └── Navbar.tsx        # Navigation and program loader
│   │   └── lib/                  # Core simulator logic
│   │       ├── CPU.ts            # CPU implementation (Tomasulo)
│   │       ├── Buffers.ts        # ROB, RS, Registers, Memory
│   │       └── Instructions.ts   # Instruction decoder
│   ├── public/                   # Static assets
│   ├── package.json              # Dependencies
│   ├── tsconfig.json             # TypeScript config
│   ├── tailwind.config.ts        # Tailwind config
│   └── next.config.ts            # Next.js config
├── LICENSE                       # License file
└── README.md                     # This file
```

### **Core Components**

#### **CPU (`CPU.ts`)**
- **issue()**: Allocates reservation stations and ROB entries
- **execute()**: Executes instructions when operands are ready
- **write()**: Broadcasts results on the Common Data Bus
- **commit()**: Commits instructions in-order from ROB head
- **step()**: Executes one clock cycle (Commit → Write → Execute → Issue)
- **run()**: Executes until all instructions complete

#### **Buffers (`Buffers.ts`)**
- **Reservation Stations**: ADD(4), MULT(1), NAND(2), LOAD(2), STORE(1), BEQ(2), CALL_RET(1)
- **Reorder Buffer**: 80,000-entry circular buffer for scalability
- **Register File**: 8 registers (R0-R7) with status tracking
- **Memory**: 64KB word-addressable memory (Int32Array)

#### **Instructions (`Instructions.ts`)**
- Decodes assembly strings into structured instruction objects
- Supports all instruction formats (ALU, Load/Store, Branch, Control)

---

## 🚀 Getting Started

### **Prerequisites**
- **Node.js**: v20 or higher
- **npm** or **yarn** or **pnpm** or **bun**

### **Installation**

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YousefElmenshawy/Tomasulo-Simulator.git
   cd Tomasulo-Simulator/simulator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📖 Usage

### **Example Program**
```assembly
LOAD R2, 0(R0)          # Load value from memory[0] into R2
LOAD R3, 34(R0)         # Load value from memory[34] into R3
CALL 5                  # Call subroutine at PC=5 (R1 = return address)
STORE R4, 45(R0)        # Store R4 to memory[45] after return
BEQ R0, R0, 4           # Branch to PC=9 (infinite loop or end)
ADD R4, R2, R3          # Subroutine: Add R2 + R3 → R4
RET                     # Return to caller (PC from R1)
```

### **Assembly Syntax**

#### **ALU Instructions**
```assembly
ADD  rDest, rSrc1, rSrc2    # rDest = rSrc1 + rSrc2
SUB  rDest, rSrc1, rSrc2    # rDest = rSrc1 - rSrc2
MUL  rDest, rSrc1, rSrc2    # rDest = rSrc1 * rSrc2
NAND rDest, rSrc1, rSrc2    # rDest = ~(rSrc1 & rSrc2)
```

#### **Memory Instructions**
```assembly
LOAD  rDest, offset(rBase)  # rDest = Memory[rBase + offset]
STORE rSrc, offset(rBase)   # Memory[rBase + offset] = rSrc
```

#### **Control Flow Instructions**
```assembly
BEQ   rA, rB, offset        # if (rA == rB) PC = PC + offset + 1
CALL  offset                # R1 = PC + 1; PC = offset
RET                         # PC = R1 (return address)
```

### **Loading a Program**

1. Click the **Load Program** button in the navbar
2. Choose one of three modes:
   - **Instruction Builder**: Build visually with dropdowns
   - **Text Editor**: Write assembly code directly
   - **Import File**: Upload a `.txt` or `.asm` file
3. Configure:
   - **Starting Address**: Initial PC value (default: 0)
   - **Data Memory**: Add address-value pairs for initial memory state
4. Click **Load Program** to start

### **Execution Modes**

- **Step**: Click the blue **Step** button to execute one cycle
- **Run**: Click the green **Play** button to execute all cycles
- **Reset**: Click the orange **Reset** button to restart with the same program

---

## 🎓 Educational Use

This simulator is ideal for:
- **Computer Architecture courses**: Visualize dynamic scheduling
- **CPU design understanding**: See how Tomasulo eliminates hazards
- **Performance analysis**: Study IPC and branch prediction impact
- **Instruction-level parallelism**: Observe out-of-order execution

---

## 📊 Performance Metrics

The simulator tracks:
- **Total Cycles**: Number of clock cycles executed
- **Instructions Completed**: Count of committed instructions
- **IPC (Instructions Per Cycle)**: Average parallelism achieved
- **Branch Misprediction Rate**: Percentage of incorrectly predicted branches

---

## 🛠️ Development

### **Build for Production**
```bash
npm run build
npm run start
```

### **Linting & Formatting**
```bash
npm run lint      # Check code quality
npm run format    # Format code with Biome
```

### **Technology Choices**
- **Next.js 16**: Latest features with React Server Components
- **TypeScript**: Type safety for complex algorithm logic
- **Tailwind CSS 4**: Modern utility-first styling
- **Biome**: Fast, unified toolchain for linting and formatting

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Yousef Elmenshawy**
- GitHub: [@YousefElmenshawy](https://github.com/YousefElmenshawy)

---

## 🙏 Acknowledgments

- Inspired by the original **Tomasulo Algorithm** (Robert Tomasulo, 1967)
- Computer Architecture courses and textbooks
- Next.js and React communities

---

## 📚 References

- **Tomasulo, R. M.** (1967). "An Efficient Algorithm for Exploiting Multiple Arithmetic Units". *IBM Journal of Research and Development*, 11(1), 25-33.
- **Hennessy, J. L., & Patterson, D. A.** (2017). *Computer Architecture: A Quantitative Approach* (6th ed.). Morgan Kaufmann.

---

## 🐛 Known Issues & Future Improvements

### **Current Limitations**
- ROB size is fixed at 8 entries for display (expandable to 80,000 internally)
- Memory view shows only 5 configurable addresses
- No support for floating-point operations

### **Future Enhancements**
- [ ] Configurable execution cycles per instruction
- [ ] Configurable reservation station counts
- [ ] Memory address range visualization
- [ ] Export execution trace to CSV/JSON
- [ ] Dark/Light theme toggle
- [ ] Step-by-step tutorial mode
- [ ] Visual data flow highlighting
- [ ] Support for more instruction types (DIV, floating-point)

---

## 📞 Support

For questions, issues, or suggestions:
- Open an issue on [GitHub Issues](https://github.com/YousefElmenshawy/Tomasulo-Simulator/issues)
- Contact the author via GitHub

---

<div align="center">
  <strong>Made with ❤️ for Computer Architecture Education</strong>
</div>
