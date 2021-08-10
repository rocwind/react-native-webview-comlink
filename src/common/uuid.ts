// random UUID
export function generateUUID(): string {
    return [0, 0, 0, 0]
        .map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16))
        .join('-');
}
