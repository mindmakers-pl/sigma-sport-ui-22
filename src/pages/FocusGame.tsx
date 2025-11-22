import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface FocusGameProps {
  onComplete?: (data: any) => void;
  onGoToCockpit?: () => void;
  mode?: "training" | "measurement";
}

export default function FocusGame({ onComplete, onGoToCockpit, mode = "training" }: FocusGameProps) {
  // Temporary static state for UI demo
  const [currentTrial] = useState(1);
  const [totalTrials] = useState(80);
  const [showFixation] = useState(true);
  const [stimulusWord] = useState("CZERWONY");
  const [stimulusColor] = useState("text-blue-500"); // This will be dynamic later

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Progress Bar / Counter */}
      <div className="p-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-slate-300 text-sm">
            Próba: {currentTrial} / {totalTrials}
          </span>
          <span className="text-slate-300 text-sm">
            {Math.round((currentTrial / totalTrials) * 100)}%
          </span>
        </div>
        <Progress value={(currentTrial / totalTrials) * 100} className="h-2" />
      </div>

      {/* Central Stimulus Area */}
      <div className="flex-1 flex items-center justify-center">
        {showFixation ? (
          <div className="text-white text-4xl font-bold">+</div>
        ) : (
          <div className={`text-6xl font-bold ${stimulusColor}`}>
            {stimulusWord}
          </div>
        )}
      </div>

      {/* Response Buttons */}
      <div className="grid grid-cols-2 gap-4 p-4 pb-8">
        <Button
          className="h-32 text-2xl font-bold bg-slate-700 hover:bg-slate-600 text-white border-2 border-slate-600"
          onClick={() => {}}
        >
          CZERWONY
        </Button>
        <Button
          className="h-32 text-2xl font-bold bg-slate-700 hover:bg-slate-600 text-white border-2 border-slate-600"
          onClick={() => {}}
        >
          NIEBIESKI
        </Button>
      </div>
    </div>
  );
}
