import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Key, Send, Check, Loader2 } from 'lucide-react';

interface ActivationCodeProps {
  onActivate: (code: string) => boolean | Promise<boolean>;
  onBack: () => void;
}

export function ActivationCode({ onActivate, onBack }: ActivationCodeProps) {
  const [code, setCode] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setError('Введите код активации');
      return;
    }

    setIsChecking(true);
    setError('');

    try {
      const ok = await onActivate(code.trim().toUpperCase());
      if (!ok) {
        setError('Неверный или устаревший код активации');
      }
    } catch {
      setError('Ошибка проверки кода. Попробуйте ещё раз.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="px-4 py-4 flex items-center gap-4 bg-black/20 backdrop-blur-md sticky top-0 z-20">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-white">Активация подписки</h1>
      </header>

      <div className="px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          {/* Icon */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.1 }}
              className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.2))',
                boxShadow: '0 0 40px rgba(139, 92, 246, 0.3)'
              }}
            >
              <Key size={40} className="text-amber-400" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              Введите код активации
            </h2>
            <p className="text-gray-400 text-sm">
              После оплаты в Telegram вы получите код для активации подписки
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  placeholder="XXXX-XXXX-XXXX"
                  maxLength={14}
                  disabled={isChecking}
                  className="w-full px-4 py-4 text-center text-lg tracking-widest bg-white/5 border border-white/10 text-white rounded-xl focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-colors uppercase placeholder:text-gray-600"
                />
                {isChecking && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Loader2 size={20} className="text-amber-400 animate-spin" />
                  </div>
                )}
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mt-2 text-center"
                >
                  {error}
                </motion.p>
              )}
            </div>

            <button
              type="submit"
              disabled={isChecking || !code.trim()}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-black font-semibold hover:from-amber-500 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isChecking ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Проверка...
                </>
              ) : (
                <>
                  <Check size={20} />
                  Активировать
                </>
              )}
            </button>
          </form>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Send size={16} className="text-amber-400" />
              Как получить код?
            </h3>
            <ol className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">1.</span>
                <span>Нажмите кнопку "Оплатить в Telegram"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">2.</span>
                <span>Свяжитесь с Татьяной и произведите оплату</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">3.</span>
                <span>Получите код активации в ответном сообщении</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">4.</span>
                <span>Введите код в поле выше</span>
              </li>
            </ol>
          </motion.div>

          {/* Telegram Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 text-center"
          >
            <a
              href="https://t.me/tatianageniush"
              target="_blank"
              rel="noopener noreferrer"
              className="telegram-button inline-flex"
            >
              <Send size={18} />
              Написать в Telegram
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
