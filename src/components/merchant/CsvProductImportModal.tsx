import React, { useState, useRef, useMemo } from 'react';
import { Product, Variant, Merchant } from '../../types';
import {
  FileSpreadsheet,
  UploadCloud,
  FileUp,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  Sparkles,
  RefreshCw,
  Trash2,
  HelpCircle,
  Check,
  Edit3,
  Layers,
  ArrowRight,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ParsedProductRow {
  id: string;
  nameEn: string;
  nameAm: string;
  category: string;
  brand: string;
  price: number;
  lowStockThreshold: number;
  sku: string;
  variantName: string;
  stockOnHand: number;
  image: string;
  descEn: string;
  descAm: string;
  errors: string[];
  selected: boolean;
}

interface CsvProductImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMerchant: Merchant;
  onAddProduct: (p: Product) => void;
  onAddAuditLog: (actor: string, action: string, details: string, severity: 'INFO' | 'WARNING' | 'CRITICAL') => void;
  language: 'en' | 'am';
  onSuccessImport?: (importedCount: number) => void;
}

// Robust CSV Parser
function parseCSV(text: string): string[][] {
  // Strip BOM if present
  const cleanText = text.replace(/^\uFEFF/, '');
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let insideQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentVal.trim());
      if (currentRow.some(cell => cell.length > 0)) {
        lines.push(currentRow);
      }
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some(cell => cell.length > 0)) {
      lines.push(currentRow);
    }
  }

  return lines;
}

export default function CsvProductImportModal({
  isOpen,
  onClose,
  currentMerchant,
  onAddProduct,
  onAddAuditLog,
  language,
  onSuccessImport
}: CsvProductImportModalProps) {
  const [inputMode, setInputMode] = useState<'FILE' | 'PASTE'>('FILE');
  const [rawPasteText, setRawPasteText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedProductRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'VALID' | 'ERRORS'>('ALL');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sample CSV Download Generator
  const handleDownloadSampleCSV = () => {
    const headers = 'Name (EN),Name (AM),Category,Brand,Base Price (ETB),Low Stock Threshold,SKU,Variant Name,Stock On Hand,Image URL,Description (EN),Description (AM)\n';
    const sampleRows = [
      `"Saba Tilet Dress","የሳባ ጥለት ቀሚስ","apparel","${currentMerchant.storeName}",4500,5,"SABA-DRS-M","Medium Size",15,"https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80","Handcrafted traditional Saba tilet cotton dress","በእጅ የተሰራ የሳባ ጥለት የጥጥ ቀሚስ"`,
      `"Yirgacheffe Specialty Coffee","ይርጋጨፌ ልዩ ቡና","staples","${currentMerchant.storeName}",1200,10,"YIRGA-500G","500g Roasted Beans",30,"https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80","Grade 1 washed Yirgacheffe arabica beans","ደረጃ 1 የታጠበ ይርጋጨፌ አረቢካ ቡና"`,
      `"Ethiopian Clay Jebena","የሸክላ ጀበና","traditional","${currentMerchant.storeName}",850,3,"JEB-STD","Standard Clay Pot",12,"https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80","Authentic clay coffee pot handcrafted in Gondar","በጎንደር በእጅ የተሰራ የሸክላ ጀበና"`,
      `"Organic Korarima Spices","ኦርጋኒክ ኮረሪማ","staples","${currentMerchant.storeName}",450,8,"KOR-100G","100g Pack",20,"https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80","Aromatic Ethiopian cardamom spices","መዓዛ ያለው የኢትዮጵያ ኮረሪማ ቅመም"`
    ].join('\n');

    const blob = new Blob([headers + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Kasma_Product_Import_Template_${currentMerchant.storeName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Map Header Names to Column Indexes
  const buildHeaderMap = (headerRow: string[]) => {
    const map: Record<string, number> = {};
    headerRow.forEach((col, idx) => {
      const normalized = col.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normalized.includes('nameen') || normalized === 'name' || normalized.includes('titleen') || normalized === 'productname' || normalized === 'product') {
        map['nameEn'] = idx;
      } else if (normalized.includes('nameam') || normalized.includes('titleam') || normalized.includes('amharic')) {
        map['nameAm'] = idx;
      } else if (normalized.includes('category') || normalized === 'cat' || normalized === 'type') {
        map['category'] = idx;
      } else if (normalized.includes('brand') || normalized === 'artisan' || normalized === 'vendor' || normalized === 'manufacturer') {
        map['brand'] = idx;
      } else if (normalized.includes('price') || normalized.includes('etb') || normalized === 'unitprice') {
        map['price'] = idx;
      } else if (normalized.includes('threshold') || normalized.includes('minstock') || normalized.includes('lowstock')) {
        map['lowStockThreshold'] = idx;
      } else if (normalized.includes('sku') || normalized.includes('skucode')) {
        map['sku'] = idx;
      } else if (normalized.includes('variant') || normalized.includes('option') || normalized.includes('size')) {
        map['variantName'] = idx;
      } else if (normalized.includes('stock') || normalized.includes('onhand') || normalized.includes('qty') || normalized.includes('inventory') || normalized.includes('quantity')) {
        map['stockOnHand'] = idx;
      } else if (normalized.includes('image') || normalized.includes('photo') || normalized.includes('picture') || normalized.includes('url')) {
        map['image'] = idx;
      } else if (normalized.includes('descen') || normalized === 'description' || normalized.includes('desc')) {
        map['descEn'] = idx;
      } else if (normalized.includes('descam') || normalized.includes('descriptionam') || normalized.includes('amharicdesc')) {
        map['descAm'] = idx;
      }
    });
    return map;
  };

  // Process CSV String Data
  const processCSVData = (csvText: string) => {
    setIsParsing(true);
    setTimeout(() => {
      try {
        const rows = parseCSV(csvText);
        if (rows.length < 2) {
          alert(language === 'en' ? 'CSV file must contain a header row and at least one product row.' : 'የCSV ፋይሉ ቢያንስ አንድ የምርት መረጃ ማካተት አለበት።');
          setIsParsing(false);
          return;
        }

        const headerRow = rows[0];
        const headerMap = buildHeaderMap(headerRow);
        const dataRows = rows.slice(1);

        const parsed: ParsedProductRow[] = dataRows.map((row, index) => {
          const getVal = (key: string) => (headerMap[key] !== undefined ? row[headerMap[key]] || '' : '');

          const rawNameEn = getVal('nameEn') || `Imported Product #${index + 1}`;
          const rawNameAm = getVal('nameAm') || rawNameEn;
          const rawCategory = getVal('category').toLowerCase() || 'traditional';
          const rawBrand = getVal('brand') || currentMerchant.storeName;
          const rawPrice = parseFloat(getVal('price')) || 0;
          const rawThreshold = parseInt(getVal('lowStockThreshold'), 10) || 5;
          const rawSku = getVal('sku').trim().toUpperCase() || `SKU-${Date.now().toString().slice(-4)}-${index + 1}`;
          const rawVariantName = getVal('variantName') || 'Standard Option';
          const rawStock = parseInt(getVal('stockOnHand'), 10) || 10;
          const rawImage = getVal('image') || 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80';
          const rawDescEn = getVal('descEn') || 'Imported via CSV Batch Upload.';
          const rawDescAm = getVal('descAm') || 'በCSV ተመዝግቦ ገቢ የተደረገ ምርት።';

          const errors: string[] = [];
          if (!rawNameEn || rawNameEn.trim().length === 0) {
            errors.push('Missing English Title');
          }
          if (isNaN(rawPrice) || rawPrice <= 0) {
            errors.push('Invalid Price (> 0 required)');
          }
          if (isNaN(rawStock) || rawStock < 0) {
            errors.push('Invalid Stock On Hand');
          }
          if (!rawSku || rawSku.trim().length === 0) {
            errors.push('Missing SKU');
          }

          return {
            id: `csv-row-${Date.now()}-${index}`,
            nameEn: rawNameEn,
            nameAm: rawNameAm,
            category: rawCategory,
            brand: rawBrand,
            price: rawPrice,
            lowStockThreshold: rawThreshold,
            sku: rawSku,
            variantName: rawVariantName,
            stockOnHand: rawStock,
            image: rawImage,
            descEn: rawDescEn,
            descAm: rawDescAm,
            errors,
            selected: errors.length === 0
          };
        });

        setParsedRows(parsed);
      } catch (err: any) {
        alert(`Failed to parse CSV: ${err.message}`);
      } finally {
        setIsParsing(false);
      }
    }, 100);
  };

  // Handle File Selection or Drop
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        processCSVData(content);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          processCSVData(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePasteProcess = () => {
    if (!rawPasteText.trim()) return;
    setFileName('Pasted CSV Data');
    processCSVData(rawPasteText);
  };

  // Editable Row Updates
  const handleUpdateParsedRow = (id: string, field: keyof ParsedProductRow, val: any) => {
    setParsedRows(prev =>
      prev.map(row => {
        if (row.id !== id) return row;
        const updated = { ...row, [field]: val };

        // Re-evaluate errors
        const errors: string[] = [];
        if (!updated.nameEn || updated.nameEn.trim().length === 0) errors.push('Missing English Title');
        if (isNaN(updated.price) || updated.price <= 0) errors.push('Invalid Price (> 0 required)');
        if (isNaN(updated.stockOnHand) || updated.stockOnHand < 0) errors.push('Invalid Stock On Hand');
        if (!updated.sku || updated.sku.trim().length === 0) errors.push('Missing SKU');

        updated.errors = errors;
        if (errors.length === 0 && !updated.selected) {
          updated.selected = true;
        }
        return updated;
      })
    );
  };

  const handleDeleteParsedRow = (id: string) => {
    setParsedRows(prev => prev.filter(r => r.id !== id));
  };

  const handleToggleSelectRow = (id: string) => {
    setParsedRows(prev =>
      prev.map(r => (r.id === id ? { ...r, selected: !r.selected } : r))
    );
  };

  const handleToggleSelectAllRows = () => {
    const validRows = parsedRows.filter(r => r.errors.length === 0);
    const allValidSelected = validRows.every(r => r.selected);

    setParsedRows(prev =>
      prev.map(r => (r.errors.length === 0 ? { ...r, selected: !allValidSelected } : r))
    );
  };

  // Filtered views for table tab
  const displayRows = useMemo(() => {
    if (activeTab === 'VALID') return parsedRows.filter(r => r.errors.length === 0);
    if (activeTab === 'ERRORS') return parsedRows.filter(r => r.errors.length > 0);
    return parsedRows;
  }, [parsedRows, activeTab]);

  const totalValidCount = parsedRows.filter(r => r.errors.length === 0).length;
  const totalErrorCount = parsedRows.filter(r => r.errors.length > 0).length;
  const selectedToImportCount = parsedRows.filter(r => r.selected && r.errors.length === 0).length;

  // Execute Final Batch Import
  const handleExecuteImport = () => {
    const rowsToImport = parsedRows.filter(r => r.selected && r.errors.length === 0);
    if (rowsToImport.length === 0) return;

    setIsImporting(true);

    // Grouping by Product Name + Category to combine multi-variant rows if present
    const productGroups: Record<string, ParsedProductRow[]> = {};
    rowsToImport.forEach(row => {
      const groupKey = `${row.nameEn.toLowerCase().trim()}_${row.category}`;
      if (!productGroups[groupKey]) {
        productGroups[groupKey] = [];
      }
      productGroups[groupKey].push(row);
    });

    let importedCount = 0;
    Object.values(productGroups).forEach((group, idx) => {
      const mainRow = group[0];
      const variants: Variant[] = group.map((item, vIdx) => ({
        sku: item.sku,
        name: item.variantName || `Option ${vIdx + 1}`,
        priceOffset: vIdx === 0 ? 0 : item.price - mainRow.price,
        onHand: item.stockOnHand,
        reserved: 0
      }));

      const newProduct: Product = {
        id: `p-csv-${Date.now()}-${idx}`,
        nameEn: mainRow.nameEn,
        nameAm: mainRow.nameAm || mainRow.nameEn,
        descriptionEn: mainRow.descEn || 'Imported via CSV batch upload.',
        descriptionAm: mainRow.descAm || 'በCSV የተመዘገበ ምርት።',
        price: mainRow.price,
        category: mainRow.category,
        brand: mainRow.brand || currentMerchant.storeName,
        image: mainRow.image,
        variants,
        status: 'PENDING_APPROVAL',
        lowStockThreshold: mainRow.lowStockThreshold,
        merchantId: currentMerchant.id,
        merchantName: currentMerchant.storeName,
        createdAt: new Date().toISOString().split('T')[0]
      };

      onAddProduct(newProduct);
      importedCount++;
    });

    // Log Audit Action
    onAddAuditLog(
      `${currentMerchant.storeName} (Merchant)`,
      'BULK_CSV_PRODUCT_IMPORT',
      `Imported ${importedCount} products (${rowsToImport.length} total SKUs) via CSV file batch upload (${fileName || 'custom.csv'}).`,
      'INFO'
    );

    setTimeout(() => {
      setIsImporting(false);
      if (onSuccessImport) {
        onSuccessImport(importedCount);
      }
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-150 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900/80">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-[#0052FF]/10 text-[#0052FF] rounded-2xl">
                <FileSpreadsheet className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>{language === 'en' ? 'Batch Product CSV Import' : 'የእቃ መረጃ በCSV መመዝገቢያ'}</span>
                  <span className="bg-blue-100 dark:bg-blue-950/50 text-[#0052FF] dark:text-blue-400 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
                    Bulk Upload
                  </span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  {language === 'en'
                    ? 'Upload multiple products and variants at once via CSV spreadsheet'
                    : 'ብዙ ምርቶችን በአንድ ጊዜ በኤክሴል/CSV ፋይል ያስገቡ'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            
            {/* Step 1: File Upload / Drag Drop & Download Template */}
            {parsedRows.length === 0 ? (
              <div className="space-y-5">
                
                {/* Template Download Banner */}
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50/40 to-amber-50/30 dark:from-zinc-850 dark:via-zinc-850 dark:to-zinc-800 border border-blue-100 dark:border-zinc-800 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 rounded-xl">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-gray-900 dark:text-white">
                        {language === 'en' ? 'Need a CSV Template?' : 'የመመዝገቢያ የCSV ናሙና ይፈልጋሉ?'}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                        {language === 'en'
                          ? 'Download our pre-formatted Kasma CSV template with Ethiopian product examples.'
                          : 'አብነቱን አውርደው የእርስዎን ምርቶች በቀላሉ ይሙሉ'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadSampleCSV}
                    className="px-4 py-2 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-900 dark:text-white border border-gray-200 dark:border-zinc-700 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[#0052FF]" />
                    <span>{language === 'en' ? 'Download Sample CSV' : 'ናሙና CSV ያውርዱ'}</span>
                  </button>
                </div>

                {/* Import Mode Switcher */}
                <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl w-fit border border-gray-200 dark:border-zinc-700">
                  <button
                    onClick={() => setInputMode('FILE')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      inputMode === 'FILE'
                        ? 'bg-white dark:bg-zinc-700 text-[#0052FF] dark:text-white shadow-xs'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-300'
                    }`}
                  >
                    {language === 'en' ? 'Upload CSV File' : 'የCSV ፋይል ስቀል'}
                  </button>
                  <button
                    onClick={() => setInputMode('PASTE')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      inputMode === 'PASTE'
                        ? 'bg-white dark:bg-zinc-700 text-[#0052FF] dark:text-white shadow-xs'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-300'
                    }`}
                  >
                    {language === 'en' ? 'Paste Raw CSV Text' : 'ጽሁፍ ለጥፍ'}
                  </button>
                </div>

                {/* Upload Zone */}
                {inputMode === 'FILE' ? (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-zinc-700 hover:border-[#0052FF] dark:hover:border-blue-500 bg-gray-50/50 dark:bg-zinc-850/20 rounded-3xl p-10 text-center transition-all cursor-pointer group space-y-3"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".csv,text/csv"
                      className="hidden"
                    />
                    <div className="w-14 h-14 bg-blue-50 dark:bg-blue-950/40 text-[#0052FF] dark:text-blue-400 rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                        {language === 'en' ? 'Click to browse or drag & drop CSV file here' : 'የCSV ፋይሉን ለማስገባት እዚህ ይጫኑ ወይም ይጎትቱ'}
                      </h4>
                      <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                        Supports standard .csv format with headers: Name, Price, SKU, Stock, Category, Brand
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      rows={8}
                      value={rawPasteText}
                      onChange={(e) => setRawPasteText(e.target.value)}
                      placeholder={`Name (EN),Name (AM),Category,Brand,Base Price (ETB),Low Stock Threshold,SKU,Variant Name,Stock On Hand,Image URL,Description (EN),Description (AM)\n"Product Name","የምርት ስም","traditional","Brand",1000,5,"SKU-100","Standard",10,"https://...","Desc EN","Desc AM"`}
                      className="w-full border border-gray-200 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-850/20 rounded-2xl p-4 text-xs font-mono text-gray-850 dark:text-zinc-200 focus:outline-none focus:border-[#0052FF]"
                    />
                    <button
                      onClick={handlePasteProcess}
                      disabled={!rawPasteText.trim()}
                      className="px-5 py-2.5 bg-[#0052FF] hover:bg-blue-600 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{language === 'en' ? 'Parse Pasted CSV Data' : 'መረጃውን አስራ'}</span>
                    </button>
                  </div>
                )}

              </div>
            ) : (
              /* Step 2: Interactive Validation & Preview Grid */
              <div className="space-y-4">
                
                {/* Stats Summary & Filters */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50 dark:bg-zinc-850/40 border border-gray-150 dark:border-zinc-800 p-4 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-gray-900 dark:text-white">
                      {language === 'en' ? 'Parsed CSV File:' : 'የተሰራው ፋይል:'}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#0052FF] bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900">
                      {fileName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex bg-gray-200/60 dark:bg-zinc-800 p-1 rounded-xl text-xs font-bold">
                      <button
                        onClick={() => setActiveTab('ALL')}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                          activeTab === 'ALL' ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-xs' : 'text-gray-500'
                        }`}
                      >
                        All ({parsedRows.length})
                      </button>
                      <button
                        onClick={() => setActiveTab('VALID')}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                          activeTab === 'VALID' ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-gray-500'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Valid ({totalValidCount})
                      </button>
                      <button
                        onClick={() => setActiveTab('ERRORS')}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                          activeTab === 'ERRORS' ? 'bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 shadow-xs' : 'text-gray-500'
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Errors ({totalErrorCount})
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setParsedRows([]);
                        setFileName(null);
                      }}
                      className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-zinc-700 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? 'Re-upload' : 'እንደገና ጫን'}</span>
                    </button>
                  </div>
                </div>

                {/* Preview Table */}
                <div className="border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs max-h-[380px] overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-gray-100 dark:bg-zinc-850 text-gray-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[9px] z-10 border-b border-gray-200 dark:border-zinc-700">
                      <tr>
                        <th className="p-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={parsedRows.length > 0 && parsedRows.filter(r => r.errors.length === 0).every(r => r.selected)}
                            onChange={handleToggleSelectAllRows}
                            className="w-4 h-4 rounded border-gray-300 dark:border-zinc-700 text-[#0052FF]"
                          />
                        </th>
                        <th className="p-3">{language === 'en' ? 'Status' : 'ሁኔታ'}</th>
                        <th className="p-3">{language === 'en' ? 'Product Name (EN / AM)' : 'የምርት ስም'}</th>
                        <th className="p-3">{language === 'en' ? 'Category' : 'ምድብ'}</th>
                        <th className="p-3">{language === 'en' ? 'Price (ETB)' : 'ዋጋ'}</th>
                        <th className="p-3">{language === 'en' ? 'SKU' : 'SKU'}</th>
                        <th className="p-3">{language === 'en' ? 'Stock On Hand' : 'ክምችት'}</th>
                        <th className="p-3 text-right">{language === 'en' ? 'Actions' : 'ድርጊት'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150 dark:divide-zinc-800">
                      {displayRows.map((row) => {
                        const hasErrors = row.errors.length > 0;
                        const isEditing = editingRowId === row.id;

                        return (
                          <tr
                            key={row.id}
                            className={`transition-colors ${
                              hasErrors
                                ? 'bg-rose-50/30 dark:bg-rose-950/10'
                                : row.selected
                                ? 'bg-blue-50/20 dark:bg-blue-950/10'
                                : ''
                            }`}
                          >
                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                disabled={hasErrors}
                                checked={row.selected && !hasErrors}
                                onChange={() => handleToggleSelectRow(row.id)}
                                className="w-4 h-4 rounded border-gray-300 dark:border-zinc-700 text-[#0052FF] cursor-pointer disabled:opacity-40"
                              />
                            </td>

                            <td className="p-3">
                              {hasErrors ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/50 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>{row.errors[0]}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Valid</span>
                                </span>
                              )}
                            </td>

                            <td className="p-3 font-semibold text-gray-900 dark:text-white">
                              {isEditing ? (
                                <div className="space-y-1">
                                  <input
                                    type="text"
                                    value={row.nameEn}
                                    onChange={(e) => handleUpdateParsedRow(row.id, 'nameEn', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-zinc-700 rounded px-2 py-1 text-xs"
                                    placeholder="English Title"
                                  />
                                  <input
                                    type="text"
                                    value={row.nameAm}
                                    onChange={(e) => handleUpdateParsedRow(row.id, 'nameAm', e.target.value)}
                                    className="w-full border border-gray-300 dark:border-zinc-700 rounded px-2 py-1 text-xs"
                                    placeholder="Amharic Title"
                                  />
                                </div>
                              ) : (
                                <div>
                                  <p>{row.nameEn}</p>
                                  <p className="text-[10px] text-gray-400 font-normal">{row.nameAm}</p>
                                </div>
                              )}
                            </td>

                            <td className="p-3 text-gray-600 dark:text-zinc-300 capitalize font-medium">
                              {isEditing ? (
                                <select
                                  value={row.category}
                                  onChange={(e) => handleUpdateParsedRow(row.id, 'category', e.target.value)}
                                  className="border border-gray-300 dark:border-zinc-700 rounded px-2 py-1 text-xs bg-white dark:bg-zinc-800"
                                >
                                  <option value="traditional">Traditional</option>
                                  <option value="staples">Staples & Coffee</option>
                                  <option value="apparel">Apparel</option>
                                  <option value="electronics">Electronics</option>
                                </select>
                              ) : (
                                row.category
                              )}
                            </td>

                            <td className="p-3 font-mono font-bold text-gray-900 dark:text-white">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={row.price}
                                  onChange={(e) => handleUpdateParsedRow(row.id, 'price', parseFloat(e.target.value) || 0)}
                                  className="w-20 border border-gray-300 dark:border-zinc-700 rounded px-2 py-1 text-xs"
                                />
                              ) : (
                                `${row.price.toLocaleString()} ETB`
                              )}
                            </td>

                            <td className="p-3 font-mono text-[11px] text-gray-500 dark:text-zinc-400">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={row.sku}
                                  onChange={(e) => handleUpdateParsedRow(row.id, 'sku', e.target.value)}
                                  className="w-24 border border-gray-300 dark:border-zinc-700 rounded px-2 py-1 text-xs"
                                />
                              ) : (
                                row.sku
                              )}
                            </td>

                            <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={row.stockOnHand}
                                  onChange={(e) => handleUpdateParsedRow(row.id, 'stockOnHand', parseInt(e.target.value, 10) || 0)}
                                  className="w-16 border border-gray-300 dark:border-zinc-700 rounded px-2 py-1 text-xs"
                                />
                              ) : (
                                `${row.stockOnHand} units`
                              )}
                            </td>

                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => setEditingRowId(isEditing ? null : row.id)}
                                  className="p-1.5 text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                                  title="Edit row"
                                >
                                  {isEditing ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Edit3 className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  onClick={() => handleDeleteParsedRow(row.id)}
                                  className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                                  title="Delete row"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

          </div>

          {/* Footer Bar */}
          <div className="p-6 border-t border-gray-150 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
              {parsedRows.length > 0 ? (
                <span>
                  Ready to import <strong className="text-gray-900 dark:text-white">{selectedToImportCount}</strong> out of {parsedRows.length} catalog items.
                </span>
              ) : (
                <span>{language === 'en' ? 'Select or drop a CSV file to begin parsing.' : 'ለመጀመር የCSV ፋይል ይምረጡ'}</span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-initial px-5 py-2.5 border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
              >
                {language === 'en' ? 'Cancel' : 'ሰርዝ'}
              </button>

              {parsedRows.length > 0 && (
                <button
                  onClick={handleExecuteImport}
                  disabled={selectedToImportCount === 0 || isImporting}
                  className="flex-1 sm:flex-initial px-6 py-2.5 bg-[#0052FF] hover:bg-blue-600 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isImporting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <FileUp className="w-4 h-4" />
                      <span>{language === 'en' ? `Import ${selectedToImportCount} Products` : `${selectedToImportCount} ምርቶችን አስገባ`}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
