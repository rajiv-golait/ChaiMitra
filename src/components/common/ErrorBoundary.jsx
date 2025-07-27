import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { ServerCrash, RefreshCw, Undo2 } from 'lucide-react';

// --- The Error Boundary Class (Logic is unchanged) ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
    // You could also log this to a service like Sentry, LogRocket, etc.
  }

  // Add a function to reset the state
  resetBoundary = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.resetBoundary}
        />
      );
    }

    return this.props.children;
  }
}


// --- The Re-styled Fallback UI Component ---
const ErrorFallback = ({ error, errorInfo, onRetry }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg text-center bg-white p-8 rounded-2xl shadow-lg">
        
        {/* Branded Icon and Header */}
        <div className="mx-auto w-16 h-16 flex items-center justify-center bg-red-500/10 rounded-full mb-5">
            <ServerCrash size={32} className="text-[#D72638]" />
        </div>
        <h1 className="font-poppins font-bold text-3xl text-[#1A1A1A]">
          {t('errors.somethingWentWrong', 'Oops! Something Went Wrong.')}
        </h1>
        <p className="text-gray-500 mt-2 mb-6">
          {t('errors.unexpectedError', "We've encountered an unexpected issue. Please try again.")}
        </p>

        {/* Technical Details for Devs */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mb-6 text-left bg-[#D72638]/5 border border-[#D72638]/20 rounded-xl p-4">
            <summary className="font-poppins font-semibold text-[#D72638] cursor-pointer mb-2">
              Technical Details (For Development)
            </summary>
            <pre className="text-xs text-red-800 whitespace-pre-wrap overflow-auto font-mono bg-transparent p-2 rounded-md">
              {error.toString()}
              {errorInfo && errorInfo.componentStack}
            </pre>
          </details>
        )}
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 text-gray-800 font-semibold rounded-xl
                       hover:bg-gray-200 transition-colors duration-200
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
          >
            <RefreshCw size={18} />
            {t('common.refresh', 'Refresh Page')}
          </button>
          <button
            onClick={onRetry}
            className="flex-1 flex items-center justify-center gap-2 text-[#1A1A1A] font-semibold py-3 px-6 rounded-xl shadow-md transition-all duration-300 transform
                       bg-gradient-to-br from-[#FFA500] to-[#FFC107]
                       hover:shadow-lg hover:shadow-[#FFA500]/40 hover:-translate-y-0.5
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFA500]"
          >
            <Undo2 size={18} />
            {t('common.tryAgain', 'Try Again')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;