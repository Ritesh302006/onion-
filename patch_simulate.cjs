const fs = require('fs');
let code = fs.readFileSync('src/pages/officer/NewAssessment.tsx', 'utf8');

const target = `      // 100 sample lot
      generate(75, "healthy", [45, 80]);
      generate(12, "undersized", [20, 35]); // Undersized based on criteria (< 35mm)
      generate(4, "rotten", [40, 70]);
      generate(6, "damaged", [40, 70]);
      generate(3, "sprouted", [40, 70]);`;

const replacement = `      // Dynamic random lot generation so different images give different results
      const totalSample = 80 + Math.floor(Math.random() * 40); // 80 to 120 onions
      const healthyCount = Math.floor(totalSample * (0.6 + Math.random() * 0.3)); // 60% to 90% healthy
      const remaining = totalSample - healthyCount;
      const undersizedCount = Math.floor(remaining * Math.random());
      const rottenCount = Math.floor((remaining - undersizedCount) * Math.random());
      const damagedCount = Math.floor((remaining - undersizedCount - rottenCount) * Math.random());
      const sproutedCount = remaining - undersizedCount - rottenCount - damagedCount;

      generate(healthyCount, "healthy", [45, 80]);
      generate(undersizedCount, "undersized", [20, 35]); 
      generate(rottenCount, "rotten", [40, 70]);
      generate(damagedCount, "damaged", [40, 70]);
      generate(sproutedCount, "sprouted", [40, 70]);`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/pages/officer/NewAssessment.tsx', code);
  console.log("Replaced");
} else {
  console.log("Target not found!");
}
