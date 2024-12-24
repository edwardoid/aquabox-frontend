import { Serializable, Serialize } from 'ts-serializer';
import { Rule } from './rule';
import { Aquabox } from './aquabox';
import { Device } from './device';

@Serialize({ root : "internals" })
export class IdMap<T> extends Serializable implements Iterable<T> {
    public internal: Map<String, T> = new Map<string, T>();


    [Symbol.iterator](): Iterator<T> {
        let i = this.internal.values();
        return {
            next(value?: any) {
                return i.next(value);   
            }
        }
    }

    public insert(obj: T, replace: boolean = false) {
        if (!replace) {
            if (this.containsInstance(obj)) 
                return false;
        }

        this.internal.set(String(obj["id" as keyof T]), obj);
        return true;
    }

    public find(id: string): T | undefined {
        return this.internal.get(id);
    }

    public removeById(id: string) {
        this.internal.delete(id);
    }

    public remove(obj: T) {
        this.internal.delete(String(obj["id" as keyof T]));
    }

    public contains(id: string): boolean {
        return this.internal.has(id);
    }

    public containsInstance(obj: T): boolean {
        return this.internal.has(String(obj["id" as keyof T]));
    }

    public values() {
        return this.internal.values();
    }

    public ids() {
        return this.internal.keys();
    }

    public valuesArray(): Array<T> {
        return Array.from(this.internal.values());
    }

    public idsArray(): Array<String> {
        return Array.from(this.internal.keys());
    }

    public size(): number {
        return this.internal.size;
    }

    public isEmpty(): boolean {
        return this.size() == 0;
    }

    public clear() {
        this.internal.clear();
    }
}

export class HostsMap extends IdMap<Aquabox> {
    constructor() { super(); }
}

export class DevicesMap extends IdMap<Device> {
    constructor() { super(); }
}

export class RulesMap extends IdMap<Rule> {
    constructor() { super(); }
}
