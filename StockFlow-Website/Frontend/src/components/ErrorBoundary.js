import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Application render error", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="screen-loader error-screen p-8 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <h2 className="text-xl font-bold text-white">We could not open this page</h2>
            <p className="text-sm text-slate-400">
              Your session is safe. You can go back to the dashboard or try this page again.
            </p>
            {this.state.error && (
              <pre className="text-xs text-rose-400 bg-rose-950/40 p-3 rounded-lg border border-rose-800/40 text-left font-mono overflow-auto max-h-32">
                {this.state.error.toString()}
              </pre>
            )}
            <div className="button-group flex justify-center gap-3 pt-2">
              <button
                className="btn secondary px-4 py-2 rounded-xl text-sm font-semibold border border-white/10 bg-white/5 hover:bg-white/10 transition text-white"
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                Try again
              </button>
              <button
                className="btn px-4 py-2 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-500 transition text-white"
                onClick={() => window.location.assign("/dashboard")}
              >
                Return to dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
