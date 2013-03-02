/**
 * dtpicker (jquery-simple-datetimepicker)
 * (c) Masanori Ohgita - 2012.
 * https://github.com/mugifly/jquery-simple-datetimepicker
 */

 (function($) {
 	var DAYS_OF_WEEK_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
 	var DAYS_OF_WEEK_JA = ['日', '月', '火', '水', '木', '金', '土'];
 	var MONTHS_EN = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

 	var PickerObjects = [];
 	var PickerjqObjects = [];
 	var ActivePickerId = -1;

 	/* Picker Object */
 	var Picker = function($obj, opt_option) {
 		console.log('Picker object initialize ... ');
 		if(opt_option == null){ opt_option = {}; }
 		var date = new Date();

		this.pickerId = PickerObjects.length;
 		this.inputObject = null;
 		this.locale = opt_option.locale || 'en';
 		this.inline = opt_option.inline || false;
 		this.animation = opt_option.animation || true;
 		this.dateFormat = opt_option.dateFormat || 'default';
 		this.pickedDate = null;

 		if(opt_option.current != null){
 			this.current = getDate(opt_option.current);
 		}else{
	 		this.current = new Date();
	 	}

 		/* Container */
		var $picker = $('<div>');
		$picker.addClass('datepicker')
		$obj.append($picker);

		/* Header */
		var $header = $('<div>');
		$header.addClass('datepicker_header');
		$picker.append($header);
		/* InnerContainer*/
		var $inner = $('<div>');
		$inner.addClass('datepicker_inner_container');
		$picker.append($inner);
		/* Calendar */
		var $calendar = $('<div>');
		$calendar.addClass('datepicker_calendar');
		var $table = $('<table>');
		$table.addClass('datepicker_table');
		$calendar.append($table);
		$inner.append($calendar);
		/* Timelist */
		var $timelist = $('<div>');
		$timelist.addClass('datepicker_timelist');
		$inner.append($timelist);

		PickerjqObjects.push($picker);

		/* Set event handler to picker */
		$picker.hover(
			function(){
				ActivePickerId = $(this).data("pickerId");
			},
			function(){
				ActivePickerId = -1;
			}
		);
		
		/* Set picker Object */
		$picker.data('picker', this);
		
		this.drawByDate({
			"isAnim": true, 
			"isOutputToInputObject": true
		}, this.current);
 	};

 	Picker.prototype.getPickerjqObject = function(){
 		for(var i=0;i<PickerjqObjects.length;i++){
 			if(PickerjqObjects[i].data('picker').pickerId == this.pickerId){
	 			return $(PickerjqObjects[i]);
	 		}
 		}
 	}

	Picker.prototype.prevMonth = function() {
 		var date = this.getPickedDate();
 		var targetMonth_lastDay = new Date(date.getYear() + 1900, date.getMonth(), 0).getDate();
 		if (targetMonth_lastDay < date.getDate()) {
 			date.setDate(targetMonth_lastDay);
 		}
 		this.draw({
 			"isAnim": true, 
 			"isOutputToInputObject": true
 		}, date.getYear() + 1900, date.getMonth() - 1, date.getDate(), date.getHours(), date.getMinutes());
 	};

 	Picker.prototype.nextMonth = function() {
 		var date = this.getPickedDate();
 		var targetMonth_lastDay = new Date(date.getYear() + 1900, date.getMonth() + 1, 0).getDate();
 		if (targetMonth_lastDay < date.getDate()) {
 			date.setDate(targetMonth_lastDay);
 		}
 		this.draw({
 			"isAnim": true, 
 			"isOutputToInputObject": true
 		}, date.getYear() + 1900, date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes());
 	};

 	/* Draw a picker with Date object */
 	Picker.prototype.drawByDate = function(option, date) {
		this.draw(option, date.getYear() + 1900, date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
	};

 	/* Draw a picker */
 	Picker.prototype.draw = function(option, year, month, day, hour, min){
 		var $picker = this.getPickerjqObject();
		var date = new Date();

		console.log($picker);
		
		if (hour != null) {
			date = new Date(year, month, day, hour, min, 0);
		} else if (year != null) {
			date = new Date(year, month, day);
		} else {
			date = new Date();
		}
		//console.log("dtpicker - draw()..." + year + "," + month + "," + day + " " + hour + ":" + min + " -> " + date);
		
		/* Read options */
		var isScroll = option.isAnim; /* It same with isAnim */

		var isAnim = option.isAnim;
		if($picker.data("animation") == false){ // If disabled by user option.
			isAnim = false;
		}
		
		var isOutputToInputObject = option.isOutputToInputObject;

		/* Read locale option */
		var daysOfWeek = DAYS_OF_WEEK_EN;
		if(this.locale == "ja"){
			daysOfWeek = DAYS_OF_WEEK_JA;
		}
		
		/* Calculate dates */
		var todayDate = new Date(); 
		var firstWday = new Date(date.getYear() + 1900, date.getMonth(), 1).getDay();
		var lastDay = new Date(date.getYear() + 1900, date.getMonth() + 1, 0).getDate();
		var beforeMonthLastDay = new Date(date.getYear() + 1900, date.getMonth(), 0).getDate();
		var dateBeforeMonth = new Date(date.getYear() + 1900, date.getMonth(), 0);
		var dateNextMonth = new Date(date.getYear() + 1900, date.getMonth() + 2, 0);
		
		/* Collect each part */
		var $header = $picker.children('.datepicker_header');
		var $inner = $picker.children('.datepicker_inner_container');
		var $calendar = $picker.children('.datepicker_inner_container').children('.datepicker_calendar');
		var $table = $calendar.children('.datepicker_table');
		var $timelist = $picker.children('.datepicker_inner_container').children('.datepicker_timelist');
		
		/* Grasp a point that will be changed */
		var changePoint = "";
		var oldDate = this.getPickedDate();
		if(oldDate != null){
			if(oldDate.getMonth() != date.getMonth() || oldDate.getDate() != date.getDate()){
				changePoint = "calendar";
			} else if (oldDate.getHours() != date.getHours() || oldDate.getMinutes() != date.getMinutes()){
				if(date.getMinutes() == 0 || date.getMinutes() == 30){
					changePoint = "timelist";
				}
			}
		}
		
		/* Save newly date to Picker data */
		this.pickedDate = date;
		
		/* Fade-out animation */
		if (isAnim == true) {
			if(changePoint == "calendar"){
				$calendar.stop().queue([]);
				$calendar.fadeTo("fast", 0.8);
			}else if(changePoint == "timelist"){
				$timelist.stop().queue([]);
				$timelist.fadeTo("fast", 0.8);
			}
		}
		/* Remind timelist scroll state */
		var drawBefore_timeList_scrollTop = $timelist.scrollTop();
		
		/* New timelist  */
		var timelist_activeTimeCell_offsetTop = -1;
		
		/* Header ----- */
		$header.children().remove();
		var $link_before_month = $('<a>');
		$link_before_month.text('<');
		$link_before_month.click(function() {
			getParentPickerObjectByObject(this).prevMonth();
		});

		var $now_month = $('<span>');
		if(this.locale == "en"){
			$now_month.text((date.getYear() + 1900) + " - " + MONTHS_EN[date.getMonth()]);
		}else if(this.locale == "ja"){
			$now_month.text((date.getYear() + 1900) + " / " + zpadding(date.getMonth() + 1));
		}

		var $link_next_month = $('<a>');
		$link_next_month.text('>');
		$link_next_month.click(function() {
			getParentPickerObjectByObject(this).nextMonth();
		});

		$header.append($link_before_month);
		$header.append($now_month);
		$header.append($link_next_month);

		/* Calendar > Table ----- */
		$table.children().remove();
		var $tr = $('<tr>');
		$table.append($tr);

		/* Output wday cells */
		for (var i = 0; i < 7; i++) {
			var $td = $('<th>');
			$td.text(daysOfWeek[i]);
			$tr.append($td);
		}

		/* Output day cells */
		var cellNum = Math.ceil((firstWday + lastDay) / 7) * 7;
		for (var i = 0; i < cellNum; i++) {
			var realDay = i + 1 - firstWday;
			if (i % 7 == 0) {
				$tr = $('<tr>');
				$table.append($tr);
			}

			var $td = $('<td>');
			$td.data("day", realDay);
			
			$tr.append($td);
			
			if (firstWday > i) {/* Before months day */
				$td.text(beforeMonthLastDay + realDay);
				$td.addClass('day_another_month');
				$td.data("dateStr", dateBeforeMonth.getYear() + 1900 + "/" + (dateBeforeMonth.getMonth() + 1) + "/" + (beforeMonthLastDay + realDay));
			} else if (i < firstWday + lastDay) {/* Now months day */
				$td.text(realDay);
				$td.data("dateStr", (date.getYear() + 1900) + "/" + (date.getMonth() + 1) + "/" + realDay);
			} else {/* Next months day */
				$td.text(realDay - lastDay);
				$td.addClass('day_another_month');
				$td.data("dateStr", dateNextMonth.getYear() + 1900 + "/" + (dateNextMonth.getMonth() + 1) + "/" + (realDay - lastDay));
			}

			if (i % 7 == 0) {/* Sunday */
				$td.addClass('wday_sun');
			} else if (i % 7 == 6) {/* Saturday */
				$td.addClass('wday_sat');
			}

			if (realDay == date.getDate()) {/* selected day */
				$td.addClass('active');
			}
			
			if (date.getMonth() == todayDate.getMonth() && realDay == todayDate.getDate()) {/* today */
				$td.addClass('today');
			}

			/* Set event-handler to day cell */

			$td.click(function() { // day cell onClick
				var target_date = new Date($(this).data("dateStr"));
				$(this).addClass('active');
				if ($(this).hasClass('hover')) {
					$(this).removeClass('hover');
				}

				var picker = getParentPickerObjectByObject($(this));
				picker.drawByDate({
					"isAnim": false, 
					"isOutputToInputObject": true
				}, target_date);
			});

			$td.hover(function() { // Day cell onHover
				if (! $(this).hasClass('active')) {
					$(this).addClass('hover');
				}
			}, function() {
				if ($(this).hasClass('hover')) {
					$(this).removeClass('hover');
				}
			});
		}

		/* Timelist ----- */
		$timelist.children().remove();
		
		/* Set height to Timelist (Calendar innerHeight - Calendar padding) */
		$timelist.css("height", $calendar.innerHeight() - 10 + 'px');

		/* Output time cells */
		for (var hour = 0; hour < 24; hour++) {
			for (var min = 0; min <= 30; min += 30) {
				var $o = $('<div>');
				$o.addClass('timelist_item');
				$o.text(zpadding(hour) + ":" + zpadding(min));

				$o.data("hour", hour);
				$o.data("min", min);

				$timelist.append($o);

				if (hour == date.getHours() && min == date.getMinutes()) {/* selected time */
					$o.addClass('active');
					timelist_activeTimeCell_offsetTop = $o.offset().top;
				}

				/* Set event handler to time cell */
				
				$o.click(function() {
					$(this).addClass('active');
					if ($(this).hasClass('hover')) {
						$(this).removeClass('hover');
					}

					var picker = getParentPickerObjectByObject($(this));
					var target_date = picker.getPickedDate();
					target_date.setHours($(this).data("hour"));
					target_date.setMinutes($(this).data("min"));

					picker.drawByDate({
						"isAnim": false, 
						"isOutputToInputObject": true
					}, target_date);
				});
				
				$o.hover(function() {
					if (! $(this).hasClass('active')) {
						$(this).addClass('hover');
					}
				}, function() {
					if ($(this).hasClass('hover')) {
						$(this).removeClass('hover');
					}
				});
			}
		}
		
		/* Scroll the timelist */
		if(isScroll == true){
			/* Scroll to new active time-cell position */
			$timelist.scrollTop(timelist_activeTimeCell_offsetTop - $timelist.offset().top);
		}else{
			/* Scroll to position that before redraw. */
			$timelist.scrollTop(drawBefore_timeList_scrollTop);
		}

		/* Fade-in animation */
		if (isAnim == true) {
			if(changePoint == "calendar"){
				$calendar.fadeTo("fast", 1.0);
			}else if(changePoint == "timelist"){
				$timelist.fadeTo("fast", 1.0);
			}
		}

		/* Output to InputForm */
		if (isOutputToInputObject == true) {
			this.outputToInputObject();
		}
 	};

	Picker.prototype.getPickedDate = function() {
		return this.pickedDate;
	};

	Picker.prototype.setInputFieldObject = function(input_object){
		this.inputObject = $(input_object);
		$(input_object).data('pickerId', this.pickerId);
	};

	Picker.prototype.outputToInputObject = function() {
		var date = this.getPickedDate();
		var $inp = $(this.inputObject);
		var date_format = this.dateFormat;
		var locale = this.locale;
		var str = "";
		if ($inp == null) {
			return;
		}
		
		if (date_format == "default"){
			if(locale == "ja"){
				date_format = "YYYY/MM/DD hh:mm";
			}else{
				date_format = "YYYY-MM-DD hh:mm";
			}
		}
		
		str = date_format;
		var y = date.getYear() + 1900;
		var m = date.getMonth() + 1;
		var d = date.getDate();
		var hou = date.getHours();
		var min = date.getMinutes();
		
		str = str.replace(/YYYY/gi, y)
		.replace(/YY/g, y - 2000)/* century */
		.replace(/MM/g, zpadding(m))
		.replace(/M/g, m)
		.replace(/DD/g, zpadding(d))
		.replace(/D/g, d)
		.replace(/hh/g, zpadding(hou))
		.replace(/h/g, hou)
		.replace(/mm/g, zpadding(min))
		.replace(/m/g, min);
		$inp.val(str);
	};

 	var getParentPickerObjectByObject = function(obj) {
 		var $obj = $(obj);
 		var picker;
 		if ($obj.hasClass('datepicker')) {
 			picker = $obj.data('picker');
 		} else {
 			var parents = $obj.parents();
 			for (var i = 0; i < parents.length; i++) {
 				if ($(parents[i]).hasClass('datepicker')) {
 					picker = $(parents[i]).data('picker');
 				}
 			}
 		}
 		return picker;
 	};

 	var getParentPickerjqObjectByObject = function(obj) {
 		var $obj = $(obj);
 		var $picker;
 		if ($obj.hasClass('datepicker')) {
 			$picker = $obj;
 		} else {
 			var parents = $obj.parents();
 			for (var i = 0; i < parents.length; i++) {
 				if ($(parents[i]).hasClass('datepicker')) {
 					$picker = $(parents[i]);
 				}
 			}
 		}
 		return $picker;
 	};

 	var getPickersInputObject = function($obj) {
 		var $picker = getParentPickerjqObjectByObject($obj);
 		if ($picker.data("inputObjectId") != null) {
 			return $(InputObjects[$picker.data("inputObjectId")]);
 		}
 		return null;
 	}

 	var getDate = function (str) {
 		var re = /^(\d{2,4})[-/](\d{1,2})[-/](\d{1,2}) (\d{1,2}):(\d{1,2})$/;
 		var m = re.exec(str);
		// change year for 4 digits
		if (m[1] < 99) {
			var date = new Date();
			m[1] = parseInt(m[1]) + parseInt(date.getFullYear().toString().substr(0, 2) + "00");
		}
		// return
		return new Date(m[1], m[2] - 1, m[3], m[4], m[5]);
	}

	var zpadding = function(num) {
		num = ("0" + num).slice(-2);
		return num
	};

	/**
	 * Initialize dtpicker
	 */
	 $.fn.dtpicker = function(options) {
	 	return this.each(function(i) {
	 		/* Initialize picker */
	 		new Picker($(this), options);
	 	});
	 };

	/**
	 * Initialize dtpicker, append to Text input field
	 * */
	 $.fn.appendDtpicker = function(options) {
	 	var date = new Date();
		if(options == null){ options = {}; }

	 	/* Each targets... */
	 	return this.each(function(i) {
	 		var $input = $(this);

	 		/* Current date */
	 		var date, strDate, strTime;
	 		if($input.val() != null && $input.val() != ""){
	 			options.current = $input.val();
	 		}

	 		/* Make parent-div for picker */
	 		var $d = $('<div>');
	 		if(options.inline == false){
	 			/* float mode */
	 			$d.css("position","absolute");
	 		}
	 		$d.insertAfter($input);

	 		/* Initialize picker */
			var $picker_parent = $($d).dtpicker(options); // call dtpicker() method
			var $picker = $picker_parent.children('.datepicker');
			var picker = $picker.data('picker');

			var pickerId = picker.pickerId;

			/* Link picker -> input-field */
			picker.setInputFieldObject($input);
			
			/* Set event handler to input-field */
			
			$input.keyup(function() {
				var $picker = $(PickerjqObjects[$input.data('pickerId')]);
				if ($input.val() != null && ( $input.data('beforeVal') == null ||
					( $input.data('beforeVal') != null && $input.data('beforeVal') != $input.val())	)) {
					 /* beforeValue == null || beforeValue != nowValue  */
					var date = getDate($input.val());
					if (isNaN(date.getDate()) == false) {/* Valid format... */
						draw_date({
							"isAnim":true, 
							"isOutputToInputObject":false
						}, date);
					}
				}
				$input.data('beforeVal',$input.val())
			});
			
			$input.change(function(){
				$(this).trigger('keyup');
			});
			
			if(options.inline == true){
				/* inline mode */
				$picker.data('isInline',true);
			}else{
				/* float mode */
				$picker.data('isInline',false);
				$picker_parent.css({
					"zIndex": 100
				});
				$picker.css("width","auto");
				
				/* Hide this picker */
				$picker.hide();
				
				/* Set onClick event handler for input-field */
				$input.click(function(){
					var $input = $(this);
					var $picker = $(PickerjqObjects[$input.data('pickerId')]);
					ActivePickerId = $input.data('pickerId');
					$picker.show();
					$picker.parent().css("top", $input.offset().top + $input.outerHeight() + 2 + "px");
					$picker.parent().css("left", $input.offset().left + "px");
				});
			}
		});
};

/* Set event handler to Body element, for hide a floated-picker */
$(function(){
	$('body').click(function(){
		for(var i=0;i<PickerjqObjects.length;i++){
			var $picker = $(PickerjqObjects[i]);
			if(ActivePickerId != i){	/* if not-active picker */
				if($picker.data("inputObjectId") != null && $picker.data("isInline") == false){
					/* if append input-field && float picker */
					$picker.hide();
				}
			}
		}
	});
});

})(jQuery);
