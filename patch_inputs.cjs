const fs = require('fs');
let code = fs.readFileSync('src/pages/officer/NewAssessment.tsx', 'utf8');

const target1 = `      reader.readAsDataURL(file);
    }
  };`;

const replacement1 = `      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };`;

if (code.includes(target1)) {
  code = code.replace(target1, replacement1).replace(target1, replacement1);
  fs.writeFileSync('src/pages/officer/NewAssessment.tsx', code);
  console.log("Replaced inputs");
} else {
  console.log("Target not found!");
}
