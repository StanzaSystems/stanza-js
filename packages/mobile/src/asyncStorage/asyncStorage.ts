import RNAsyncStorage from '@react-native-async-storage/async-storage';

export interface IAsyncStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
}

class AsyncStorage implements IAsyncStorage {
  public async getItem(key: string): Promise<string | null> {
    try {
      const value = await RNAsyncStorage.getItem(key);
      return value;
    } catch (e) {
      let message = 'RNAsyncStorage.getItem failed';
      if (e instanceof Error) {
        message = `${message}: ${e.message}`;
      }
      throw new Error(message);
    }
  }

  public async setItem(key: string, value: string): Promise<void> {
    try {
      await RNAsyncStorage.setItem(key, value);
    } catch (e) {
      let message = 'RNAsyncStorage.setItem failed';
      if (e instanceof Error) {
        message = `${message}: ${e.message}`;
      }
      throw new Error(message);
    }
  }

  public async removeItem(key: string): Promise<void> {
    try {
      await RNAsyncStorage.removeItem(key);
    } catch (e) {
      let message = 'RNAsyncStorage.removeItem failed';
      if (e instanceof Error) {
        message = `${message}: ${e.message}`;
      }
      throw new Error(message);
    }
  }

  public async clear(): Promise<void> {
    try {
      await RNAsyncStorage.clear();
    } catch (e) {
      let message = 'RNAsyncStorage.clear failed';
      if (e instanceof Error) {
        message = `${message}: ${e.message}`;
      }
      throw new Error(message);
    }
  }

  public async getAllKeys(): Promise<string[]> {
    try {
      const keys = await RNAsyncStorage.getAllKeys();
      const result = await RNAsyncStorage.multiGet(keys);

      const savedKeys = result.map((req) => req[0]);

      return savedKeys;
    } catch (e) {
      let message = 'RNAsyncStorage.getAllKeys failed';
      if (e instanceof Error) {
        message = `${message}: ${e.message}`;
      }
      throw new Error(message);
    }
  }
}

export const asyncStorage = new AsyncStorage();
