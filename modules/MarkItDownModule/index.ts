import { NativeModules, Platform } from 'react-native';

interface MarkItDownModuleInterface {
  convert(filePath: string): Promise<string>;
}

const { MarkItDownModule } = NativeModules as { MarkItDownModule?: MarkItDownModuleInterface };

export default {
  isAvailable(): boolean {
    return Platform.OS === 'android' && MarkItDownModule != null;
  },

  async convert(filePath: string): Promise<string> {
    if (!MarkItDownModule) {
      throw new Error('MarkItDownModule is only available on Android with a full native build.');
    }
    return MarkItDownModule.convert(filePath);
  },
};
