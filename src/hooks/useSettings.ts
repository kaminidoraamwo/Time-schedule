import { useState, useEffect, useCallback } from 'react';
import { SCHEDULE_STEPS, type Step } from '../constants';

const STORAGE_KEY = 'salon-pacer-settings';
const PRESETS_KEY = 'salon-pacer-presets';

export type Preset = {
    id: string;
    name: string;
    steps: Step[];
};

export const useSettings = () => {
    const [steps, setSteps] = useState<Step[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : SCHEDULE_STEPS;
    });

    const [presets, setPresets] = useState<Preset[]>(() => {
        const saved = localStorage.getItem(PRESETS_KEY);
        return saved ? JSON.parse(saved) : [];
    });

    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(steps));
    }, [steps]);

    useEffect(() => {
        localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
    }, [presets]);

    const updateStep = useCallback((id: number, field: keyof Step, value: string | number) => {
        setSteps(prev => prev.map(step =>
            step.id === id ? { ...step, [field]: value } : step
        ));
    }, []);

    const addStep = useCallback(() => {
        setSteps(prev => {
            const newId = Math.max(...prev.map(s => s.id), 0) + 1;
            return [...prev, { id: newId, name: '新規ステップ', durationMinutes: 10 }];
        });
    }, []);

    const removeStep = useCallback((id: number) => {
        setSteps(prev => prev.filter(s => s.id !== id));
    }, []);

    const moveStep = useCallback((index: number, direction: 'up' | 'down') => {
        setSteps(prev => {
            const newSteps = [...prev];
            if (direction === 'up' && index > 0) {
                [newSteps[index], newSteps[index - 1]] = [newSteps[index - 1], newSteps[index]];
            } else if (direction === 'down' && index < newSteps.length - 1) {
                [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
            }
            return newSteps;
        });
    }, []);

    const resetToDefault = useCallback(() => {
        if (confirm('設定を初期状態に戻しますか？')) {
            setSteps(SCHEDULE_STEPS);
        }
    }, []);

    const savePreset = useCallback((name: string) => {
        const newPreset: Preset = {
            id: crypto.randomUUID(),
            name,
            steps: [...steps], // Deep copy if needed, but shallow copy of array is enough here as steps are replaced
        };
        setPresets(prev => [...prev, newPreset]);
    }, [steps]);

    const loadPreset = useCallback((presetId: string) => {
        const preset = presets.find(p => p.id === presetId);
        if (preset) {
            if (confirm(`プリセット「${preset.name}」を読み込みますか？\n現在の設定は上書きされます。`)) {
                setSteps(preset.steps);
            }
        }
    }, [presets]);

    const deletePreset = useCallback((presetId: string) => {
        if (confirm('このプリセットを削除しますか？')) {
            setPresets(prev => prev.filter(p => p.id !== presetId));
        }
    }, []);

    return {
        steps,
        presets,
        isOpen,
        setIsOpen,
        updateStep,
        addStep,
        removeStep,
        moveStep,
        resetToDefault,
        savePreset,
        loadPreset,
        deletePreset
    };
};
