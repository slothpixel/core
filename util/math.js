const average = require('mean-average');
const median = require('median-average');

/**
 * Finds the max of the input array
 * */
function max(array) {
  if (array.length === 0) {
    return NaN;
  }

  return Math.max(...array);
}

/**
 * Finds the min of the input array
 * */
function min(array) {
  if (array.length === 0) {
    return NaN;
  }

  return Math.min(...array);
}

/**
 * Finds the standard deviation of the input array
 * */
function stdDev(data) {
  if (data.length === 0) return null;

  const avg = average(data);
  const squareDiffs = data.map((value) => {
    const diff = value - avg;
    const sqrDiff = diff * diff;
    return sqrDiff;
  });
  const avgSquareDiff = average(squareDiffs);
  const stdDev = Math.sqrt(avgSquareDiff);
  return Math.floor(stdDev);
}

module.exports = {
  max,
  min,
  stdDev,
  average,
  median,
};
