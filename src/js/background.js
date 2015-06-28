(function($){

	var data = {
		life_url: 'http://192.168.1.1',
		traffic_url: '/api/monitoring/traffic-statistics',
		monitoring_url: '/api/monitoring/status',
		connect_url: '/api/dialup/dial',

		connect: false,

		traffic_status: {},
		network_status: {},

		storage: {}
	};

	var message = {
		connect: true,
		disconnect: true
	};

	var getTrafficStatus = function(){
		window.LIFE.getAjaxData(data.life_url + data.traffic_url, function($xml){
			var traffic_ret = window.LIFE.xml2object($xml);
			if (traffic_ret.type == "response") 
			{
				data.traffic_status = traffic_ret.response;
			}
		});				
	};

	var getStatus = function(){
		window.LIFE.getAjaxData(data.life_url + data.monitoring_url, function($xml){
			if ((typeof $xml == "string" && $xml == "disconnect"))
			{
				data.connect = false;				
			}
			else
			{
				var status_ret = window.LIFE.xml2object($xml);
				if (status_ret.type == "response") 
				{
					data.network_status = status_ret.response;
					data.connect = !(data.network_status.WanIPAddress == '');
				}
				else
				{
					data.connect = false;				
				}
			}
		});
	};

	var notifyStatus = function(){

		if (data.connect == true && message.disconnect == true)
		{
			var notification = webkitNotifications.createNotification(
				'img/connected.png',  // icon url - can be relative
				'',  // notification title
				'Соединение установлено!'  // notification body text
			);
			//notification.show();
			chrome.browserAction.setIcon({path: 'img/connected.png'});

			message.connect = true;
			message.disconnect = false;
		}

		if (data.connect == false && message.connect == true)
		{
			var notification = webkitNotifications.createNotification(
				'img/disconnect.png',  // icon url - can be relative
				'',  // notification title
				'Соединение отсутствует!'  // notification body text
			);
			//notification.show();
			chrome.browserAction.setIcon({path: 'img/disconnect.png'});

			message.connect = false;
			message.disconnect = true;
		}
	};




	$(document).ready(function(){
		
		window.setInterval(function(){

			getStatus();
			notifyStatus();

			if (data.connect)
			{
				getTrafficStatus();				

				data.storage.ip = data.network_status.WanIPAddress;

				//console.log(data.traffic_status);
				
				data.storage.current_connect_time = window.LIFE.getCurrentTime(data.traffic_status.CurrentConnectTime);
				
				
				data.storage.upload_speed = window.LIFE.formatFloat((parseFloat(data.traffic_status.CurrentUploadRate) / 1024) / 1024, 2);
				data.storage.download_speed = window.LIFE.formatFloat((parseFloat(data.traffic_status.CurrentDownloadRate) / 1024) / 1024, 2);

				data.storage.current_download = window.LIFE.getTrafficNumber(data.traffic_status.CurrentDownload);
				data.storage.current_download_meter = window.LIFE.getTrafficDUMeter(data.traffic_status.CurrentDownload);

				data.storage.current_upload = window.LIFE.getTrafficNumber(data.traffic_status.CurrentUpload);
				data.storage.current_upload_meter = window.LIFE.getTrafficDUMeter(data.traffic_status.CurrentUpload);

				data.storage.total_current = window.LIFE.getTrafficNumber(
					window.parseInt(data.traffic_status.CurrentDownload) +
					window.parseInt(data.traffic_status.CurrentUpload));
				data.storage.total_current_meter = window.LIFE.getTrafficDUMeter(
					window.parseInt(data.traffic_status.CurrentDownload) +
					window.parseInt(data.traffic_status.CurrentUpload));

			}
			else
			{
				data.storage.ip = '';
				data.storage.current_download = 0;
				data.storage.current_download_meter = '';
				data.storage.current_upload = 0;
				data.storage.current_upload_meter = '';
				data.storage.total_current = 0;
				data.storage.total_current_meter = '';
			}

			chrome.browserAction.setBadgeText({text: data.storage.total_current + ''});

			window.localStorage.setItem('app_data', window.JSON.stringify(data));
			

		}, 500);



	});




})(jQuery);
