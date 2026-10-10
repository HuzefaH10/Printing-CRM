import { toTotalBase, splitBase, formatUnits, pluralizeUnitLabel } from "./units";

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`FAIL: ${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
  }
  console.log(`PASS: ${message}`);
}

export function runUnitsTests() {
  console.log("Running Quantity Units Helper Unit Tests...");

  // 1. Pluralization tests
  assertEqual(pluralizeUnitLabel("tin", 1), "tin", "1 tin");
  assertEqual(pluralizeUnitLabel("tin", 3), "tins", "3 tins");
  assertEqual(pluralizeUnitLabel("box", 1), "box", "1 box");
  assertEqual(pluralizeUnitLabel("box", 2), "boxes", "2 boxes");

  // 2. toTotalBase tests
  assertEqual(toTotalBase(3, 0.5, 1), 3.5, "toTotalBase 3 tins + 0.5 kg (packSize 1) === 3.5");
  assertEqual(toTotalBase(2, 150, 500), 1150, "toTotalBase 2 reams + 150 sheets (packSize 500) === 1150");
  assertEqual(toTotalBase(1, 20, 100), 120, "toTotalBase 1 box + 20 pcs (packSize 100) === 120");

  // 3. splitBase tests
  assertEqual(splitBase(3.5, 1), { fullPacks: 3, looseAmount: 0.5 }, "splitBase(3.5, 1) === { fullPacks: 3, looseAmount: 0.5 }");
  assertEqual(splitBase(1150, 500), { fullPacks: 2, looseAmount: 150 }, "splitBase(1150, 500) === { fullPacks: 2, looseAmount: 150 }");
  assertEqual(splitBase(120, 100), { fullPacks: 1, looseAmount: 20 }, "splitBase(120, 100) === { fullPacks: 1, looseAmount: 20 }");

  // 4. formatUnits tests
  assertEqual(formatUnits(3.5, 1, "tin", "kg"), "3 tins + 0.5 kg", "3.5 kg tin === '3 tins + 0.5 kg'");
  assertEqual(formatUnits(3, 1, "tin", "kg"), "3 tins", "3 kg tin === '3 tins'");
  assertEqual(formatUnits(0.5, 1, "tin", "kg"), "0.5 kg", "0.5 kg tin === '0.5 kg'");
  assertEqual(formatUnits(1150, 500, "ream", "sheets"), "2 reams + 150 sheets", "1150 ream === '2 reams + 150 sheets'");
  assertEqual(formatUnits(0, 1, "bottle", "L"), "0 bottles", "0 bottles === '0 bottles'");
  assertEqual(formatUnits(100, 100, "box", "pcs"), "1 box", "100 pcs box === '1 box'");

  console.log("All Quantity Units Helper Unit Tests Passed Successfully!");
}

if (require.main === module) {
  runUnitsTests();
}
