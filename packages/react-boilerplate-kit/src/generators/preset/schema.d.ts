export interface PresetGeneratorSchema {
  name: string;
  uiLibrary: 'mui' | 'antd' | 'none';
  reactQuery_swr: 'react-query' | 'swr' | 'none';
  useReactRouter: boolean;
  stateManagement: 'redux' | 'jotai' | 'none';
  useStorybook: boolean;
}
