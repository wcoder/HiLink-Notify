(function($){

	var data = {},
		status = 2;

	var processShow = function(){
		var text = '';

		switch (status) {
			case -1:
				text = 'Отключиться';
			break;
			case 0:
				text = 'Выполнение...';
			break;
			case 1:
				text = 'Подключиться';
			break;
			default:
				text = '';
			break;
		}

		$('#wrapper button').text(text);
	};

	/**
	 * @param bool type
	 */
	var disableButton = function(type){
		$('#wrapper button').attr('disabled', type);
	};

	var sendConnectionAction = function(action){
		var dialup_xml = window.LIFE.object2xml('request', {
			Action: action + ''
		});

		window.LIFE.saveAjaxData(
			data.life_url + data.connect_url,
			dialup_xml,
			function($xml){
				disableButton(false);
			}
		);
	};

		
	$('#connect_btn').live('click', function(){
		disableButton(true);
		sendConnectionAction(1);
	});
		
	$('#disconnect_btn').live('click', function(){
		disableButton(true);
		sendConnectionAction(0);
	});


	window.setInterval(function(){

		data = window.JSON.parse(window.localStorage.getItem('app_data'));

		$('#ip').text(data.storage.ip || '0');
		$('#download').text(data.storage.current_download + ' ' + data.storage.current_download_meter);
		$('#upload').text(data.storage.current_upload + ' ' + data.storage.current_upload_meter);
		$('#total').text(data.storage.total_current + ' ' + data.storage.total_current_meter);		
		$('#upload_speed').text(data.storage.upload_speed + ' MB/c');
		$('#download_speed').text(data.storage.download_speed + ' MB/c');
		$('#cuttent_connect_time').text(data.storage.current_connect_time);	
		
		if (data.connect) {
			$('#wrapper button').attr('id', 'disconnect_btn');
			connectAction();
		} else {
			$('#wrapper button').attr('id', 'connect_btn');
			disconnectAction();
		}

		processShow();

	}, 500);

	var connectAction = function(){
		status = -1;
	};

	var disconnectAction = function(){
		status = 1;
	};

})(jQuery);