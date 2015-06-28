(function(){



	window.LIFE = {};



	var _createNodeStr = function (nodeName, nodeValue){
		return '<' + nodeName + '>' + nodeValue + '</' + nodeName + '>';
	};



	var _recursiveObject2Xml = function (name, obj) {
		var xmlstr = '';
		if (typeof(obj) == 'string' || typeof(obj) == 'number') 
		{
			xmlstr = _createNodeStr(name, obj);
		}
		else if ($.isArray(obj)) 
		{
			$.each(obj, function(idx, item){
				xmlstr += _recursiveObject2Xml(name, item);
			});
		}
		else if (typeof(obj) == 'object') 
		{
			xmlstr += '<' + name + '>';
			$.each(obj, function(propName, propVal){
				xmlstr += _recursiveObject2Xml(propName, propVal);
			});
			xmlstr += '</' + name + '>';
		}
		return xmlstr;
	};



	var _recursiveXml2Object = function ($xml) {
		if ($xml.children().size() > 0) 
		{
			var _obj = {};
			$xml.children().each(function(){
				var _childObj = ($(this).children().size() > 0) ? _recursiveXml2Object($(this)) : $(this).text();
				if ($(this).siblings().size() > 0 && $(this).siblings().get(0).tagName == this.tagName) 
				{
					if (_obj[this.tagName] == null) 
					{
						_obj[this.tagName] = [];
					}
					_obj[this.tagName].push(_childObj);
				}
				else 
				{
					_obj[this.tagName] = _childObj;
				}
			});
			return _obj;
		}
		else 
		{
			return $xml.text();
		}
	};



	window.LIFE.object2xml = function (name, obj) {
		var xmlstr = '<?xml version="1.0" encoding="UTF-8"?>';
		xmlstr += _recursiveObject2Xml(name, obj);
		return xmlstr;
	}



	window.LIFE.xml2object = function ($xml) {
		var obj = new Object();
		if ($xml.find('response').size() > 0) 
		{
			var _response = _recursiveXml2Object($xml.find('response'));
			obj.type = 'response';
			obj.response = _response;
		}
		else if ($xml.find('error').size() > 0) 
		{
			var _code = $xml.find('code').text();
			var _message = $xml.find('message').text();
			obj.type = 'error';
			obj.error = {
				code: _code,
				message: _message
			};
		}
		else if ($xml.find('configuration').size() > 0) 
		{
			var _config = _recursiveXml2Object($xml.find('configuration'));
			obj.type = 'configuration';
			obj.configuration = _config;
		}
		else if ($xml.find('config').size() > 0) 
		{
			var _config = _recursiveXml2Object($xml.find('config'));
			obj.type = 'config';
			obj.config = _config;
		}
		else
		{
			obj.type = 'unknown';
		}
		return obj;
	};



	window.LIFE.getAjaxData = function (urlstr, callback_func, options) {
		$.ajax({
			type: 'GET',
			url: urlstr,
			error: function(XMLHttpRequest, textStatus){
			   callback_func('disconnect');
			},
			success: function(data){
				var xml;
				if (typeof data == 'string' || typeof data == 'number') 
				{
					if (!window.ActiveXObject) 
					{
						var parser = new DOMParser();
						xml = parser.parseFromString(data, 'text/xml');
					}
				}
				else 
				{
					xml = data;
				}
				if (typeof callback_func == 'function') 
				{
					callback_func($(xml));
				}
				else 
				{
					console.log('callback_func is undefined or not a function');
				}
			}
		});
	}



	window.LIFE.saveAjaxData = function (urlstr, xml, callback_func, options) {
		var isAsync = true;
		var nTimeout = 3000;
		var errorCallback = null;

		if (options)
		{
			if (options.sync)
			{
				isAsync = (options.sync === true) ? false : true;
			}
			if (options.timeout)
			{
				nTimeout = parseInt(options.timeout);
				if (isNaN(nTimeout))
					nTimeout = 3000;
			}
			errorCallback = options.errorCB;
		}
		
		$.ajax({
			async: isAsync,
			type: 'POST',
			timeout: nTimeout,
			url: urlstr,
			data: xml,
			error: function(XMLHttpRequest, textStatus){
				console.log(XMLHttpRequest);
			},
			success: function(data){
				
				var xml;				
					xml = data;

				if (typeof callback_func == 'function') 
				{
					callback_func($(xml));
				}
			}
		});
	}

	
	window.LIFE.formatFloat = function(src, pos){
		return Math.round(src * Math.pow(10, pos)) / Math.pow(10, pos);
	};

	
	window.LIFE.getTrafficNumber = function (bit) {
		var final_number = 0;			

		if (1024 > bit) {
			final_number = window.LIFE.formatFloat(parseFloat(bit) / 1024, 2);

		} else if (1024 <= bit && 1024*1024 > bit) {
			final_number = window.LIFE.formatFloat(parseFloat(bit) / 1024, 2);

		} else if (1024*1024 <= bit && 1024*1024*1024 > bit) {
			final_number = window.LIFE.formatFloat((parseFloat(bit) / 1024)/1024, 2);

		} else {
			final_number = window.LIFE.formatFloat(((parseFloat(bit) / 1024)/1024)/1024, 2);
		}

		return final_number;
	};



	window.LIFE.getTrafficDUMeter = function (bit) {
		var final_str = '';

		if(1024 > bit) {
			final_str = ' KB';

		} else if(1024 <= bit && 1024*1024 > bit) {
			final_str = ' KB';

		} else if (1024*1024 <= bit && 1024*1024*1024 > bit) {
			final_str = ' MB';

		} else {
			final_str = ' GB';
		}

		return final_str;
	};
	


	/**
	 * @param int time - seconds
	 * @return string (format time: 02:15:38)
	 */
	window.LIFE.getCurrentTime = function (time){
		var final_time = '',
			times = time*1,
			common_colon = ':',
			hours = minutes = 0;

		hours = (times / 3600)*1;

		if (hours > 9) {
			final_time += hours + common_colon;

		} else if (hours > 0) {
			final_time += '0' + hours + common_colon;

		} else if (hours == 0) {
			final_time += '00' + common_colon;
		}

		times = times - hours * 3600;

		minutes = (times / 60)*1;

		if (minutes > 9) {
			final_time += minutes + common_colon;

		} else if (minutes > 0) {
			final_time += '0' + minutes+common_colon;

		} else if (minutes == 0) {
			final_time += '00'+common_colon;
		}

		times = times - minutes * 60;

		if (times > 9) {
			final_time += times;

		} else if (times > 0) {
			final_time += '0' + times;

		} else if (times == 0) {
			final_time += '00';
		} 

		return final_time;
	}



})(jQuery);