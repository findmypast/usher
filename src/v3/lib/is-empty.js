function isEmpty(obj) {
  return obj == null || Object.keys(obj).length === 0;
}

module.exports = isEmpty;