/**
 *	Some reusable functions
**/

function miuLibFunctions () {
	/* A simple function to add a new class value to an element */
	this.miuAddClass = function(element, newClass) {
		let myArr = element.className.split(' ');
		if (myArr.indexOf(newClass) == -1) {
			element.className += ' ' + newClass;
		}
	};

	this.miuHasClass = function(element, classToCheck) {
		if(!element || !element.className)
			return false;
		let myArr = element.className.split(' ');
		return myArr.indexOf(classToCheck) != -1;
	};

	this.miuRemoveClass = function(element, classToRemove) {
		let myArr = element.className.split(' ');
		let i = 0, newClassName = '';
		for(i = 0; i < myArr.length; i++){
			if(myArr[i] !== classToRemove){
				newClassName += myArr[i] + ' ';
			}
		}
		element.className = newClassName.trim();
	};

	/* A simple function to wrap all innerHTML of an element into another element */
	this.miuWrap = function(toWrapParent, wrapper) {
		wrapper.innerHTML = toWrapParent.innerHTML;
		toWrapParent.innerHTML = '';
		toWrapParent.appendChild(wrapper);
	};

	this.miuGetComputedStyleNumValue = function(element, property) {
		let value = window.getComputedStyle(element).getPropertyValue(property);
		return parseFloat(value.substring(0, value.length - 2), 10);
	};
	
	this.miuGetClearer = function() {
		let clearer = document.createElement('div');
		this.miuAddClass(clearer, 'miu-clearer');
		clearer.style.clear = 'both';
		return clearer;
	};
	
	this.miuGetGap = function(width, height) {
		let gap = document.createElement('div');
		this.miuAddClass(gap, 'miu-gap');
		gap.style.width = (width == -1) ? 'auto' : width + 'px';
		gap.style.height = (height == -1) ? 'auto' : height + 'px';
		gap.style.marginTop = '0px';
		gap.style.marginBottom = '0px';
		gap.style.marginLeft = '0px';
		gap.style.marginRight = '0px';
		return gap;
	};

	this.miuAddClearer = function(element) {
		let clearer = this.miuGetClearer();
		element.appendChild(clearer);
	};
	
	this.miuAddGap = function(element, width, height) {
		let gap = this.miuGetGap(width, height);
		element.appendChild(gap);
	};
	
	this.miuRemoveChildsWithClass = function(parent, className) {
		let childs = parent.childNodes;
		let i = 0;
		for(i = 0; i < childs.length; i++){
			let child = childs[i];
			if(this.miuHasClass(child, className)){
				parent.removeChild(child);
			}
		}
	};
}
var miuLib = new miuLibFunctions;


/**
 *	JS Processor for MIU Grid Component
**/
function miuGridProcessor () {
	if(!miuLib){
		console.log('MIU Library is required');
		return false;
	}
	
	/* A simple function to get the proportion of a cell */
	let miuGetProp = (cell) => {
		let myArr = cell.className.split(' ');
		let i = 0;
		for(i = 0; i < myArr.length; i++){
			let propClass = myArr[i];
			if(/miu-grid-cell-[0-9]{0,1}(d[1-9]){0,1}/.test(propClass)){
				let prop = propClass.replace('miu-grid-cell-', '');
				prop = prop.replace('d', '.');
				prop = parseFloat(prop, 10);
				return prop;
			}
		}
		return 1;
	};

	let miuWrapGridCells = (miuGridSelector) => {
		let cells = document.querySelectorAll(miuGridSelector + ' > .miu-grid-inner > .miu-grid-cell');
		let i = 0, cellInner;
		for(i = 0; i < cells.length; i++){
			cellInner = document.createElement('div');
			cellInner.style.marginLeft = 'auto';
			cellInner.style.marginRight = 'auto';
			miuLib.miuAddClass(cellInner, 'miu-grid-cell-inner');
			miuLib.miuWrap(cells[i], cellInner);
		}
	};

	let miuWrapGrid = (grid) => {
		let gridInner = document.createElement('div');
		gridInner.style.marginLeft = 'auto';
		gridInner.style.marginRight = 'auto';
		miuLib.miuAddClass(gridInner, 'miu-grid-inner');
		miuLib.miuWrap(grid, gridInner);
	}

	let miuUpdateGridCellsWidth = (grid, miuGridContentWidthFixed, miuGridCellMaxWidth, miuGridCellPrefMarginLR, miuGridCellPrefMarginTB, miuAutoFillSpaces, miuGridFullResponsive, miuLtr) => {
		if(miuGridFullResponsive && miuAutoFillSpaces === 'autofill'){
			console.log('Full responsive is useless in autofill display mode! Disabling...');
			miuGridFullResponsive = false;
			grid.setAttribute('miugGridFullResponsive', miuGridFullResponsive);
			console.log('Full responsive disabled!');
		}
		let miuGridIsResponsive = miuGridContentWidthFixed === 'responsive';
		let miuGridSelector = grid.getAttribute('miugSelector');
		let gridWidth = miuLib.miuGetComputedStyleNumValue(grid, 'width') + 5;
		let numPerLine = Math.floor(gridWidth / ((miuGridCellMaxWidth) + 2 * miuGridCellPrefMarginLR));
		let newGcWidth = (gridWidth / numPerLine) - (2 * miuGridCellPrefMarginLR);
		let newGcMargin = miuGridCellPrefMarginLR;
		
		let gridInner = document.querySelector(miuGridSelector + ' > .miu-grid-inner');
		let gridInnerWidth = Math.floor(((newGcWidth + 1 + 2 * newGcMargin) * numPerLine));
		gridInner.style.width = gridInnerWidth + 'px';
		
		let cellsInner = document.querySelectorAll(miuGridSelector + ' > .miu-grid-inner > .miu-grid-cell > .miu-grid-cell-inner');
		let lineCells = [], j = 0, propSum = 0;
		for(i = 0; i < cellsInner.length; i++){
			let cell = cellsInner[i].parentNode;
			let prop = miuGetProp(cell);
			cellsInner[i].style.width = (miuGridCellMaxWidth * prop) + 'px';
			let k = newGcMargin * (prop - 1);
			let toRemove = miuLib.miuGetComputedStyleNumValue(cell, 'padding-left');
			toRemove += miuLib.miuGetComputedStyleNumValue(cell, 'padding-right');
			toRemove += miuLib.miuGetComputedStyleNumValue(cell, 'border-left-width');
			toRemove += miuLib.miuGetComputedStyleNumValue(cell, 'border-right-width');
			let cellWidth = newGcWidth * prop + (2 * k) - toRemove;
			if(cellWidth < (miuGridCellMaxWidth * prop))
				cellsInner[i].style.width = cellWidth + 'px';
			if(miuGridFullResponsive && cellWidth >= (gridInnerWidth - 2 * newGcMargin)){
				cellWidth = (gridInnerWidth - 2 * newGcMargin);
				cellsInner[i].style.width = cellWidth + 'px';
			}
			if(miuGridIsResponsive){
				cellsInner[i].style.width = cellWidth + 'px';
			}
			cell.style.width = cellWidth + 'px';
			cell.style.height = 'auto';
			cell.style.position = 'relative';
			cell.style.marginLeft = (newGcMargin) + 'px';
			cell.style.marginRight = (newGcMargin) + 'px';
			cell.style.marginTop = miuGridCellPrefMarginTB + 'px';
			cell.style.marginBottom = miuGridCellPrefMarginTB + 'px';
			cell.style.cssFloat = miuLtr;
			if(miuGridFullResponsive){
				if(propSum < numPerLine && (propSum + prop > numPerLine)){
					let remSpace = gridInnerWidth - ((newGcWidth + lineCells.length) * propSum  + (lineCells.length * 2 * newGcMargin));
					let toAdd = remSpace / lineCells.length;
					let k = 0;
					for(k = 0; k < lineCells.length; k++){
						if(miuGridIsResponsive){
							cellsInner[lineCells[k].index].style.width = (miuLib.miuGetComputedStyleNumValue(cellsInner[lineCells[k].index], 'width') + toAdd) + 'px';
						}
						lineCells[k].cell.style.width = (miuLib.miuGetComputedStyleNumValue(lineCells[k].cell, 'width') + toAdd) + 'px';
					}
					lineCells = [{'index': i, 'cell': cell}];
					j = 1;
					propSum = prop;
				}else{
					if(propSum == numPerLine){
						j = 1;
						propSum = prop;
						lineCells = [{'index': i, 'cell': cell}];
					}else{
						propSum += prop;
						lineCells[j++] = {'index': i, 'cell': cell};
					}
				}
			}
		}
		if(miuGridFullResponsive){
			if(propSum < numPerLine){
				let remSpace = gridInnerWidth - ((newGcWidth + lineCells.length) * propSum  + (lineCells.length * 2 * newGcMargin));
				let toAdd = remSpace / lineCells.length;
				let k = 0;
				for(k = 0; k < lineCells.length; k++){
					if(miuGridIsResponsive){
						cellsInner[lineCells[k].index].style.width = (miuLib.miuGetComputedStyleNumValue(cellsInner[lineCells[k].index], 'width') + toAdd) + 'px';
					}
					lineCells[k].cell.style.width = (miuLib.miuGetComputedStyleNumValue(lineCells[k].cell, 'width') + toAdd) + 'px';
				}
			}
		}
		miuGridDisplay(grid, miuAutoFillSpaces, numPerLine, miuGridCellPrefMarginTB, miuLtr);
	};
	
	let miuGridDisplay = (grid, miuAutoFillSpaces, numPerLine, miuGridCellPrefMarginTB, miuLtr) => {
		if(miuAutoFillSpaces === 'table'){
			miuRemoveClearers(grid);
			miuAddClearers(grid, numPerLine);
		}
		
		if(miuAutoFillSpaces === 'autofill'){
			miuRemoveClearers(grid);
			miuAddClearers(grid, numPerLine);
			miuProcessAutoFillSpaces(grid, numPerLine, miuGridCellPrefMarginTB, miuLtr);
		}
	};
	
	let miuRemoveClearers = (grid) => {
		let miuGridSelector = grid.getAttribute('miugSelector');
		let miuGridInner = document.querySelector(miuGridSelector + ' > .miu-grid-inner');
		miuLib.miuRemoveChildsWithClass(miuGridInner, 'miu-clearer');
	};
	
	let miuAddClearers = (grid, numPerLine) => {
		if(numPerLine > 1){
			let miuGridSelector = grid.getAttribute('miugSelector');
			let miuGridInner = document.querySelector(miuGridSelector + ' > .miu-grid-inner');
			let cells = document.querySelectorAll(miuGridSelector + ' > .miu-grid-inner > .miu-grid-cell');
			let i = 0, totalProp = 0;
			for(i = 0; i < cells.length; i++){
				let cell = cells[i];
				let prop = miuGetProp(cell);
				if(totalProp + prop > numPerLine){
					miuGridInner.insertBefore(miuLib.miuGetClearer(), cell);
					totalProp = prop;
				}else{
					totalProp += prop;
				}
			}
		}
	};
	
	let miuProcessAutoFillSpaces = (grid, numPerLine, miuGridCellPrefMarginTB, miuLtr) => {
		if(numPerLine > 1){
			let miuGridSelector = grid.getAttribute('miugSelector');
			let miuGridInner = document.querySelector(miuGridSelector + ' > .miu-grid-inner');
			let cells = document.querySelectorAll(miuGridSelector + ' > .miu-grid-inner > .miu-grid-cell');
			if(cells.length > 1){
				let i = 0, j = 0;
				for(i = 0; i < cells.length; i++){
					let prop = miuGetProp(cells[i]);
					if(prop != 1){
						console.log('Autofill blank spaces option is not supported for multicol and splitted cell.');
						return false;
					}
				}
				let toRetrieve = [];
				for(i = 0; i < numPerLine; i++){
					toRetrieve[i] = 0;
				}
				for(i = 0; i < cells.length; i += numPerLine){
					let lineHeights = [], maxHeight = 0;
					for(j = 0; j < numPerLine; j++){
						let cell = cells[i + j];
						if(cell){
							lineHeights[j] = miuLib.miuGetComputedStyleNumValue(cell, 'height');
							maxHeight = (maxHeight < lineHeights[j]) ? lineHeights[j] : maxHeight;
							if(toRetrieve[j] > 0){
								cell.style.marginTop = (-toRetrieve[j]) + 'px';
							}
						}else{
							lineHeights[j] = 0;
						}
					}
					for(j = 0; j < numPerLine; j++){
						let cell = cells[i + j];
						if(cell){
							cell.style.height = (maxHeight + toRetrieve[j]) + 'px';
							toRetrieve[j] += (maxHeight - lineHeights[j] - miuGridCellPrefMarginTB);
						}
					}
				}
			}
		}
	};

	/* The function that inits the grid */
	this.miuInitGrid = function (params){
		if(params && params.selector){
			let miuGridSelector = params.selector;
			let grids = document.querySelectorAll(miuGridSelector);
			let i = 0;
			for(i = 0; i < grids.length; i++){
				let grid = grids[i];
				if(!miuLib.miuHasClass(grid, 'miu-grid')){
					let miuGridContentWidthFixed = params.gridContentWidthFixed ? params.gridContentWidthFixed : ((grid.getAttribute('miugGridContentWidthFixed')) ? grid.getAttribute('miugGridContentWidthFixed') : 'fixed');
					let miuGridCellMaxWidth = params.gridRefWidth ? params.gridRefWidth : ((grid.getAttribute('miugGridRefWidth')) ? parseFloat(grid.getAttribute('miugGridRefWidth'), 10) : 200);
					let miuGridCellPrefMarginLR = params.cellLeftRightGap ? params.cellLeftRightGap / 2 : ((grid.getAttribute('miugCellLeftRightGap')) ? parseFloat(grid.getAttribute('miugCellLeftRightGap'), 10) / 2 : 0);
					let miuGridCellPrefMarginTB = params.cellTopBottomGap ? params.cellTopBottomGap / 2 : ((grid.getAttribute('miugCellTopBottomGap')) ? parseFloat(grid.getAttribute('miugCellTopBottomGap'), 10) / 2 : 0);
					let miuGridDisplay = params.gridDisplay ? params.gridDisplay : ((grid.getAttribute('miugGridDisplay')) ? grid.getAttribute('miugGridDisplay') : 'table');
					let miuGridFullResponsive = params.gridFullResponsive ? params.gridFullResponsive : ((grid.getAttribute('miugGridFullResponsive')) ? grid.getAttribute('miugGridFullResponsive') : false);
					let miuLtr = params.ltr ? params.ltr : ((grid.getAttribute('miugLtr')) ? grid.getAttribute('miugLtr') : 'ltr');
					
					if(grid){
						miuLib.miuAddClass(grid, 'miu-grid');
						let uniqueClass = 'miu-grid-' + (2475 + document.querySelectorAll('.miu-grid').length);
						miuLib.miuAddClass(grid, uniqueClass);
						let gSelector = '.' + uniqueClass;
						grid.setAttribute('miugSelector', gSelector);
						grid.setAttribute('miugGridContentWidthFixed', miuGridContentWidthFixed);
						grid.setAttribute('miugGridRefWidth', miuGridCellMaxWidth);
						grid.setAttribute('miugCellLeftRightGap', miuGridCellPrefMarginLR * 2);
						grid.setAttribute('miugCellTopBottomGap', miuGridCellPrefMarginTB * 2);
						grid.setAttribute('miugGridDisplay', miuGridDisplay);
						grid.setAttribute('miugGridFullResponsive', miuGridFullResponsive);
						grid.setAttribute('miugLtr', miuLtr);
						miuLtr = miuLtr === 'rtl' ? 'right' : 'left';
						
						miuWrapGrid(grid);
						
						miuLib.miuAddClearer(grid);
						
						miuWrapGridCells(gSelector);
						
						miuUpdateGridCellsWidth(grid, miuGridContentWidthFixed, miuGridCellMaxWidth, miuGridCellPrefMarginLR, miuGridCellPrefMarginTB, miuGridDisplay, miuGridFullResponsive, miuLtr);
					}
				}
			}
		}
	};

	/* We listen to window resize event so to update our grids */
	document.onreadystatechange = () => {
		if (document.readyState === 'interactive') {
			let gridsToInit = document.querySelectorAll('.miu-grid-container');
			let i = 0;
			for(i = 0; i < gridsToInit.length; i++){
				let gridToInit = gridsToInit[i];
				if(!miuLib.miuHasClass(gridToInit, 'miu-grid')){
					miuLib.miuAddClass(gridToInit, 'miu-grid-auto-initiated');
					let autoInitClass = 'miu-grid-auto-initiated-' + (1356 + i);
					miuLib.miuAddClass(gridToInit, autoInitClass);
					this.miuInitGrid({selector: '.' + autoInitClass});
					miuLib.miuRemoveClass(gridToInit, autoInitClass);
				}
			}
			window.onresize = (e) => {
				let grids = document.querySelectorAll('.miu-grid');
				let i = 0;
				for(i = 0; i < grids.length; i++){
					let grid = grids[i];
					let miuGridContentWidthFixed = grid.getAttribute('miugGridContentWidthFixed');
					let miuGridCellMaxWidth = parseFloat(grid.getAttribute('miugGridRefWidth'), 10);
					let miuGridCellPrefMarginLR = parseFloat(grid.getAttribute('miugCellLeftRightGap'), 10) / 2;
					let miuGridCellPrefMarginTB = parseFloat(grid.getAttribute('miugCellTopBottomGap'), 10) / 2;
					let miuGridDisplay = grid.getAttribute('miugGridDisplay');
					let miuGridFullResponsive = grid.getAttribute('miugGridFullResponsive') === 'true';
					let miuLtr = grid.getAttribute('miugLtr') === 'rtl' ? 'right' : 'left';
					miuUpdateGridCellsWidth(grid, miuGridContentWidthFixed, miuGridCellMaxWidth, miuGridCellPrefMarginLR, miuGridCellPrefMarginTB, miuGridDisplay, miuGridFullResponsive, miuLtr);
				}
			};
		}
	};
};
var miuGrid = new miuGridProcessor;