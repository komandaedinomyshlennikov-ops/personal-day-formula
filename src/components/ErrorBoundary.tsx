import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryClass extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

// Fallback component with translation
function ErrorFallback({ error }: { error: Error | null }) {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
          <span className="text-4xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">
          {t('errors.generic', 'Something went wrong')}
        </h1>
        <p className="text-gray-400 mb-6">
          {t('errors.tryAgain', 'Please try refreshing the page')}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-full font-medium hover:opacity-90 transition-opacity"
        >
          {t('actions.refresh', 'Refresh Page')}
        </button>
        {error && (
          <details className="mt-6 text-left">
            <summary className="text-gray-500 cursor-pointer text-sm">
              {t('errors.details', 'Error details')}
            </summary>
            <pre className="mt-2 p-4 bg-white/5 rounded-lg text-red-400 text-xs overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

export { ErrorBoundaryClass as ErrorBoundary };
