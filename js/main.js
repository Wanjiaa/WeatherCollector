/*-------------*/
/*CONSTANT LOOP*/
/*-------------*/
window.setInterval(function(){
	//If there's a scrollbar remove fixed-footer and vise versa
	if ($(document).height() > $(window).height()){
		if($('footer').eq(0).is('.fixed-footer')){
			$('footer').removeClass("fixed-footer");
		}
	}else{
		$('footer').addClass('fixed-footer');
	}

	if ($(window).width() < 993){
		$('.mobile-nav').show();
	}
	else {
		$('.mobile-nav').hide();
	}
}, 1);

/*---*/
/*NAV*/
/*---*/
$('.button-collapse').on('click',function(e){
	e.preventDefault();
	$('.mobile-nav').animate({right: "0px"}, 200);
});
$('.close-collapse').on('click',function(e){
	e.preventDefault();
	$('.mobile-nav').animate({right: "-5000px"}, 200);
});

/*-----*/
/*CHART*/
/*-----*/
//Update onresize because default graph is empty
window.onresize = function(event){
    changeGraph($('div.row.checkboxes')[0].innerText)
}

/*IF */
// window.setInterval(function(){
// 	changeGraph($('div.row.checkboxes')[0].innerText)
// },10000)

$('div.row.checkboxes').on('change',function(e){ changeGraph(e) });


var pointRadius = 5;
var title = '';
var datapoints = [0, 20, 20, 60, 60, 120, 180, 120, 125, 105, 110, 170, 110, 105, 125, 120, 180, 120, 60, 60, 20, 20, 0, 0, 20, 20, 60, 60, 120, 180, 120, 125, 105, 110, 170, 110, 105, 125, 120, 180, 120, 60, 60, 20, 20, 0];

// var color = Chart.helpers.color;
// backgroundColor: color(window.chartColors.red).alpha(0.1).rgbString(),
var config = {
	type: 'line',
	data: {
		labels: [],
		datasets: []
	},
	options: {
		responsive: true,
		title:{
			display: true,
			text: title
		},
		elements: {
					point: {
						pointStyle: 'rectRounded'
					}
				},
		tooltips: {
			mode: 'index',
			intersect: true
		},
		animation: {
			duration: 500
		},
		scales: {
			xAxes: [{
				display: true,
				scaleLabel: {
					display: true,
					labelString: 'Date'
				}
			}],
			yAxes: [{
				display: true,
				scaleLabel: {
					display: true,
					labelString: 'Value'
				},
				ticks: {
					// suggestedMin: 10,
					// suggestedMax: 0,
					// stepSize: 5
				}
			}]
		}
	}
};

window.onload = function(){
	ctx = document.getElementById("canvas").getContext("2d");
	window.myLine = new Chart(ctx, config);

	//Make one before changing it
	changeGraph($('div.row.checkboxes')[0].innerText)
};

/*---------*/
/*FUNCTIONS*/
/*---------*/
function changeGraph(e){
	var table = []
	if(typeof e == "string")
	{
		inputs = []
		e = e.replace(/Air /g,'Air-')
		e = e.replace(/Wind /g,'Wind-')
		e = e.replace(/Rain /g,'Rain-')
		inputs = e.split(' ')
	}
	if(typeof e == "object")
	{
		inputs = []
		values = e.currentTarget.innerHTML.split('id="')
		for (var i = 1; i < values.length; i++){
			inputs.push(values[i].substr(0,values[i].search('"')).replace(' ', '-'))
		}
	}
	for (var i = 0; i < inputs.length; i++){
		if($('#' + inputs[i]).is(':checked')) table.push(inputs[i])
	}
	var query = 'selectAll'
	ajaxCall(table,query)
}

function ajaxCall(table,query){
	$.ajax({
			type: "POST",
			url: "php/getFromDatabase.php",
			data: {
				'table': table,
				'query': query
			},
			dataType: "json"
		}).done(function(data){
			var returnedData = data
			// window.myLine.destroy()
			var color = ''
			//Clear the excisting line graphs
			config.data.datasets = []

			config.options.animation.duration = 0;
			if(returnedData != {}){
				for (var i = 0; i < table.length; i++){
					try{
						dataArray = []
						config.data.labels = []
						//Label the values
						//Needs fine-tuning
						for (var o = 0; o < returnedData.Dates.length; o++){
							if(o != 0){
								var dateArray = returnedData.Dates[o].date.split('-')
								if(returnedData.Dates[o].date == returnedData.Dates[o-1].date){
									var timeArray = returnedData.Dates[o].time.split(':')
									var timeWithoutSeconds = timeArray[0] + ':' + timeArray[1]
									config.data.labels.push(timeWithoutSeconds)
								}else if(dateArray[0] == returnedData.Dates[o-1].date.slice(0,4)){
									config.data.labels.push(dateArray[1] + '-' + dateArray[2])
								}else{
									config.data.labels.push(returnedData.Dates[o].date)
								}
							}else{
								config.data.labels.push(returnedData.Dates[o].date)
							}
						}
						// Add the correct value's
						for (var o = 0; o < returnedData[table[i]].length; o++){
							dataArray.push(returnedData[table[i]][o].value)
						}
						//Non changing colors for each 
						for (var o = 0; o < window.chartColors.length; o++){
							if (window.chartColors[o][0] == table[i]) {
								color = window.chartColors[o][1]
							}
						};
						config.data.datasets.push(
							{
								label: table[i].replace('-', ' '),
								data: dataArray,
								
								backgroundColor: color,
								borderColor: color,
								fill: false,
								pointRadius: pointRadius,
								pointHoverRadius: pointRadius + 3,
								lineTension: 0,
								showLine: true
							},
						)
					}catch(error){
						if(typeof returnedData[table[i]].error != 'undefined'){
							console.log(returnedData[table[i]][0].error.errorInfo[2].split('\'')[1])
						}
					}
				}
			}
			window.myLine = new Chart(ctx, config);
		}).error(function(data){
			window.myLine.destroy();
	})
}
$('sexy.fien').on('click',function(e){
	e.preventDefault();
})
// $('.fixed-action-btn').openFAB();
// $('.fixed-action-btn').closeFAB();
// $('.fixed-action-btn.toolbar').openToolbar();
// $('.fixed-action-btn.toolbar').closeToolbar();