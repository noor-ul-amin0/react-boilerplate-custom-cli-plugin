import {
  addDependenciesToPackageJson,
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  installPackagesTask,
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
  const dependencies = {
    react: await getLatestVersion('react'),
    'react-dom': await getLatestVersion('react-dom'),
    'react-scripts': await getLatestVersion('react-scripts'),
  };
  const devDependencies = {
    typescript: await getLatestVersion('typescript'),
    '@types/react': await getLatestVersion('@types/react'),
    '@types/react-dom': await getLatestVersion('@types/react-dom'),
  };
  const projectRoot = `.`;
  const targetRoot = projectRoot + '/src';
  addProjectConfiguration(tree, options.name, {
    root: projectRoot,
    projectType: 'application',
    targets: {},
  });
  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, {
    ...options,
    tmpl: '.template',
  });
  if (options.useReactRouter) {
    dependencies['react-router-dom'] = await getLatestVersion(
      'react-router-dom'
    );
    generateFiles(
      tree,
      path.join(__dirname, 'meta_data', 'router_components'),
      targetRoot,
      options
    );
  }
  if (options.useRedux) {
    dependencies['react-redux'] = await getLatestVersion('react-redux');
    dependencies['@reduxjs/toolkit'] = await getLatestVersion(
      '@reduxjs/toolkit'
    );
    generateFiles(
      tree,
      path.join(__dirname, 'meta_data', 'redux_components'),
      targetRoot,
      options
    );
  }
  if (options.useStorybook) {
    dependencies['@storybook/addon-essentials'] = await getLatestVersion(
      '@storybook/addon-essentials'
    );
    dependencies['@storybook/addon-interactions'] = await getLatestVersion(
      '@storybook/addon-interactions'
    );
    dependencies['@storybook/addon-links'] = await getLatestVersion(
      '@storybook/addon-links'
    );
    dependencies['@storybook/addon-onboarding'] = await getLatestVersion(
      '@storybook/addon-onboarding'
    );
    dependencies['@storybook/blocks'] = await getLatestVersion(
      '@storybook/blocks'
    );
    dependencies['@storybook/preset-create-react-app'] = await getLatestVersion(
      '@storybook/preset-create-react-app'
    );
    dependencies['@storybook/react'] = await getLatestVersion(
      '@storybook/react'
    );
    dependencies['@storybook/react-webpack5'] = await getLatestVersion(
      '@storybook/react-webpack5'
    );
    dependencies['@storybook/testing-library'] = await getLatestVersion(
      '@storybook/testing-library'
    );
    dependencies['babel-plugin-named-exports-order'] = await getLatestVersion(
      'babel-plugin-named-exports-order'
    );
    dependencies['eslint-plugin-storybook'] = await getLatestVersion(
      'eslint-plugin-storybook'
    );
    dependencies['prop-types'] = await getLatestVersion('prop-types');
    dependencies['storybook'] = await getLatestVersion('storybook');
    dependencies['webpack'] = await getLatestVersion('webpack');

    generateFiles(
      tree,
      path.join(__dirname, 'meta_data', 'storybook_components', '_storybook'),
      projectRoot,
      options
    );
    generateFiles(
      tree,
      path.join(__dirname, 'meta_data', 'storybook_components', '_stories'),
      targetRoot,
      options
    );
    updateJson(tree, 'package.json', (json) => {
      json.scripts = json.scripts || {};
      json.scripts.storybook = 'storybook dev -p 6006';
      json.scripts['build-storybook'] = 'storybook build';
      return json;
    });
  }
  if (options.uiLibrary === 'antd') {
    dependencies['antd'] = await getLatestVersion('antd');
    generateFiles(
      tree,
      path.join(__dirname, 'meta_data', 'ui_library_components', 'antd'),
      targetRoot,
      options
    );
  } else if (options.uiLibrary === 'mui') {
    dependencies['@mui/material'] = await getLatestVersion('@mui/material');
    dependencies['@emotion/react'] = await getLatestVersion('@emotion/react');
    dependencies['@emotion/styled'] = await getLatestVersion('@emotion/styled');
    generateFiles(
      tree,
      path.join(__dirname, 'meta_data', 'ui_library_components', 'mui'),
      targetRoot,
      options
    );
  } else {
    generateFiles(
      tree,
      path.join(__dirname, 'meta_data', 'ui_library_components', 'css'),
      targetRoot,
      options
    );
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
  addDependenciesToPackageJson(tree, dependencies, devDependencies);
  return () => {
    installPackagesTask(tree);
  };
}

export default presetGenerator;
