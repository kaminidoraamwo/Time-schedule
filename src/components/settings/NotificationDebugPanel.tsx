import React from 'react';

type Props = {
    fcmToken: string;
    onRequestToken: () => Promise<string | null>;
    onTestNotification: () => Promise<void>;
};

export const NotificationDebugPanel: React.FC<Props> = ({
    fcmToken,
    onRequestToken,
    onTestNotification
}) => {
    return (
        <div className="p-6 border-t border-gray-200 bg-gray-100">
            <h4 className="text-sm font-bold text-gray-500 mb-2">開発者用テスト</h4>
            <div className="flex gap-2">
                <button
                    onClick={onRequestToken}
                    className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700"
                >
                    1. FCMトークンを取得
                </button>
                <button
                    onClick={onTestNotification}
                    disabled={!fcmToken}
                    className={`px-4 py-2 rounded text-sm ${!fcmToken ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                >
                    2. サーバー経由でテスト
                </button>
            </div>
            {fcmToken && (
                <div className="mt-2 p-2 bg-white border border-gray-300 rounded text-xs break-all font-mono select-all">
                    {fcmToken}
                </div>
            )}
        </div>
    );
};
