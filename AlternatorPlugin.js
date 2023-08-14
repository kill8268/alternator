/* eslint-disable */
import fs from 'fs';
import Path from 'path';
import { createFilter } from '@rollup/pluginutils';

/**
 * @type {(options:{
*   routerDir: string;
*   ext: string;
*   separateFile?: string[];
*   notFoundFile?: string;
*   layoutFile?: string;
*   injectName?: string;
*   injectFile?: string;
* })=>any}
*
*/
export default function AlternatorPlugin({
  routerDir, ext, 
  separateFile = [],
  notFound = '_notFound',
  layout = '_layout',
  injectName = '__routes',
  injectFile = 'src/main.jsx',
}) {
  const dir = Path.normalize(`${Path.join(process.cwd(), routerDir)}/`);
  const separateFileSet = new Set(separateFile);
  const notFoundFile = `${notFound}${ext}`;
  const layoutFile = `${layout}${ext}`;

  const toRouterPath = (filePath) => {
    const reg = /\[([^\]]+)\]/g;
    const path = filePath.replaceAll('.', '/');
    return path.replace(reg, (_, p1) => `:${p1}`);
  };

  const toRouter = (filepath, isDirectory, islayoutFile) => {
    const path = filepath.replace(dir, '/');
    const url = path.replace(ext, '').replace('/index', '').replace('index', '') || '/';
    if (isDirectory) {
      const route = {
        path: toRouterPath(url),
        element: islayoutFile ? Path.join(path, layoutFile) : undefined,
      };
      return route;
    }
    if (path.includes(notFoundFile)) {
      return {
        path: '*',
        element: path,
      };
    }
    return {
      path: toRouterPath(url),
      element: path,
    };
  };

  const getTree = (url = '') => {
    const itemPath = Path.join(dir, url);
    const stat = fs.statSync(itemPath);
    let route = {};
    if (stat.isDirectory()) {
      const files = fs.readdirSync(itemPath);
      route = toRouter(itemPath, stat.isDirectory(), files.includes(layoutFile));
      route.children = files
        .filter((item) => { // filter not ext file
          const _itemPath = Path.join(itemPath, item);
          const _stat = fs.statSync(_itemPath);
          return _stat.isDirectory() || Path.extname(_itemPath) === ext;
        })
        .filter((item) => !item.includes(layoutFile) && !separateFileSet.has(item)) // 过滤掉指定的独立层级文件
        .filter((item) => item === notFoundFile || !item.startsWith('_')) // 过滤掉以_开头的文件
        .filter((item) => !item.startsWith('.')) // 过滤掉以.开头的文件
        .map((item) => getTree(Path.join(url, item)));
    } else {
      route = toRouter(itemPath);
    }
    return route;
  };
  const filter = createFilter(Path.join(process.cwd(), injectFile));
  return {
    name: 'alternator-plugin',
    transform(code, id) {
      if (filter(id)) {
        const tree = [
          ...separateFile.map((item) => toRouter(Path.join(dir, item))),
          getTree(),
        ];
        return {
          code: `Object.defineProperty(globalThis, '${injectName}', {value: ${JSON.stringify(tree)}, writable: false})
${code}`,
        };
      }
    },
  };
}
