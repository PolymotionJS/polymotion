export function waitForProperty(property: string): Promise<any> {
    return new Promise<any>((resolve) => {
        const interval = setInterval(() => {
            const value = window[property as keyof typeof window];
            if (value) {
                clearInterval(interval);
                resolve(value);
            }
        }, 1);
    });
}

export async function emit(event: string, data?: any) {
    const emit = await waitForProperty("__polymotion_emit");
    emit(event, data);
}

export async function on(event: string, callback: (data: any) => void) {
    const on = await waitForProperty("__polymotion_listen");
    on(event, callback);
}