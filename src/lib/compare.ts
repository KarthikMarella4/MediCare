import { ExtractedMedicine, ComparedMedicine, ComparisonStatus } from './types';

export function comparePrescriptions(
  oldList: ExtractedMedicine[],
  newList: ExtractedMedicine[]
): ComparedMedicine[] {
  const result: ComparedMedicine[] = [];

  // Track which old medicines have been matched
  const oldProcessed = new Set<string>();

  // Process new list against old list
  for (const newMed of newList) {
    // Match by name — case-insensitive, trimmed
    const oldMed = oldList.find(
      m => m.name.toLowerCase().trim() === newMed.name.toLowerCase().trim()
    );

    if (!oldMed) {
      // In new but not in old → Added
      result.push({ ...newMed, status: 'Added' });
    } else {
      // Found in both → check for any differences
      oldProcessed.add(oldMed.id);

      const changes: ComparedMedicine['changes'] = {};
      let isModified = false;

      if (oldMed.dosage.toLowerCase().trim() !== newMed.dosage.toLowerCase().trim()) {
        changes.dosage = { old: oldMed.dosage, new: newMed.dosage };
        isModified = true;
      }
      if (oldMed.timing.toLowerCase().trim() !== newMed.timing.toLowerCase().trim()) {
        changes.timing = { old: oldMed.timing, new: newMed.timing };
        isModified = true;
      }
      if (oldMed.foodInstruction.toLowerCase().trim() !== newMed.foodInstruction.toLowerCase().trim()) {
        changes.foodInstruction = { old: oldMed.foodInstruction, new: newMed.foodInstruction };
        isModified = true;
      }

      if (isModified) {
        // Medicine found in both but something changed → Modified
        result.push({ ...newMed, status: 'Modified', changes });
      } else {
        // Exactly the same in both → Unchanged
        result.push({ ...newMed, status: 'Unchanged' });
      }
    }
  }

  // Any old medicine not matched → Removed
  for (const oldMed of oldList) {
    if (!oldProcessed.has(oldMed.id)) {
      result.push({ ...oldMed, status: 'Removed' });
    }
  }

  return result;
}
