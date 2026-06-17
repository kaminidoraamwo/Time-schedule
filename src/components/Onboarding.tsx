import React from 'react';
import { TEMPLATES } from '../constants';
import { TemplateGallery } from './settings/TemplateGallery';

type Props = {
    onSelectTemplate: (id: string) => void;
    onSkip: () => void;
};

/**
 * 初回起動時のみ表示するオンボーディング（localStorage フラグで制御）。
 * 「選ぶ→確認→開始」を最短にするため、いきなりテンプレギャラリーを前面に出す。
 */
export const Onboarding: React.FC<Props> = ({ onSelectTemplate, onSkip }) => {
    return (
        <div className="fixed inset-0 bg-cream z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-2xl py-8">
                <div className="text-center mb-8">
                    <h1 className="font-serif text-3xl text-ink mb-3">ようこそ</h1>
                    <p className="text-ink-soft">
                        まずはメニューを選んで始めましょう。<br />
                        工程や時間はあとから自由に調整できます。
                    </p>
                </div>

                <TemplateGallery templates={TEMPLATES} onSelectTemplate={onSelectTemplate} />

                <div className="text-center mt-6">
                    <button
                        onClick={onSkip}
                        className="text-sm text-ink-soft hover:text-accent underline underline-offset-4 decoration-line transition-colors"
                    >
                        あとで設定する
                    </button>
                </div>
            </div>
        </div>
    );
};
