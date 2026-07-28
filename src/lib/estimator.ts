export interface EstimatorInputs {
  // Plates
  numPlates: number;
  costPerPlate: number;
  
  // Paper
  totalSheets: number;
  overageAllowance: number;
  pricePerSheet: number;
  
  // Machine
  totalImpressions: number;
  pressSpeedPerHour: number;
  hourlyPressRate: number;
  
  // Finishing
  finishingSetupCost: number;
  finishingPerUnitCost: number;
  quantity: number;
}

export interface EstimatorBreakdown {
  platesCost: number;
  paperCost: number;
  machineCost: number;
  finishingCost: number;
  baseCost: number;
}

export function calculateBaseCost(inputs: EstimatorInputs): EstimatorBreakdown {
  const platesCost = inputs.numPlates * inputs.costPerPlate;
  const paperCost = (inputs.totalSheets + inputs.overageAllowance) * inputs.pricePerSheet;
  
  // Prevent division by zero
  const pressSpeed = inputs.pressSpeedPerHour > 0 ? inputs.pressSpeedPerHour : 1;
  const machineCost = (inputs.totalImpressions / pressSpeed) * inputs.hourlyPressRate;
  
  const finishingCost = inputs.finishingSetupCost + (inputs.finishingPerUnitCost * inputs.quantity);
  
  const baseCost = platesCost + paperCost + machineCost + finishingCost;

  return {
    platesCost,
    paperCost,
    machineCost,
    finishingCost,
    baseCost
  };
}
