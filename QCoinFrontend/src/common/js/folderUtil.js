export function checkFolderOverlap(folders) {
  for (let indexCurrent = 0; indexCurrent < folders.length; indexCurrent++) {
    let folderCurrent = folders[indexCurrent] + '/';

    for (let indexPrevious = 0; indexPrevious < indexCurrent; indexPrevious++) {
      let folderPrevious = folders[indexPrevious] + '/';
      if (folderPrevious.startsWith(folderCurrent) || folderCurrent.startsWith(folderPrevious))
        return [true,folderCurrent,folderPrevious]
    }
  }
  return [false,undefined,undefined]
}

