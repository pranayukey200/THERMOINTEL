import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[THERMOINTEL ErrorBoundary Caught]:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#060913] text-white p-6 select-none font-sans">
          <div className="tactical-card max-w-lg w-full p-6 rounded-2xl border border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)] text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-base font-bold font-mono tracking-wider text-white">
                THERMOINTEL UI RECOVERY
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                A component encountered an issue rendering telemetry points.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-black/60 p-3 rounded-lg border border-red-900/50 text-left font-mono text-[11px] text-red-300 overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all inline-flex items-center gap-2 shadow-lg"
            >
              <RotateCcw className="w-4 h-4" /> Reload Command Center
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
