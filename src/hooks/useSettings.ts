import { useState, useEffect, useCallback } from 'react';
import { SCHEDULE_STEPS, STORAGE_KEYS, TEMPLATES, DEFAULT_MENU_NAME } from '../constants';
import type { Step, Preset } from '../types';

const STORAGE_KEY = STORAGE_KEYS.SETTINGS;
const PRESETS_KEY = STORAGE_KEYS.PRESETS;
const ACTIVE_MENU_KEY = STORAGE_KEYS.ACTIVE_MENU;

// 現在編集中のメニューの素性。各画面の見出し（「『◯◯』を編集中」等）に使う。
type ActiveMenu = {
    id: string | null; // テンプレ/プリセットの id。手動編集の初期状態は null。
    name: string;
    dirty: boolean; // 読み込み後に工程を手で編集したか。
};

const DEFAULT_ACTIVE_MENU: ActiveMenu = {
    id: null,
    name: DEFAULT_MENU_NAME,
    dirty: false,
};

const genId = (): string =>
    typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);

export const useSettings = () => {
    const [steps, setSteps] = useState<Step[]>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            // 既定値は定数を共有しないようコピーして渡す（stateの直接変更で定数が汚れるのを防ぐ）。
            return saved ? JSON.parse(saved) : SCHEDULE_STEPS.map(s => ({ ...s }));
        } catch {
            return SCHEDULE_STEPS.map(s => ({ ...s }));
        }
    });

    const [presets, setPresets] = useState<Preset[]>(() => {
        try {
            const saved = localStorage.getItem(PRESETS_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [activeMenu, setActiveMenu] = useState<ActiveMenu>(() => {
        try {
            const saved = localStorage.getItem(ACTIVE_MENU_KEY);
            return saved ? { ...DEFAULT_ACTIVE_MENU, ...JSON.parse(saved) } : DEFAULT_ACTIVE_MENU;
        } catch {
            return DEFAULT_ACTIVE_MENU;
        }
    });

    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(steps));
    }, [steps]);

    useEffect(() => {
        localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
    }, [presets]);

    useEffect(() => {
        localStorage.setItem(ACTIVE_MENU_KEY, JSON.stringify(activeMenu));
    }, [activeMenu]);

    // 工程を手で編集する全操作はこれを通す。編集すると「変更あり」を立てる（メニュー名は維持）。
    const markDirty = useCallback(() => {
        setActiveMenu(prev => (prev.dirty ? prev : { ...prev, dirty: true }));
    }, []);

    const editSteps = useCallback((updater: (prev: Step[]) => Step[]) => {
        setSteps(updater);
        markDirty();
    }, [markDirty]);

    const updateStep = useCallback((id: number, field: keyof Step, value: string | number) => {
        editSteps(prev => prev.map(step =>
            step.id === id ? { ...step, [field]: value } : step
        ));
    }, [editSteps]);

    const addStep = useCallback(() => {
        editSteps(prev => {
            const newId = Math.max(...prev.map(s => s.id), 0) + 1;
            return [...prev, { id: newId, name: '新規ステップ', durationMinutes: 10 }];
        });
    }, [editSteps]);

    const removeStep = useCallback((id: number) => {
        editSteps(prev => prev.filter(s => s.id !== id));
    }, [editSteps]);

    const duplicateStep = useCallback((id: number) => {
        editSteps(prev => {
            const index = prev.findIndex(s => s.id === id);
            if (index === -1) return prev;
            const newId = Math.max(...prev.map(s => s.id), 0) + 1;
            const copy = { ...prev[index], id: newId };
            return [...prev.slice(0, index + 1), copy, ...prev.slice(index + 1)];
        });
    }, [editSteps]);

    const addNamedStep = useCallback((name: string) => {
        editSteps(prev => {
            const newId = Math.max(...prev.map(s => s.id), 0) + 1;
            // スマートデフォルト: 直前工程の分数をプリフィル（無ければ10分）
            const defaultDuration = prev.length > 0 ? prev[prev.length - 1].durationMinutes : 10;
            return [...prev, { id: newId, name, durationMinutes: defaultDuration }];
        });
    }, [editSteps]);

    const moveStep = useCallback((index: number, direction: 'up' | 'down') => {
        editSteps(prev => {
            const newSteps = [...prev];
            if (direction === 'up' && index > 0) {
                [newSteps[index], newSteps[index - 1]] = [newSteps[index - 1], newSteps[index]];
            } else if (direction === 'down' && index < newSteps.length - 1) {
                [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
            }
            return newSteps;
        });
    }, [editSteps]);

    const reorderSteps = useCallback((from: number, to: number) => {
        editSteps(prev => {
            if (from === to || from < 0 || to < 0 || from >= prev.length || to >= prev.length) return prev;
            const arr = [...prev];
            const [moved] = arr.splice(from, 1);
            arr.splice(to, 0, moved);
            return arr;
        });
    }, [editSteps]);

    const resetToDefault = useCallback(() => {
        setSteps(SCHEDULE_STEPS.map(s => ({ ...s })));
        setActiveMenu(DEFAULT_ACTIVE_MENU);
    }, []);

    const savePreset = useCallback((name: string) => {
        const newPreset: Preset = {
            id: genId(),
            name,
            steps: steps.map(s => ({ ...s })),
        };
        setPresets(prev => [...prev, newPreset]);
        // 保存した内容が、いまの「現在のメニュー」になる（=変更なし状態）。
        setActiveMenu({ id: newPreset.id, name: newPreset.name, dirty: false });
    }, [steps]);

    const applyTemplate = useCallback((templateId: string) => {
        const template = TEMPLATES.find(t => t.id === templateId);
        if (template) {
            // 同梱テンプレの定数を共有しないよう各工程をディープコピー
            setSteps(template.steps.map(step => ({ ...step })));
            setActiveMenu({ id: template.id, name: template.name, dirty: false });
        }
    }, []);

    const loadPreset = useCallback((presetId: string) => {
        const preset = presets.find(p => p.id === presetId);
        if (preset) {
            setSteps(preset.steps.map(step => ({ ...step })));
            setActiveMenu({ id: preset.id, name: preset.name, dirty: false });
        }
    }, [presets]);

    const deletePreset = useCallback((presetId: string) => {
        setPresets(prev => prev.filter(p => p.id !== presetId));
        // 削除されたプリセットを編集中だった場合は、名札だけ「変更あり」に切り替える（工程はそのまま）。
        setActiveMenu(prev => (prev.id === presetId ? { ...prev, id: null, dirty: true } : prev));
    }, []);

    return {
        steps,
        presets,
        isOpen,
        setIsOpen,
        activeMenuName: activeMenu.name,
        isMenuDirty: activeMenu.dirty,
        updateStep,
        addStep,
        removeStep,
        moveStep,
        resetToDefault,
        savePreset,
        loadPreset,
        deletePreset,
        applyTemplate,
        duplicateStep,
        addNamedStep,
        reorderSteps
    };
};
