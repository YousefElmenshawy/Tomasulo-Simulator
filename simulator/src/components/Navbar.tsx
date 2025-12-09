"use client"
import { useState } from 'react';
import { ChevronDown, X, Plus } from 'lucide-react';

interface Instruction { // will be changed
  inst: string;
  dest: string;
  src1: string;
  src2: string;
}

export default function NavBar({ children }:{children:React.ReactNode}) {
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [loadMode, setLoadMode] = useState('builder'); // 'builder', 'text', or 'file'
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [programText, setProgramText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [startingAddress, setStartingAddress] = useState('0');
  const [dataMemory, setDataMemory] = useState<Array<{address: string, value: string}>>([
    { address: '0', value: '0' },
    { address: '34', value: '0' },
    { address: '45', value: '0' },
  ]);

  const availableInstructions = [
    'LOAD', 'STORE', 'ADD', 'SUB', 'MUL', 'NAND','BEQ','CALL','RET'   // to be changed
  ];

  const registers = ['R0', 'R1', 'R2', 'R3', 'R4', 'R5','R6','R7'];
  const baseRegisters = ['R0', 'R1', 'R2', 'R3', 'R4', 'R5','R6','R7'];

  const addInstruction = () => {
    setInstructions([...instructions, { 
      inst: 'LOAD', 
      dest: 'R0', 
      src1: '0', 
      src2: 'R2' 
    }]);
  };

  const addDataMemory = () => {
    setDataMemory([...dataMemory, { address: '0', value: '0' }]);
  };

  const removeDataMemory = (index: number) => {
    setDataMemory(dataMemory.filter((_, i) => i !== index));
  };

  const updateDataMemory = (index: number, field: 'address' | 'value', value: string) => {
    const updated = [...dataMemory];
    updated[index][field] = value;
    setDataMemory(updated);
  };

  const removeInstruction = (index: number) => {
   setInstructions(instructions.filter((_, i) => i !== index)); 
  };

  const updateInstruction = (index: number, field: keyof Instruction, value: string) => {
const updated = [...instructions];
    updated[index][field] = value;
    setInstructions(updated);
  };

  const loadProgram = () => {
    const handleProgramLoad = (window as any).simulatorHandlers?.handleProgramLoad;
    
    // Parse starting address and data memory
    const startAddr = parseInt(startingAddress) || 0;
    const memData: Array<[number, number]> = dataMemory.map(item => [
      parseInt(item.address) || 0,
      parseFloat(item.value) || 0
    ]);
    
    if (loadMode === 'text') {
      // Parse text program
      const lines = programText.trim().split('\n').filter(line => line.trim() !== '');
      if (lines.length > 0 && handleProgramLoad) {
        handleProgramLoad(lines, startAddr, memData);
        setShowLoadModal(false);
      }
    } else if (loadMode === 'file' && selectedFile) {
      // Load from file
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const lines = content.trim().split('\n').filter(line => line.trim() !== '');
        if (lines.length > 0 && handleProgramLoad) {
          handleProgramLoad(lines, startAddr, memData);
          setShowLoadModal(false);
          setSelectedFile(null);
        }
      };
      reader.readAsText(selectedFile);
    } else {
      // Load from builder
      const programLines = instructions.map(inst => {
        if (inst.inst === 'LOAD' || inst.inst === 'STORE') {
          return `${inst.inst} ${inst.dest}, ${inst.src1}(${inst.src2})`;
        } else if (inst.inst === 'BEQ') {
          // BEQ rA, rB, offset (dest is rA, src1 is rB, src2 is offset)
          return `${inst.inst} ${inst.dest}, ${inst.src1}, ${inst.src2}`;
        } else if (inst.inst === 'CALL') {
          // CALL label/offset (only src1 is used)
          return `${inst.inst} ${inst.src1}`;
        } else if (inst.inst === 'RET') {
          return inst.inst;
        } else {
          // ADD, SUB, MUL, NAND: rA, rB, rC
          return `${inst.inst} ${inst.dest}, ${inst.src1}, ${inst.src2}`;
        }
      });
      if (programLines.length > 0 && handleProgramLoad) {
        handleProgramLoad(programLines, startAddr, memData);
        setShowLoadModal(false);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };


  // AI prompt:Create a professional navigation bar for a Tomasulo simulator with the following options: Run, Step, and Load (Load Program). 
  // The Load option should have two choices: either a text area to enter the program manually if it is large,
  //  or a dropdown menu to select instructions from
  return (
    <>
      <nav className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-100">Tomasulo Simulator</h1>
                <p className="text-xs text-gray-500">Dynamic Scheduling</p>
              </div>
            </div>

            {/* Icon Controls */}
            <div className="flex items-center gap-2">
              {/* Run Button */}
              <div className="relative group">
                <button 
                  onClick={() => (window as any).simulatorHandlers?.handleRun()}
                  className="p-3 hover:bg-zinc-800 text-green-500 rounded transition-all"
                >
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M4.5 3v10l8-5-8-5z"/>
                  </svg>
                </button>
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-zinc-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-zinc-700">
                  Run
                </div>
              </div>

              {/* Step Button */}
              <div className="relative group">
                <button 
                  onClick={() => (window as any).simulatorHandlers?.handleStep()}
                  className="p-3 hover:bg-zinc-800 text-blue-400 rounded transition-all"
                >
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M2 3v10l7-5-7-5zm7 0v10l7-5-7-5z"/>
                  </svg>
                </button>
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-zinc-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-zinc-700">
                  Step Over
                </div>
              </div>

              {/* Load Program Button */}
              <div className="relative group">
                <button 
                  onClick={() => setShowLoadModal(true)}
                  className="p-3 hover:bg-zinc-800 text-purple-400 rounded transition-all"
                >
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M13.5 1h-12l-.5.5v13l.5.5h12l.5-.5v-13l-.5-.5zM13 14H2V2h11v12zM4 7h8v1H4V7zm0 2h8v1H4V9zm0 2h6v1H4v-1zM4 4h4v2H4V4z"/>
                  </svg>
                </button>
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-zinc-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-zinc-700">
                  Load Program
                </div>
              </div>

              {/* Reset Button */}
              <div className="relative group">
                <button 
                  onClick={() => (window as any).simulatorHandlers?.handleReset()}
                  className="p-3 hover:bg-zinc-800 text-orange-400 rounded transition-all"
                >
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M12.75 8a4.5 4.5 0 0 1-8.61 1.834l-1.391.565A6.001 6.001 0 0 0 14.25 8 6 6 0 0 0 3.5 4.334V2.5H2v4l.75.75h3.5v-1.5H4.352A4.5 4.5 0 0 1 12.75 8z"/>
                  </svg>
                </button>
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-zinc-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-zinc-700">
                  Restart
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {children}

      {/* Load Program Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h2 className="text-2xl font-bold text-gray-100">Load Program</h2>
              <button 
                onClick={() => setShowLoadModal(false)}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2 p-6 pb-4 border-b border-zinc-800">
              <button
                onClick={() => setLoadMode('builder')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  loadMode === 'builder' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M13.5 1h-12l-.5.5v13l.5.5h12l.5-.5v-13l-.5-.5zM13 14H2V2h11v12zM4 7h8v1H4V7zm0 2h8v1H4V9zm0 2h6v1H4v-1zM4 4h4v2H4V4z"/>
                </svg>
                Instruction Builder
              </button>
              <button
                onClick={() => setLoadMode('text')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  loadMode === 'text' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M9.5 1l-.5.5v3l.5.5h3l.5-.5v-3l-.5-.5h-3zM10 4V2h2v2h-2zm-6.5 7l-.5.5v3l.5.5h3l.5-.5v-3l-.5-.5h-3zM4 14v-2h2v2H4zm9-11l-.5.5v10l.5.5h2l.5-.5v-10l-.5-.5h-2zm1.5 10h-1V4h1v9zM1 3l.5-.5h7l.5.5v1l-.5.5h-7L1 4V3zm.5 4h7l.5.5v1l-.5.5h-7L1 9V8l.5-.5z"/>
                </svg>
                Text Editor
              </button>
              <button
                onClick={() => setLoadMode('file')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  loadMode === 'file' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                </svg>
                Import File
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Starting Address and Data Memory - Common for all modes */}
              <div className="mb-6 space-y-4 pb-6 border-b border-zinc-800">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Starting Address (PC)
                  </label>
                  <input
                    type="number"
                    value={startingAddress}
                    onChange={(e) => setStartingAddress(e.target.value)}
                    className="w-full bg-zinc-800 text-gray-100 px-4 py-2 rounded-lg border border-zinc-700 focus:border-blue-500 focus:outline-none"
                    placeholder="0"
                    min="0"
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-gray-300 text-sm font-medium">
                      Data Memory (16-bit values)
                    </label>
                    <button
                      onClick={addDataMemory}
                      className="flex items-center gap-1 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-blue-400 text-xs rounded transition-colors"
                    >
                      <Plus size={14} />
                      Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {dataMemory.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-zinc-800 p-3 rounded-lg">
                        <span className="text-gray-500 text-sm">Address:</span>
                        <input
                          type="number"
                          value={item.address}
                          onChange={(e) => updateDataMemory(idx, 'address', e.target.value)}
                          className="bg-zinc-700 text-gray-100 px-3 py-1 rounded border border-zinc-600 focus:border-blue-500 focus:outline-none w-24"
                          placeholder="0"
                        />
                        <span className="text-gray-500 text-sm">Value:</span>
                        <input
                          type="number"
                          value={item.value}
                          onChange={(e) => updateDataMemory(idx, 'value', e.target.value)}
                          className="bg-zinc-700 text-gray-100 px-3 py-1 rounded border border-zinc-600 focus:border-blue-500 focus:outline-none flex-1"
                          placeholder="0"
                        />
                        <button
                          onClick={() => removeDataMemory(idx)}
                          className="p-1 hover:bg-red-900/30 text-red-400 rounded transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {loadMode === 'builder' ? (
                <div className="space-y-4">
                  {instructions.map((inst, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-zinc-800 p-4 rounded-lg">
                      <span className="text-gray-500 font-mono text-sm w-8">{idx + 1}.</span>
                      
                      <select
                        value={inst.inst}
                        onChange={(e) => updateInstruction(idx, 'inst', e.target.value)}
                        className="bg-zinc-700 text-gray-100 px-3 py-2 rounded border border-zinc-600 focus:border-blue-500 focus:outline-none"
                      >
                        {availableInstructions.map(op => (
                          <option key={op} value={op}>{op}</option>
                        ))}
                      </select>

                      <select
                        value={inst.dest}
                        onChange={(e) => updateInstruction(idx, 'dest', e.target.value)}
                        className="bg-zinc-700 text-gray-100 px-3 py-2 rounded border border-zinc-600 focus:border-blue-500 focus:outline-none"
                      >
                        {registers.map(reg => (
                          <option key={reg} value={reg}>{reg}</option>
                        ))}
                      </select>

                      {(inst.inst === 'LOAD' || inst.inst === 'STORE') ? (
                        <>
                          <input
                            type="text"
                            value={inst.src1}
                            onChange={(e) => updateInstruction(idx, 'src1', e.target.value)}
                            placeholder="Offset"
                            className="bg-zinc-700 text-gray-100 px-3 py-2 rounded border border-zinc-600 focus:border-blue-500 focus:outline-none w-24"
                          />
                          <select
                            value={inst.src2}
                            onChange={(e) => updateInstruction(idx, 'src2', e.target.value)}
                            className="bg-zinc-700 text-gray-100 px-3 py-2 rounded border border-zinc-600 focus:border-blue-500 focus:outline-none"
                          >
                            {baseRegisters.map(reg => (
                              <option key={reg} value={reg}>{reg}</option>
                            ))}
                          </select>
                        </>
                      ) : inst.inst === 'BEQ' ? (
                        <>
                          <select
                            value={inst.src1}
                            onChange={(e) => updateInstruction(idx, 'src1', e.target.value)}
                            className="bg-zinc-700 text-gray-100 px-3 py-2 rounded border border-zinc-600 focus:border-blue-500 focus:outline-none"
                          >
                            {registers.map(reg => (
                              <option key={reg} value={reg}>{reg}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={inst.src2}
                            onChange={(e) => updateInstruction(idx, 'src2', e.target.value)}
                            placeholder="Offset"
                            className="bg-zinc-700 text-gray-100 px-3 py-2 rounded border border-zinc-600 focus:border-blue-500 focus:outline-none w-24"
                          />
                        </>
                      ) : inst.inst === 'CALL' ? (
                        <input
                          type="text"
                          value={inst.src1}
                          onChange={(e) => updateInstruction(idx, 'src1', e.target.value)}
                          placeholder="Label/Offset"
                          className="bg-zinc-700 text-gray-100 px-3 py-2 rounded border border-zinc-600 focus:border-blue-500 focus:outline-none w-32"
                        />
                      ) : inst.inst === 'RET' ? (
                        <span className="text-gray-500 text-sm italic">No operands</span>
                      ) : (
                        <>
                          <select
                            value={inst.src1}
                            onChange={(e) => updateInstruction(idx, 'src1', e.target.value)}
                            className="bg-zinc-700 text-gray-100 px-3 py-2 rounded border border-zinc-600 focus:border-blue-500 focus:outline-none"
                          >
                            {registers.map(reg => (
                              <option key={reg} value={reg}>{reg}</option>
                            ))}
                          </select>
                          <select
                            value={inst.src2}
                            onChange={(e) => updateInstruction(idx, 'src2', e.target.value)}
                            className="bg-zinc-700 text-gray-100 px-3 py-2 rounded border border-zinc-600 focus:border-blue-500 focus:outline-none"
                          >
                            {registers.map(reg => (
                              <option key={reg} value={reg}>{reg}</option>
                            ))}
                          </select>
                        </>
                      )}

                      <button
                        onClick={() => removeInstruction(idx)}
                        className="ml-auto p-2 hover:bg-red-900/30 text-red-400 rounded transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={addInstruction}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-gray-300 rounded-lg transition-colors border-2 border-dashed border-zinc-700"
                  >
                    <Plus size={18} />
                    Add Instruction
                  </button>
                </div>
              ) : loadMode === 'text' ? (
                <div className="space-y-3">
                  <p className="text-gray-400 text-sm">
                    Enter your program in assembly format. Each instruction on a new line. Example:
                  </p>
                  <div className="bg-zinc-800 p-3 rounded-lg text-sm font-mono text-gray-400">
                    LOAD R6, 34(R2)<br />
                    MUL R0, R2, R4<br />
                    SUB R5, R6, R2
                  </div>
                  <textarea
                    value={programText}
                    onChange={(e) => setProgramText(e.target.value)}
                    placeholder="LOAD R6, 34(R2)&#10;MUL R0, R2, R4&#10;SUB R5, R6, R2"
                    className="w-full h-64 bg-zinc-800 text-gray-100 p-4 rounded-lg border border-zinc-700 focus:border-blue-500 focus:outline-none font-mono text-sm resize-none"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-gray-400 text-sm">
                    <p className="mb-2">Upload a text file containing your assembly program.</p>
                    <p>Each instruction should be on a new line. Supported formats:</p>
                  </div>
                  <div className="bg-zinc-800 p-3 rounded-lg text-sm font-mono text-gray-400">
                    LOAD R6, 34(R2)<br />
                    LOAD R2, 45(R3)<br />
                    MUL R0, R2, R4<br />
                    SUB R5, R6, R2<br />
                    ADD R7, R0, R2
                  </div>
                  
                  <div className="border-2 border-dashed border-zinc-700 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      accept=".txt,.asm"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center gap-3"
                    >
                      <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 16 16" fill="currentColor" className="text-blue-400">
                          <path d="M7.646 4.854a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L8.5 3.293V.5a.5.5 0 0 0-1 0v2.793L6.354 2.146a.5.5 0 1 0-.708.708l2 2z"/>
                          <path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383zm.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-blue-400 font-medium mb-1">
                          {selectedFile ? selectedFile.name : 'Click to select a file'}
                        </p>
                        <p className="text-gray-500 text-sm">
                          or drag and drop
                        </p>
                      </div>
                      <p className="text-xs text-gray-600">
                        TXT or ASM files only
                      </p>
                    </label>
                  </div>
                  
                  {selectedFile && (
                    <div className="flex items-center gap-3 bg-zinc-800 p-4 rounded-lg">
                      <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" className="text-blue-400">
                        <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                      </svg>
                      <div className="flex-1">
                        <p className="text-gray-200 text-sm font-medium">{selectedFile.name}</p>
                        <p className="text-gray-500 text-xs">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="p-2 hover:bg-red-900/30 text-red-400 rounded transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-zinc-800">
              <div className="text-sm text-gray-500">
                {loadMode === 'builder' 
                  ? `${instructions.length} instruction${instructions.length !== 1 ? 's' : ''}`
                  : loadMode === 'text'
                  ? 'Text mode'
                  : selectedFile
                  ? `File: ${selectedFile.name}`
                  : 'No file selected'
                }
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLoadModal(false)}
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-gray-300 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={loadProgram}
                  disabled={
                    (loadMode === 'builder' && instructions.length === 0) ||
                    (loadMode === 'text' && programText.trim() === '') ||
                    (loadMode === 'file' && !selectedFile)
                  }
                  className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                    (loadMode === 'builder' && instructions.length === 0) ||
                    (loadMode === 'text' && programText.trim() === '') ||
                    (loadMode === 'file' && !selectedFile)
                      ? 'bg-zinc-700 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Load Program
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}