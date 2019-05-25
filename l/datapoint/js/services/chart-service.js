define(function() {
	return function(Chart) {
		/*
		 *  API:
		 * 	createChart:
		 *   title: a string or array represent the title(s) of each dataset,
		 *   data: the data for the dataset as an array of objects,
		 *   target: the DOM element (canvas) to place the chart, 
		 *   label: a function returning the label for an object in 
		 *   	data parameter,
		 *   element: a function returning the datapoint(s) for an
		 *   	object in the data parameter.
		 */
		this.createLineChart = function(title, data, target, label, element) {
			var chartData = {
					labels: [],
					datasets: [
					]
				};
			
			var count = 0;
			angular.forEach(data, function(item) {
				chartData.labels.push(label(item));
				var datapoints = element(item);
				if (datapoints.length) {
					angular.forEach(datapoints, function(datapoint) {
						if (!chartData.datasets[count]) {
							chartData.datasets[count] = createDataSet(title[count]);
						}
						chartData.datasets[count++].data.push(datapoint);
					});
					count = 0;
				} else {
					if (!chartData.datasets[0]) {
						chartData.datasets[0] = createDataSet(title);
					}
					chartData.datasets[0].data.push(element(item));
				}
			});
	
			var chartContext = target.get(0).getContext("2d");
			return new Chart(chartContext).Line(chartData, {
				scaleFontSize: 8
			});
		}
		
		function createDataSet(title) {
			return {
			    label: title,
			    fillColor: "rgba(220,220,220,0.2)",
			    strokeColor: "rgba(220,220,220,1)",
			    pointColor: "rgba(220,220,220,1)",
			    pointStrokeColor: "#fff",
			    pointHighlightFill: "#fff",
			    pointHighlightStroke: "rgba(220,220,220,1)",
			    data: []
			};
		}

		this.createAngularGauge = function(title, min, max, value, unit, target) {
			var chart = new Highcharts.Chart({
					chart: {
						renderTo: target,
						type: 'gauge',
						alignTicks: false,
						plotBackgroundColor: null,
						plotBackgroundImage: null,
						plotBorderWidth: 0,
						plotShadow: false
					},

					title: {
						text: title,
					},

					pane: {
						startAngle: -150,
						endAngle: 150
					},

					yAxis: [{
						min: min,
						max: max,
						tickPosition: 'outside',
						lineColor: '#933',
						lineWidth: 2,
						minorTickPosition: 'outside',
						tickColor: '#933',
						minorTickColor: '#933',
						tickLength: 5,
						minorTickLength: 5,
						labels: {
							distance: 12,
							rotation: 'auto'
						},
						offset: -20,
						endOnTick: false,
					}],

					series: [{
						name: title,
						data: [80],
						dataLabels: {
							backgroundColor: {
								linearGradient: {
									x1: 0,
									y1: 0,
									x2: 0,
									y2: 1
								},
								stops: [
									[0, '#DDD'],
									[1, '#FFF']
								]
							}
						},
						tooltip: {
							valueSuffix: unit
						}
					}]

				},
				function (chart) {
					var point = chart.series[0].points[0];
					point.update(value);
				});
		}
	}
});