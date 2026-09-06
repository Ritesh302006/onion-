const fs = require('fs');
let code = fs.readFileSync('src/pages/officer/NewAssessment.tsx', 'utf8');

// 1. Add models to useAppStore destructured variables
code = code.replace(
  'const { currentUser, rules, addLot, isOnline } = useAppStore();',
  'const { currentUser, rules, models, addLot, isOnline } = useAppStore();'
);

// 2. Add activeModel
code = code.replace(
  'const activeRule = rules.find((r) => r.active) || rules[0];',
  'const activeRule = rules.find((r) => r.active) || rules[0];\n  const activeModel = models.find((m) => m.active) || models[0];'
);

// 3. Update addLot modelVersion
code = code.replace(
  'modelVersion: "YOLO-v8-Onion-2.1", // Mock model',
  'modelVersion: activeModel.version,'
);

// 4. Update the analyzing view UI
code = code.replace(
  '<span>Model: YOLO-v8-Onion-2.1</span>',
  '<span>Model: {activeModel.version} ({activeModel.datasetVersion.substring(0,8)}...)</span>'
);

fs.writeFileSync('src/pages/officer/NewAssessment.tsx', code);
console.log("Patched NewAssessment");
