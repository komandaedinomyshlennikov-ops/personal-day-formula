import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface GlossaryTooltipProps {
  term: string;
  children: React.ReactNode;
  className?: string;
}

export function GlossaryTooltip({ term, children, className = '' }: GlossaryTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  
  // Get glossary data based on current language
  const getGlossaryData = (planetName: string) => {
    
    // Map Russian planet names to translation keys
    const planetKeyMap: Record<string, string> = {
      'Раху': 'rahu',
      'Кету': 'ketu',
      'Сатурн': 'saturn',
      'Марс': 'mars',
      'Меркурий': 'mercury',
      'Венера': 'venus',
      'Юпитер': 'jupiter',
      'Солнце': 'sun',
      'Луна': 'moon',
      // English equivalents
      'Rahu': 'rahu',
      'Ketu': 'ketu',
      'Saturn': 'saturn',
      'Mars': 'mars',
      'Mercury': 'mercury',
      'Venus': 'venus',
      'Jupiter': 'jupiter',
      'Sun': 'sun',
      'Moon': 'moon',
    };
    
    const key = planetKeyMap[planetName];
    if (!key) return null;
    
    return {
      term: t(`glossary.${key}.name`),
      shortDesc: t(`glossary.${key}.shortDesc`),
      fullDesc: t(`glossary.${key}.fullDesc`),
      westernEquivalent: t(`glossary.${key}.westernEquivalent`),
      examples: [
        t(`glossary.${key}.example1`),
        t(`glossary.${key}.example2`),
        t(`glossary.${key}.example3`),
        t(`glossary.${key}.example4`),
      ],
    };
  };
  
  const data = getGlossaryData(term);
  if (!data) return <>{children}</>;

  return (
    <>
      <span className={`inline-flex items-center gap-1 ${className}`}>
        {children}
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-400/20 hover:bg-amber-400/30 text-amber-400 transition-colors"
          aria-label={`${t('glossary.learnMore')} ${data.term}`}
        >
          <HelpCircle size={12} />
        </button>
      </span>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-[#1a1a2e] border border-white/10 rounded-2xl z-50 overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-amber-500/10 to-purple-500/10">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">✨</span>
                  {data.term}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 overflow-y-auto space-y-4">
                {/* Short description */}
                <p className="text-amber-400 text-sm font-medium">
                  {data.shortDesc}
                </p>

                {/* Full description */}
                <div className="glass-card p-4 rounded-2xl">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {data.fullDesc}
                  </p>
                </div>

                {/* Western equivalent */}
                <div className="flex items-start gap-2">
                  <span className="text-purple-400 text-lg">🌍</span>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">
                      {t('glossary.westernEquivalent')}
                    </p>
                    <p className="text-white text-sm">{data.westernEquivalent}</p>
                  </div>
                </div>

                {/* Examples */}
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">
                    {t('glossary.howItManifests')}
                  </p>
                  <ul className="space-y-2">
                    {data.examples.map((example, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">✦</span>
                        <span className="text-gray-300 text-sm">{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10 bg-white/5">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold hover:from-amber-600 hover:to-amber-700 transition-colors"
                >
                  {t('actions.close')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Simple inline tooltip for hover
interface InlineTooltipProps {
  term: string;
  children: React.ReactNode;
}

export function InlineTooltip({ term, children }: InlineTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { t } = useTranslation();
  
  // Get glossary data based on current language
  const getGlossaryData = (planetName: string) => {
    const planetKeyMap: Record<string, string> = {
      'Раху': 'rahu',
      'Кету': 'ketu',
      'Сатурн': 'saturn',
      'Марс': 'mars',
      'Меркурий': 'mercury',
      'Венера': 'venus',
      'Юпитер': 'jupiter',
      'Солнце': 'sun',
      'Луна': 'moon',
      'Rahu': 'rahu',
      'Ketu': 'ketu',
      'Saturn': 'saturn',
      'Mars': 'mars',
      'Mercury': 'mercury',
      'Venus': 'venus',
      'Jupiter': 'jupiter',
      'Sun': 'sun',
      'Moon': 'moon',
    };
    
    const key = planetKeyMap[planetName];
    if (!key) return null;
    
    return {
      term: t(`glossary.${key}.name`),
      shortDesc: t(`glossary.${key}.shortDesc`),
    };
  };
  
  const data = getGlossaryData(term);
  
  if (!data) return <>{children}</>;

  return (
    <span 
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="border-b border-dotted border-amber-400/50 cursor-help">
        {children}
      </span>
      
      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-xl z-30"
        >
          <p className="text-amber-400 text-xs font-medium mb-1">{data.term}</p>
          <p className="text-gray-300 text-xs">{data.shortDesc}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1a1a2e]" />
        </motion.div>
      )}
    </span>
  );
}
