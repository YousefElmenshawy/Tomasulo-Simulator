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
  const [loadMode, setLoadMode] = useState('builder'); // 'builder' or 'text'
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [programText, setProgramText] = useState('');

  const availableInstructions = [
    'L.D', 'S.D', 'ADD.D', 'SUB.D', 'MUL.D', 'DIV.D'   // to be changed
  ];

  const registers = ['F0', 'F2', 'F4', 'F6', 'F8', 'F10', 'F12', 'F14'];
  const baseRegisters = ['R0', 'R1', 'R2', 'R3', 'R4', 'R5'];

  const addInstruction = () => {
    setInstructions([...instructions, { 
      inst: 'L.D', 
      dest: 'F0', 
      src1: '0', 
      src2: 'R2' 
    }]);
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
    if (loadMode === 'text') {
      // Parse text program
      //to be implemented
    } else {
      // Load from builder
     //to be implemented
    }
    setShowLoadModal(false);
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
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
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

                      {(inst.inst === 'L.D' || inst.inst === 'S.D') ? (
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
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-400 text-sm">
                    Enter your program in assembly format. Example:
                  </p>
                  <div className="bg-zinc-800 p-3 rounded-lg text-sm font-mono text-gray-400">
                    L.D F6, 34, R2<br />
                    MUL.D F0, F2, F4<br />
                    SUB.D F8, F6, F2
                  </div>
                  <textarea
                    value={programText}
                    onChange={(e) => setProgramText(e.target.value)}
                    placeholder="L.D F6, 34, R2&#10;MUL.D F0, F2, F4&#10;SUB.D F8, F6, F2"
                    className="w-full h-64 bg-zinc-800 text-gray-100 p-4 rounded-lg border border-zinc-700 focus:border-blue-500 focus:outline-none font-mono text-sm resize-none"
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-zinc-800">
              <div className="text-sm text-gray-500">
                {loadMode === 'builder' 
                  ? `${instructions.length} instruction${instructions.length !== 1 ? 's' : ''}`
                  : 'Text mode'
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
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
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