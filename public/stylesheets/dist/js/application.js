$(document).ready(function () {
	
	var opts = {
	        lines: 17, // The number of lines to draw
	        length: 28, // The length of each line
	        width: 14, // The line thickness
	        radius: 36, // The radius of the inner circle
	        corners: 1, // Corner roundness (0..1)
	        rotate: 0, // The rotation offset
	        direction: 1, // 1: clockwise, -1: counterclockwise
	        color: '#000', // #rgb or #rrggbb or array of colors
	        speed: 1, // Rounds per second
	        trail: 60, // Afterglow percentage
	        shadow: true, // Whether to render a shadow
	        hwaccel: false, // Whether to use hardware acceleration
	        className: 'spinner', // The CSS class to assign to the spinner
	        zIndex: 2e9, // The z-index (defaults to 2000000000)
	        top: '50%', // Top position relative to parent
	        left: '50%' // Left position relative to parent
	    };
	
	if (window.top != window.self) {window.top.location = window.self.location;}

	$("#processing_topics").click(function(){
		var target = document.getElementById('main_div');
        var spinner = new Spinner(opts).spin(target);
		window.location.href = "?tab=messaging&cat=list_topics"
	});
	$("#processing_resources").click(function(){
		var target = document.getElementById('main_div');
        var spinner = new Spinner(opts).spin(target);
		window.location.href = "?tab=messaging&cat=resources"
	});
	$("#processing_test").click(function(){
		var target = document.getElementById('main_div');
        var spinner = new Spinner(opts).spin(target);
		window.location.href = "?tab=messaging&cat=test"
	});
	$("#processing_start").click(function(){
		$.confirm({
		    text: "Are you sure you want to start the Messaging tool?",
		    confirmButtonClass: "btn-danger",
		    confirm: function() {
		    	var target = document.getElementById('main_div');
		        var spinner = new Spinner(opts).spin(target);
		        window.location.href = "?tab=messaging&cat=resources&action=start_service";
		    },
		    cancel: function() {}
		});
	});
	$("#processing_stop").click(function(){
		$.confirm({
		    text: "Are you sure you want to stop the Messaging tool?",
		    confirmButtonClass: "btn-danger",
		    confirm: function() {
		    	var target = document.getElementById('main_div');
		        var spinner = new Spinner(opts).spin(target);
		        window.location.href = "?tab=messaging&cat=resources&action=stop_service";
		    },
		    cancel: function() {}
		});
	});
	$("#processing_restart").click(function(){
		$.confirm({
		    text: "Are you sure you want to restart the Messaging tool?",
		    confirmButtonClass: "btn-danger",
		    confirm: function() {
		    	var target = document.getElementById('main_div');
		        var spinner = new Spinner(opts).spin(target);
		        window.location.href = "?tab=messaging&cat=resources&action=restart_service";
		    },
		    cancel: function() {}
		});
	});
	$("#processing_clean").click(function(){
		$.confirm({
		    text: "Are you sure you want to clean the LOGS/DATA directories?",
		    confirmButtonClass: "btn-danger",
		    confirm: function() {
		    	var target = document.getElementById('main_div');
		        var spinner = new Spinner(opts).spin(target);
		        window.location.href = "?tab=messaging&cat=resources&action=clean_dir";
		    },
		    cancel: function() {}
		});
	});
	$(".a_topic").click(function(){
		
		var target = document.getElementById('main_div');
        var spinner = new Spinner(opts).spin(target);
		window.location.href = "?tab=messaging&cat=list_topics&action=topic_details&topics=" + $(this).html();
		
	});
	$(".delete_topic").click(function(){
		var topic_name = $(this).attr('alt');
		$.confirm({
		    text: "Are you sure you want to delete the topic?",
		    confirmButtonClass: "btn-danger",
		    confirm: function() {
		    	var target = document.getElementById('main_div');
		        var spinner = new Spinner(opts).spin(target);
				window.location.href = "?tab=messaging&cat=list_topics&action=topic_delete&topics=" + topic_name;
		    },
		    cancel: function() {
		        // nothing to do
		    }
		});
		
	});
	$("#processing_add_topics").click(function(){
		
		var html_form = "<div class=\"add_new_topic\"><br/><br/><form class=\"form_add_new_topic\">" +
				"<h4>Add new topic</h4><br/><br/>" +
				"<div class=\"input-group\"><span class=\"input-group-addon\">Name</span><input type=\"text\" id=\"name_new_topic\" class=\"form-control\" placeholder=\"e.g. TestTopic\" required /></div>" +
				"<div class=\"input-group\"><span class=\"input-group-addon\">Replation factor</span><input type=\"number\" id=\"replication_new_topic\" class=\"form-control\" placeholder=\"e.g. 1\" name=\"number\" required /></div>" +
				"<div class=\"input-group\"><span class=\"input-group-addon\">Partitions</span><input type=\"number\" id=\"partitions_new_topic\" class=\"form-control\" placeholder=\"e.g. 1\" name=\"number\" required /></div>" +
				"<hr/>" + 
				"<div class=\"btn-group\"><button type=\"submit\" name=\"submit\" id=\"processing_save_topics\" class=\"btn btn-primary\">Save topic</button>" + 
				"<button type=\"button\" id=\"processing_cancel_save_topics\" class=\"btn btn-default\">Cancel</button></form></div>";
		$("#main_div").append(html_form);
		$(".add_new_topic").slideDown(300, function(){
			
			$('.form_add_new_topic').validate({
				submitHandler: function(form) {
					var target = document.getElementById('main_div');
					var spinner = new Spinner(opts).spin(target);
					window.location.href = "?tab=messaging&cat=list_topics&action=topic_save&topics=" + $("#name_new_topic").val() + "&replications=" + $("#replication_new_topic").val() + "&partitions=" + $("#partitions_new_topic").val();
				}
			});
		});
		
		
		
	});
	
	$(document).on('click', '#processing_cancel_save_topics', function(){
		$(".add_new_topic").slideUp(300, function(){ $(this).remove()});
	});
	
	$("#processing_remove_all").click(function(){
		$.confirm({
		    text: "Are you sure you want to delete ALL of the topics?",
		    confirmButtonClass: "btn-danger",
		    confirm: function() {
		    	var target = document.getElementById('main_div');
		        var spinner = new Spinner(opts).spin(target);
		        window.location.href = "?tab=messaging&cat=list_topics&action=remove_all";
		    },
		    cancel: function() {
		    }
		});
		
	});
	
	
	//Nodejs - WebRouter
	$("#webrouter_start").click(function(){
		$.confirm({
		    text: "Are you sure you want to start the WebRouter?",
		    confirmButtonClass: "btn-danger",
		    confirm: function() {
		    	var target = document.getElementById('main_div');
		        var spinner = new Spinner(opts).spin(target);
		        window.location.href = "?tab=webrouter&cat=resources&action=start_service";
		    },
		    cancel: function() {}
		});
	});
	$("#webrouter_stop").click(function(){
		$.confirm({
		    text: "Are you sure you want to stop the WebRouter?",
		    confirmButtonClass: "btn-danger",
		    confirm: function() {
		    	var target = document.getElementById('main_div');
		        var spinner = new Spinner(opts).spin(target);
		        window.location.href = "?tab=webrouter&cat=resources&action=stop_service";
		    },
		    cancel: function() {}
		});
	});
	$("#webrouter_restart").click(function(){
		$.confirm({
		    text: "Are you sure you want to restart the WebRouter?",
		    confirmButtonClass: "btn-danger",
		    confirm: function() {
		    	var target = document.getElementById('main_div');
		        var spinner = new Spinner(opts).spin(target);
		        window.location.href = "?tab=webrouter&cat=resources&action=restart_service";
		    },
		    cancel: function() {}
		});
	});
	
	
	//If confirmation is requested
	$("#delete_confirm").confirm({
	    text: "The selected topic has been queued for deletion.",
	    title: "Successfully",
	    confirm: function(button) {
	    	
	    },
	    cancel: function(button) {
	    	
	    },
	    confirmButton: "OK",
	    cancelButton: "Cancel",
	    post: false,
	    confirmButtonClass: "btn-success"
	}).click();
	$("#save_confirm").confirm({
	    text: "New topic has been saved! In case of not showing, please refresh the page.",
	    title: "Successfully",
	    confirm: function(button) {
	    },
	    cancel: function(button) {
	    },
	    confirmButton: "OK",
	    cancelButton: "Cancel",
	    post: false,
	    confirmButtonClass: "btn-success"
	}).click();
	$("#delete_all_confirm").confirm({
	    text: "All topics have been deleted.",
	    title: "Successfully",
	    confirm: function(button) {
	    	var target = document.getElementById('main_div');
	        var spinner = new Spinner(opts).spin(target);
	    },
	    cancel: function(button) {
	    	var target = document.getElementById('main_div');
	        var spinner = new Spinner(opts).spin(target);
	        window.location.href = "?tab=messaging&cat=list_topics"
	    },
	    confirmButton: "OK",
	    cancelButton: "Cancel",
	    post: false,
	    confirmButtonClass: "btn-success"
	}).click();
	
});