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
- **Circular Buffer ROB**: Efficient 8-entry Reorder Buffer with O(1) enqueue/dequeue
- **Instruction Queue**: Proper FIFO queue with automatic refill on control flow changes
- **Reservation Stations**: Separate stations for ADD(4), MULT(1), NAND(2), LOAD(2), STORE(1), BEQ(2), CALL_RET(1)
- **Common Data Bus (CDB)**: Queue-based result broadcasting to waiting instructions
- **Branch Prediction**: Predict-not-taken policy with misprediction recovery and ROB flushing
- **Control Flow Instructions**: Full support for BEQ, CALL, and RET with proper speculative execution handling

### **Supported Instructions**
| Instruction | Type | Execution Cycles | Commit Cycles | Description |
|------------|------|------------------|---------------|-------------|
| `ADD` | ALU | 2 | 1 | Addition |
| `SUB` | ALU | 2 | 1 | Subtraction |
| `MUL` | ALU | 12 | 1 | Multiplication |
| `NAND` | ALU | 1 | 1 | Bitwise NAND |
| `LOAD` | Memory | 6 | 1 | Load from memory |
| `STORE` | Memory | 2 | 4 | Store to memory |
| `BEQ` | Branch | 1 | 1 | Branch if equal |
| `CALL` | Control | 1 | 1 | Subroutine call |
| `RET` | Control | 1 | 1 | Return from subroutine |

### **Real-Time Visualization**
- **Instruction Status Table**: Shows Issue, Execute, Write, and Commit cycles for each instruction
- **Reservation Stations**: Displays operand values (vj, vk), dependencies (qj, qk), ROB indices (qi), and addr fields
- **Reorder Buffer**: 8-entry circular buffer with instruction tracking, destination registers, and ready status
- **Register File**: 8 general-purpose registers (R0-R7) with live value updates
- **Register Status Table**: Shows ROB dependencies for each register
- **Memory View**: Configurable initial memory state with address-value pairs
- **Performance Metrics**:
  - Total execution cycles
  - Instructions completed (with proper counter)
  - Instructions Per Cycle (IPC)
  - Branch misprediction rate (percentage)

### **Program Loading Modes**
1. **Instruction Builder**: Visual interface for building programs (in development)
2. **Text Editor**: Directly write assembly code
3. **File Import**: Load programs from `.txt` or `.asm` files
4. **Custom Configuration**:
   - Starting address (initial PC value)
   - Initial memory data (address-value pairs)

### **Execution Controls**
- **Step**: Execute one cycle at a time (auto-disables when program completes)
- **Run**: Execute entire program automatically (auto-disables when program completes)
- **Reset**: Restart simulator with current program
- **Load Program**: Configure and load new programs
- **Visual Feedback**: Buttons show disabled state with "Program Completed" tooltip

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
- **issue()**: Allocates reservation stations and ROB entries, dequeues from instruction queue
- **execute()**: Executes instructions when operands are ready, handles all 9 instruction types
- **write()**: Broadcasts results on the Common Data Bus (CDB) using queue
- **commit()**: Commits instructions in-order from ROB head (circular buffer), handles control flow flushing
- **step()**: Executes one clock cycle (Commit → Write → Execute → Issue)
- **run()**: Executes until all instructions complete or safety limit reached
- **loadInstructionQueue()**: Refills instruction queue from current PC after control flow changes
- **freeAllReservationStations()**: Frees reservation stations for flushed instructions

#### **Buffers (`Buffers.ts`)**
- **Circular ROB**: 8-entry fixed-size buffer with `ROB_Head`, `ROB_Tail`, `ROBCount` tracking
- **allocateROB()**: O(1) enqueue at tail position
- **DequeueROB()**: O(1) dequeue from head position
- **FlushROB()**: Clears all speculative entries (keeps committing instruction at head)
- **Reservation Stations**: ADD(4), MULT(1), NAND(2), LOAD(2), STORE(1), BEQ(2), CALL_RET(1) with addr fields
- **Instruction Queues**: `IQ` for display, `Actual_IQ` for working FIFO queue
- **Register File**: 8 registers (R0-R7) with ROB status tracking
- **Memory**: 64KB word-addressable memory (Int32Array)
- **CDB**: Queue for broadcasting results (CMDB array)

#### **Instructions (`Instructions.ts`)**
- Decodes assembly strings into structured instruction objects
- Supports all 9 instruction formats (ALU, Load/Store, Branch, Control)
- Tracks cycle information for visualization

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

1. Click the **Load Program** button (purple icon) in the navbar
2. Choose one of three modes:
   - **Instruction Builder**: Build visually with dropdowns (in development)
   - **Text Editor**: Write assembly code directly
   - **Import File**: Upload a `.txt` or `.asm` file
3. Configure:
   - **Starting Address**: Initial PC value (default: 0)
   - **Data Memory**: Add address-value pairs for initial memory state
4. Click **Load Program** to initialize

### **Execution Modes**

- **Step** (blue icon): Execute one cycle at a time
  - Auto-disables when program completes
  - Tooltip shows "Program Completed" when disabled
- **Run** (green icon): Execute all cycles automatically until completion
  - Auto-disables when program completes
  - Safety limit prevents infinite loops
- **Reset** (orange icon): Restart simulation with current program
  - Always available
  - Resets all state while keeping program loaded

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
- **Instructions Completed**: Count of committed instructions (proper counter)
- **IPC (Instructions Per Cycle)**: Average parallelism achieved
- **Branch Misprediction Rate**: Percentage of incorrectly predicted branches

---

## 🏛️ Architecture Highlights

### **Circular Buffer ROB**
The simulator implements a true circular buffer for the Reorder Buffer:
- **Fixed 8-entry size**: No dynamic reallocation or shifting
- **O(1) operations**: Enqueue at tail, dequeue from head
- **Head/Tail pointers**: Track valid entries with wraparound
- **ROBCount**: Maintains accurate entry count
- **Efficient flushing**: Clears speculative entries while preserving head

### **Instruction Queue Management**
Two separate queues provide proper semantics:
- **`IQ`**: Full program for UI display (never modified)
- **`Actual_IQ`**: Working FIFO queue that:
  - Dequeues on successful issue
  - Auto-refills on control flow changes (BEQ/CALL/RET)
  - Maintains proper instruction fetch semantics

### **Control Flow Handling**
Comprehensive control flow instruction support:
- **BEQ (Branch if Equal)**:
  - Predict-not-taken policy
  - On misprediction: flush ROB, reload queue from target PC
  - Tracks branch statistics for misprediction rate
- **CALL (Subroutine Call)**:
  - Saves return address in R1
  - Flushes all speculative instructions
  - Jumps to subroutine and reloads queue
- **RET (Return)**:
  - Returns to address in R1
  - Flushes speculative instructions
  - Reloads queue from return PC
- All control flow instructions properly:
  - Clear ROB entry fields (BranchPC, targetPC, BranchTaken, addr)
  - Free reservation stations for flushed instructions
  - Clear register table dependencies
  - Empty the CDB queue

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

## 👤 Contributors

-**Yousef Elmenshawy**
-**Kareem Rashed**


---



## **Future Enhancements**
- [ ] Complete Instruction Builder visual interface
- [ ] Configurable execution cycles per instruction
- [ ] Configurable reservation station counts
- [ ] Full memory address range visualization
- [ ] Export execution trace to CSV/JSON
- [ ] Dark/Light theme toggle
- [ ] Interactive tutorial mode with guided examples
- [ ] Visual data flow highlighting on CDB broadcasts
- [ ] Support for more instruction types (DIV, floating-point)
- [ ] Adjustable ROB size (currently fixed at 8)

---

## 📞 Support

For questions, issues, or suggestions:
- Open an issue on [GitHub Issues](https://github.com/YousefElmenshawy/Tomasulo-Simulator/issues)
- Contact the author via GitHub

---

<div align="center">
  <strong>Made with ❤️ for Computer Architecture Education</strong>
</div>
