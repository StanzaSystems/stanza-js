import RNAsyncStorage from '@react-native-async-storage/async-storage';
import Emittery from 'emittery';

type StorageEvent = {
  key: string;
  oldValue: string | null;
  newValue: string;
};

export interface IAsyncStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  addEventListener(listener: (event: StorageEvent) => void): void;
}

class AsyncStorage implements IAsyncStorage {
  private emitter = new Emittery();

  constructor() {
    this.addEventListener = this.addEventListener.bind(this);
  }

  public async getItem(key: string): Promise<string | null> {
    try {
      const value = await RNAsyncStorage.getItem(key);
      return value;
    } catch (e) {
      console.log(e);
      throw new Error('RNAsyncStorage.getItem failed');
    }
  }

  public async setItem(key: string, value: string): Promise<void> {
    try {
      const oldValue = await RNAsyncStorage.getItem(key);

      const newValue = value;

      await RNAsyncStorage.setItem(key, value);

      await this.emitter.emit('storage', { key, oldValue, newValue });
    } catch (e) {
      console.log(e);
      throw new Error('RNAsyncStorage.setItem failed');
    }
  }

  public async removeItem(key: string): Promise<void> {
    try {
      await RNAsyncStorage.removeItem(key);

      await this.emitter.emit('storage', {
        key,
        oldValue: null,
        newValue: null,
      });
    } catch (e) {
      console.log(e);
      throw new Error('RNAsyncStorage.removeItem failed');
    }
  }

  public async clear(): Promise<void> {
    try {
      await RNAsyncStorage.clear();
    } catch (e) {
      console.log(e);
      throw new Error('RNAsyncStorage.clear failed');
    }
  }

  public async getAllKeys(): Promise<string[]> {
    try {
      const keys = await RNAsyncStorage.getAllKeys();
      const result = await RNAsyncStorage.multiGet(keys);

      const savedKeys = result.map((req) => req[0]);

      return savedKeys;
    } catch (e) {
      console.log(e);
      throw new Error('RNAsyncStorage.getAllKeys failed');
    }
  }

  public addEventListener(listener: (event: StorageEvent) => void): void {
    this.emitter.on('storage', listener);
  }
}

export const asyncStorage = new AsyncStorage();
