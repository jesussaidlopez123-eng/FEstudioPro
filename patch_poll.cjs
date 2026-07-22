const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const replaceStr = `    return () => { supabase.removeChannel(channel); };`;
const newStr = `    // Fallback polling every 10 seconds in case Realtime is disabled
    const interval = setInterval(async () => {
      if (isSyncingRef.current) return;
      const { data: row, error } = await supabase.from('core_state').select('data').eq('id', 'singleton').single();
      if (!error && row && (row as any).data) {
        isSyncingRef.current = true;
        const data = (row as any).data;
        if (data.fichas) setFichasTecnicas(data.fichas);
        if (data.orders) setOrders(data.orders);
        if (data.tasks) setProductionTasks(data.tasks);
        if (data.transactions) setTransactions(data.transactions);
        if (data.alerts) setAlerts(data.alerts);
        if (data.users) setUsers(data.users);
        if (data.okrs) setOkrs(data.okrs);
        setTimeout(() => { isSyncingRef.current = false; }, 500);
      }
    }, 10000);

    return () => { 
      supabase.removeChannel(channel); 
      clearInterval(interval);
    };`;

if(code.includes(replaceStr)) {
    code = code.replace(replaceStr, newStr);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Patched App.tsx polling");
} else {
    console.log("Could not patch App.tsx");
}
