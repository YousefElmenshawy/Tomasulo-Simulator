# Tomasulo Algorithm Simulator - Frontend

A modern, interactive web-based simulator for the **Tomasulo Algorithm** with real-time visualization of CPU components, reservation stations, reorder buffer (ROB), and instruction lifecycle tracking.

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

---

## 🎯 Features

### **Core Simulator**
- **Circular Buffer ROB**: 8-entry Reorder Buffer with efficient O(1) enqueue/dequeue
- **Instruction Queue**: Proper FIFO instruction queue with automatic refill on control flow changes
- **Dynamic Scheduling**: Out-of-order execution with in-order commit
- **Register Renaming**: Eliminates WAR and WAW hazards
- **Reservation Stations**: Separate stations for ADD(4), MULT(1), NAND(2), LOAD(2), STORE(1), BEQ(2), CALL_RET(1)
- **Common Data Bus (CDB)**: Queue-based result broadcasting
- **Branch Prediction**: Predict-not-taken with misprediction recovery
- **Control Flow**: Full support for BEQ, CALL, and RET instructions

### **Supported Instructions**
| Instruction | Execution Cycles | Commit Cycles | Description |
|------------|------------------|---------------|-------------|
| `ADD` | 2 | 1 | Addition |
| `SUB` | 2 | 1 | Subtraction |
| `MUL` | 12 | 1 | Multiplication |
| `NAND` | 1 | 1 | Bitwise NAND |
| `LOAD` | 6 | 1 | Load from memory |
| `STORE` | 2 | 4 | Store to memory |
| `BEQ` | 1 | 1 | Branch if equal |
| `CALL` | 1 | 1 | Subroutine call |
| `RET` | 1 | 1 | Return from subroutine |

### **Real-Time Visualization**
- **Instruction Status Table**: Shows Issue, Execute, Write, and Commit cycles
- **Reservation Stations**: Displays operand values, dependencies, and busy status with addr fields
- **Reorder Buffer (ROB)**: 8-entry circular buffer with instruction tracking
- **Register File**: 8 general-purpose registers (R0-R7) with status tracking
- **Memory View**: Configurable initial memory state
- **Performance Metrics**:
  - Total execution cycles
  - Instructions completed counter
  - Instructions Per Cycle (IPC)
  - Branch misprediction rate

### **Program Loading**
- **Three Input Modes**:
  1. **Instruction Builder**: Visual interface (in development)
  2. **Text Editor**: Write assembly code directly
  3. **File Import**: Load `.txt` or `.asm` files
- **Configuration Options**:
  - Starting PC address
  - Initial memory data (address-value pairs)
  - Sample programs included

### **Execution Controls**
- **Step**: Execute one cycle at a time (disabled when program completes)
- **Run**: Execute entire program automatically (disabled when program completes)
- **Reset**: Restart simulation with current program
- **Visual Feedback**: Buttons automatically disable and show "Program Completed" tooltip

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js v20 or higher
- npm, yarn, pnpm, or bun

### **Installation**

1. **Navigate to the simulator directory**:
   ```bash
   cd simulator
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
CALL 5                  # Call subroutine at PC=5
STORE R4, 45(R0)        # Store R4 to memory[45] after return
BEQ R0, R0, 4           # Branch to end
ADD R4, R2, R3          # Subroutine: Add R2 + R3 → R4
RET                     # Return to caller
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
RET                         # PC = R1
```

### **Loading a Program**

1. Click the **Load Program** button (purple icon)
2. Choose input mode (Builder/Text/File)
3. Configure:
   - **Starting Address**: Initial PC value (default: 0)
   - **Data Memory**: Add address-value pairs for initial memory state
4. Click **Load Program** to initialize

### **Running the Simulator**

- **Step Button** (blue): Execute one cycle at a time
- **Run Button** (green): Execute all cycles until completion
- **Reset Button** (orange): Restart with the same program
- **Buttons auto-disable** when program completes with visual feedback

---

## 🏗️ Project Structure

```
simulator/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Main simulator page
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   └── Navbar.tsx          # Navigation and program loader
│   └── lib/
│       ├── CPU.ts              # Tomasulo CPU implementation
│       ├── Buffers.ts          # ROB, RS, Registers, Memory, IQ
│       └── Instructions.ts     # Instruction decoder
├── public/                     # Static assets
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── tailwind.config.ts          # Tailwind CSS config
└── next.config.ts              # Next.js config
```

### **Key Implementation Details**

#### **CPU.ts**
- `issue()`: Allocates reservation stations and ROB entries
- `execute()`: Executes instructions when operands ready
- `write()`: Broadcasts results via CDB queue
- `commit()`: In-order commit from ROB head with control flow handling
- `step()`: Single cycle execution (Commit → Write → Execute → Issue)
- `loadInstructionQueue()`: Refills instruction queue from current PC

#### **Buffers.ts**
- **Circular ROB**: 8-entry buffer with `ROB_Head`, `ROB_Tail`, `ROBCount`
- `allocateROB()`: O(1) enqueue at tail
- `DequeueROB()`: O(1) dequeue from head
- `FlushROB()`: Clears speculative entries (keeps head)
- **Actual_IQ**: Working instruction queue (FIFO)
- **IQ**: Full program for UI display

#### **Instructions.ts**
- Decodes assembly strings into structured instruction objects
- Supports all 9 instruction types with proper field extraction

---

## 🛠️ Development

### **Build for Production**
```bash
npm run build
npm run start
```

### **Linting & Formatting**
```bash
npm run lint      # Check code quality with Biome
```

### **Technology Stack**
- **Next.js 16**: React Server Components and App Router
- **React 19**: Latest features with concurrent rendering
- **TypeScript 5**: Type-safe implementation
- **Tailwind CSS 4**: Modern utility-first styling
- **Biome**: Fast unified linting and formatting

---

## 🎓 Educational Use

Perfect for:
- Computer Architecture courses
- CPU design understanding
- Performance analysis and IPC studies
- Instruction-level parallelism visualization
- Branch prediction impact analysis

---

## 📊 Architecture Highlights

### **Circular Buffer ROB**
- Fixed 8-entry size (no shifting/reallocation)
- O(1) enqueue/dequeue operations
- Head/tail pointers track valid entries
- Automatic wraparound using modulo arithmetic

### **Instruction Queue**
- Separate queues: `Actual_IQ` (working) and `IQ` (display)
- Auto-refills on control flow changes (BEQ/CALL/RET)
- FIFO semantics with proper dequeue on issue

### **Control Flow Handling**
- BEQ: Flush on misprediction, reload queue from target PC
- CALL: Flush all entries, jump to subroutine, reload queue
- RET: Flush entries, return to caller, reload queue
- All control flow instructions clear ROB fields and free reservation stations

---

## 🐛 Known Issues

- Instruction Builder mode UI is under development
- ROB display limited to 8 entries (matches hardware)
- Memory view shows only configured addresses

---

## 🚀 Future Enhancements

- [ ] Configurable execution cycles per instruction
- [ ] Adjustable reservation station counts
- [ ] Full memory address range visualization
- [ ] Export execution trace to CSV/JSON
- [ ] Dark/Light theme toggle
- [ ] Interactive tutorial mode
- [ ] Visual data flow highlighting

---

## 📝 License

This project is licensed under the MIT License.

---

## 👤Contributors

- **Yousef Elmenshawy**
- **Kareem Rashed**

---




