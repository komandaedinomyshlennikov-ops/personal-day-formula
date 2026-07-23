import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SITE_AUTHOR, SITE_EMAIL, SITE_NAME, SITE_URL, SUPPORT_TELEGRAM } from '@/config/site';

type DocKind = 'privacy' | 'terms';

interface LegalDocumentProps {
  kind: DocKind;
}

export function LegalDocument({ kind }: LegalDocumentProps) {
  const { i18n } = useTranslation();
  const isRu = i18n.language?.startsWith('ru');
  const updated = '2026-07-23';

  return (
    <div className="app-shell min-h-screen pb-16">
      <header className="app-header">
        <Link to="/settings" className="icon-btn" aria-label="Back">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-display text-xl text-white leading-tight">
          {kind === 'privacy'
            ? isRu
              ? 'Политика конфиденциальности'
              : 'Privacy Policy'
            : isRu
              ? 'Публичная оферта'
              : 'Terms of Service'}
        </h1>
      </header>

      <article className="px-4 py-6 max-w-2xl mx-auto prose prose-invert prose-sm">
        <p className="text-gray-500 text-xs mb-6">
          {isRu ? 'Обновлено' : 'Updated'}: {updated} · {SITE_NAME}
        </p>

        {kind === 'privacy' ? (
          isRu ? <PrivacyRu /> : <PrivacyEn />
        ) : isRu ? (
          <TermsRu />
        ) : (
          <TermsEn />
        )}

        <div className="mt-10 pt-6 border-t border-white/10 text-gray-400 text-sm space-y-1 not-prose">
          <p>
            {isRu ? 'Оператор' : 'Operator'}: {SITE_AUTHOR}
          </p>
          <p>
            Web: <a className="text-amber-400" href={SITE_URL}>{SITE_URL}</a>
          </p>
          <p>
            Telegram:{' '}
            <a className="text-amber-400" href={SUPPORT_TELEGRAM} target="_blank" rel="noreferrer">
              {SUPPORT_TELEGRAM}
            </a>
          </p>
          {SITE_EMAIL && (
            <p>
              Email: <a className="text-amber-400" href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a>
            </p>
          )}
        </div>
      </article>
    </div>
  );
}

function PrivacyRu() {
  return (
    <div className="space-y-4 text-gray-300 leading-relaxed">
      <h2 className="text-white text-base font-semibold">1. Общие положения</h2>
      <p>
        Настоящая Политика описывает, как приложение «{SITE_NAME}» (далее — Сервис)
        обрабатывает данные пользователей на сайте {SITE_URL}.
      </p>
      <h2 className="text-white text-base font-semibold">2. Какие данные обрабатываются</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Дата рождения — для расчёта личного календаря (хранится локально в браузере).</li>
        <li>Настройки (язык, тема, уведомления, контраст) — localStorage.</li>
        <li>Заметки пользователя — localStorage.</li>
        <li>Статус пробного периода / подписки (дата окончания) — localStorage.</li>
        <li>Технические cookie/localStorage согласия на аналитику.</li>
      </ul>
      <h2 className="text-white text-base font-semibold">3. Где хранятся данные</h2>
      <p>
        Основные пользовательские данные хранятся <strong className="text-white">только на вашем устройстве</strong>
        (localStorage) и не передаются на наш сервер, так как Сервис работает как статический клиентский сайт.
        Очистка данных браузера удаляет эту информацию.
      </p>
      <h2 className="text-white text-base font-semibold">4. Аналитика</h2>
      <p>
        Опциональная веб-аналитика (Google Analytics) подключается только после вашего согласия в cookie-баннере
        и только если владелец Сервиса настроил идентификатор. Вы можете отказаться («Только необходимое»).
      </p>
      <h2 className="text-white text-base font-semibold">5. Платежи</h2>
      <p>
        Оплата подписки осуществляется вне Сервиса (через Telegram / договорённость с автором).
        Платёжные реквизиты карт в приложении не собираются и не хранятся.
      </p>
      <h2 className="text-white text-base font-semibold">6. Права пользователя</h2>
      <p>
        Вы можете в любой момент удалить данные в Настройках («Удалить данные» / «Выйти»),
        отозвать согласие на аналитику, очистив localStorage, или написать автору.
      </p>
      <h2 className="text-white text-base font-semibold">7. Контакты</h2>
      <p>По вопросам конфиденциальности: {SUPPORT_TELEGRAM}</p>
    </div>
  );
}

function PrivacyEn() {
  return (
    <div className="space-y-4 text-gray-300 leading-relaxed">
      <h2 className="text-white text-base font-semibold">1. Overview</h2>
      <p>
        This Policy explains how {SITE_NAME} (“Service”) handles user data at {SITE_URL}.
      </p>
      <h2 className="text-white text-base font-semibold">2. Data we process</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Birth date — to compute the personal calendar (browser localStorage).</li>
        <li>Preferences (language, theme, notifications, contrast) — localStorage.</li>
        <li>User notes — localStorage.</li>
        <li>Trial / subscription end date — localStorage.</li>
        <li>Cookie-consent preference for optional analytics.</li>
      </ul>
      <h2 className="text-white text-base font-semibold">3. Storage</h2>
      <p>
        Core user data is stored <strong className="text-white">only on your device</strong>.
        The Service is a static client-side app and does not upload this data to our server.
        Clearing site data removes it.
      </p>
      <h2 className="text-white text-base font-semibold">4. Analytics</h2>
      <p>
        Optional Google Analytics loads only after you accept cookies and only if a measurement ID is configured.
        You may choose “Essential only”.
      </p>
      <h2 className="text-white text-base font-semibold">5. Payments</h2>
      <p>
        Subscription payments happen outside the app (Telegram / arrangement with the author).
        Card details are never collected by the app.
      </p>
      <h2 className="text-white text-base font-semibold">6. Your rights</h2>
      <p>
        Delete data anytime in Settings, clear browser storage, or contact the operator.
      </p>
      <h2 className="text-white text-base font-semibold">7. Contact</h2>
      <p>{SUPPORT_TELEGRAM}</p>
    </div>
  );
}

function TermsRu() {
  return (
    <div className="space-y-4 text-gray-300 leading-relaxed">
      <h2 className="text-white text-base font-semibold">1. Предмет оферты</h2>
      <p>
        Настоящая оферта определяет условия использования Сервиса «{SITE_NAME}» и
        предоставления доступа к персональному календарю (пробный период и платные тарифы).
      </p>
      <h2 className="text-white text-base font-semibold">2. Услуги</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Пробный доступ — 3 дня после ввода даты рождения.</li>
        <li>Платные планы: месяц, год, lifetime — активируются кодом после оплаты.</li>
        <li>Контент носит рекомендательный / информационно-развлекательный характер и не является медицинской, финансовой или юридической консультацией.</li>
      </ul>
      <h2 className="text-white text-base font-semibold">3. Оплата и активация</h2>
      <p>
        Оплата производится через согласованный канал (Telegram). После подтверждения оплаты
        пользователь получает код активации. Возвраты — по согласованию с оператором в разумный срок,
        если доступ не был активирован или по иным основаниям, согласованным сторонами.
      </p>
      <h2 className="text-white text-base font-semibold">4. Ограничение ответственности</h2>
      <p>
        Сервис предоставляется «как есть». Оператор не гарантирует бесперебойную работу сторонних
        платформ (GitHub Pages, Telegram) и не отвечает за решения, принятые пользователем на основе календаря.
      </p>
      <h2 className="text-white text-base font-semibold">5. Интеллектуальная собственность</h2>
      <p>
        Тексты, дизайн и методики в составе Сервиса принадлежат автору / правообладателю.
        Копирование в коммерческих целях без согласия запрещено.
      </p>
      <h2 className="text-white text-base font-semibold">6. Принятие условий</h2>
      <p>
        Начиная использование Сервиса (ввод даты рождения / оплату), вы принимаете условия оферты.
      </p>
    </div>
  );
}

function TermsEn() {
  return (
    <div className="space-y-4 text-gray-300 leading-relaxed">
      <h2 className="text-white text-base font-semibold">1. Agreement</h2>
      <p>
        These Terms govern use of {SITE_NAME} and access to the personal calendar
        (trial and paid plans).
      </p>
      <h2 className="text-white text-base font-semibold">2. Services</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Trial: 3 days after entering a birth date.</li>
        <li>Paid plans (month / year / lifetime) activated with a code after payment.</li>
        <li>Content is informational/entertainment and not medical, financial, or legal advice.</li>
      </ul>
      <h2 className="text-white text-base font-semibold">3. Payment & activation</h2>
      <p>
        Payment is arranged via Telegram (or another channel agreed with the operator).
        After payment confirmation you receive an activation code. Refunds are handled case-by-case with the operator.
      </p>
      <h2 className="text-white text-base font-semibold">4. Disclaimer</h2>
      <p>
        The Service is provided “as is”. The operator is not liable for decisions made based on calendar guidance
        or for outages of third-party hosts (e.g. GitHub Pages, Telegram).
      </p>
      <h2 className="text-white text-base font-semibold">5. IP</h2>
      <p>
        App content and design belong to the rights holder. Commercial reuse without permission is prohibited.
      </p>
      <h2 className="text-white text-base font-semibold">6. Acceptance</h2>
      <p>
        Using the Service (entering a birth date or purchasing access) means you accept these Terms.
      </p>
    </div>
  );
}
