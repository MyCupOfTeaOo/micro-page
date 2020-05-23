export function join(...path: string[]) {
  return path.reduce((allPath, curPath) => {
    if (allPath.charAt(allPath.length - 1) === '/') {
      return allPath + curPath;
    }
    if (curPath.charAt(0) === '/') {
      return allPath + curPath;
    }
    return `${allPath}/${curPath}`;
  }, '');
}
