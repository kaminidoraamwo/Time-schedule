import React from 'react';
import type { Preset } from '../../types';
import { getTotalDurationMinutes, formatTotalDurationLabel } from '../../utils/schedule';

type Props = {
    templates: Preset[];
    selectedId?: string | null;
    onSelectTemplate: (id: string) => void;
};

export const TemplateGallery: React.FC<Props> = ({ templates, selectedId, onSelectTemplate }) => {
    return (
        <div className="mb-8">
            <h3 className="font-serif text-lg text-ink mb-1">メニューを選ぶ</h3>
            <p className="text-sm text-ink-soft mb-3">テンプレートから始められます（あとで自由に調整OK）</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {templates.map(template => {
                    const totalMinutes = getTotalDurationMinutes(template.steps);
                    const isSelected = template.id === selectedId;
                    return (
                        <button
                            key={template.id}
                            onClick={() => onSelectTemplate(template.id)}
                            aria-pressed={isSelected}
                            className={`relative flex flex-col items-center text-center bg-cream-alt border rounded-none p-4 transition-colors active:translate-y-0.5 ${
                                isSelected ? 'border-ink ring-1 ring-ink' : 'border-line hover:border-ink'
                            }`}
                        >
                            {isSelected && (
                                <span aria-hidden="true" className="absolute top-1 right-1 text-xs text-cream bg-ink px-1.5 py-0.5 rounded-none">選択中</span>
                            )}
                            <span className="text-3xl mb-2" aria-hidden="true">{template.icon}</span>
                            <span className="font-medium text-ink">{template.name}</span>
                            <span className="text-xs text-ink-soft mt-1">{formatTotalDurationLabel(totalMinutes)}</span>
                            <span className="text-xs text-ink-faint">{template.steps.length}工程</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
