const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace("import { db } from './lib/firebase';", "import { supabase } from './lib/supabase';");
code = code.replace("import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';", "");

const snapshotRegex = /if \(!db\.app\) \{[\s\S]*?const unsub = onSnapshot\(doc\(db, 'erp', 'core_state'\), \(docSnap\) => \{[\s\S]*?if \(docSnap\.exists\(\)\) \{[\s\S]*?isSyncingRef\.current = true;[\s\S]*?const data = docSnap\.data\(\);([\s\S]*?)setTimeout\(\(\) => \{[\s\S]*?isSyncingRef\.current = false;[\s\S]*?\}, 500\);[\s\S]*?\}[\s\S]*?setIsAppLoaded\(true\);[\s\S]*?\}, \(error\) => \{[\s\S]*?console\.error\("Firebase sync error:", error\);[\s\S]*?setIsAppLoaded\(true\);[\s\S]*?\}\);[\s\S]*?return \(\) => unsub\(\);/m;

const snapshotReplacement = `if (!supabase) {
      setIsAppLoaded(true);
      return () => {};
    }

    const loadData = async () => {
      const { data: row, error } = await supabase.from('core_state').select('data').eq('id', 'singleton').single();
      if (!error && row && row.data) {
        isSyncingRef.current = true;
        const data = row.data;
$1        setTimeout(() => {
          isSyncingRef.current = false;
        }, 500);
      }
      setIsAppLoaded(true);
    };
    
    loadData();

    const channel = supabase.channel('core_state_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'core_state' }, (payload) => {
        if (payload.new && payload.new.data) {
          isSyncingRef.current = true;
          const data = payload.new.data;
$1          setTimeout(() => {
            isSyncingRef.current = false;
          }, 500);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };`;

code = code.replace(snapshotRegex, snapshotReplacement);

const saveRegex = /if \(!isAppLoaded \|\| isSyncingRef\.current \|\| !db\.app\) return;[\s\S]*?const syncData = async \(\) => \{[\s\S]*?try \{[\s\S]*?const payload = JSON\.parse\(JSON\.stringify\(\{([\s\S]*?)\}\)\);[\s\S]*?await setDoc\(doc\(db, 'erp', 'core_state'\), payload, \{ merge: true \}\);[\s\S]*?\} catch \(err\) \{[\s\S]*?console\.error\("Error saving to Firebase", err\);[\s\S]*?\}[\s\S]*?\};/m;

const saveReplacement = `if (!isAppLoaded || isSyncingRef.current || !supabase) return;
    const syncData = async () => {
      try {
        const payload = JSON.parse(JSON.stringify({$1}));
        await supabase.from('core_state').upsert({ id: 'singleton', data: payload });
      } catch (err) {
        console.error("Error saving to Supabase", err);
      }
    };`;

code = code.replace(saveRegex, saveReplacement);
fs.writeFileSync('src/App.tsx', code);
