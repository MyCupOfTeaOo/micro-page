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

export function getReactEntityRenderText(entityId: string) {
  return `<MicroPageReact.Entity core={core} entityId="${entityId}" />`;
}
export function getReactPageRenderText(entityId: string, pageId: string) {
  return `<MicroPageReact.Page core={core} entityId="${entityId}" pageId="${pageId}" />`;
}
