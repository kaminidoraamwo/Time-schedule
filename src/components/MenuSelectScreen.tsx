import React, { useState } from 'react';
import type { Preset } from '../types';
import { formatTotalDurationLabel } from '../utils/schedule';
import { TemplateGallery } from './settings/TemplateGallery';
import { PresetManager } from './settings/PresetManager';

type PendingSelection = { type: 'template' | 'preset'; id: string };

type Props = {
    templates: Preset[];
    presets: Preset[];
    menuName?: string;
    isMenuDirty?: boolean;
    currentStepsCount: number;
    currentTotalMinutes: number;
    onSelectTemplate: (id: string) => void;
    onSavePreset: (name: string) => void;
    onLoadPreset: (id: string) => void;
    onDeletePreset: (id: string) => void;
    onProceedWithCurrent: () => void;
    onOpenHistory: () => void;
};

export const MenuSelectScreen: React.FC<Props> = ({
    templates,
    presets,
    menuName,
    isMenuDirty = false,
    currentStepsCount,
    currentTotalMinutes,
    onSelectTemplate,
    onSavePreset,
    onLoadPreset,
    onDeletePreset,
    onProceedWithCurrent,
    onOpenHistory,
}) => {
    // カードのタップは「選択（ハイライト）」だけ。実際の適用＆次画面遷移は「次へ」で行う。
    const [pending, setPending] = useState<PendingSelection | null>(null);
    // 削除は破壊的なので確認をはさむ。
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const pendingDeletePreset = presets.find((p) => p.id === pendingDeleteId) ?? null;

    const pendingName = pending
        ? (pending.type === 'template' ? templates : presets).find((x) => x.id === pending.id)?.name ?? null
        : null;

    const handleNext = () => {
        if (!pending) return;
        if (pending.type === 'template') onSelectTemplate(pending.id);
        else onLoadPreset(pending.id);
    };

    const confirmDelete = () => {
        if (!pendingDeleteId) return;
        const idToDelete = pendingDeleteId;
        onDeletePreset(idToDelete);
        // 選択中のものを消したら選択も解除
        setPending((prev) => (prev?.id === idToDelete ? null : prev));
        setPendingDeleteId(null);
    };

    return (
        <div className="py-8">
            <h2 className="font-serif text-3xl mb-1 text-ink text-center">メニューを選ぶ</h2>
            <p className="text-sm text-ink-soft mb-6 text-center">
                テンプレートやプリセットを選んで「次へ」。または今の設定のまま進めます
            </p>

            <TemplateGallery
                templates={templates}
                selectedId={pending?.type === 'template' ? pending.id : null}
                onSelectTemplate={(id) => setPending({ type: 'template', id })}
            />

            <PresetManager
                presets={presets}
                selectedId={pending?.type === 'preset' ? pending.id : null}
                onSavePreset={onSavePreset}
                onLoadPreset={(id) => setPending({ type: 'preset', id })}
                onDeletePreset={setPendingDeleteId}
            />

            <div className="flex flex-col items-center mt-8 pt-6 border-t border-line">
                <button
                    onClick={handleNext}
                    disabled={!pending}
                    className="bg-ink hover:opacity-90 disabled:bg-ink-faint disabled:opacity-100 disabled:cursor-not-allowed text-cream font-medium py-3 px-10 rounded-none transition-opacity active:opacity-80"
                >
                    {pendingName ? `『${pendingName}』で次へ →` : 'メニューを選んでください'}
                </button>

                {currentStepsCount > 0 && (
                    <button
                        onClick={onProceedWithCurrent}
                        className="mt-4 text-sm text-ink-soft hover:text-ink transition-colors underline underline-offset-4 decoration-line"
                    >
                        今の設定のまま進む（
                        {menuName ? `『${menuName}』${isMenuDirty ? '（変更あり）' : ''}・` : ''}
                        {currentStepsCount}工程・{formatTotalDurationLabel(currentTotalMinutes)}）
                    </button>
                )}

                <button
                    onClick={onOpenHistory}
                    className="mt-6 text-sm text-ink-soft hover:text-accent transition-colors underline underline-offset-4 decoration-line"
                >
                    施術履歴を見る
                </button>
            </div>

            {/* プリセット削除の確認 */}
            {pendingDeletePreset && (
                <div className="fixed inset-0 bg-ink/40 flex items-center justify-center z-[60] p-4">
                    <div className="bg-cream border border-line rounded-none p-6 max-w-sm w-full mx-4">
                        <h3 className="font-serif text-lg text-ink mb-2">確認</h3>
                        <p className="text-ink-soft mb-6">
                            プリセット「{pendingDeletePreset.name}」を削除しますか？
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setPendingDeleteId(null)}
                                className="px-4 py-2 text-ink-soft hover:bg-cream-alt rounded-none transition-colors"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 text-cream bg-red-500 rounded-none transition-opacity hover:opacity-90"
                            >
                                削除する
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
