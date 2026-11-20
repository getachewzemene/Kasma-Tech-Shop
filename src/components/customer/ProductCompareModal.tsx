import React from 'react';
import { GitCompare, Star, Eye, ShoppingCart } from 'lucide-react';
import { Product, Variant } from '../../types';
import { LazyImage } from '../LazyImage';
import { getProductSpecs, getProductFeatures } from '../../utils/productSpecs';

interface CategoryItem {
  id: string;
  nameEn: string;
  nameAm: string;
}

interface ProductCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  comparedProductIds: string[];
  setComparedProductIds: React.Dispatch<React.SetStateAction<string[]>>;
  products: Product[];
  categories: CategoryItem[];
  language: 'en' | 'am';
  getProductRatingInfo: (product: Product) => { avg: number; count: number };
  addToCart: (product: Product, variant: Variant, quantity?: number) => void;
  handleOpenProduct: (product: Product) => void;
}

export const ProductCompareModal: React.FC<ProductCompareModalProps> = ({
  isOpen,
  onClose,
  comparedProductIds,
  setComparedProductIds,
  products,
  categories,
  language,
  getProductRatingInfo,
  addToCart,
  handleOpenProduct
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-150 dark:border-zinc-800 text-gray-900 dark:text-zinc-100 transition-colors p-6 md:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-gray-500 dark:text-zinc-400 rounded-full p-2 text-sm font-bold w-9 h-9 flex items-center justify-center z-50 transition-all border border-gray-150 dark:border-zinc-800 cursor-pointer"
          title={language === 'en' ? 'Close Comparison' : 'ማነጻጸሪያውን ዝጋ'}
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#0052FF] text-white p-2.5 rounded-2xl">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-950 dark:text-white uppercase tracking-wider">
              {language === 'en' ? 'Product Comparison Matrix' : 'የምርቶች ማነጻጸሪያ ማትሪክስ'}
            </h3>
            <p className="text-xs text-gray-400 dark:text-zinc-500 font-medium">
              {language === 'en'
                ? 'Review technical specifications and prices side-by-side'
                : 'ዝርዝር መግለጫዎችን እና ዋጋዎችን ጎን ለጎን ያነጻጽሩ'}
            </p>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto rounded-2xl border border-gray-150 dark:border-zinc-850">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-zinc-850/50 border-b border-gray-150 dark:border-zinc-850">
                <th className="p-4 text-[10px] font-black uppercase text-gray-400 dark:text-zinc-500 tracking-wider w-1/4">
                  {language === 'en' ? 'Feature Specification' : 'የምርት ዝርዝር መግለጫ'}
                </th>
                {[0, 1, 2].map((index) => {
                  const pId = comparedProductIds[index];
                  const prod = pId ? products.find((p) => p.id === pId) : null;
                  return (
                    <th key={index} className="p-4 w-1/4 border-l border-gray-150 dark:border-zinc-850 relative align-top">
                      {prod ? (
                        <div className="space-y-3 relative group">
                          <button
                            onClick={() => setComparedProductIds(comparedProductIds.filter((id) => id !== prod.id))}
                            className="absolute -top-2 -right-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-black border border-rose-200 cursor-pointer shadow-sm z-10"
                            title="Remove item"
                          >
                            ✕
                          </button>
                          <div className="aspect-video w-full rounded-xl overflow-hidden bg-gray-50 dark:bg-zinc-950 border border-gray-150 dark:border-zinc-850">
                            <LazyImage src={prod.image} alt={prod.nameEn} className="w-full h-full object-cover" />
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest block">
                              {prod.brand}
                            </span>
                            <h4 className="text-xs font-extrabold text-gray-950 dark:text-white line-clamp-1 truncate min-h-[18px] leading-tight">
                              {language === 'en' ? prod.nameEn : prod.nameAm}
                            </h4>
                            <p className="text-sm font-black text-black dark:text-white font-mono">
                              {prod.price.toLocaleString()} ETB
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center p-4 text-center border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl min-h-[140px] space-y-2">
                          <span className="text-xl text-gray-300">📦</span>
                          <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">
                            {language === 'en' ? 'Empty Slot' : 'ባዶ ቦታ'}
                          </p>
                          <select
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val) {
                                setComparedProductIds([...comparedProductIds, val]);
                              }
                            }}
                            className="bg-gray-50 dark:bg-zinc-850 border border-gray-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[10px] font-bold text-gray-600 dark:text-zinc-400 focus:outline-none w-full"
                            value=""
                          >
                            <option value="">{language === 'en' ? '+ Choose Product' : '+ ምርት ይምረጡ'}</option>
                            {products
                              .filter((p) => p.status === 'APPROVED' && !comparedProductIds.includes(p.id))
                              .map((p) => (
                                <option key={p.id} value={p.id}>
                                  {language === 'en' ? p.nameEn : p.nameAm} ({p.price.toLocaleString()} ETB)
                                </option>
                              ))}
                          </select>
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="text-xs text-gray-700 dark:text-zinc-300 divide-y divide-gray-150 dark:divide-zinc-850">
              {/* Category */}
              <tr>
                <td className="p-4 font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider text-[10px]">
                  {language === 'en' ? 'Category' : 'ምድብ'}
                </td>
                {[0, 1, 2].map((index) => {
                  const pId = comparedProductIds[index];
                  const prod = pId ? products.find((p) => p.id === pId) : null;
                  const catName = prod
                    ? categories.find((c) => c.id === prod.category)?.[language === 'en' ? 'nameEn' : 'nameAm'] || prod.category
                    : '-';
                  return (
                    <td key={index} className="p-4 border-l border-gray-150 dark:border-zinc-850 font-semibold">
                      {catName}
                    </td>
                  );
                })}
              </tr>

              {/* Brand */}
              <tr>
                <td className="p-4 font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider text-[10px]">
                  {language === 'en' ? 'Brand' : 'ብራንድ'}
                </td>
                {[0, 1, 2].map((index) => {
                  const pId = comparedProductIds[index];
                  const prod = pId ? products.find((p) => p.id === pId) : null;
                  return (
                    <td key={index} className="p-4 border-l border-gray-150 dark:border-zinc-850 font-bold text-gray-900 dark:text-white">
                      {prod ? prod.brand : '-'}
                    </td>
                  );
                })}
              </tr>

              {/* Merchant Store */}
              <tr>
                <td className="p-4 font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider text-[10px]">
                  {language === 'en' ? 'Seller / Merchant' : 'ሻጭ / ነጋዴ'}
                </td>
                {[0, 1, 2].map((index) => {
                  const pId = comparedProductIds[index];
                  const prod = pId ? products.find((p) => p.id === pId) : null;
                  return (
                    <td key={index} className="p-4 border-l border-gray-150 dark:border-zinc-850 font-medium">
                      {prod ? prod.merchantName : '-'}
                    </td>
                  );
                })}
              </tr>

              {/* Rating Info */}
              <tr>
                <td className="p-4 font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider text-[10px]">
                  {language === 'en' ? 'Customer Rating' : 'የደንበኞች ደረጃ'}
                </td>
                {[0, 1, 2].map((index) => {
                  const pId = comparedProductIds[index];
                  const prod = pId ? products.find((p) => p.id === pId) : null;
                  if (!prod) return <td key={index} className="p-4 border-l border-gray-150 dark:border-zinc-850">-</td>;
                  const { avg, count } = getProductRatingInfo(prod);
                  return (
                    <td key={index} className="p-4 border-l border-gray-150 dark:border-zinc-850">
                      {count > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <div className="flex text-amber-500">
                            {[...Array(Math.round(avg))].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-current shrink-0" />
                            ))}
                          </div>
                          <span className="font-bold text-gray-900 dark:text-white">{avg} ({count})</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-[11px] italic">
                          {language === 'en' ? 'No reviews yet' : 'እስካሁን ግምገማ የለም'}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Stock Availability */}
              <tr>
                <td className="p-4 font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider text-[10px]">
                  {language === 'en' ? 'In-Stock Status' : 'የክምችት ሁኔታ'}
                </td>
                {[0, 1, 2].map((index) => {
                  const pId = comparedProductIds[index];
                  const prod = pId ? products.find((p) => p.id === pId) : null;
                  if (!prod) return <td key={index} className="p-4 border-l border-gray-150 dark:border-zinc-850">-</td>;
                  const totalStock = prod.variants.reduce((sum, v) => sum + v.onHand, 0);
                  const isOut = totalStock <= 0;
                  return (
                    <td key={index} className="p-4 border-l border-gray-150 dark:border-zinc-850">
                      {isOut ? (
                        <span className="text-rose-600 dark:text-rose-400 font-bold uppercase text-[9px] bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-md border border-rose-100 dark:border-rose-900/40">
                          {language === 'en' ? 'Out of Stock' : 'ክምችት አልቋል'}
                        </span>
                      ) : (
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold uppercase text-[9px] bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-900/40">
                          {language === 'en' ? `${totalStock} units available` : `${totalStock} ዕቃዎች አሉ`}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Key Features */}
              <tr>
                <td className="p-4 font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider text-[10px]">
                  {language === 'en' ? 'Key Features' : 'ዋና ዋና ባህሪያት'}
                </td>
                {[0, 1, 2].map((index) => {
                  const pId = comparedProductIds[index];
                  const prod = pId ? products.find((p) => p.id === pId) : null;
                  if (!prod) return <td key={index} className="p-4 border-l border-gray-150 dark:border-zinc-850">-</td>;
                  const features = getProductFeatures(prod);
                  return (
                    <td key={index} className="p-4 border-l border-gray-150 dark:border-zinc-850 space-y-1.5 align-top">
                      {features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-1.5 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 leading-snug">
                          <span className="text-[#0052FF] text-xs shrink-0 select-none">✦</span>
                          <span>{feat}</span>
                        </div>
                      ))}
                    </td>
                  );
                })}
              </tr>

              {/* Technical Specifications */}
              <tr>
                <td className="p-4 font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider text-[10px]">
                  {language === 'en' ? 'Technical Specs' : 'ቴክኒካዊ መግለጫዎች'}
                </td>
                {[0, 1, 2].map((index) => {
                  const pId = comparedProductIds[index];
                  const prod = pId ? products.find((p) => p.id === pId) : null;
                  if (!prod) return <td key={index} className="p-4 border-l border-gray-150 dark:border-zinc-850">-</td>;
                  const specs = getProductSpecs(prod);
                  return (
                    <td key={index} className="p-4 border-l border-gray-150 dark:border-zinc-850 space-y-2.5 align-top">
                      {specs.map((spec, sIdx) => (
                        <div key={sIdx} className="border-b border-gray-100 dark:border-zinc-850/60 pb-2 last:border-0 last:pb-0">
                          <span className="block text-[9px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wide">
                            {language === 'en' ? spec.labelEn : spec.labelAm}
                          </span>
                          <span className="block text-[11px] font-black text-gray-800 dark:text-zinc-200 mt-0.5 leading-snug">
                            {language === 'en' ? spec.valueEn : spec.valueAm}
                          </span>
                        </div>
                      ))}
                    </td>
                  );
                })}
              </tr>

              {/* Variants */}
              <tr>
                <td className="p-4 font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider text-[10px]">
                  {language === 'en' ? 'Available Variants' : 'የሚገኙ አይነቶች'}
                </td>
                {[0, 1, 2].map((index) => {
                  const pId = comparedProductIds[index];
                  const prod = pId ? products.find((p) => p.id === pId) : null;
                  if (!prod) return <td key={index} className="p-4 border-l border-gray-150 dark:border-zinc-850">-</td>;
                  return (
                    <td key={index} className="p-4 border-l border-gray-150 dark:border-zinc-850 space-y-2 align-top">
                      {prod.variants.map((v) => (
                        <div key={v.sku} className="text-[10px] bg-gray-50 dark:bg-zinc-850 p-2 rounded-xl border border-gray-100 dark:border-zinc-800/80 flex items-center justify-between font-medium gap-2">
                          <div className="min-w-0 flex-1">
                            <span className="block truncate font-bold text-gray-900 dark:text-white leading-tight">{v.name}</span>
                            <span className="block text-[8px] font-mono text-gray-400 mt-0.5">
                              {v.sku} • {v.priceOffset > 0 ? `+${v.priceOffset} ETB` : v.priceOffset < 0 ? `${v.priceOffset} ETB` : 'Base Price'}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              addToCart(prod, v, 1);
                            }}
                            className="p-1 px-2.5 bg-indigo-50 dark:bg-zinc-800 hover:bg-indigo-100 dark:hover:bg-zinc-750 text-[#0052FF] dark:text-blue-400 font-extrabold text-[9px] uppercase rounded-lg border border-blue-150/50 dark:border-zinc-700/80 transition-all shrink-0 cursor-pointer"
                            title={language === 'en' ? `Add ${v.name} to Cart` : `ቅርጫት ውስጥ አስገባ`}
                          >
                            + Add
                          </button>
                        </div>
                      ))}
                    </td>
                  );
                })}
              </tr>

              {/* Descriptions */}
              <tr>
                <td className="p-4 font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider text-[10px]">
                  {language === 'en' ? 'Product Description' : 'የምርት መግለጫ'}
                </td>
                {[0, 1, 2].map((index) => {
                  const pId = comparedProductIds[index];
                  const prod = pId ? products.find((p) => p.id === pId) : null;
                  const desc = prod ? (language === 'en' ? prod.descriptionEn : prod.descriptionAm) : '';
                  return (
                    <td key={index} className="p-4 border-l border-gray-150 dark:border-zinc-850 text-gray-500 dark:text-zinc-400 leading-relaxed text-[11px] align-top max-w-xs">
                      <p className="line-clamp-6">{desc || '-'}</p>
                    </td>
                  );
                })}
              </tr>

              {/* Action Buttons */}
              <tr className="bg-gray-50/50 dark:bg-zinc-850/20">
                <td className="p-4 font-extrabold text-gray-400 dark:text-zinc-500 uppercase tracking-wider text-[10px]">
                  {language === 'en' ? 'Quick Actions' : 'ፈጣን ተግባራት'}
                </td>
                {[0, 1, 2].map((index) => {
                  const pId = comparedProductIds[index];
                  const prod = pId ? products.find((p) => p.id === pId) : null;
                  if (!prod) return <td key={index} className="p-4 border-l border-gray-150 dark:border-zinc-850"></td>;
                  return (
                    <td key={index} className="p-4 border-l border-gray-150 dark:border-zinc-850 space-y-2">
                      <button
                        onClick={() => {
                          onClose();
                          handleOpenProduct(prod);
                        }}
                        className="w-full bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-750 text-gray-800 dark:text-zinc-200 border border-gray-250 dark:border-zinc-700 font-extrabold uppercase text-[10px] tracking-wider py-2.5 px-3 rounded-xl text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#0052FF]" />
                        <span>{language === 'en' ? 'Quick View' : 'ፈጣን እይታ'}</span>
                      </button>

                      <button
                        onClick={() => {
                          const defaultVariant = prod.variants[0];
                          if (defaultVariant) {
                            addToCart(prod, defaultVariant, 1);
                          }
                        }}
                        className="w-full bg-black dark:bg-white hover:bg-zinc-900 dark:hover:bg-zinc-100 text-white dark:text-black font-extrabold uppercase text-[10px] tracking-wider py-2.5 px-3 rounded-xl text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 text-amber-500" />
                        <span>{language === 'en' ? 'Add Default' : 'ቅርጫት ውስጥ አስገባ'}</span>
                      </button>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
