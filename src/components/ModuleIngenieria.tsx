/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Ruler, Plus, Eye, List, PenTool, Trash2, Clipboard, Box, Check, Cpu, 
  AlertCircle, FileText, Folder, LayoutGrid, Search, Download, ArrowRight, 
  Clock, ArrowUpRight, CheckCircle2, CloudUpload, HelpCircle, Briefcase,
  FileCode2, Sliders, ChevronRight, Menu, HelpCircle as HelpIcon, Layers,
  Paperclip
} from 'lucide-react';
import { FichaTecnica } from '../types';

interface ModuleIngenieriaProps {
  fichasTecnicas: FichaTecnica[];
  onAddFicha: (ficha: FichaTecnica) => void;
  onDeleteFicha: (id: string) => void;
  userRole: 'Admin' | 'Operador';
  onAddTaskToQueue: (ficha: FichaTecnica, clientName: string, quantity: number, assignedTo?: string) => void;
}

type DriveFolder = 'todos' | 'escritorios' | 'mesas' | 'credenzas_sillas';

export default function ModuleIngenieria({
  fichasTecnicas,
  onAddFicha,
  onDeleteFicha,
  userRole,
  onAddTaskToQueue
}: ModuleIngenieriaProps) {
  const [selectedFicha, setSelectedFicha] = useState<FichaTecnica | null>(fichasTecnicas[0] || null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<DriveFolder>('todos');

  // Drag-and-drop Queue State
  const [queueingFicha, setQueueingFicha] = useState<FichaTecnica | null>(null);
  const [queueClientName, setQueueClientName] = useState('Público General');
  const [queueQuantity, setQueueQuantity] = useState(1);
  const [queueAssignedTo, setQueueAssignedTo] = useState('Jorge Salmero');

  // PDF Extraction Loading States
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [extractionLog, setExtractionLog] = useState('');
  const [showDirectQueueForm, setShowDirectQueueForm] = useState(false);
  
  // Direct queue form simplified state
  const [dqName, setDqName] = useState('');
  const [dqDifficulty, setDqDifficulty] = useState<'Baja' | 'Media' | 'Alta'>('Media');
  const [dqDescription, setDqDescription] = useState('');
  const [dqInstrucciones, setDqInstrucciones] = useState('');
  const [dqClientName, setDqClientName] = useState('Público General');
  const [dqQuantity, setDqQuantity] = useState(1);
  const [dqAssignedTo, setDqAssignedTo] = useState('Jorge Salmero');
  const [dqPdfName, setDqPdfName] = useState('plano_diseno.pdf');
  const [dqPdfSize, setDqPdfSize] = useState('1.8 MB');

  // Form fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(10);
  const [difficulty, setDifficulty] = useState<'Baja' | 'Media' | 'Alta'>('Media');
  const [structuredInstructions, setStructuredInstructions] = useState<{ title: string; description: string; materials: string; image?: string }[]>([
    { title: 'Corte de perfiles', description: 'Cortar tubos de PTR a 1.5" según las especificaciones del plano.', materials: 'Tubos PTR de 1.5 pulgadas', image: '' },
    { title: 'Soldadura de base', description: 'Soldar la estructura de soporte y niveladores con proceso MIG.', materials: 'Microalambre MIG, gas argón/CO2', image: '' },
    { title: 'Acabado y Pintura', description: 'Limpiar cordones de soldadura y aplicar pintura electrostática mate.', materials: 'Pintura electrostática negro mate', image: '' }
  ]);

  const parseRawInstructionsToStructured = (rawText: string) => {
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    return lines.map(line => {
      try {
        const parsed = JSON.parse(line);
        if (parsed && typeof parsed === 'object' && 'title' in parsed) {
          return {
            title: parsed.title || '',
            description: parsed.description || '',
            materials: parsed.materials || '',
            image: parsed.image || ''
          };
        }
      } catch (e) {}

      let cleanLine = line.replace(/^\d+[\.\)\s\-]+/, '').trim();
      const colonIndex = cleanLine.indexOf(':');
      if (colonIndex !== -1 && colonIndex < 45) {
        return {
          title: cleanLine.substring(0, colonIndex).trim(),
          description: cleanLine.substring(colonIndex + 1).trim(),
          materials: '',
          image: ''
        };
      } else {
        return {
          title: cleanLine,
          description: '',
          materials: '',
          image: ''
        };
      }
    });
  };

  const mapTemplateToStructured = (instruccionesRaw: string, templateMaterials: { material: string; quantity: string }[]) => {
    const steps = parseRawInstructionsToStructured(instruccionesRaw);
    
    // Distribute materials to steps based on keyword matches
    return steps.map(step => {
      const stepText = (step.title + ' ' + step.description).toLowerCase();
      const matchedMats: string[] = [];

      templateMaterials.forEach(m => {
        const matLower = m.material.toLowerCase();
        let matches = false;

        if (matLower.includes('ptr') || matLower.includes('perfil') || matLower.includes('acero') || matLower.includes('barra') || matLower.includes('metal') || matLower.includes('tubo')) {
          if (stepText.includes('corte') || stepText.includes('perfil') || stepText.includes('solda') || stepText.includes('estructura') || stepText.includes('metal') || stepText.includes('chasis')) {
            matches = true;
          }
        }
        if (matLower.includes('madera') || matLower.includes('mdf') || matLower.includes('encino') || matLower.includes('parota') || matLower.includes('pino') || matLower.includes('triplay') || matLower.includes('tabl') || matLower.includes('cubierta')) {
          if (stepText.includes('madera') || stepText.includes('cubierta') || stepText.includes('lij') || stepText.includes('barniz') || stepText.includes('carpinteria') || stepText.includes('corte') || stepText.includes('tabl') || stepText.includes('ensamb')) {
            matches = true;
          }
        }
        if (matLower.includes('pintura') || matLower.includes('barniz') || matLower.includes('laca') || matLower.includes('sellador') || matLower.includes('tinta') || matLower.includes('esmalte') || matLower.includes('aceite')) {
          if (stepText.includes('pintur') || stepText.includes('barniz') || stepText.includes('acabad') || stepText.includes('laca') || stepText.includes('sellador') || stepText.includes('esmalte') || stepText.includes('aceite') || stepText.includes('pulid')) {
            matches = true;
          }
        }
        if (matLower.includes('tornillo') || matLower.includes('perno') || matLower.includes('bisa') || matLower.includes('herraje') || matLower.includes('nivelador') || matLower.includes('riel') || matLower.includes('pata')) {
          if (stepText.includes('tornill') || stepText.includes('perno') || stepText.includes('bisa') || stepText.includes('ensamb') || stepText.includes('instala') || stepText.includes('fijac') || stepText.includes('mont') || stepText.includes('ajuste')) {
            matches = true;
          }
        }

        if (matches) {
          matchedMats.push(`${m.material} (${m.quantity})`);
        }
      });

      return {
        ...step,
        materials: matchedMats.join(', ')
      };
    });
  };

  const handleAddInstructionRow = () => {
    setStructuredInstructions(prev => [...prev, { title: '', description: '', materials: '', image: '' }]);
  };

  const handleRemoveInstructionRow = (index: number) => {
    if (structuredInstructions.length > 1) {
      setStructuredInstructions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleInstructionChange = (index: number, field: 'title' | 'description' | 'materials' | 'image', value: string) => {
    setStructuredInstructions(prev => prev.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };
  
  // Simulated uploaded file
  const [uploadedFile, setUploadedFile] = useState<{name: string, size: string} | null>(null);
  const [isFormFileDragOver, setIsFormFileDragOver] = useState(false);

  // Reference images for manual uploading
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [referenceImageNames, setReferenceImageNames] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((fileItem: any) => {
        const file = fileItem as File;
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              setReferenceImages(prev => [...prev, reader.result as string]);
              const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
              setReferenceImageNames(prev => [...prev, cleanName]);
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const removeReferenceImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
    setReferenceImageNames(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files) {
      Array.from(files).forEach((fileItem: any) => {
        const file = fileItem as File;
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              setReferenceImages(prev => [...prev, reader.result as string]);
              const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
              setReferenceImageNames(prev => [...prev, cleanName]);
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const loadDemoImages = () => {
    const demoUrls = [
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=500&q=80'
    ];
    setReferenceImages(prev => [...prev, ...demoUrls]);
    setReferenceImageNames(prev => [...prev, 'Foto Mesa', 'Ensamble Estructura', 'Acabado Final']);
  };

  // Preview tab for the technical sheet modal
  const [previewTab, setPreviewTab] = useState<'blueprint' | 'images'>('images');
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Auto adjust preview tabs on active sheet change
  React.useEffect(() => {
    if (selectedFicha) {
      setPreviewTab(selectedFicha.referenceImages && selectedFicha.referenceImages.length > 0 ? 'images' : 'blueprint');
      setActivePhotoIdx(0);
    }
  }, [selectedFicha]);

  // Refs for file uploads
  const mainFileInputRef = useRef<HTMLInputElement>(null);

  // Materials list builder
  const [materials, setMaterials] = useState<{ material: string; quantity: string }[]>([
    { material: '', quantity: '' }
  ]);
  const [error, setError] = useState('');

  // Guide and template state
  const [showFormatGuide, setShowFormatGuide] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'estructura' | 'plantilla' | 'ejemplo'>('estructura');

  const handleAddMaterialRow = () => {
    setMaterials([...materials, { material: '', quantity: '' }]);
  };

  const handleRemoveMaterialRow = (index: number) => {
    const newMaterials = [...materials];
    newMaterials.splice(index, 1);
    setMaterials(newMaterials);
  };

  const handleMaterialChange = (index: number, field: 'material' | 'quantity', value: string) => {
    const newMaterials = [...materials];
    newMaterials[index][field] = value;
    setMaterials(newMaterials);
  };

  // Helper to resolve detailed instructions and specs based on filename
  const getFichaTemplateForFile = (fileName: string) => {
    const nameLower = fileName.toLowerCase();
    if (nameLower.includes('tutorial') || nameLower.includes('modelo') || nameLower.includes('ejemplo') || nameLower.includes('guide') || nameLower.includes('formato')) {
      return {
        name: "Mesa de Juntas Modelo F-Estudio",
        code: "MES-FESTUDIO-01",
        difficulty: "Media" as const,
        dimensions: "180 x 90 x 75 cm",
        estimatedHours: 8,
        description: "Mesa de juntas de alto diseño con estructura metálica modular de PTR 2x2\" y cubierta de madera de encino con cantos invertidos.",
        materials: [
          { material: "Perfil de acero PTR 2x2\" Calibre 14", quantity: "3 barras" },
          { material: "Tablero MDF Enchapado de Encino 18mm", quantity: "1 unidad" },
          { material: "Pintura electrostática negro microtextura", quantity: "1 lote" },
          { material: "Tornillos cabeza de coche 5/16\"", quantity: "16 piezas" }
        ],
        instrucciones: "1. Habilitar perfiles de acero PTR según la lista de corte del plano\n2. Realizar escuadres a 90 grados y soldar soportes laterales con proceso MIG\n3. Soldar travesaños longitudinales de refuerzo para chasis de cubierta\n4. Esmerilar y limpiar cordones de soldadura con disco flap grano 80\n5. Aplicar pintura electrostática en polvo negro microtexturizado y hornear a 180°C\n6. Cortar cubierta de MDF y pegar chapa de encino natural con pegamento de contacto\n7. Lijar la madera en grano 120, 180 y 240 preparando la superficie\n8. Aplicar fondo sellador de poliuretano a dos manos y asentar con lija 320\n9. Aplicar dos manos de barniz de poliuretano de acabado mate\n10. Presentar y atornillar la cubierta metálica al chasis usando tornillos de 5/16\""
      };
    }
    if (nameLower.includes('escritorio') || nameLower.includes('esc') || nameLower.includes('ensamble') || nameLower.includes('pro')) {
      return {
        name: "Escritorio Ensamble Pro V1",
        code: `ESC-${Math.floor(100 + Math.random() * 900)}`,
        difficulty: "Media" as const,
        dimensions: "140 x 70 x 75 cm",
        estimatedHours: 6,
        description: "Escritorio de oficina con estructura metálica de PTR y cubierta de madera de encino barnizada.",
        materials: [
          { material: "Tubo de acero PTR 2x1\"", quantity: "2 barras" },
          { material: "Placa de madera de Encino 140x70 cm", quantity: "1 unidad" },
          { material: "Tornillos Allen 1/4\"", quantity: "12 piezas" },
          { material: "Niveladores para patas", quantity: "4 patas" }
        ],
        instrucciones: "1. Cortar perfiles PTR para patas y soporte según plano\n2. Realizar soldadura MIG en las uniones de las patas\n3. Esmerilar y pulir uniones soldadas para acabado liso\n4. Aplicar pintura electrostática negro mate a la estructura\n5. Cortar y lijar la cubierta de madera de encino\n6. Aplicar 2 capas de barniz de poliuretano brillante\n7. Ensamble final: atornillar cubierta a la estructura metálica"
      };
    } else if (nameLower.includes('mesa') || nameLower.includes('mes') || nameLower.includes('diseno') || nameLower.includes('final') || nameLower.includes('industrial') || nameLower.includes('cad')) {
      return {
        name: "Mesa Industrial CAD",
        code: `MES-${Math.floor(100 + Math.random() * 900)}`,
        difficulty: "Alta" as const,
        dimensions: "200 x 100 x 75 cm",
        estimatedHours: 12,
        description: "Mesa de juntas de diseño industrial con patas en X soldadas y cubierta robusta de parota sólida.",
        materials: [
          { material: "Perfil PTR de acero 3x3\"", quantity: "3 barras" },
          { material: "Cubierta sólida de madera de Parota", quantity: "1 unidad" },
          { material: "Pernos de anclaje de alta resistencia", quantity: "8 piezas" },
          { material: "Aceite de linaza protector", quantity: "1 litro" }
        ],
        instrucciones: "1. Cortar PTR de 3x3 pulgadas para formar las patas en X\n2. Soldar y reforzar la viga central de la base de acero\n3. Biselar los bordes de la base metálica\n4. Pintura al horno anticorrosivo color gris grafito\n5. Cepillar y nivelar el tablón de madera de parota\n6. Aplicar acabado de aceite de linaza y sellador\n7. Unir estructura metálica con cubierta usando pernos"
      };
    } else if (nameLower.includes('credenza') || nameLower.includes('cre') || nameLower.includes('corte') || nameLower.includes('ptr')) {
      return {
        name: "Credenza de Acero PTR",
        code: `CRE-${Math.floor(100 + Math.random() * 900)}`,
        difficulty: "Alta" as const,
        dimensions: "160 x 45 x 85 cm",
        estimatedHours: 10,
        description: "Credenza minimalista de acero y paneles de pino, con puertas corredizas y estante interno.",
        materials: [
          { material: "Ángulo de acero de 1.5\"", quantity: "2 barras" },
          { material: "Lámina de acero calibre 18", quantity: "1 hoja" },
          { material: "Tablones de madera de Pino de 3/4\"", quantity: "4 unidades" },
          { material: "Rieles para puertas corredizas", quantity: "2 juegos" }
        ],
        instrucciones: "1. Cortar ángulos y láminas de acero según plantilla\n2. Armar la estructura del cajón metálico principal mediante soldadura de punto\n3. Instalar rieles y soportes para estantes internos\n4. Pulido completo y aplicación de esmalte de poliuretano\n5. Cortar y barnizar los listones de pino para los laterales y puertas\n6. Montar los paneles de madera sobre el esqueleto metálico\n7. Ajuste de puertas corredizas y nivelación"
      };
    } else if (nameLower.includes('silla') || nameLower.includes('sil') || nameLower.includes('carpinteria') || nameLower.includes('encino')) {
      return {
        name: "Silla de Encino Premium",
        code: `SIL-${Math.floor(100 + Math.random() * 900)}`,
        difficulty: "Baja" as const,
        dimensions: "45 x 45 x 90 cm",
        estimatedHours: 4,
        description: "Silla ergonómica de carpintería fina fabricada en madera de encino con herrajes ocultos.",
        materials: [
          { material: "Madera sólida de Encino", quantity: "1.5 docenas" },
          { material: "Pegamento industrial para madera", quantity: "0.5 litros" },
          { material: "Herrajes de unión ocultos Minifix", quantity: "8 piezas" },
          { material: "Tela de tapicería premium gris", quantity: "1 metro" }
        ],
        instrucciones: "1. Cortar y torneado de patas traseras y delanteras\n2. Maquinar cajas y espigas para ensambles tradicionales\n3. Armado previo de la estructura de madera para verificar cuadre\n4. Encolado definitivo y prensado por 12 horas\n5. Lijado orbital de grano 80 a 220\n6. Tapizado del asiento con espuma de alta densidad y tela gris\n7. Montar el asiento tapizado y aplicar laca mate protectora"
      };
    } else {
      return {
        name: "Estructura Modular Multipropósito",
        code: `MOD-${Math.floor(100 + Math.random() * 900)}`,
        difficulty: "Media" as const,
        dimensions: "100 x 50 x 50 cm",
        estimatedHours: 8,
        description: "Mueble multifuncional con estructura tubular de acero galvanizado y charolas ajustables.",
        materials: [
          { material: "Tubo galvanizado de 1\"", quantity: "2 barras" },
          { material: "Lámina de acero desplegada", quantity: "2 hojas" },
          { material: "Abrazaderas ajustables", quantity: "12 piezas" }
        ],
        instrucciones: "1. Cortar tubos redondos a longitudes especificadas\n2. Soldar soportes de charolas en las uniones tubulares\n3. Esmerilar rebabas en los puntos de soldadura\n4. Pintura protectora anticorrosiva gris\n5. Montar lámina desplegada para charolas de almacenamiento\n6. Colocar tapones plásticos en las puntas de soporte\n7. Control de calidad y empaque"
      };
    }
  };

  // Perform PDF text & instruction extraction simulation with loading phases
  const executePDFExtraction = (fileName: string, fileSize: string, isForQueueDirect: boolean = false) => {
    setIsExtracting(true);
    setExtractionProgress(15);
    setExtractionLog('Abriendo plano vectorial PDF e interpretando capas CAD...');

    setTimeout(() => {
      setExtractionProgress(50);
      setExtractionLog('Procesando metadatos estructurales e identificando "Instrucciones de Trabajo"...');
    }, 500);

    setTimeout(() => {
      setExtractionProgress(85);
      setExtractionLog('Dividiendo pasos de fabricación e identificando materiales clave (BOM)...');
    }, 1100);

    setTimeout(() => {
      setIsExtracting(false);
      setExtractionProgress(100);

      const template = getFichaTemplateForFile(fileName);
      
      if (isForQueueDirect) {
        // Populates direct queue form states (ultra-simple workflow requested by user!)
        setDqName(template.name);
        setDqDifficulty(template.difficulty);
        setDqDescription(template.description);
        setDqInstrucciones(template.instrucciones);
        setDqClientName('Público General');
        setDqQuantity(1);
        setDqPdfName(fileName);
        setDqPdfSize(fileSize);
        setShowDirectQueueForm(true);
      } else {
        // Populates main design form states
        setUploadedFile({ name: fileName, size: fileSize });
        setName(template.name);
        setCode(template.code);
        setDifficulty(template.difficulty);
        setDimensions(template.dimensions);
        setEstimatedHours(template.estimatedHours);
        setDescription(template.description);
        setMaterials(template.materials);
        setStructuredInstructions(mapTemplateToStructured(template.instrucciones, template.materials));
      }
    }, 1500);
  };

  // Drag and Drop files onto Form
  const handleFormFileDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsFormFileDragOver(true);
  };

  const handleFormFileDragLeave = () => {
    setIsFormFileDragOver(false);
  };

  const handleFormFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsFormFileDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        executePDFExtraction(file.name, `${(file.size / (1024 * 1024)).toFixed(1)} MB`, false);
      } else {
        alert('Por favor carga un archivo PDF válido.');
      }
    }
  };

  const triggerSimulatedPdfUpload = () => {
    const fileNames = [
      'PLANO_ENSAMBLE_PRO_V1.pdf',
      'DISEÑO_INDUSTRIAL_CAD_FINAL.pdf',
      'CORTE_PTR_ESPECIFICACIONES.pdf',
      'DETALLE_CARPINTERIA_ENCINO.pdf'
    ];
    const randomName = fileNames[Math.floor(Math.random() * fileNames.length)];
    const randomSize = `${(1.2 + Math.random() * 3).toFixed(1)} MB`;
    executePDFExtraction(randomName, randomSize, false);
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError('Por favor, completa todos los campos del encabezado.');
      return;
    }

    // Compile materials dynamically from each step to preserve BOM capability in other modules
    const compiledMaterials = structuredInstructions
      .filter(inst => inst && (inst.materials || '').trim() !== '')
      .map(inst => ({
        material: (inst.materials || '').trim(),
        quantity: `Paso: ${(inst.title || '').trim() || 'General'}`
      }));

    // Fallback if no materials are provided in any step
    const finalMaterials = compiledMaterials.length > 0 ? compiledMaterials : [
      { material: 'Materiales estructurales según instrucciones', quantity: '1 lote' }
    ];

    // Compile structured instructions using robust JSON serialization for materials-to-step association
    const parsedInstructions = structuredInstructions
      .map(inst => {
        const title = (inst.title || '').trim();
        const desc = (inst.description || '').trim();
        const mat = (inst.materials || '').trim();
        const img = (inst.image || '').trim();
        if (!title) return '';
        return JSON.stringify({ title, description: desc, materials: mat, image: img });
      })
      .filter(line => line.length > 0);

    const newFicha: FichaTecnica = {
      id: `ft-${Date.now()}`,
      name: name.trim(),
      code: code.toUpperCase().trim(),
      description: description.trim(),
      dimensions: dimensions.trim() || 'Estándar',
      estimatedHours: Number(estimatedHours) || 8,
      difficulty,
      materials: finalMaterials,
      pdfName: uploadedFile?.name || 'Carga Manual',
      pdfSize: uploadedFile?.size || 'Sin PDF',
      uploadedAt: new Date().toISOString().split('T')[0],
      instruccionesTrabajo: parsedInstructions.length > 0 ? parsedInstructions : [
        JSON.stringify({ title: 'Habilitado de perfiles de acero', description: 'Cortes iniciales', materials: 'Tubos PTR' }),
        JSON.stringify({ title: 'Soldadura y ensamble base metal', description: 'Ensamble de estructura', materials: 'Microalambre' }),
        JSON.stringify({ title: 'Tratamiento y acabado final', description: 'Pintura y acabados', materials: 'Pintura electrostática' })
      ],
      referenceImages: referenceImages.length > 0 ? referenceImages : undefined,
      referenceImageNames: referenceImages.length > 0 ? referenceImageNames : undefined
    };

    onAddFicha(newFicha);
    setSelectedFicha(newFicha); // Auto-focus new spec sheet
    setShowAddForm(false);
    
    // Reset form
    setName('');
    setCode('');
    setDescription('');
    setDimensions('');
    setEstimatedHours(10);
    setDifficulty('Media');
    setStructuredInstructions([
      { title: '', description: '', materials: '' },
      { title: '', description: '', materials: '' },
      { title: '', description: '', materials: '' }
    ]);
    setUploadedFile(null);
    setReferenceImages([]);
    setReferenceImageNames([]);
    setError(null);
    setMaterials([{ material: '', quantity: '' }]);
    setError('');
  };

  // Drag and Drop from Grid to Queue
  const handleFichaDragStart = (e: React.DragEvent, ficha: FichaTecnica) => {
    e.dataTransfer.setData('text/plain', ficha.id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const triggerDirectQueue = (ficha: FichaTecnica) => {
    setQueueingFicha(ficha);
    setQueueClientName('Público General');
    setQueueQuantity(1);
  };

  const confirmQueueSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queueingFicha) return;
    onAddTaskToQueue(queueingFicha, queueClientName, queueQuantity, queueAssignedTo);
    setQueueingFicha(null);
  };

  const handleDirectQueueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dqName.trim()) {
      alert('Por favor completa los campos del diseño.');
      return;
    }

    const parsedInstructions = dqInstrucciones
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => JSON.stringify({ title: line, description: '', materials: '', image: '' }));

    const codePrefix = dqName.toLowerCase().includes('escritorio') ? 'ESC' 
                     : dqName.toLowerCase().includes('mesa') ? 'MES'
                     : dqName.toLowerCase().includes('credenza') ? 'CRE'
                     : dqName.toLowerCase().includes('silla') ? 'SIL' : 'MOD';

    const newFicha: FichaTecnica = {
      id: `ft-${Date.now()}`,
      name: dqName.trim(),
      code: `${codePrefix}-${Math.floor(100 + Math.random() * 900)}`,
      description: dqDescription.trim(),
      dimensions: "120 x 60 x 75 cm", // default
      estimatedHours: dqDifficulty === 'Baja' ? 4 : dqDifficulty === 'Media' ? 8 : 16,
      difficulty: dqDifficulty,
      materials: [
        { material: "Materiales estructurales según plano", quantity: "1 lote" }
      ],
      pdfName: dqPdfName,
      pdfSize: dqPdfSize,
      uploadedAt: new Date().toISOString().split('T')[0],
      instruccionesTrabajo: parsedInstructions.length > 0 ? parsedInstructions : [
        JSON.stringify({ title: 'Habilitado de perfiles de acero', description: 'Cortes iniciales', materials: 'Tubos PTR', image: '' }),
        JSON.stringify({ title: 'Soldadura y ensamble base metal', description: 'Ensamble de estructura', materials: 'Microalambre', image: '' }),
        JSON.stringify({ title: 'Tratamiento y acabado final', description: 'Pintura y acabados', materials: 'Pintura electrostática', image: '' })
      ]
    };

    onAddFicha(newFicha);
    setSelectedFicha(newFicha);
    onAddTaskToQueue(newFicha, dqClientName, dqQuantity, dqAssignedTo);
    setShowDirectQueueForm(false);
  };

  // Folder Filtering logic
  const filteredFichas = fichasTecnicas.filter(ficha => {
    const matchesSearch = 
      ficha.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ficha.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ficha.pdfName && ficha.pdfName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (selectedFolder === 'escritorios') {
      return ficha.code.includes('ESC');
    }
    if (selectedFolder === 'mesas') {
      return ficha.code.includes('MES');
    }
    if (selectedFolder === 'credenzas_sillas') {
      return ficha.code.includes('CRE') || ficha.code.includes('SIL');
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn" id="module-ingenieria-view">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Ruler size={22} className="text-blue-500" />
            <span>Módulo 2: Diseño e Ingeniería de Producto</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gestión de planos PDF, instrucciones de trabajo, BOM y envío de fichas técnicas para el taller ("Carta Laboral").
          </p>
        </div>

        <button
          onClick={() => {
            setShowAddForm(true);
            setUploadedFile(null);
          }}
          className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer shadow-sm shadow-blue-500/10"
          id="btn-toggle-ficha-form"
        >
          <Plus size={16} />
          <span>+ Agregar Diseño con Instrucciones</span>
        </button>
      </div>

      {/* DRIVE FILE BROWSER (FULL WIDTH) */}
      <div className="space-y-6">
        
        {/* SEARCH & LAYOUT VIEW CONTROLS */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Input Bar */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar diseños, planos o fichas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs outline-none focus:border-blue-500 font-medium text-slate-700 transition-all"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(true);
                setUploadedFile(null);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-sm shadow-blue-500/10 flex-shrink-0"
              title="Agregar diseño con instrucciones de trabajo"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* View Mode & Count details */}
          <div className="flex items-center gap-4 justify-between w-full md:w-auto">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Mostrando {filteredFichas.length} de {fichasTecnicas.length} archivos
            </span>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-white text-blue-500 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                title="Vista Cuadrícula"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-white text-blue-500 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                title="Vista Lista"
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* GRID OR LIST FILE BROWSER */}
        {filteredFichas.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
            No se encontraron fichas de ingeniería que coincidan con los filtros de búsqueda.
          </div>
        ) : viewMode === 'grid' ? (
          
          /* GRID VIEW (Google Drive Style Cards) */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" id="drive-grid-view">
            {filteredFichas.map((ficha) => {
              const isSelected = selectedFicha?.id === ficha.id;
              return (
                <div
                  key={ficha.id}
                  draggable="true"
                  onDragStart={(e) => handleFichaDragStart(e, ficha)}
                  onClick={() => setSelectedFicha(ficha)}
                  className={`bg-white rounded-xl border transition-all duration-200 text-left relative flex flex-col justify-between overflow-hidden group cursor-grab active:cursor-grabbing select-none
                    ${isSelected 
                      ? 'border-blue-500 ring-2 ring-blue-500/10 shadow-md' 
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}
                  id={`drive-card-${ficha.id}`}
                >
                  {/* Header line */}
                  <div className="p-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-red-50 text-red-500 rounded border border-red-100">
                        <FileText size={14} />
                      </div>
                      <span className="text-[10px] font-mono font-extrabold text-slate-400 tracking-wider uppercase">{ficha.code}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">📝 {ficha.instruccionesTrabajo?.length || 0} pasos</span>
                    </div>
                  </div>

                  {/* PDF Blueprint Mockup Area */}
                  <div className="h-32 bg-slate-900 flex items-center justify-center relative overflow-hidden">
                    {ficha.referenceImages && ficha.referenceImages.length > 0 ? (
                      <div className="absolute inset-0">
                        <img 
                          src={ficha.referenceImages[0]} 
                          alt={ficha.name} 
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-slate-950/45"></div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 grid grid-cols-6 grid-rows-3 pointer-events-none opacity-[0.02]">
                        {Array.from({ length: 18 }).map((_, i) => (
                          <div key={i} className="border border-cyan-400"></div>
                        ))}
                      </div>
                    )}

                    <div className="absolute top-2 left-2 flex gap-1 z-10">
                      <span className="text-[8px] font-mono text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-900/40">
                        {ficha.difficulty}
                      </span>
                      <span className="text-[8px] font-mono text-indigo-400 bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-900/40">
                        ⏱️ {ficha.estimatedHours}h
                      </span>
                    </div>

                    {/* PDF Blueprint Label */}
                    <div className="text-center z-10 flex flex-col items-center">
                      <span className="text-[11px] font-bold text-white/90 font-mono tracking-wide mt-1.5 uppercase font-mono truncate max-w-[150px] drop-shadow-md">
                        {ficha.referenceImages && ficha.referenceImages.length > 0 ? '📸 Carga Manual' : (ficha.pdfName || 'PLANO.pdf')}
                      </span>
                      <span className="text-[9px] text-slate-300 mt-0.5 font-mono drop-shadow-md">
                        {ficha.referenceImages && ficha.referenceImages.length > 0 ? `${ficha.referenceImages.length} fotos ref.` : (ficha.pdfSize || '1.5 MB')}
                      </span>
                    </div>

                    {/* Hover action bar overlay */}
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFicha(ficha);
                        }}
                        className="px-2.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-[10px] font-bold flex items-center gap-1 shadow cursor-pointer"
                      >
                        <Eye size={12} />
                        <span>Vista Previa</span>
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerDirectQueue(ficha);
                        }}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-1 shadow cursor-pointer"
                      >
                        <ArrowRight size={12} />
                        <span>+ Fila</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`¿Estás seguro de que deseas eliminar el diseño "${ficha.name}"?`)) {
                            onDeleteFicha(ficha.id);
                            if (selectedFicha?.id === ficha.id) {
                              setSelectedFicha(null);
                            }
                          }
                        }}
                        className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded shadow cursor-pointer"
                        title="Eliminar Diseño"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Metadata summary */}
                  <div className="p-3.5 space-y-1">
                    <h4 className="text-xs font-bold text-slate-850 leading-tight group-hover:text-blue-600 transition-colors truncate">
                      {ficha.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-medium">
                      Dimensiones: {ficha.dimensions}
                    </p>
                    
                    <div className="flex justify-between items-center pt-2 text-[9px] text-slate-400 border-t border-slate-100 mt-2 font-mono">
                      <span>Cargado: {ficha.uploadedAt || '2026-06-12'}</span>
                      <span className="font-bold text-indigo-500 hover:underline">F. ESTUDIO</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          
          /* LIST VIEW (Table style) */
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm" id="drive-list-view">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-400 border-b border-slate-200 text-[10px] font-bold uppercase">
                  <th className="py-3 px-4">Código / Nombre</th>
                  <th className="py-3 px-4">Plano PDF</th>
                  <th className="py-3 px-4">Dimensiones</th>
                  <th className="py-3 px-4">Horas Est.</th>
                  <th className="py-3 px-4">Instrucciones</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFichas.map((ficha) => {
                  const isSelected = selectedFicha?.id === ficha.id;
                  return (
                    <tr 
                      key={ficha.id}
                      draggable="true"
                      onDragStart={(e) => handleFichaDragStart(e, ficha)}
                      onClick={() => setSelectedFicha(ficha)}
                      className={`hover:bg-slate-50 cursor-pointer select-none transition-colors
                        ${isSelected ? 'bg-blue-50/35' : ''}`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1 bg-red-50 text-red-500 rounded">
                            <FileText size={14} />
                          </div>
                          <div>
                            <div className="font-mono font-bold text-slate-400 text-[9px]">{ficha.code}</div>
                            <div className="font-bold text-slate-850">{ficha.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px]">
                          <Download size={11} className="text-slate-400" />
                          <span className="font-bold text-slate-600">{ficha.pdfName || 'plano.pdf'}</span>
                          <span className="text-[9px] text-slate-400">({ficha.pdfSize || '1.5 MB'})</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-medium">{ficha.dimensions}</td>
                      <td className="py-3 px-4 font-bold text-slate-700">{ficha.estimatedHours} hrs</td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded text-[10px]">
                          {ficha.instruccionesTrabajo?.length || 0} Pasos
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => setSelectedFicha(ficha)}
                            className="bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-500 hover:text-white px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer"
                          >
                            Ver Detalles
                          </button>
                          <button
                            onClick={() => triggerDirectQueue(ficha)}
                            className="bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-500 hover:text-white px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer"
                          >
                            + Fila
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Estás seguro de que deseas eliminar el diseño "${ficha.name}"?`)) {
                                onDeleteFicha(ficha.id);
                                if (selectedFicha?.id === ficha.id) {
                                  setSelectedFicha(null);
                                }
                              }
                            }}
                            className="text-red-500 hover:bg-red-50 p-1 border border-slate-200 hover:border-red-200 rounded transition-colors cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VENTANA EMERGENTE DE VISTA PREVIA (MODAL DETAIL POPUP) */}
      {selectedFicha && !showAddForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-[150] p-4 animate-fadeIn" onClick={() => setSelectedFicha(null)}>
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-150 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-red-50 text-red-500 rounded border border-red-100">
                  <FileText size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-extrabold text-blue-500 uppercase tracking-widest block">{selectedFicha.code}</span>
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">{selectedFicha.name}</h3>
                </div>
              </div>
              
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    triggerDirectQueue(selectedFicha);
                    setSelectedFicha(null);
                  }}
                  className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow shadow-emerald-500/15 cursor-pointer"
                >
                  <ArrowRight size={14} />
                  <span>Mandar a Fila</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(`¿Estás seguro de que deseas eliminar el diseño "${selectedFicha.name}"?`)) {
                      onDeleteFicha(selectedFicha.id);
                      setSelectedFicha(null);
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-slate-200"
                  title="Eliminar Diseño"
                >
                  <Trash2 size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFicha(null)}
                  className="text-slate-400 hover:text-slate-600 text-2xl font-light p-1 px-2.5 hover:bg-slate-150 rounded-lg transition-colors cursor-pointer"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(92vh-130px)]">
              {/* PREVIEW SELECTION TABS */}
              <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-slate-200">
                <span className="text-[10px] font-mono font-extrabold text-slate-500 uppercase tracking-wider">Visualización Técnica del Diseño</span>
                <div className="flex gap-1.5 bg-slate-200/60 p-0.5 rounded-lg border border-slate-300/40">
                  <button
                    type="button"
                    onClick={() => setPreviewTab('blueprint')}
                    className={`px-3 py-1 rounded-md text-[9px] font-extrabold uppercase transition-all cursor-pointer ${previewTab === 'blueprint' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    📐 Plano CAD / Esquema
                  </button>
                  {selectedFicha.referenceImages && selectedFicha.referenceImages.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setPreviewTab('images')}
                      className={`px-3 py-1 rounded-md text-[9px] font-extrabold uppercase transition-all cursor-pointer ${previewTab === 'images' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      📸 Fotos de Referencia ({selectedFicha.referenceImages.length})
                    </button>
                  )}
                </div>
              </div>

              {/* VIEWPORTS */}
              {previewTab === 'images' && selectedFicha.referenceImages && selectedFicha.referenceImages.length > 0 ? (
                /* Interactive Reference Photo Slider */
                <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col md:flex-row gap-5 h-[240px] overflow-hidden justify-between shadow-lg">
                  {/* Big main view */}
                  <div className="flex-1 h-full flex items-center justify-center relative overflow-hidden bg-slate-950 rounded-lg border border-slate-800/80">
                    <img 
                      src={selectedFicha.referenceImages[activePhotoIdx]} 
                      alt={`Referencia ${selectedFicha.name}`}
                      className="max-h-full max-w-full object-contain transition-all duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-2 left-2 bg-slate-900/90 px-2.5 py-1 rounded text-[9px] text-slate-300 font-mono border border-slate-800/85 shadow-sm max-w-[90%] truncate">
                      {selectedFicha.referenceImageNames && selectedFicha.referenceImageNames[activePhotoIdx]
                        ? selectedFicha.referenceImageNames[activePhotoIdx]
                        : `Foto de referencia ${activePhotoIdx + 1} de ${selectedFicha.referenceImages.length}`}
                    </div>
                  </div>
                  
                  {/* Thumbnails grid */}
                  {selectedFicha.referenceImages.length > 1 && (
                    <div className="w-full md:w-32 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto pr-1.5 h-16 md:h-full justify-start py-0.5">
                      {selectedFicha.referenceImages.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActivePhotoIdx(idx)}
                          className={`relative h-12 w-12 md:h-16 md:w-full rounded-lg border overflow-hidden flex-shrink-0 cursor-pointer transition-all
                            ${activePhotoIdx === idx ? 'border-blue-500 ring-2 ring-blue-500/10 scale-95 shadow-md' : 'border-slate-800 hover:border-slate-700'}`}
                        >
                          <img 
                            src={img} 
                            alt={`Miniatura ${idx + 1}`} 
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Dynamic CAD Blueprint Simulator */
                <div className="bg-slate-950 rounded-lg p-5 border border-slate-800 text-center relative overflow-hidden flex flex-col justify-between h-[200px]" id="blueprint-schematic">
                  <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 pointer-events-none opacity-[0.03]">
                    {Array.from({ length: 72 }).map((_, i) => (
                      <div key={i} className="border border-cyan-400"></div>
                    ))}
                  </div>

                  <div className="z-10 flex justify-between items-center text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest">
                    <span>Esquema Técnico de Ensamble</span>
                    <span>F. ESTUDIO BLUEPRINT // CAD-0{selectedFicha.code.split('-').pop()}</span>
                  </div>

                  <div className="z-10 flex items-center justify-center my-1 relative h-24">
                    {selectedFicha.code.includes('ESC') ? (
                      <svg className="h-full w-48 text-cyan-400/80" viewBox="0 0 100 50">
                        <rect x="10" y="10" width="80" height="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        <line x1="18" y1="16" x2="18" y2="44" stroke="currentColor" strokeWidth="1.5" />
                        <line x1="24" y1="16" x2="24" y2="44" stroke="currentColor" strokeWidth="1.5" />
                        <line x1="76" y1="16" x2="76" y2="44" stroke="currentColor" strokeWidth="1.5" />
                        <line x1="82" y1="16" x2="82" y2="44" stroke="currentColor" strokeWidth="1.5" />
                        <line x1="24" y1="20" x2="76" y2="20" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
                        <path d="M 10 5 L 10 3 M 90 5 L 90 3 M 10 4 L 90 4" fill="none" stroke="#06b6d4" strokeWidth="0.5" />
                        <text x="50" y="2" fill="#06b6d4" className="text-[4px] font-mono" textAnchor="middle">{selectedFicha.dimensions.split('x')[0]}m</text>
                      </svg>
                    ) : selectedFicha.code.includes('MES') ? (
                      <svg className="h-full w-48 text-cyan-400/80" viewBox="0 0 100 50">
                        <polygon points="5,12 95,12 91,18 9,18" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        <line x1="20" y1="18" x2="35" y2="44" stroke="currentColor" strokeWidth="1.5" />
                        <line x1="80" y1="18" x2="65" y2="44" stroke="currentColor" strokeWidth="1.5" />
                        <line x1="35" y1="44" x2="65" y2="44" stroke="currentColor" strokeWidth="1.5" />
                        <line x1="20" y1="18" x2="50" y2="44" stroke="currentColor" strokeWidth="1" strokeDasharray="2 1" />
                        <line x1="80" y1="18" x2="50" y2="44" stroke="currentColor" strokeWidth="1" strokeDasharray="2 1" />
                      </svg>
                    ) : (
                      <svg className="h-full w-48 text-cyan-400/80" viewBox="0 0 100 50">
                        <rect x="25" y="8" width="50" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        <line x1="50" y1="8" x2="50" y2="44" stroke="currentColor" strokeWidth="1" />
                        <circle cx="47" cy="26" r="1" fill="currentColor" />
                        <circle cx="53" cy="26" r="1" fill="currentColor" />
                      </svg>
                    )}
                  </div>

                  <div className="z-10 flex justify-between text-[8px] font-mono text-slate-500">
                    <span>PLANO PDF ASOCIADO: {selectedFicha.pdfName || 'plano.pdf'} ({selectedFicha.pdfSize || '1.5 MB'})</span>
                    <span>INGENIERÍA F. ESTUDIO</span>
                  </div>
                </div>
              )}

              {/* THREE COLUMN TECHNICAL VIEW */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Technical Specs */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Clipboard size={14} className="text-blue-500" />
                    <span>Especificaciones</span>
                  </h4>

                  <div className="bg-slate-50 rounded-lg p-4 space-y-3 border border-slate-100 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-500">Dimensiones:</span>
                      <span className="font-extrabold text-slate-800">{selectedFicha.dimensions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-500">Horas Estimadas:</span>
                      <span className="font-extrabold text-slate-800">{selectedFicha.estimatedHours} horas</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-500">Dificultad Soldadura:</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px]
                        ${selectedFicha.difficulty === 'Baja' ? 'bg-emerald-100 text-emerald-800' : ''}
                        ${selectedFicha.difficulty === 'Media' ? 'bg-amber-100 text-amber-800' : ''}
                        ${selectedFicha.difficulty === 'Alta' ? 'bg-red-100 text-red-800' : ''}`}>
                        {selectedFicha.difficulty}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Descripción de Manufactura:</h5>
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-100 rounded-lg p-3">
                      {selectedFicha.description}
                    </p>
                  </div>
                </div>

                {/* 2. Bill of Materials */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Box size={14} className="text-indigo-500" />
                    <span>Materia Prima (BOM)</span>
                  </h4>

                  <div className="border border-slate-100 rounded-lg overflow-hidden shadow-inner">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 border-b border-slate-100 text-[10px] uppercase font-bold">
                          <th className="py-2 px-3">Material / Perfil</th>
                          <th className="py-2 px-3 text-right">Cantidad</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 bg-white">
                        {selectedFicha.materials.map((mat, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 font-semibold text-slate-800">{mat.material}</td>
                            <td className="py-2 px-3 text-right font-extrabold text-blue-600">{mat.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3. Work Instructions List */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <List size={14} className="text-emerald-500" />
                    <span>Instrucciones de Trabajo</span>
                  </h4>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {selectedFicha.instruccionesTrabajo && selectedFicha.instruccionesTrabajo.length > 0 ? (
                      selectedFicha.instruccionesTrabajo.map((inst, index) => {
                        let title = inst;
                        let detail = '';
                        let stepMaterials = '';
                        let stepImage = '';

                        try {
                          const parsed = JSON.parse(inst);
                          if (parsed && typeof parsed === 'object' && 'title' in parsed) {
                            title = parsed.title || '';
                            detail = parsed.description || '';
                            stepMaterials = parsed.materials || '';
                            stepImage = parsed.image || '';
                          }
                        } catch (e) {
                          const newlineIndex = inst.indexOf('\n');
                          const hasDetail = newlineIndex !== -1;
                          title = hasDetail ? inst.substring(0, newlineIndex) : inst;
                          detail = hasDetail ? inst.substring(newlineIndex + 1) : '';
                        }
                        
                        return (
                          <div key={index} className="flex gap-2.5 items-start p-3 bg-slate-50 border border-slate-150 rounded-lg text-xs">
                            <span className="font-extrabold text-[10px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-200/55 rounded w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            <div className="space-y-1.5 w-full text-left">
                              <span className="text-slate-800 font-extrabold block leading-tight">{title}</span>
                              {detail && (
                                <span className="text-slate-500 block leading-relaxed whitespace-pre-wrap text-[11px] font-medium bg-white border border-slate-100 p-2 rounded-lg font-mono">
                                  {detail}
                                </span>
                              )}
                              {stepMaterials && (
                                <span className="text-indigo-600 font-bold block text-[10px] bg-indigo-50 border border-indigo-100/50 p-1.5 rounded-md leading-relaxed">
                                  🛠️ Materiales / Materia Prima: <span className="font-extrabold">{stepMaterials}</span>
                                </span>
                              )}
                              {stepImage && (
                                <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 bg-white max-w-xs max-h-48 flex justify-center items-center shadow-2xs">
                                  <img 
                                    src={stepImage} 
                                    alt={`Ilustración del Paso ${index + 1}`} 
                                    className="max-h-44 object-contain" 
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-6 text-xs text-slate-400 italic">
                        Sin instrucciones explícitas. Se usarán etapas estándar.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedFicha(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg cursor-pointer"
              >
                Cerrar Vista Previa
              </button>
            </div>
          </div>
        </div>
      )}

          {/* CREATION FORM DIALOG MODAL */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[110] p-4">
              <form 
                onSubmit={handleSubmit} 
                className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-[640px] w-full max-h-[90vh] overflow-y-auto animate-fadeIn" 
                id="ficha-tecnica-form"
              >
                {/* Modal Header */}
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <div className="flex items-center gap-2">
                    <PenTool size={18} className="text-blue-500" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">Creación de Ficha Técnica de Manufactura</h3>
                      <p className="text-[10px] text-slate-400 mt-0.5">Sube el plano PDF y define las especificaciones estructurales de taller.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-slate-400 hover:text-slate-600 text-lg p-1"
                  >
                    &times;
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-5">
                  
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-xs text-red-600 font-medium">
                      <AlertCircle size={15} />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Header details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wide mb-1">Código de Diseño (FT-XXXX)</label>
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="FT-ESC-15"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 font-mono font-bold"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wide mb-1">Nombre del Diseño</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Silla Minimalista, Mesa Ovalada..."
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wide mb-1">Horas Est. Ensamble</label>
                      <input
                        type="number"
                        value={estimatedHours}
                        onChange={(e) => setEstimatedHours(parseInt(e.target.value) || 0)}
                        min={1}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 font-bold"
                        required
                      />
                    </div>
                  </div>

                  {/* COMPACT ATTACHMENT BAR (Gmail clip style) */}
                  <div className="flex flex-col gap-2.5 bg-slate-50 border border-slate-200/80 rounded-xl p-3 shadow-3xs">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        className="flex items-center justify-center w-9 h-9 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 shadow-2xs transition-all cursor-pointer hover:border-slate-350 shrink-0"
                        title="Adjuntar fotos de referencia"
                      >
                        <Paperclip size={18} className="text-slate-500" />
                      </button>
                      <span className="text-[11px] font-bold text-slate-500">
                        {referenceImages.length > 0 ? `${referenceImages.length} fotos adjuntas (haz clic abajo para editar nombre)` : 'Adjuntar fotos de referencia'}
                      </span>
                    </div>

                    {referenceImages.length > 0 && (
                      <div className="flex items-center gap-2.5 overflow-x-auto py-1.5 max-w-full scrollbar-thin">
                        {referenceImages.map((img, idx) => (
                          <div key={idx} className="relative flex flex-col bg-white border border-slate-200 rounded-lg overflow-hidden group shadow-2xs shrink-0 w-28 animate-fadeIn">
                            <div className="relative h-16 w-full bg-slate-50 border-b border-slate-100 flex items-center justify-center">
                              <img src={img} alt={referenceImageNames[idx] || `Ref ${idx + 1}`} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewImage(img);
                                  }}
                                  className="p-1 bg-white/20 hover:bg-white/40 text-white rounded transition-all cursor-pointer"
                                  title="Vista Previa"
                                >
                                  <Eye size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeReferenceImage(idx);
                                  }}
                                  className="p-1 bg-red-600 hover:bg-red-700 text-white rounded transition-all cursor-pointer"
                                  title="Eliminar"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                            <input
                              type="text"
                              value={referenceImageNames[idx] || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setReferenceImageNames(prev => {
                                  const copy = [...prev];
                                  copy[idx] = val;
                                  return copy;
                                });
                              }}
                              placeholder={`Ref ${idx + 1}`}
                              className="w-full text-[10px] px-1.5 py-1 border-none outline-none focus:bg-slate-50 font-bold text-center text-slate-700 truncate"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <input
                      type="file"
                      ref={imageInputRef}
                      onChange={handleImageFileChange}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                  </div>

                  {/* WORK INSTRUCTIONS (Crucial requirement!) */}
                  <div className="space-y-3.5">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">
                        Instrucciones de Trabajo Secuenciales (Manual)
                      </label>
                      <button
                        type="button"
                        onClick={handleAddInstructionRow}
                        className="text-[10px] font-extrabold text-blue-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                      >
                        + Agregar Paso
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                      {structuredInstructions.map((item, idx) => (
                        <div key={idx} className="bg-slate-50/70 border border-slate-200 rounded-xl p-2.5 space-y-2 relative shadow-3xs transition-all hover:border-slate-300">
                          {/* Header Line with Step badge and Delete button */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-extrabold text-[9px] font-mono text-blue-600 bg-blue-50 border border-blue-150/40 px-1.5 py-0.5 rounded">
                              PASO {String(idx + 1).padStart(2, '0')}
                            </span>
                            {structuredInstructions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveInstructionRow(idx)}
                                className="p-0.5 text-red-500 hover:bg-red-50 hover:text-red-600 rounded transition-all cursor-pointer"
                                title="Eliminar este paso"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>

                          {/* Compact Responsive Layout with more weight on Instructions */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                            {/* Left Col: Title & Description (More Space) */}
                            <div className="md:col-span-8 space-y-1.5">
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) => handleInstructionChange(idx, 'title', e.target.value)}
                                placeholder="Título (Ej. Corte de perfiles, Soldadura...)"
                                className="w-full p-1.5 bg-white border border-slate-200 rounded-md text-[11px] outline-none focus:border-blue-500 font-bold text-slate-800"
                                required
                              />
                              <textarea
                                value={item.description}
                                onChange={(e) => handleInstructionChange(idx, 'description', e.target.value)}
                                placeholder="Detalles del paso (medidas, cortes, ángulos...)"
                                rows={1}
                                className="w-full p-1.5 bg-white border border-slate-200 rounded-md text-[11px] outline-none focus:border-blue-500 font-medium text-slate-600 leading-snug resize-y"
                              ></textarea>
                            </div>

                            {/* Right Col: Materials & Image (Less Space) */}
                            <div className="md:col-span-4 space-y-1.5">
                              <input
                                type="text"
                                value={item.materials || ''}
                                onChange={(e) => handleInstructionChange(idx, 'materials', e.target.value)}
                                placeholder="Materiales requeridos para este paso"
                                className="w-full p-1.5 bg-indigo-50/25 border border-indigo-150 rounded-md text-[11px] outline-none focus:border-indigo-500 font-semibold text-indigo-700 placeholder-indigo-300"
                              />


                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="text-[9px] text-slate-400">
                      Estas instrucciones se desglosarán automáticamente como tareas cronometradas en el módulo de taller para los operarios, mostrando el título en negrita y las especificaciones técnicas detalladas.
                    </p>
                  </div>





                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-lg shadow cursor-pointer shadow-blue-500/15"
                  >
                    Guardar Ficha Técnica
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* CONFIRM QUEUE ADDITION MODAL (Activated by Drag-and-drop or clicking queue buttons) */}
          {queueingFicha && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[110] p-4 animate-fadeIn">
              <form onSubmit={confirmQueueSubmission} className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-[440px] w-full overflow-hidden" id="queue-conf-modal">
                <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">CARTA LABORAL DE TRABAJO</span>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 mt-0.5">Mandar Pieza a Producción</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQueueingFicha(null)}
                    className="text-slate-400 hover:text-white text-lg p-1"
                  >
                    &times;
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-xs text-slate-600 space-y-1">
                    <div>
                      <span className="font-semibold text-slate-400 block uppercase text-[9px]">Diseño Técnico:</span>
                      <strong className="text-slate-800 text-sm font-extrabold">{queueingFicha.name}</strong>
                    </div>
                    <div className="flex justify-between items-center pt-2 text-[10px] border-t border-slate-200/50 mt-1">
                      <span>Plano: <strong>{queueingFicha.pdfName || 'plano.pdf'}</strong></span>
                      <span>Dificultad: <strong className="text-blue-600">{queueingFicha.difficulty}</strong></span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Nombre del Cliente / Pedido</label>
                    <input
                      type="text"
                      value={queueClientName}
                      onChange={(e) => setQueueClientName(e.target.value)}
                      placeholder="Cliente General, Arquitectos Asociados..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Cantidad de Piezas a Fabricar</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQueueQuantity(Math.max(1, queueQuantity - 1))}
                        className="w-9 h-9 border border-slate-200 rounded-lg flex items-center justify-center font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={queueQuantity}
                        onChange={(e) => setQueueQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="flex-grow p-2 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs font-extrabold"
                      />
                      <button
                        type="button"
                        onClick={() => setQueueQuantity(queueQuantity + 1)}
                        className="w-9 h-9 border border-slate-200 rounded-lg flex items-center justify-center font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Se generarán {queueQuantity} {queueQuantity > 1 ? 'piezas individuales' : 'pieza individual'} en el taller con sus {queueingFicha.instruccionesTrabajo?.length || 0} instrucciones de trabajo.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Operario / Estación Asignada</label>
                    <select
                      value={queueAssignedTo}
                      onChange={(e) => setQueueAssignedTo(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 font-bold text-slate-800"
                    >
                      <option value="Jorge Salmero">Jorge Salmero (Mesa y Carpintería)</option>
                      <option value="Martín Gómez">Martín Gómez (Estructura y Soldadura)</option>
                      <option value="Roberto Sosa">Roberto Sosa (Pintura y Acabados)</option>
                      <option value="Álvaro Ramos">Álvaro Ramos (Ensamble y Calidad)</option>
                      <option value="Oficina Central">Oficina Central (Oficina)</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setQueueingFicha(null)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow cursor-pointer shadow-emerald-500/15"
                  >
                    Confirmar Envío
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* MODERN AI PDF SCANNING SCANNER OVERLAY */}
          {isExtracting && (
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-fadeIn">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
                
                {/* Laser scan lines effect */}
                <div className="absolute top-0 inset-x-0 h-[2px] bg-cyan-500 shadow-[0_0_15px_#22d3ee] animate-pulse" />
                
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-center text-cyan-400 relative overflow-hidden animate-pulse">
                    <FileText size={36} />
                    <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-[10px] font-extrabold animate-bounce">
                    AI
                  </div>
                </div>

                <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-widest font-mono">
                  Análisis Inteligente Activo
                </h3>
                
                <p className="text-xs text-slate-400 mt-2 font-medium max-w-[320px]">
                  El motor de IA está procesando el plano estructural y desglosando las instrucciones secuenciales para taller.
                </p>

                {/* Loading bar progression */}
                <div className="w-full bg-slate-900 rounded-full h-2 mt-6 overflow-hidden border border-slate-800">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-300 shadow-[0_0_8px_#3b82f6]" 
                    style={{ width: `${extractionProgress}%` }}
                  />
                </div>

                {/* Progress metadata */}
                <div className="w-full flex justify-between items-center text-[10px] font-mono text-slate-500 mt-2">
                  <span>PROCESANDO CAPAS...</span>
                  <span className="font-bold text-cyan-400">{extractionProgress}%</span>
                </div>

                {/* Interactive log line */}
                <div className="w-full mt-5 bg-slate-900/60 rounded-lg border border-slate-900 p-3 text-left font-mono text-[9px] text-cyan-300/90 leading-relaxed min-h-[46px] flex items-center gap-2">
                  <span className="animate-pulse text-cyan-400 text-xs">⚡</span>
                  <span>{extractionLog}</span>
                </div>
              </div>
            </div>
          )}

          {/* SIMPLIFIED DIRECT QUEUE FORM (Only requires Name, Difficulty, Description, Client and Quantity) */}
          {showDirectQueueForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-[110] p-4 animate-fadeIn">
              <form onSubmit={handleDirectQueueSubmit} className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-[500px] w-full overflow-hidden">
                
                <div className="p-5 bg-blue-600 text-white flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <Cpu size={18} className="text-white" />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono font-bold text-blue-100 uppercase tracking-widest block">EXTRACCIÓN DIRECTA DE PLANO</span>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-white">Lanzar Nuevo Trabajo a Producción</h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDirectQueueForm(false)}
                    className="text-blue-100 hover:text-white text-lg p-1"
                  >
                    &times;
                  </button>
                </div>

                <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                  <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100/50 text-xs text-blue-800 flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-blue-600 flex-shrink-0" />
                    <span>¡Instrucciones de Trabajo extraídas con éxito del PDF! Puedes revisarlas a continuación.</span>
                  </div>

                  {/* 1. Name */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wide mb-1">Nombre del Diseño / Pieza</label>
                    <input
                      type="text"
                      value={dqName}
                      onChange={(e) => setDqName(e.target.value)}
                      placeholder="Ej. Silla de Encino Premium"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 font-bold text-slate-800"
                      required
                    />
                  </div>



                  {/* 3. Description */}

                  {/* 4. Extracted Work Instructions */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wide mb-1 flex justify-between">
                      <span>Instrucciones de Trabajo secuenciales extraídas (BOM)</span>
                      <span className="text-blue-500 text-[8px] font-mono lowercase">Una por línea</span>
                    </label>
                    <textarea
                      value={dqInstrucciones}
                      onChange={(e) => setDqInstrucciones(e.target.value)}
                      rows={4}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 text-slate-100 rounded-lg text-xs font-mono outline-none focus:border-blue-500 resize-none leading-relaxed"
                      required
                    ></textarea>
                  </div>

                  {/* 5. Production specs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wide mb-1">Cliente / Pedido</label>
                      <input
                        type="text"
                        value={dqClientName}
                        onChange={(e) => setDqClientName(e.target.value)}
                        placeholder="Ej. Público General"
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wide mb-1">Cantidad de Piezas</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={dqQuantity}
                        onChange={(e) => setDqQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 font-extrabold text-blue-600"
                        required
                      />
                    </div>
                  </div>

                  {/* 6. Assigned artisan */}
                  <div className="border-t border-slate-100 pt-3">
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wide mb-1">Operario / Estación Asignada</label>
                    <select
                      value={dqAssignedTo}
                      onChange={(e) => setDqAssignedTo(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 font-bold text-slate-800"
                    >
                      <option value="Jorge Salmero">Jorge Salmero (Mesa y Carpintería)</option>
                      <option value="Martín Gómez">Martín Gómez (Estructura y Soldadura)</option>
                      <option value="Roberto Sosa">Roberto Sosa (Pintura y Acabados)</option>
                      <option value="Álvaro Ramos">Álvaro Ramos (Ensamble y Calidad)</option>
                      <option value="Oficina Central">Oficina Central (Oficina)</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowDirectQueueForm(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow cursor-pointer shadow-blue-500/15"
                  >
                    Guardar y Mandar a Taller
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* REFERENCE IMAGE PREVIEW LIGHTBOX */}
          {previewImage && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[150] p-4 animate-fadeIn">
              <div className="relative bg-white rounded-xl shadow-2xl max-w-[500px] w-full overflow-hidden border border-slate-300">
                <div className="p-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Vista Previa de Imagen</span>
                  <button
                    type="button"
                    onClick={() => setPreviewImage(null)}
                    className="p-1 px-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-all cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
                <div className="p-4 bg-slate-950 flex items-center justify-center min-h-[300px] max-h-[70vh]">
                  <img
                    src={previewImage}
                    alt="Referencia ampliada"
                    className="max-w-full max-h-[60vh] object-contain rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setPreviewImage(null)}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer transition-all active:scale-95"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            </div>
          )}

      </div>
    );
  }
