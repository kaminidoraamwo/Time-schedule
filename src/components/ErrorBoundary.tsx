import { Component, type ErrorInfo, type ReactNode } from 'react';

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
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleReset = () => {
        // 最終手段としてローカルストレージをクリアするオプションも考えられるが
        // まずは単なるリロードを提供する
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-cream p-4">
                    <div className="bg-cream border border-line rounded-none p-8 max-w-md w-full text-center">
                        <div className="text-6xl mb-4">😢</div>
                        <h1 className="font-serif text-xl text-ink mb-2">予期せぬエラーが発生しました</h1>
                        <p className="text-ink-soft mb-6 text-sm">
                            申し訳ありません。アプリに問題が発生しました。<br />
                            再読み込みを試してください。
                        </p>

                        <div className="bg-red-50 text-red-600 p-3 rounded-none mb-6 text-xs text-left overflow-auto max-h-32">
                            {this.state.error?.toString()}
                        </div>

                        <button
                            onClick={this.handleReset}
                            className="bg-ink hover:opacity-90 text-cream font-medium py-3 px-6 rounded-none w-full transition-opacity"
                        >
                            アプリを再読み込み
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
