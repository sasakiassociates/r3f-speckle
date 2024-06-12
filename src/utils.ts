export const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        // eslint-disable-next-line no-bitwise
        const r = (Math.random() * 16) | 0
        // eslint-disable-next-line no-bitwise
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
};

export const cullSpaces = (str: string) => {
    return str.replace(/\s/g, '');
}

export const hexStringToNumber = (hexString: string): number => {
    // Remove the hash symbol (#) if present
    if (hexString.startsWith('#')) {
        hexString = hexString.slice(1);
    }

    // Convert the hex string to a number
    return parseInt(hexString, 16);
}
