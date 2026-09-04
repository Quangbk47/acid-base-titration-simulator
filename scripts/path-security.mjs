import { isAbsolute, relative, sep } from 'node:path';

export const isPathInsideRoot = (root, candidate) => {
  const relativePath = relative(root, candidate);
  return (
    relativePath === '' ||
    !isAbsolute(relativePath) &&
      relativePath !== '..' &&
      !relativePath.startsWith(`..${sep}`)
  );
};
