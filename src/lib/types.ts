export type ComparisonStatus = 'Added' | 'Removed' | 'Modified' | 'Unchanged';

export interface ComparedMedicine {
  id: string;
  name: string;
  dosage: string;
  timing: string;
  foodInstruction: string;
  uses: string;
  status: ComparisonStatus;
  changes?: {
    dosage?: { old: string; new: string };
    timing?: { old: string; new: string };
    foodInstruction?: { old: string; new: string };
  };
  sideEffects?: string;
}

export interface ExtractedMedicine {
  id: string;
  name: string;
  dosage: string;
  timing: 'Morning' | 'Afternoon' | 'Night' | 'Multiple' | 'Unknown';
  foodInstruction: 'Before Food' | 'After Food' | 'Anytime' | 'Unknown';
  uses: string;
  sideEffects?: string;
}
