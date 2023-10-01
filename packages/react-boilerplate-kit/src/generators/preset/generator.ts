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

  if (options.uiLibrary === 'antd') {
    addDependenciesToPackageJson(
      tree,
      {
        antd: await getLatestVersion('antd'),
      },
      {}
    );
    generateFiles(
      tree,
      path.join(__dirname, 'meta_data', 'components', 'antd'),
      targetRoot,
      options
    );
  } else if (options.uiLibrary === 'mui') {
    addDependenciesToPackageJson(
      tree,
      {
        '@mui/material': await getLatestVersion('@mui/material'),
        '@emotion/react': await getLatestVersion('@emotion/react'),
        '@emotion/styled': await getLatestVersion('@emotion/styled'),
      },
      {}
    );
    generateFiles(
      tree,
      path.join(__dirname, 'meta_data', 'components', 'mui'),
      targetRoot,
      options
    );
  } else {
    generateFiles(
      tree,
      path.join(__dirname, 'meta_data', 'components', 'css'),
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
  return addDependenciesToPackageJson(
    tree,
    {
      react: await getLatestVersion('react'),
      'react-dom': await getLatestVersion('react-dom'),
      'react-scripts': await getLatestVersion('react-scripts'),
    },
    {
      typescript: await getLatestVersion('typescript'),
      '@types/react': await getLatestVersion('@types/react'),
      '@types/react-dom': await getLatestVersion('@types/react-dom'),
    }
  );
}

export default presetGenerator;
