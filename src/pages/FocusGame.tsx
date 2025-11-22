import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface FocusGameProps {
  onComplete?: (data: any) => void;
  onGoToCockpit?: () => void;
  mode?: "training" | "measurement";
}

export default function FocusGame({ onComplete, onGoToCockpit, mode = "training" }: FocusGameProps) {
  // Game state management
  const [gameState, setGameState] = useState<"ready" | "playing" | "finished">("ready");
  const [currentTrial] = useState(1);
  const [totalTrials] = useState(80);
  const [showFixation] = useState(true);
  const [stimulusWord] = useState("CZERWONY");
  const [stimulusColor] = useState("text-blue-500");

  const handleStartGame = () => {
    setGameState("playing");
  };

  // Ready screen
  if (gameState === "ready") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-slate-800 rounded-lg p-8 space-y-6">
          <h1 className="text-4xl font-bold text-white text-center">Sigma Focus</h1>
          
          <div className="space-y-4 text-slate-300">
            <p className="text-lg leading-relaxed">
              Twoim zadaniem jest <span className="font-bold text-white">zidentyfikowanie koloru tekstu</span>, ignorując znaczenie słowa.
            </p>
            
            <div className="bg-slate-900 rounded p-4 space-y-2">
              <p className="font-semibold text-white">Przykład:</p>
              <p>Jeśli zobaczysz słowo <span className="text-blue-500 font-bold">CZERWONY</span> napisane na niebiesko, wybierz przycisk <span className="font-bold">NIEBIESKI</span>.</p>
            </div>
            
            <p className="text-lg leading-relaxed">
              Test składa się z <span className="font-bold text-white">80 prób</span>. Reaguj jak najszybciej, ale staraj się unikać błędów.
            </p>
            
            <p className="text-sm text-slate-400">
              Przed każdą próbą pojawi się krzyżyk (+) na środku ekranu - skup na nim wzrok.
            </p>
          </div>
          
          <Button 
            size="lg" 
            className="w-full text-xl py-6"
            onClick={handleStartGame}
          >
            START
          </Button>
        </div>
      </div>
    );
  }

  // Playing screen
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
