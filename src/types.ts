// Type definitions for ELECTRONX Laboratory

export type LabViewId =
  | 'landing'
  | 'dashboard'
  | 'physics'
  | 'pn-junction'
  | 'bjt'
  | 'mosfet'
  | 'opto'
  | 'special-devices'
  | 'circuit-builder'
  | 'experiments'
  | 'comparator'
  | 'mentor'
  | 'formulas'
  | 'quizzes'
  | 'about';

export interface DeviceInfo {
  id: string;
  name: string;
  category: 'junction' | 'bipolar' | 'fet' | 'opto' | 'special';
  symbol: string;
  tagline: string;
  module: string;
  structureDescription: string;
  operatingPrinciple: string;
  keyEquations: string[];
  parameters: {
    name: string;
    symbol: string;
    unit: string;
    typicalValue: string;
    description: string;
  }[];
  applications: string[];
  advantages: string[];
  limitations: string[];
  carrierType: 'Majority' | 'Minority' | 'Bipolar (Both)' | 'Photons & Carriers';
  controlMechanism: 'Current-controlled' | 'Voltage-controlled' | 'Optical-controlled' | 'Field-induced';
  inputImpedance: 'Low (~1 kΩ)' | 'Extremely High (>10¹² Ω)' | 'Moderate' | 'Reverse-dependent';
  switchingSpeed: 'Moderate (~MHz)' | 'Very High (~GHz)' | 'Ultra-high (~100 GHz)' | 'Nanoseconds';
}

export interface FormulaItem {
  id: string;
  name: string;
  category: 'Physics' | 'PN Junction' | 'BJT' | 'FET & MOSFET' | 'Optoelectronics' | 'Special Devices';
  latex: string;
  description: string;
  variables: { symbol: string; name: string; unit: string; defaultValue: number }[];
  calculate: (inputs: Record<string, number>) => { value: number; unit: string; steps: string[] };
}

export interface ExperimentItem {
  id: string;
  title: string;
  module: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  durationMinutes: number;
  objective: string;
  apparatus: string[];
  theory: string;
  formula: string;
  procedureSteps: string[];
  defaultControls: Record<string, number>;
  controlConfig: {
    id: string;
    label: string;
    min: number;
    max: number;
    step: number;
    unit: string;
  }[];
  calculateReading: (params: Record<string, number>) => {
    primaryValue: number;
    secondaryValue: number;
    metrics: Record<string, number | string>;
  };
  primaryAxis: { name: string; unit: string };
  secondaryAxis: { name: string; unit: string };
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface CircuitComponent {
  id: string;
  type: 'dc-source' | 'resistor' | 'capacitor' | 'diode' | 'zener' | 'led' | 'bjt-npn' | 'nmos' | 'ground';
  name: string;
  x: number;
  y: number;
  value: number; // e.g. Volts, Ohms, Farads, Breakdown V
  unit: string;
  label: string;
}

export interface MentorMessage {
  id: string;
  sender: 'user' | 'mentor';
  timestamp: string;
  content: string;
  structuredSections?: {
    simple: string;
    engineering: string;
    formula: string;
    visual: string;
    applications: string;
  };
}

export interface QuizQuestion {
  id: string;
  module: 'MODULE 01' | 'MODULE 02' | 'MODULE 03' | 'MODULE 04' | 'MODULE 05';
  topic: string;
  type: 'mcq' | 'numerical' | 'true-false' | 'identification';
  question: string;
  options: string[];
  correctAnswer: string | number;
  explanation: string;
  hint?: string;
}

export interface StudentProgress {
  devicesExplored: string[];
  simulationsRun: number;
  experimentsCompleted: {
    id: string;
    completedAt: string;
    score: number;
    readingsCount: number;
  }[];
  quizResults: {
    quizId: string;
    score: number;
    total: number;
    completedAt: string;
  }[];
  labScore: number;
  achievements: string[];
}

export type Formula = FormulaItem;
export type Experiment = ExperimentItem;
