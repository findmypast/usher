function isNotResolved(executable) {
  return !isResolved(executable);
}

function isResolved(executable) {
  return Array.isArray(executable)
    ? executable.every(isResolved)
    : executable.do === 'shell';
}

module.exports = {
  isNotResolved,
  isResolved
}