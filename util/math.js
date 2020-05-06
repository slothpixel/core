/**
Finds the max of the input array
*/
function max(array) {
  if (array.length === 0) {
    return Number.NaN;
  }

  return Math.max(...array);
}

/**
Finds the min of the input array
*/
function min(array) {
  if (array.length === 0) {
    return Number.NaN;
  }

  return Math.min(...array);
}

/**
Get the average value of the input array.
*/
function average(array) {
  if (array.length === 0) {
    return Number.NaN;
  }

  const result = Math.floor(array.reduce((previousValue, currentValue) => previousValue + currentValue) / array.length);

  if (!Number.isFinite(result)) {
    return Number.NaN;
  }

  return result;
}

/**
Get the median average value of the input array.
*/
function median(array) {
  if (array.length === 0) {
    return Number.NaN;
  }

  const sortedArray = array.sort((a, b) => a - b);

  if (sortedArray.length % 2 === 0) {
    return Math.floor(average([sortedArray[(sortedArray.length / 2) - 1], sortedArray[(sortedArray.length / 2)]]));
  }

  return Math.floor(sortedArray[Math.floor(sortedArray.length / 2)]);
}

/**
Finds the standard deviation of the input array
*/
function standardDeviation(data) {
  if (data.length === 0) return null;

  const avg = average(data);
  const squareDiffs = data.map((value) => {
    const diff = value - avg;
    const sqrDiff = diff * diff;
    return sqrDiff;
  });
  const avgSquareDiff = average(squareDiffs);
  const standardDeviation_ = Math.sqrt(avgSquareDiff);
  return Math.floor(standardDeviation_);
}

module.exports = {
  max,
  min,
  stdDev: standardDeviation,
  average,
  median,
};
