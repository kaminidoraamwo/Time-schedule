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
        <header className={`bg-cream border-b border-line py-4 px-6 flex justify-between items-center ${isActive ? 'mb-2' : 'mb-6'}`}>
            <h1 className="font-serif text-xl text-ink tracking-wide">Salon Pacer</h1>
            <div className="flex gap-4 items-center">
                <button
                    onClick={onToggleMute}
                    className="text-xl text-ink-soft hover:text-ink transition-colors"
                    title={isMuted ? "ミュート解除" : "ミュート"}
                >
                    {isMuted ? "🔇" : "🔊"}
                </button>
                <button
                    onClick={onOpenSettings}
                    className="text-sm text-ink-soft hover:text-accent transition-colors"
                >
                    設定
                </button>
            </div>
        </header>
    );
};
