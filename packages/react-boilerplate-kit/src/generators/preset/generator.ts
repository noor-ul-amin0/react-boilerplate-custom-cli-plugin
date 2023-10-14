import {
  addDependenciesToPackageJson,
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  Tree,
  updateJson,
} from '@nx/devkit';
import * as path from 'path';
import { PresetGeneratorSchema } from './schema';
import { exec } from 'child_process';
import { promisify } from 'util';

async function getLatestVersion(packageName: string): Promise<string> {
  const execAsync = promisify(exec);
  const { stdout } = await execAsync(`npm show ${packageName} version`);
  return stdout.trim() || 'latest';
}

export async function presetGenerator(
  tree: Tree,
  options: PresetGeneratorSchema
) {
  const reactDeps = await Promise.all([
    getLatestVersion('react'),
    getLatestVersion('react-dom'),
    getLatestVersion('react-scripts'),
  ]);
  const reactDevDeps = await Promise.all([
    getLatestVersion('typescript'),
    getLatestVersion('@types/react'),
    getLatestVersion('@types/react-dom'),
  ]);
  const dependencies = {
    react: reactDeps.at(0),
    'react-dom': reactDeps.at(1),
    'react-scripts': reactDeps.at(2),
  };
  const devDependencies = {
    typescript: reactDevDeps.at(0),
    '@types/react': reactDevDeps.at(1),
    '@types/react-dom': reactDevDeps.at(2),
  };

  const projectRoot = `.`;
  const projectSrc = projectRoot + '/src';
  const projectComponentsPath = projectSrc + '/components';
  const projectPagesPath = projectSrc + '/pages';

  addProjectConfiguration(tree, options.name, {
    root: projectRoot,
    projectType: 'application',
    targets: {},
  });
  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, {
    ...options,
    tmpl: '.template',
  });
  if (options.uiLibrary === 'antd') {
    dependencies['antd'] = await getLatestVersion('antd');
    generateFiles(
      tree,
      path.join(__dirname, 'meta_data', 'ui_library_components', 'antd'),
      projectSrc,
      options
    );
  } else if (options.uiLibrary === 'mui') {
    const deps = await Promise.all([
      getLatestVersion('@mui/material'),
      getLatestVersion('@emotion/react'),
      getLatestVersion('@emotion/styled'),
    ]);
    dependencies['@mui/material'] = deps.at(0);
    dependencies['@emotion/react'] = deps.at(1);
    dependencies['@emotion/styled'] = deps.at(2);
    generateFiles(
      tree,
      path.join(__dirname, 'meta_data', 'ui_library_components', 'mui'),
      projectSrc,
      options
    );
  } else if (options.uiLibrary === 'none') {
    generateFiles(
      tree,
      path.join(__dirname, 'meta_data', 'ui_library_components', 'css'),
      projectSrc,
      options
    );
  }
  if (options.reactQuery_swr === 'react-query') {
    dependencies['@tanstack/react-query'] = await getLatestVersion(
      '@tanstack/react-query'
    );
    if (options.useReactRouter) {
      generateFiles(
        tree,
        path.join(__dirname, 'meta_data', 'react_query_components'),
        projectPagesPath + '/posts',
        options
      );
    } else {
      generateFiles(
        tree,
        path.join(__dirname, 'meta_data', 'react_query_components'),
        projectComponentsPath + '/posts',
        options
      );
    }
  } else if (options.reactQuery_swr === 'swr') {
    dependencies['swr'] = await getLatestVersion('swr');
    if (options.useReactRouter) {
      generateFiles(
        tree,
        path.join(__dirname, 'meta_data', 'swr_components'),
        projectPagesPath + '/posts',
        options
      );
    } else {
      generateFiles(
        tree,
        path.join(__dirname, 'meta_data', 'swr_components'),
        projectComponentsPath + '/posts',
        options
      );
    }
  }
  if (options.useReactRouter) {
    dependencies['react-router-dom'] = await getLatestVersion(
      'react-router-dom'
    );
    generateFiles(
      tree,
      path.join(__dirname, 'meta_data', 'router_components'),
      projectSrc,
      options
    );
    generateFiles(
      tree,
      path.join(__dirname, 'meta_data', 'ui_library_components', 'navbar'),
      projectSrc + '/components/navbar',
      options
    );
  }
  if (options.stateManagement === 'redux') {
    const deps = await Promise.all([
      getLatestVersion('react-redux'),
      getLatestVersion('@reduxjs/toolkit'),
    ]);
    dependencies['react-redux'] = deps.at(0);
    dependencies['@reduxjs/toolkit'] = deps.at(1);
    generateFiles(
      tree,
      path.join(__dirname, 'meta_data', 'redux_components'),
      projectSrc,
      options
    );
  } else if (options.stateManagement === 'jotai') {
    dependencies['jotai'] = await getLatestVersion('jotai');
    generateFiles(
      tree,
      path.join(__dirname, 'meta_data', 'jotai_components'),
      projectSrc,
      options
    );
  }

  if (options.useStorybook) {
    const devDeps = await Promise.all([
      getLatestVersion('@storybook/addon-essentials'),
      getLatestVersion('@storybook/addon-interactions'),
      getLatestVersion('@storybook/addon-links'),
      getLatestVersion('@storybook/addon-onboarding'),
      getLatestVersion('@storybook/blocks'),
      getLatestVersion('@storybook/preset-create-react-app'),
      getLatestVersion('@storybook/react'),
      getLatestVersion('@storybook/react-webpack5'),
      getLatestVersion('@storybook/testing-library'),
      getLatestVersion('babel-plugin-named-exports-order'),
      getLatestVersion('eslint-plugin-storybook'),
      getLatestVersion('prop-types'),
      getLatestVersion('storybook'),
      getLatestVersion('webpack'),
    ]);
    devDependencies['@storybook/addon-essentials'] = devDeps.at(0);
    devDependencies['@storybook/addon-interactions'] = devDeps.at(1);
    devDependencies['@storybook/addon-links'] = devDeps.at(2);
    devDependencies['@storybook/addon-onboarding'] = devDeps.at(3);
    devDependencies['@storybook/blocks'] = devDeps.at(4);
    devDependencies['@storybook/preset-create-react-app'] = devDeps.at(5);
    devDependencies['@storybook/react'] = devDeps.at(6);
    devDependencies['@storybook/react-webpack5'] = devDeps.at(7);
    devDependencies['@storybook/testing-library'] = devDeps.at(8);
    devDependencies['babel-plugin-named-exports-order'] = devDeps.at(9);
    devDependencies['eslint-plugin-storybook'] = devDeps.at(10);
    devDependencies['prop-types'] = devDeps.at(11);
    devDependencies['storybook'] = devDeps.at(12);
    devDependencies['webpack'] = devDeps.at(13);

    generateFiles(
      tree,
      path.join(__dirname, 'meta_data', 'storybook_components', '.storybook'),
      projectRoot + '/.storybook',
      options
    );
    generateFiles(
      tree,
      path.join(__dirname, 'meta_data', 'storybook_components', 'stories'),
      projectSrc + '/stories',
      options
    );
    updateJson(tree, 'package.json', (json) => {
      json.scripts = json.scripts || {};
      json.scripts.storybook = 'storybook dev -p 6006';
      json.scripts['build-storybook'] = 'storybook build';
      return json;
    });
  }
  updateJson(tree, 'package.json', (json) => {
    json.scripts = json.scripts || {};
    json.scripts.start = 'react-scripts start';
    json.scripts.build = 'react-scripts build';
    json.scripts.test = 'react-scripts test';
    json.scripts.eject = 'react-scripts eject';
    return json;
  });
  await formatFiles(tree);
  console.log('🚀 ~ file: generator.ts:228 ~ tree.root:', tree.children('src'));
  return;
  // return addDependenciesToPackageJson(tree, dependencies, devDependencies);
}

export default presetGenerator;
