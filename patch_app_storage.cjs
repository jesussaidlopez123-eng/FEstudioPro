const fs = require('fs');
let code = fs.readFileSync('src/components/ModuleIngenieria.tsx', 'utf-8');

const importSupabase = `import { supabase } from '../lib/supabase';`;
if (!code.includes(importSupabase)) {
  code = code.replace("import { FichaTecnica, AppUser } from '../types';", "import { FichaTecnica, AppUser } from '../types';\n" + importSupabase);
}

const replaceFetch = /const formData = new FormData\(\);[\s\S]*?formData\.append\('image', file\);[\s\S]*?try \{[\s\S]*?const res = await fetch\('\/api\/upload', \{[\s\S]*?method: 'POST',[\s\S]*?body: formData[\s\S]*?\}\);[\s\S]*?if \(res\.ok\) \{[\s\S]*?const data = await res\.json\(\);[\s\S]*?setReferenceImages\(prev => \[\.\.\.prev, data\.url\]\);[\s\S]*?const cleanName = file\.name\.substring\(0, file\.name\.lastIndexOf\('\.'\)\) \|\| file\.name;[\s\S]*?setReferenceImageNames\(prev => \[\.\.\.prev, cleanName\]\);[\s\S]*?\} else \{[\s\S]*?throw new Error\('Server returned ' \+ res\.status\);[\s\S]*?\}[\s\S]*?\} catch \(e: any\) \{/gm;

const replaceFetch2 = /const formData = new FormData\(\);[\s\S]*?formData\.append\('image', file\);[\s\S]*?try \{[\s\S]*?const res = await fetch\('\/api\/upload', \{[\s\S]*?method: 'POST',[\s\S]*?body: formData[\s\S]*?\}\);[\s\S]*?if \(res\.ok\) \{[\s\S]*?const data = await res\.json\(\);[\s\S]*?setReferenceImages\(prev => \[\.\.\.prev, data\.url\]\);[\s\S]*?const cleanName = file\.name\.substring\(0, file\.name\.lastIndexOf\('\.'\)\) \|\| file\.name;[\s\S]*?setReferenceImageNames\(prev => \[\.\.\.prev, cleanName\]\);[\s\S]*?\} else \{[\s\S]*?throw new Error\('Server returned ' \+ res\.status\);[\s\S]*?\}[\s\S]*?\} catch \(err: any\) \{/gm;


const newStorageCode = `try {
            if (!supabase) throw new Error("Supabase no configurado");
            
            const fileExt = file.name.split('.').pop();
            const fileName = \`\${Math.random()}.\${fileExt}\`;
            const filePath = \`engineering/\${fileName}\`;

            const { error: uploadError } = await supabase.storage
              .from('uploads')
              .upload(filePath, file);
              
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
              .from('uploads')
              .getPublicUrl(filePath);

            setReferenceImages(prev => [...prev, publicUrl]);
            const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            setReferenceImageNames(prev => [...prev, cleanName]);
          } catch (e: any) {`;

code = code.replace(replaceFetch, newStorageCode);

const newStorageCode2 = `try {
            if (!supabase) throw new Error("Supabase no configurado");
            
            const fileExt = file.name.split('.').pop();
            const fileName = \`\${Math.random()}.\${fileExt}\`;
            const filePath = \`engineering/\${fileName}\`;

            const { error: uploadError } = await supabase.storage
              .from('uploads')
              .upload(filePath, file);
              
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
              .from('uploads')
              .getPublicUrl(filePath);

            setReferenceImages(prev => [...prev, publicUrl]);
            const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            setReferenceImageNames(prev => [...prev, cleanName]);
          } catch (err: any) {`;

code = code.replace(replaceFetch2, newStorageCode2);

fs.writeFileSync('src/components/ModuleIngenieria.tsx', code);
