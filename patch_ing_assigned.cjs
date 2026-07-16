const fs = require('fs');
let code = fs.readFileSync('src/components/ModuleIngenieria.tsx', 'utf-8');

code = code.replace(
  "const [queueAssignedTo, setQueueAssignedTo] = useState(defaultOperator);",
  "const [queueAssignedTo, setQueueAssignedTo] = useState(defaultOperator);\n  React.useEffect(() => {\n    const operators = users.filter(u => u.role === 'Operador');\n    if (operators.length > 0 && !operators.find(u => u.username === queueAssignedTo)) {\n      setQueueAssignedTo(operators[0].username);\n    }\n  }, [users, queueAssignedTo]);"
);

code = code.replace(
  "const [dqAssignedTo, setDqAssignedTo] = useState(defaultOperator);",
  "const [dqAssignedTo, setDqAssignedTo] = useState(defaultOperator);\n  React.useEffect(() => {\n    const operators = users.filter(u => u.role === 'Operador');\n    if (operators.length > 0 && !operators.find(u => u.username === dqAssignedTo)) {\n      setDqAssignedTo(operators[0].username);\n    }\n  }, [users, dqAssignedTo]);"
);

fs.writeFileSync('src/components/ModuleIngenieria.tsx', code);
