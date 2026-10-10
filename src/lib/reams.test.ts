import { toTotalSheets, splitSheets, formatReams } from "./reams";

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`FAIL: ${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
  }
  console.log(`PASS: ${message}`);
}

export function runReamsTests() {
  console.log("Running Reams Helper Unit Tests...");

  // 1. toTotalSheets tests
  assertEqual(toTotalSheets(2, 150, 500), 1150, "toTotalSheets(2, 150, 500) === 1150");
  assertEqual(toTotalSheets(0, 0, 500), 0, "toTotalSheets(0, 0, 500) === 0");
  assertEqual(toTotalSheets(3, 0, 500), 1500, "toTotalSheets(3, 0, 500) === 1500");
  assertEqual(toTotalSheets(0, 250, 500), 250, "toTotalSheets(0, 250, 500) === 250");
  assertEqual(toTotalSheets(2, 50, 250), 550, "toTotalSheets with custom perReam 250");

  // 2. splitSheets tests
  assertEqual(splitSheets(1150, 500), { reams: 2, loose: 150 }, "splitSheets(1150, 500) === { reams: 2, loose: 150 }");
  assertEqual(splitSheets(1500, 500), { reams: 3, loose: 0 }, "splitSheets(1500, 500) === { reams: 3, loose: 0 }");
  assertEqual(splitSheets(150, 500), { reams: 0, loose: 150 }, "splitSheets(150, 500) === { reams: 0, loose: 150 }");
  assertEqual(splitSheets(0, 500), { reams: 0, loose: 0 }, "splitSheets(0, 500) === { reams: 0, loose: 0 }");
  assertEqual(splitSheets(550, 250), { reams: 2, loose: 50 }, "splitSheets with custom perReam 250");

  // 3. formatReams tests
  assertEqual(formatReams(1150, 500), "2 reams + 150 sheets", "formatReams 1150 => '2 reams + 150 sheets'");
  assertEqual(formatReams(1500, 500), "3 reams", "formatReams 1500 => '3 reams'");
  assertEqual(formatReams(150, 500), "150 sheets", "formatReams 150 => '150 sheets'");
  assertEqual(formatReams(0, 500), "0 sheets", "formatReams 0 => '0 sheets'");
  assertEqual(formatReams(501, 500), "1 ream + 1 sheet", "formatReams singular 501 => '1 ream + 1 sheet'");
  assertEqual(formatReams(500, 500), "1 ream", "formatReams 500 => '1 ream'");

  console.log("All Reams Helper Unit Tests Passed Successfully!");
}

// Auto-run if executed directly via node/ts-node
if (require.main === module) {
  runReamsTests();
}
