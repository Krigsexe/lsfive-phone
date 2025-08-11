
/**
 * @param eventName - The name of the NUI callback event
 * @param data - The data to be sent to the NUI callback
 * @returns - A promise resolving when the fetch is complete.
 */
export async function fetchNui<T>(eventName: string, data: unknown = {}): Promise<T | void> {
    const resourceName = (window as any).GetParentResourceName ? (window as any).GetParentResourceName() : 'phone';

    try {
        const resp = await fetch(`https://${resourceName}/${eventName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify(data),
        });

        if (!resp.ok) {
            throw new Error(`Failed to fetch NUI event ${eventName}. Status: ${resp.status}`);
        }

        return await resp.json();
    } catch (e) {
        // This will happen in a browser environment
        // console.error(`NUI Error: ${e.message}. This is expected in a browser.`);
        return; // Return void or mock data if needed for browser testing
    }
}
