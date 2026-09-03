const STORAGE_KEY = "noteshare_learning_events_v1";
const MAX_EVENTS = 500;

export function createSessionId() {
    return `session_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 10)}`;
}

export function getLearningEvents() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw);

        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Failed to read learning analytics:", error);
        return [];
    }
}

export function recordLearningEvent(event) {
    try {
        const events = getLearningEvents();

        const newEvent = {
            id: `event_${Date.now()}_${Math.random()
                .toString(36)
                .slice(2, 8)}`,
            timestamp: new Date().toISOString(),
            ...event,
        };

        const updatedEvents = [...events, newEvent].slice(-MAX_EVENTS);

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(updatedEvents)
        );

        return newEvent;
    } catch (error) {
        console.error("Failed to save learning analytics:", error);
        return null;
    }
}

export function clearLearningEvents() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error("Failed to clear learning analytics:", error);
    }
}