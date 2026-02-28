/**
 * Google Calendar sync utility for the Auto Scheduler.
 * Uses the Google OAuth accessToken from Firebase to create Calendar events.
 */

const CALENDAR_API = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

/** Maps a day name to the next upcoming date of that weekday (from today). */
function getNextDateForDay(dayName: string): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    const todayDay = today.getDay(); // 0=Sun, 1=Mon...
    const targetDay = days.findIndex(d => d.toLowerCase() === dayName.toLowerCase());

    if (targetDay === -1) {
        // Fallback: use today if day not recognized
        return today.toISOString().split('T')[0];
    }

    let daysUntil = targetDay - todayDay;
    if (daysUntil <= 0) daysUntil += 7; // Always go to the NEXT occurrence

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntil);
    return targetDate.toISOString().split('T')[0]; // Returns "YYYY-MM-DD"
}

/** Converts a "HH:MM" time string + date string to an ISO 8601 datetime string. */
function toDateTime(date: string, time: string): string {
    return `${date}T${time}:00`;
}

export interface ScheduleSlot {
    task_title: string;
    scheduled_day: string;
    start_time: string;
    end_time: string;
    priority?: string;
}

export interface SyncResult {
    success: number;
    failed: number;
    errors: string[];
}

/**
 * Syncs an array of schedule slots to the user's primary Google Calendar.
 * @param slots - The schedule items from the auto-scheduler
 * @param accessToken - The Google OAuth access token from Firebase login
 */
export async function syncScheduleToGoogleCalendar(
    slots: ScheduleSlot[],
    accessToken: string
): Promise<SyncResult> {
    const result: SyncResult = { success: 0, failed: 0, errors: [] };

    for (const slot of slots) {
        try {
            const date = getNextDateForDay(slot.scheduled_day);
            const startDateTime = toDateTime(date, slot.start_time);
            const endDateTime = toDateTime(date, slot.end_time);

            const event = {
                summary: slot.task_title,
                description: `Priority: ${slot.priority || 'Medium'} — Scheduled by Flourish AI Assistant`,
                start: {
                    dateTime: startDateTime,
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                },
                end: {
                    dateTime: endDateTime,
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                },
                colorId: slot.priority === 'High' ? '11' : slot.priority === 'Low' ? '2' : '7', // Red / Green / Teal
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'popup', minutes: 15 },
                    ],
                },
            };

            const response = await fetch(CALENDAR_API, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err?.error?.message || `HTTP ${response.status}`);
            }

            result.success++;
        } catch (err: any) {
            result.failed++;
            result.errors.push(`"${slot.task_title}": ${err.message}`);
        }
    }

    return result;
}
