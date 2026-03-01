import { useState, useEffect } from 'react';
import { fetchIntegrationSettingsService } from '@/services/integrationService';
import { IntegrationSettings } from '@/types/integration';

export function useStoreStatus() {
    const [storeSettings, setStoreSettings] = useState<IntegrationSettings | null>(null);
    const [storeStatus, setStoreStatus] = useState<{ isOpen: boolean; text: string; rawText?: string }>({ isOpen: true, text: 'Aberto' });

    useEffect(() => {
        async function loadSettings() {
            const settings = await fetchIntegrationSettingsService();
            setStoreSettings(settings);
        }
        loadSettings();
    }, []);

    const checkStoreStatus = (settings: IntegrationSettings | null) => {
        if (!settings || !settings.store_hours) return { isOpen: true, text: 'Aberto', rawText: '' };
        try {
            const hoursObj = JSON.parse(settings.store_hours);
            const now = new Date();
            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const currentDayStr = days[now.getDay()];
            const daySchedule = hoursObj[currentDayStr];

            if (!daySchedule || !daySchedule.enabled || !daySchedule.slots || daySchedule.slots.length === 0) {
                return { isOpen: false, text: 'Fechado hoje', rawText: 'Fechado hoje' };
            }

            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            let isOpen = false;
            let scheduleText = '';

            for (const slot of daySchedule.slots) {
                if (!slot.start || !slot.end) continue;
                const [startH, startM] = slot.start.split(':').map(Number);
                const [endH, endM] = slot.end.split(':').map(Number);
                const startMins = startH * 60 + startM;
                const endMins = endH * 60 + endM;

                if (currentMinutes >= startMins && currentMinutes <= endMins) {
                    isOpen = true;
                }
                if (scheduleText) scheduleText += ' / ';
                scheduleText += `${slot.start} - ${slot.end}`;
            }

            return {
                isOpen,
                rawText: scheduleText,
                text: isOpen ? `Aberto agora` : `Fechado`
            };
        } catch (e) {
            return { isOpen: true, text: settings.store_hours || 'Aberto', rawText: settings.store_hours };
        }
    };

    useEffect(() => {
        if (storeSettings) {
            setStoreStatus(checkStoreStatus(storeSettings));
            const interval = setInterval(() => {
                setStoreStatus(checkStoreStatus(storeSettings));
            }, 30000);
            return () => clearInterval(interval);
        }
    }, [storeSettings]);

    return { storeSettings, storeStatus };
}
