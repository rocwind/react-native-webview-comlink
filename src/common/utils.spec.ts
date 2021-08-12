import { ArrayMap } from './utils';

describe('ArrayMap', () => {
    it('should be able to retrive previous set value', () => {
        const key = () => {};
        const value = 1;
        const map = new ArrayMap();
        map.set(key, value);
        const result = map.get(key);
        expect(result).toBe(value);
    });

    it('should return undefined for not exits key', () => {
        const key = () => {};
        const value = 1;
        const map = new ArrayMap();
        map.set(key, value);
        const key2 = () => {};
        const result = map.get(key2);
        expect(result).toBe(undefined);
    });

    it('should return undefined after key being deleted', () => {
        const key = () => {};
        const value = 1;
        const map = new ArrayMap();
        map.set(key, value);
        map.delete(key);
        const result = map.get(key);
        expect(result).toBe(undefined);
    });

    it('should return new value after key being override', () => {
        const key = () => {};
        const value = 1;
        const map = new ArrayMap();
        map.set(key, value);
        const value2 = 2;
        map.set(key, value2);
        const result = map.get(key);
        expect(result).toBe(value2);
    });

    it('should handles remove and insert case', () => {
        const key = () => {};
        const value = 1;
        const map = new ArrayMap();
        map.set(key, value);
        map.delete(key);
        const key2 = () => {};
        const value2 = 2;
        map.set(key2, value2);
        const result = map.get(key);
        expect(result).toBe(undefined);
        const result2 = map.get(key2);
        expect(result2).toBe(value2);
    });
});
