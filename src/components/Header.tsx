import React from 'react';

type Props = {
    isActive: boolean;
    isMuted: boolean;
    onToggleMute: () => void;
    onOpenSettings: () => void;
};

export const Header: React.FC<Props> = ({
    isActive,
    isMuted,
    onToggleMute,
    onOpenSettings
}) => {
    return (
        <header className={`bg-white shadow-sm py-4 px-6 flex justify-between items-center ${isActive ? 'mb-2' : 'mb-6'}`}>
            <h1 className="text-xl font-bold text-gray-700">Salon Pacer</h1>
            <div className="flex gap-4">
                <button
                    onClick={onToggleMute}
                    className="text-2xl hover:scale-110 transition-transform"
                    title={isMuted ? "ミュート解除" : "ミュート"}
                >
                    {isMuted ? "🔇" : "🔊"}
                </button>
                <button
                    onClick={onOpenSettings}
                    className="text-gray-500 hover:text-blue-600"
                >
                    ⚙️ 設定
                </button>
            </div>
        </header>
    );
};
