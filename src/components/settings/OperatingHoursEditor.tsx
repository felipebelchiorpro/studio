"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Clock } from "lucide-react";

export type TimeSlot = {
    start: string;
    end: string;
};

export type DaySchedule = {
    enabled: boolean;
    slots: TimeSlot[];
};

export type OperatingHours = {
    [key: string]: DaySchedule;
};

const DAYS = [
    { key: "monday", label: "Segunda-feira" },
    { key: "tuesday", label: "Terça-feira" },
    { key: "wednesday", label: "Quarta-feira" },
    { key: "thursday", label: "Quinta-feira" },
    { key: "friday", label: "Sexta-feira" },
    { key: "saturday", label: "Sábado" },
    { key: "sunday", label: "Domingo" },
];

const DEFAULT_SCHEDULE: DaySchedule = {
    enabled: true,
    slots: [{ start: "09:00", end: "18:00" }],
};

interface OperatingHoursEditorProps {
    value: string; // JSON string or plain text
    onChange: (value: string) => void;
}

export function OperatingHoursEditor({ value, onChange }: OperatingHoursEditorProps) {
    const [schedule, setSchedule] = useState<OperatingHours>(() => {
        try {
            const parsed = JSON.parse(value);
            // Validate structure basic check
            if (parsed.monday) return parsed;
            throw new Error("Invalid structure");
        } catch (e) {
            // Default init if empty or invalid JSON (legacy text)
            const initial: OperatingHours = {};
            DAYS.forEach((day) => {
                initial[day.key] = { ...DEFAULT_SCHEDULE, enabled: day.key !== "sunday" }; // Default closed sunday
            });
            return initial;
        }
    });

    useEffect(() => {
        onChange(JSON.stringify(schedule));
    }, [schedule]);

    const toggleDay = (dayKey: string) => {
        setSchedule((prev) => ({
            ...prev,
            [dayKey]: {
                ...prev[dayKey],
                enabled: !prev[dayKey].enabled,
            },
        }));
    };

    const addSlot = (dayKey: string) => {
        setSchedule((prev) => ({
            ...prev,
            [dayKey]: {
                ...prev[dayKey],
                slots: [...prev[dayKey].slots, { start: "12:00", end: "13:00" }],
            },
        }));
    };

    const removeSlot = (dayKey: string, index: number) => {
        setSchedule((prev) => ({
            ...prev,
            [dayKey]: {
                ...prev[dayKey],
                slots: prev[dayKey].slots.filter((_, i) => i !== index),
            },
        }));
    };

    const updateSlot = (dayKey: string, index: number, field: "start" | "end", newVal: string) => {
        setSchedule((prev) => {
            const newSlots = [...prev[dayKey].slots];
            newSlots[index] = { ...newSlots[index], [field]: newVal };
            return {
                ...prev,
                [dayKey]: {
                    ...prev[dayKey],
                    slots: newSlots,
                },
            };
        });
    };

    return (
        <div className="space-y-4 border rounded-md p-4">
            {DAYS.map((day) => (
                <div key={day.key} className="flex flex-col sm:flex-row sm:items-start gap-4 py-3 border-b last:border-0">
                    <div className="flex items-center gap-2 w-32 pt-2">
                        <Switch
                            checked={schedule[day.key]?.enabled ?? false}
                            onCheckedChange={() => toggleDay(day.key)}
                        />
                        <Label className="font-medium">{day.label}</Label>
                    </div>

                    <div className="flex-1 space-y-2">
                        {!schedule[day.key]?.enabled ? (
                            <div className="text-muted-foreground text-sm italic pt-2">Fechado</div>
                        ) : (
                            <>
                                {schedule[day.key]?.slots.map((slot, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4 text-muted-foreground" />
                                            <Input
                                                type="time"
                                                value={slot.start}
                                                onChange={(e) => updateSlot(day.key, index, "start", e.target.value)}
                                                className="w-24 h-8"
                                            />
                                        </div>
                                        <span>até</span>
                                        <div className="flex items-center gap-1">
                                            <Input
                                                type="time"
                                                value={slot.end}
                                                onChange={(e) => updateSlot(day.key, index, "end", e.target.value)}
                                                className="w-24 h-8"
                                            />
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeSlot(day.key, index)}
                                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                            disabled={schedule[day.key].slots.length === 1} // Prevent removing last slot? Maybe allow
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addSlot(day.key)}
                                    className="flex items-center text-xs h-7 mt-1"
                                >
                                    <Plus className="w-3 h-3 mr-1" /> Adicionar intervalo
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
