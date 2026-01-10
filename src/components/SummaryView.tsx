import React from 'react';
import type { StepRecord } from '../hooks/useTimer';
import type { Step } from '../constants';

type Props = {
    steps: Step[];
    completedSteps: StepRecord[];
    onReset: () => void;
};

const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
};

export const SummaryView: React.FC<Props> = ({ steps, completedSteps, onReset }) => {
    const totalPlanned = completedSteps.reduce((acc, s) => acc + s.plannedDuration, 0);
    const totalActual = completedSteps.reduce((acc, s) => acc + s.actualDuration, 0);
    const totalDiff = totalActual - totalPlanned;

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-center">Result Summary</h2>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-gray-200">
                            <th className="py-3 px-2">Step</th>
                            <th className="py-3 px-2 text-right">Planned</th>
                            <th className="py-3 px-2 text-right">Actual</th>
                            <th className="py-3 px-2 text-right">Diff</th>
                        </tr>
                    </thead>
                    <tbody>
                        {completedSteps.map((record, index) => {
                            const step = steps.find(s => s.id === record.stepId);
                            const diff = record.actualDuration - record.plannedDuration;
                            const isLate = diff > 0;

                            return (
                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-2 text-sm font-medium text-gray-700">{step?.name || `Step ${record.stepId}`}</td>
                                    <td className="py-3 px-2 text-right text-sm text-gray-500">{formatTime(record.plannedDuration)}</td>
                                    <td className="py-3 px-2 text-right text-sm font-mono">{formatTime(record.actualDuration)}</td>
                                    <td className={`py-3 px-2 text-right text-sm font-bold ${isLate ? 'text-red-500' : 'text-green-500'}`}>
                                        {diff > 0 ? '+' : ''}{formatTime(diff)}
                                    </td>
                                </tr>
                            );
                        })}
                        <tr className="bg-gray-50 font-bold">
                            <td className="py-4 px-2">Total</td>
                            <td className="py-4 px-2 text-right">{formatTime(totalPlanned)}</td>
                            <td className="py-4 px-2 text-right">{formatTime(totalActual)}</td>
                            <td className={`py-4 px-2 text-right ${totalDiff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {totalDiff > 0 ? '+' : ''}{formatTime(totalDiff)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="mt-8 text-center">
                <button
                    onClick={onReset}
                    className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-8 rounded-lg shadow transition-colors"
                >
                    Start New Session
                </button>
            </div>
        </div>
    );
};
