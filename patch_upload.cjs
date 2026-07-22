const fs = require('fs');
let code = fs.readFileSync('src/components/ModuleIngenieria.tsx', 'utf-8');

// Replace handleImageFileChange
const replaceFileChange = /const handleImageFileChange = async \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?\}\s*};\s*const removeReferenceImage/gm;

const newFileChange = `const [isUploading, setIsUploading] = useState(false);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setIsUploading(true);
      const filesArray = Array.from(files);
      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i] as File;
        if (file.type.startsWith('image/')) {
          try {
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
          } catch (e: any) {
            console.error('Image upload failed', e);
            alert(\`Error al subir la imagen: \${e?.message || 'Error de conexión.'}\`);
          }
        }
      }
      setIsUploading(false);
      // Reset input so same file can be uploaded again
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  const removeReferenceImage`;

code = code.replace(replaceFileChange, newFileChange);

// Replace handleImageDrop
const replaceDrop = /const handleImageDrop = async \(e: React\.DragEvent\) => \{[\s\S]*?\}\s*};\s*const loadDemoImages/gm;

const newDrop = `const handleImageDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files) {
      setIsUploading(true);
      const filesArray = Array.from(files);
      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i] as File;
        if (file.type.startsWith('image/')) {
          try {
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
          } catch (err: any) {
            console.error('Image upload failed', err);
            alert(\`Error al subir la imagen: \${err?.message || 'Error de conexión.'}\`);
          }
        }
      }
      setIsUploading(false);
    }
  };

  const loadDemoImages`;

code = code.replace(replaceDrop, newDrop);

fs.writeFileSync('src/components/ModuleIngenieria.tsx', code);
