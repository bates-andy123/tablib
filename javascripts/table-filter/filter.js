(function($){
	
	$.fn.serializeObject = function()
	{
		var o = {};
		var a = this.serializeArray();
		$.each(a, function() {
			if (o[this.name] !== undefined) {
				if (!o[this.name].push) {
					o[this.name] = [o[this.name]];
				}
				o[this.name].push(this.value || '');
			} else {
				o[this.name] = this.value || '';
			}
		});
		return o;
	};
	
	$.fn.filterable = function( initObj ){
		
		var colsToAdd;
		var jQueryTableObj;
		var master = new Array([]); //Javascript 2d array
		var unique = new Array([]); //Javascript 2d array
		var rowHeaders;
		var cols;
		var tableID;
		var multiSelectorsDivArr = [];
		
		function onlyUnique(value, index, self) { 
			return self.indexOf(value) === index;
		}
		
		function doFilterSort(selections){
			
			buildData(cols);
			
			if(typeof selections == "undefined")//Just in case
				selections = {};
				
			
			$(jQueryTableObj).children('tbody').children('tr').css('display',"table-row");
			
			if(! $.isEmptyObject(selections))
				$.each(selections, function(key, value){
					var currentColumn = Number(key.replace("col-",""));
					hideTheSelected(currentColumn, value);
				});
			placeMultiSelectors();
		}
		
		function placeMultiSelectors(){
			var pos = {top: 0, left: 0};
			for(index in multiSelectorsDivArr){
					for(var i=0; i < master[0].length; i++){
						pos = $(document.getElementById(tableID).tBodies[0].rows[i].cells[multiSelectorsDivArr[index].col]).position();
						if(pos["left"] != 0)
							break;
					}
				
				if(pos["left"] == 0){//This means no rows are currently displayed
					return;
				}
				else	
					$(multiSelectorsDivArr[index].div).css({
						top: pos["top"],
						left: pos["left"]
					});
			}
		}
		
		function getUrlParameter(sParam)
		{
			var sPageURL = window.location.search.substring(1);
			var sURLVariables = sPageURL.split('&');
			for (var i = 0; i < sURLVariables.length; i++) 
			{
				var sParameterName = sURLVariables[i].split('=');
				if (sParameterName[0] == sParam) 
				{
					return sParameterName[1];
				}
			}
		}
		
		function uncheckAllMultiSelects(){
			for(index in multiSelectorsDivArr){
				$(multiSelectorsDivArr[index].div).find("input[type='checkbox']").prop('checked', false);
			}
		}
		
		function hideTheSelected(currentColumn, selected){
			for(i=0; i < master[currentColumn].length; i++){
				//If the column is not selected get rid of it
				if(selected.indexOf(master[currentColumn][i]) == -1)
					$(document.getElementById(tableID).tBodies[0].rows[i]).css('display', "none");;
			}
		}
		
		function hideAllMultiSelectors(exceptionDOM){
			if (typeof exceptionDOM == "undefined")
				exceptionDOM = ""
			for(index in multiSelectorsDivArr){
				if(multiSelectorsDivArr[index].div != exceptionDOM){
					$(multiSelectorsDivArr[index].div).hide();
				}
			}
		}
		
		function addFilterButton(col, div){
			var button = document.createElement('input');
			button.setAttribute("type", "image");
			button.setAttribute("class", "filter-picture");
			button.setAttribute("src", "javascripts/table-filter/style/filter.png");
			
			$(rowHeaders[col]).append(button);
			
			var pos = $(document.getElementById(tableID).tBodies[0].rows[0].cells[col]).position();
			//console.log(pos);
			$(div).css({
				position: "absolute",
				top: pos["top"],
				left: pos["left"]
			});
			$(div).hide();
			
			$(button).click(function(e){
				e.stopPropagation();
				placeMultiSelectors();
				hideAllMultiSelectors(div);
				if($(div).css("display") == "none"){
					$(div).show();
				}else{
					$(div).hide();
				}
			});
		}
		
		function addColumn(identifer){
			if(typeof colsToAdd != "object"){//If you have no objects (arrays) to compare against. Than you must add it
				return true
			}
			if(colsToAdd.length == 0){//If you don't specify anything you want, then add it all 
				return true;
			}
			if(colsToAdd.indexOf(identifer) > -1){//If you found an index than add it
				return true;
			}
			//Consider adding names here
			return false;//If passed everything than don't add it
		}
		
		function buildForm(id){
			
			for(var col=0; col < unique.length; col++){
				if( addColumn(col)){//If not a ignorableColumn
					var form = document.createElement("form");
					form.setAttribute('id',"filterStatsForm");
					form.setAttribute('class','doFilterSort');
					
					for(title=0; title<unique[col].length; title++){
						var i = document.createElement("input"); //input element, text
						i.setAttribute('type',"checkbox");
						i.setAttribute('name',"col-"+col);
						i.setAttribute('data-col', col);
						i.setAttribute('value',unique[col][title]);
						form.appendChild(i);
						var p = document.createElement("p");
						p.setAttribute('class',"checkbox-descript");
						p.innerHTML = unique[col][title];
						form.appendChild(p);
						var br = document.createElement('br');
						form.appendChild(br);
					}
					
					var buttonDiv = document.createElement("div");
					
					var filterButton = document.createElement("button"); //input element, Submit button
					filterButton.setAttribute('class', 'filter-button')
					filterButton.innerHTML = "Filter";
					buttonDiv.appendChild(filterButton);
					var resetButton = document.createElement("button");
					resetButton.setAttribute("class", "reset-button");
					resetButton.innerHTML = "Reset";
					buttonDiv.appendChild(resetButton);
					
					var ContDiv = document.createElement('div');
					ContDiv.setAttribute('class', "mult-selector");
					ContDiv.appendChild(form);
					ContDiv.appendChild(buttonDiv);
					document.getElementsByTagName('body')[0].appendChild(ContDiv);
					
					multiSelectorsDivArr.push({div:ContDiv, col: col});
					
					addFilterButton(col,ContDiv);//Adding the button to trigger filter
					$('.doFilterSort').submit(function(event){//Stops the form from being submited
						event.preventDefault();
						return false;
					});
					$(filterButton).click(function(){//Cause the form to be submitted
						doFilterSort($(".doFilterSort").serializeObject());
						hideAllMultiSelectors();
					});
					$(resetButton).click(function(){
						doFilterSort({});//Empty object causes nothing to be reset
						uncheckAllMultiSelects();
						hideAllMultiSelectors();
					});
					
				}
			}	
		}
		
		function buildData(cols){
			for(var i=0; i<cols; i++){
			var table = "td:nth-child(" + (i + 1) + ")";
			 
			master[i] = $(document.getElementById(tableID).tBodies[0].rows).children(table);
			
			master[i] = $(master[i]).map(function(){
				return $.trim($(this).text());
			}).get();
			
			unique[i] = master[i].slice();
			unique[i] = unique[i].filter( onlyUnique );
			}
		}
		
		function addRefreshClick(rebuild){
			$("#" + tableID + " " + rebuild).click(function(){
				alert("Please work");
			});
		}
		
		colsToAdd = initObj["cols"];
		
		jQueryTableObj = this;
		
		tableID = $(this).attr('id');
		if (typeof tableID === "undefined"){
			return false;
			//throw "Table must have an id";
		}
		
		if(typeof initObj["rebuild"] != "undefined"){
			addRefreshClick(initObj["rebuild"]);
		}
		
		rowHeaders = $(this).children('thead').children('tr').children('th'); 
		cols = document.getElementById(tableID).rows[0].cells.length;
		
		buildData(cols);
		
		//Do sort the arrays for good flow
		for(index in unique){
			unique[index].sort();
		}
		buildForm(tableID);
		//console.log(master);
		//console.log(unique);
		return this;
	
	};

}(jQuery));