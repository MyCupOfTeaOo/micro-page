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

export function getReactEntityRenderText(projectId: string) {
  return `<MicroPageReact.Entity core={core} id="${projectId}" />`;
}
export function getReactPageRenderText(projectId: string, pageId: string) {
  return `<MicroPageReact.Page core={core} id="${projectId}" entityId="${pageId}" />`;
}
