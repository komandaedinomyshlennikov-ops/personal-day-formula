import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Heart, DollarSign, Users, Lightbulb, X, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface UseCase {
  id: string;
  category: 'business' | 'personal' | 'finance' | 'relationships' | 'creative';
  planet: string;
  title: string;
  scenario: string;
  goodTiming: string;
  badTiming: string;
  tips: string[];
}

export function UseCaseExamples() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCase, setSelectedCase] = useState<UseCase | null>(null);

  const useCases: UseCase[] = [
    {
      id: 'mars-negotiations',
      category: 'business',
      planet: `${t('energies.9.name')} (9)`,
      title: t('useCases.marsNegotiations.title'),
      scenario: t('useCases.marsNegotiations.scenario'),
      goodTiming: t('useCases.marsNegotiations.goodTiming'),
      badTiming: t('useCases.marsNegotiations.badTiming'),
      tips: [
        t('useCases.marsNegotiations.tip1'),
        t('useCases.marsNegotiations.tip2'),
        t('useCases.marsNegotiations.tip3'),
        t('useCases.marsNegotiations.tip4'),
      ],
    },
    {
      id: 'mercury-presentations',
      category: 'business',
      planet: `${t('energies.5.name')} (5)`,
      title: t('useCases.mercuryPresentations.title'),
      scenario: t('useCases.mercuryPresentations.scenario'),
      goodTiming: t('useCases.mercuryPresentations.goodTiming'),
      badTiming: t('useCases.mercuryPresentations.badTiming'),
      tips: [
        t('useCases.mercuryPresentations.tip1'),
        t('useCases.mercuryPresentations.tip2'),
        t('useCases.mercuryPresentations.tip3'),
        t('useCases.mercuryPresentations.tip4'),
      ],
    },
    {
      id: 'jupiter-startup',
      category: 'business',
      planet: `${t('energies.3.name')} (3)`,
      title: t('useCases.jupiterStartup.title'),
      scenario: t('useCases.jupiterStartup.scenario'),
      goodTiming: t('useCases.jupiterStartup.goodTiming'),
      badTiming: t('useCases.jupiterStartup.badTiming'),
      tips: [
        t('useCases.jupiterStartup.tip1'),
        t('useCases.jupiterStartup.tip2'),
        t('useCases.jupiterStartup.tip3'),
        t('useCases.jupiterStartup.tip4'),
      ],
    },
    {
      id: 'venus-date',
      category: 'relationships',
      planet: `${t('energies.6.name')} (6)`,
      title: t('useCases.venusDate.title'),
      scenario: t('useCases.venusDate.scenario'),
      goodTiming: t('useCases.venusDate.goodTiming'),
      badTiming: t('useCases.venusDate.badTiming'),
      tips: [
        t('useCases.venusDate.tip1'),
        t('useCases.venusDate.tip2'),
        t('useCases.venusDate.tip3'),
        t('useCases.venusDate.tip4'),
      ],
    },
    {
      id: 'saturn-contract',
      category: 'business',
      planet: `${t('energies.8.name')} (8)`,
      title: t('useCases.saturnContract.title'),
      scenario: t('useCases.saturnContract.scenario'),
      goodTiming: t('useCases.saturnContract.goodTiming'),
      badTiming: t('useCases.saturnContract.badTiming'),
      tips: [
        t('useCases.saturnContract.tip1'),
        t('useCases.saturnContract.tip2'),
        t('useCases.saturnContract.tip3'),
        t('useCases.saturnContract.tip4'),
      ],
    },
    {
      id: 'sun-leadership',
      category: 'business',
      planet: `${t('energies.1.name')} (1)`,
      title: t('useCases.sunLeadership.title'),
      scenario: t('useCases.sunLeadership.scenario'),
      goodTiming: t('useCases.sunLeadership.goodTiming'),
      badTiming: t('useCases.sunLeadership.badTiming'),
      tips: [
        t('useCases.sunLeadership.tip1'),
        t('useCases.sunLeadership.tip2'),
        t('useCases.sunLeadership.tip3'),
        t('useCases.sunLeadership.tip4'),
      ],
    },
    {
      id: 'moon-relationships',
      category: 'relationships',
      planet: `${t('energies.2.name')} (2)`,
      title: t('useCases.moonRelationships.title'),
      scenario: t('useCases.moonRelationships.scenario'),
      goodTiming: t('useCases.moonRelationships.goodTiming'),
      badTiming: t('useCases.moonRelationships.badTiming'),
      tips: [
        t('useCases.moonRelationships.tip1'),
        t('useCases.moonRelationships.tip2'),
        t('useCases.moonRelationships.tip3'),
        t('useCases.moonRelationships.tip4'),
      ],
    },
    {
      id: 'rahu-innovation',
      category: 'creative',
      planet: `${t('energies.4.name')} (4)`,
      title: t('useCases.rahuInnovation.title'),
      scenario: t('useCases.rahuInnovation.scenario'),
      goodTiming: t('useCases.rahuInnovation.goodTiming'),
      badTiming: t('useCases.rahuInnovation.badTiming'),
      tips: [
        t('useCases.rahuInnovation.tip1'),
        t('useCases.rahuInnovation.tip2'),
        t('useCases.rahuInnovation.tip3'),
        t('useCases.rahuInnovation.tip4'),
      ],
    },
    {
      id: 'ketu-reflection',
      category: 'personal',
      planet: `${t('energies.7.name')} (7)`,
      title: t('useCases.ketuReflection.title'),
      scenario: t('useCases.ketuReflection.scenario'),
      goodTiming: t('useCases.ketuReflection.goodTiming'),
      badTiming: t('useCases.ketuReflection.badTiming'),
      tips: [
        t('useCases.ketuReflection.tip1'),
        t('useCases.ketuReflection.tip2'),
        t('useCases.ketuReflection.tip3'),
        t('useCases.ketuReflection.tip4'),
      ],
    },
    {
      id: 'mercury-sales',
      category: 'finance',
      planet: `${t('energies.5.name')} (5)`,
      title: t('useCases.mercurySales.title'),
      scenario: t('useCases.mercurySales.scenario'),
      goodTiming: t('useCases.mercurySales.goodTiming'),
      badTiming: t('useCases.mercurySales.badTiming'),
      tips: [
        t('useCases.mercurySales.tip1'),
        t('useCases.mercurySales.tip2'),
        t('useCases.mercurySales.tip3'),
        t('useCases.mercurySales.tip4'),
      ],
    },
  ];

  const categories = [
    { id: 'all', label: t('useCases.all'), icon: Lightbulb },
    { id: 'business', label: t('useCases.business'), icon: Briefcase },
    { id: 'relationships', label: t('useCases.relationships'), icon: Heart },
    { id: 'finance', label: t('useCases.finance'), icon: DollarSign },
    { id: 'personal', label: t('useCases.personal'), icon: Users },
    { id: 'creative', label: t('useCases.creative'), icon: Lightbulb },
  ];

  const filteredCases = selectedCategory === 'all' 
    ? useCases 
    : useCases.filter(c => c.category === selectedCategory);

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all
                ${selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <Icon size={16} />
              <span className="text-sm font-medium">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Use Cases List */}
      <div className="space-y-3">
        {filteredCases.map((useCase) => (
          <motion.button
            key={useCase.id}
            onClick={() => setSelectedCase(useCase)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full text-left glass-card p-4 hover:bg-white/5 transition-colors group rounded-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                    {useCase.planet}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">
                    {categories.find(c => c.id === useCase.category)?.label}
                  </span>
                </div>
                <h4 className="text-white font-semibold group-hover:text-amber-400 transition-colors">
                  {useCase.title}
                </h4>
                <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                  {useCase.scenario}
                </p>
              </div>
              <ChevronRight size={20} className="text-gray-500 group-hover:text-amber-400 transition-colors flex-shrink-0" />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedCase && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCase(null)}
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
                <div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 mb-2 inline-block">
                    {selectedCase.planet}
                  </span>
                  <h3 className="text-lg font-bold text-white">{selectedCase.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 overflow-y-auto space-y-4">
                {/* Scenario */}
                <div className="glass-card p-4 rounded-2xl">
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">{t('useCases.scenario')}</p>
                  <p className="text-white text-sm">{selectedCase.scenario}</p>
                </div>

                {/* Good Timing */}
                <div className="glass-card p-4 border-green-400/20 bg-green-500/5 rounded-2xl">
                  <p className="text-green-400 text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span>✓</span> {t('useCases.goodTiming')}
                  </p>
                  <p className="text-gray-300 text-sm">{selectedCase.goodTiming}</p>
                </div>

                {/* Bad Timing */}
                <div className="glass-card p-4 border-red-400/20 bg-red-500/5 rounded-2xl">
                  <p className="text-red-400 text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span>✕</span> {t('useCases.badTiming')}
                  </p>
                  <p className="text-gray-300 text-sm">{selectedCase.badTiming}</p>
                </div>

                {/* Tips */}
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">{t('useCases.tips')}</p>
                  <ul className="space-y-2">
                    {selectedCase.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">✦</span>
                        <span className="text-gray-300 text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10 bg-white/5">
                <button
                  onClick={() => setSelectedCase(null)}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold hover:from-amber-600 hover:to-amber-700 transition-colors"
                >
                  {t('actions.close')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
