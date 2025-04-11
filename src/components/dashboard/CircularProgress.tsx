import React from 'react';
import { Button } from "@/components/ui/button";
import { Crown, TrendingUp, Award } from "lucide-react";

interface CircularProgressProps {
  value: number;
}

export function CircularProgress({ value }: CircularProgressProps) {
  const radius = 60;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  
  // Determinar color basado en el progreso
  const getProgressColor = () => {
    if (value >= 100) return "text-green-500";
    if (value >= 75) return "text-blue-500";
    if (value >= 50) return "text-yellow-500";
    return "text-primary";
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-36 h-36 transform -rotate-90">
        <circle
          className="text-muted/20 stroke-current"
          strokeWidth="8"
          fill="transparent"
          r={radius}
          cx="72"
          cy="72"
        />
        <circle
          className={`${getProgressColor()} stroke-current`}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx="72"
          cy="72"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <div className={`text-3xl font-bold ${getProgressColor()}`}>{value}%</div>
      </div>
    </div>
  );
}

export default function MonthlyGoalCard({ 
  kpis, 
  monthlyGoal, 
  goalProgress, 
  goalRemaining, 
  goalProjection, 
  setNewGoal, 
  setEditGoalOpen 
}) {
  const isCompleted = goalProgress >= 100;
  
  return (
    <div className="p-6 h-full bg-gradient-to-br from-primary/5 via-indigo-50/10 to-purple-100/10 rounded-lg border border-purple-200/30 shadow-md">
      <div className="flex justify-between items-center mb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            <h3 className="font-medium text-lg">Meta Mensual</h3>
          </div>
          <p className="text-sm text-muted-foreground">Progreso hacia el objetivo</p>
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          className="border-primary/20 hover:bg-primary/5"
          onClick={() => { 
            setNewGoal(monthlyGoal.toString()); 
            setEditGoalOpen(true); 
          }}
        >
          Editar Meta
        </Button>
      </div>
      
      <div className="flex flex-col items-center justify-center mt-4 h-[240px] relative">
        <div className="flex flex-col items-center">
          <CircularProgress value={goalProgress} />
          
          <div className="mt-8 text-center">
            <div className="flex items-baseline justify-center gap-1">
              <p className="text-3xl font-bold text-primary">${kpis.salesTotal.toLocaleString()}</p>
              <p className="text-lg text-muted-foreground">de ${monthlyGoal.toLocaleString()}</p>
            </div>
            
            {isCompleted ? (
              <div className="mt-4 flex flex-col items-center animate-pulse">
                <Award className="h-8 w-8 text-green-500 mb-2" />
                <p className="text-lg font-semibold text-green-600">¡Felicidades! Has alcanzado tu meta</p>
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-center gap-2 p-2 rounded-full bg-primary/5 text-primary">
                  <p className="font-medium">${goalRemaining.toLocaleString()} restantes</p>
                </div>
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <p>Proyección: {goalProjection} días para completar</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}