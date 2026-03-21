import { ComparedMedicine } from './types';

export interface ScheduleItem {
  timeOfDay: 'Morning' | 'Afternoon' | 'Night';
  beforeFood: ComparedMedicine[];
  afterFood: ComparedMedicine[];
  anytime: ComparedMedicine[];
}

export function generateSchedule(medicines: ComparedMedicine[]): ScheduleItem[] {
  // Only schedule medicines that are currently active (Added, Modified, Unchanged)
  // We do NOT schedule Removed medicines.
  const activeMeds = medicines.filter(m => m.status !== 'Removed');

  const scheduleMap = {
    Morning: { beforeFood: [], afterFood: [], anytime: [] } as Omit<ScheduleItem, 'timeOfDay'>,
    Afternoon: { beforeFood: [], afterFood: [], anytime: [] } as Omit<ScheduleItem, 'timeOfDay'>,
    Night: { beforeFood: [], afterFood: [], anytime: [] } as Omit<ScheduleItem, 'timeOfDay'>,
  };

  activeMeds.forEach(med => {
    // Current timing and food instruction
    const timing = med.changes?.timing?.new || med.timing;
    const food = med.changes?.foodInstruction?.new || med.foodInstruction;

    const timingsToAssign: ('Morning' | 'Afternoon' | 'Night')[] = [];

    if (timing === 'Multiple') {
      timingsToAssign.push('Morning', 'Night'); // Default to twice a day if multiple is specified without details
    } else if (['Morning', 'Afternoon', 'Night'].includes(timing)) {
      timingsToAssign.push(timing as 'Morning' | 'Afternoon' | 'Night');
    } else {
      timingsToAssign.push('Morning'); // Default fallback
    }

    const foodCategory = food === 'Before Food' ? 'beforeFood' : food === 'After Food' ? 'afterFood' : 'anytime';

    timingsToAssign.forEach(t => {
      scheduleMap[t][foodCategory].push(med);
    });
  });

  return [
    { timeOfDay: 'Morning', ...scheduleMap.Morning },
    { timeOfDay: 'Afternoon', ...scheduleMap.Afternoon },
    { timeOfDay: 'Night', ...scheduleMap.Night },
  ];
}
