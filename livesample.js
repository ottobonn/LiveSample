/**
 * livesample.js
 * -------------
 * This script holds the main application logic for LiveSample.
 * It manages the population data set and interacts with the histograms.
 */

// Returns a random integer between min (included) and max (excluded)
// Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

// Create the reference chart to view the population distribution
popChart = new LiveHistogram("#population");

// Generate a skewed log-normal population
var population = d3.range(1000).map(d3.random.logNormal(0, 1));

popProperties = {
  bins: 20,
  easing: "linear"
};

popChart.update(population, popProperties);

meansProperties = {
  bins: 40,
  easing: "linear"
};

meansChart = new LiveHistogram("#means", meansProperties);

/**
 * singleMean: Compute and plot one mean
 * -------------------------------------
 * Parameters:
 *   population: the data set of which to take a mean of samples
 *   means: the array of means already computed (needed for the chart)
 *   samplesPerMean: the number of samples to take and average together
 *   chart: the chart on which to draw the data
 */
function singleMean(population, means, samplesPerMean, chart) {
  var sum = 0;
  for (var j = 0; j < samplesPerMean; j++){
    sum += population[getRandomInt(0, population.length)];
  }
  // Compute the mean of the samples
  means.push(sum / samplesPerMean);
  chart.update(means);
  // Update the sample means counter
  d3.select("#meansCounter").text(means.length);
}

/**
 * animateMeans: Animate the computation of many sample means
 * ----------------------------------------------------------
 * Parameters:
 *   population: the data set from which to take the means
 *   chart: the chart on which to draw the animation of mean counts
 *
 * animateMeans makes use of singleMean, dispathed through a callback on a timer.
 * As singleMean calls evaluate in the background, the chart shows the updated
 * count of each mean, such that over time a normal distribution appears.
 */
function animateMeans(population, chart) {
  // Take many means
  // Each mean the average of samplesPerMean random samples
  var meanCount = 100; // The number of means to find
  var samplesPerMean = 30; // The number of samples in each mean
  var delay = 100; // Delay in milliseconds between each mean displayed
  var means = [ ];
  for (var i = 0; i < meanCount; i++){
    setTimeout(function(){singleMean(population, means, samplesPerMean, chart);}, i*delay);
  }
}

animateMeans(population, meansChart);
