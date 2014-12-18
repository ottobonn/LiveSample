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

/**
 * variance: Compute the sample variance of an array of values
 * -----------------------------------------------------------
 * Computes the variance of the given array of samples using
 * the first and second moments.
 */
function variance (samples) {
  var sum = 0;
  var squares = 0;
  for(var i = 0, l = samples.length; i < l; i++){
    sum += samples[i];
    squares += samples[i] ^ 2;
  }
  // Compute first moment squared
  var squareMean = (sum / samples.length) ^ 2;
  // Compute second moment
  var secondMoment = squares / samples.length;
  // Variance is E[X^2] - E^2[X]
  return secondMoment - squareMean;
}

/**
 * animateMeans: Animate the computation of many sample means
 * ----------------------------------------------------------
 * Parameters:
 *   population: the data set from which to take the means
 *   chart: the chart on which to draw the animation of mean counts
 *   means: the array of means computed so far. Pass in empty array to start fresh.
 *
 * animateMeans makes use of singleMean, dispatched through a callback on a timer.
 * As single mean calls evaluate in the background, the chart shows the updated
 * count of each mean, such that over time a normal distribution appears.
 * The MEANS parameter is a way to fetch the means computed so far so you can pause
 * the animation and resume where it left off.
 */
 function animateMeans(population, chart, means, callback) {
   // Take many means
   // Each mean the average of samplesPerMean random samples
   var meanCount = 100; // The number of means to find
   var samplesPerMean = 30; // The number of samples in each mean
   var delay = 100; // Delay in milliseconds between each mean displayed
   var count = means.length;

   var animationInterval = setInterval(function(){
     if (count < meanCount){
       var sum = 0;
       for (var j = 0; j < samplesPerMean; j++){
         sum += population[getRandomInt(0, population.length)];
       }
       // Compute the mean of the samples
       means.push(sum / samplesPerMean);
       chart.update(means);
       // Update the sample means counter
       d3.select("#meansCounter").text(means.length); // TODO remove hardwired select
       count++;
    } else {
      // If the counter has expired, dequeue future updates.
      clearInterval (animationInterval);
      // Signal that the tasks are done.
      callback();
    }
   }, delay); // setTimeout
   return animationInterval;
}

function resetMeans(chart){
  chart.reset();
  d3.select("#meansCounter").text(0); // TODO remove hardwired select
}

$(document).ready(function(){
  popProperties = {
    bins: 20,
    easing: "linear"
  };
  meansProperties = {
    bins: 40,
    easing: "linear"
  };

  // Create the reference chart to view the population distribution
  popChart = new LiveHistogram("#population", popProperties);

  // Generate a skewed log-normal population
  var population = d3.range(500).map(d3.random.logNormal(0, 1));
  popChart.update(population);

  meansChart = new LiveHistogram("#means", meansProperties);

  // Master state. If sampling is happening, the app is running.
  var running = false;

  // The animation interval is set and cleared based on RUNNING.
  var animationInterval;

  // The means array holds the state of the animation so it can be resumed.
  var means = [ ];

  // Callback for when animateMeans finishes with all its tasks.
  // animateMeans will have cleared its interval already, so all this has to do
  // is clear the means array, reset the UI, and set the state to not-running.
  function runComplete(){
    running = false;
    $('#means-play-button').button('reset');
    means = [ ];
  }

  $('#means-play-button').on('click', function () {
    if(running) {
      running = false;
      $(this).button('reset'); // Set button to original text
      clearInterval(animationInterval);
    } else {
      running = true;
      $(this).button('pause'); // Set button to "Pause" text
      animationInterval = animateMeans(population, meansChart, means, runComplete);
    }
  });

  $('#means-reset-button').on('click', function () {
    resetMeans(meansChart);
    means = [ ];
  });
}); // $(document).ready
