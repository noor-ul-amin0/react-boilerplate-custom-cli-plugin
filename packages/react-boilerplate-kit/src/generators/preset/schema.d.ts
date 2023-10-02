export interface PresetGeneratorSchema {
  name: string;
  uiLibrary: 'mui' | 'antd' | 'none';
  useReactRouter: boolean;
}
