import React from 'react';
import type { Preset } from '../../types';
import { getTotalDurationMinutes } from '../../utils/schedule';

type Props = {
    templates: Preset[];
    onSelectTemplate: (id: string) => void;
};

const formatTotal = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0) return `約${minutes}分`;
    if (minutes === 0) return `約${hours}時間`;
    return `約${hours}時間${minutes}分`;
};

export const TemplateGallery: React.FC<Props> = ({ templates, onSelectTemplate }) => {
    return (
        <div className="mb-8">
            <h3 className="font-serif text-lg text-ink mb-1">メニューを選ぶ</h3>
            <p className="text-sm text-ink-soft mb-3">テンプレートから始められます（あとで自由に調整OK）</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {templates.map(template => {
                    const totalMinutes = getTotalDurationMinutes(template.steps);
                    return (
                        <button
                            key={template.id}
                            onClick={() => onSelectTemplate(template.id)}
                            className="flex flex-col items-center text-center bg-cream-alt border border-line rounded-none p-4 hover:border-ink transition-colors active:translate-y-0.5"
                        >
                            <span className="text-3xl mb-2" aria-hidden="true">{template.icon}</span>
                            <span className="font-medium text-ink">{template.name}</span>
                            <span className="text-xs text-ink-soft mt-1">{formatTotal(totalMinutes)}</span>
                            <span className="text-xs text-ink-faint">{template.steps.length}工程</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
