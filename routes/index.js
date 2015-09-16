

var url = require('url');
var rexec = require('remote-exec');
var messaging = require('./messaging');
var webrouter = require('./webrouter');
var fs = require('fs');
var lazy = require("lazy");
var Q = require("q");

//------------Support functions-----------------------------

//==========================================================




//--------- Tabs rendering declaration ----------------------

//Home - Administration
function render_home(req, res){
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	
	
	res.render('administration', { title: 'HOOP Resources Administration', tab: query.tab});
}

//Cluster - Zookeeper/Exhibitor
function render_cluster(req, res){
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	var config = req.app.get('configuration');
	
	res.render('cluster', { title: 'HOOP Resources Administration', tab: query.tab, redirect_url: config.zookeeper["zookeeper-exhibitor"]});
}

//Messaging - Kafka
function get_server_stat(req, callback){
	
	var config = req.app.get('configuration');
	var initial_cmd = ['IPs=`hostname -I | awk \'{print $2}\'` && IDp=`ps aux | awk \'/kafka.[K]afka/ {print $2}\'` && echo "$IDp" | sed -e "s/$/=pid_$IPs/" && ps aux | grep "kafka.[K]afka" | wc -l | sed -e "s/$/=numproc_$IPs/" && ps -eo pid,etime | grep "$IDp" | awk \'{print $2}\' | sed -e "s/$/=etime_$IPs/" '];

    var returnObject = [];
    
	messaging.messaging_rexec(req, config.kafka["kafka-user"], config.kafka["kafka-password"], initial_cmd, config.kafka["kafka-server"], ["get_server_stat"], function(list_args, status){
		
		if(status[0][1] == 'false')
		{
			callback(['false', 'null', '--:--:--'],status);
		}
		else {
			messaging.server_stat_output(req,config.kafka["kafka-internal"],list_args, function(obj,err){
				
				if(err){
					callback(['false', 'null', '--:--:--'],status);
				} else {
					callback(obj,status);
				}
			});
		}
		
	});
} 
function set_server_state(req, callback){
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	var config = req.app.get('configuration');
	var cmds = [];
	var tasks = [];
    var returnObject = [];
    
    if(query.action=='stop_service') {
    	cmds.push('IDp=`ps aux | awk \'/kafka.[K]afka/ {print $2}\'` && kill -9 "$IDp"');
    	tasks.push('stop_service');
    }
    if (query.action=='start_service') {
    	cmds.push('IDp=`ps aux | awk \'/kafka.[K]afka/ {print $2}\'` && if [ -z "$IDp" ] ; then echo `' + config.kafka["kafka-base"] + '/bin/kafka-server-start.sh ' + config.kafka["kafka-conf"] + '/server.properties 1>/dev/null &` ; else echo "Instance started!" ; fi');
    	tasks.push('start_service');
    }
    if (query.action=='restart_service') {
    	cmds.push('IDp=`ps aux | awk \'/kafka.[K]afka/ {print $2}\'` && echo "$IDp" && if [ ! -z "$IDp" ] ; then kill -9 "$IDp" ; else echo "Instance not started" ; fi && IDp=`ps aux | awk \'/kafka.[K]afka/ {print $2}\'` && if [ -z "$IDp" ] ; then echo `' + config.kafka["kafka-base"] + '/bin/kafka-server-start.sh ' + config.kafka["kafka-conf"] + '/server.properties 1>/dev/null &` ; else echo "Instance started!" ; fi')
    	tasks.push('restart_service');
    }
    if (query.action=='clean_dir') {
    	cmds.push('IDp=`ps aux | awk \'/kafka.[K]afka/ {print $2}\'` && if [ ! -z "$IDp" ] ; then kill -9 "$IDp" ; else echo "Instance not started" ; fi && rm -rf ' + config.kafka["kafka-base"] + '/logs/* && rm -rf ' + config.kafka["kafka-data"] + '/* ');
    	tasks.push('clean_dir');
    }      
    
	messaging.messaging_rexec(req, config.kafka["kafka-user"], config.kafka["kafka-password"], cmds, config.kafka["kafka-server"], tasks, function(list_args, status){
		
		console.log(status);
		callback(status);
		
	});
}

function render_messaging(req, res, list_params, exec_status){
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	var config = req.app.get('configuration');
   
	
	var process_started = list_params[0];
	list_params.push(config.zookeeper["zookeeper-server"]);
	list_params.push(config.kafka["kafka-server"]);
    
	if(query.cat=='list_topics')
	{
		var cmds = [];
		var tasks = [];
		
		//Topic details
		if(query.action=='topic_details' && query.topics) {
			cmds.push(config.kafka["kafka-base"] + '/bin/kafka-topics.sh --describe --zookeeper ' + config.zookeeper["zookeeper-server"] + ' --topic ' + query.topics);
			tasks.push('topic_details');
		}
		
		//Topic remove
		if(query.action=='topic_delete' && query.topics) {
			cmds.push(config.kafka["kafka-base"] + '/bin/kafka-topics.sh --delete --zookeeper ' + config.zookeeper["zookeeper-server"] + ' --topic ' + query.topics);
			tasks.push('topic_delete');
		}
		
		//Topic add
		if(query.action=='topic_save' && query.topics && query.replications && query.partitions) {
			cmds.push(config.kafka["kafka-base"] + '/bin/kafka-topics.sh --create --zookeeper ' + config.zookeeper["zookeeper-server"] + ' --topic ' + query.topics + ' --partitions ' + query.partitions + ' --replication-factor ' + query.replications);
			tasks.push('topic_save');
		}
		
		cmds.push(config.kafka["kafka-base"] + '/bin/kafka-topics.sh --list --zookeeper ' + config.zookeeper["zookeeper-server"]);
		tasks.push('list_topics');
		
		console.log(cmds)
		messaging.messaging_rexec(req, config.kafka["kafka-user"], config.kafka["kafka-password"], cmds, [ config.kafka["kafka-server"][0] ], tasks, function(list_args, cstatus){
			console.log(list_params);
			res.render('messaging', { title: 'HOOP Resources Administration', tab: query.tab, category: query.cat, action: query.action, topics: query.topics, initial_params: list_params, list_arguments: list_args, list_tasks: tasks, status: exec_status.concat(cstatus) });
		});
	}
	else {
		var cmds = [];
		var tasks = [];
		
		cmds.push('IPs=`hostname -I | awk \'{print $2}\'` && TU=`df -h --total | head -n 2 | tail -n 1` && echo $TU | awk \'{print $2}\' | sed -e "s/$/=size_$IPs/" && echo $TU | awk \'{print $3}\' | sed -e "s/$/=used_$IPs/" && echo $TU | awk \'{print $4}\' | sed -e "s/$/=available_$IPs/" && echo $TU | awk \'{print $5}\' | sed -e "s/$/=percused_$IPs/" && du -sh ' + config.kafka["kafka-data"] + ' | awk \'{print $1}\' | sed -e "s/$/=datasize_$IPs/" && du -sh ' + config.kafka["kafka-logs"] + ' | awk \'{print $1}\' | sed -e "s/$/=logsize_$IPs/"');
		tasks.push('total_disk_usage');
		
		messaging.messaging_rexec(req, config.kafka["kafka-user"], config.kafka["kafka-password"], cmds, config.kafka["kafka-server"], tasks, function(list_args, cstatus){
			messaging.server_disk_usage_output(req,config.kafka["kafka-internal"],list_args, function(obj,err){
				res.render('messaging', { title: 'HOOP Resources Administration', tab: query.tab, category: query.cat, action: query.action, topics: query.topics, initial_params: list_params, list_arguments: obj, list_tasks: tasks, status: exec_status.concat(cstatus), data_dir: config.kafka["kafka-data"], logs_dir: config.kafka["kafka-logs"] });
			});
		});
	}
	/*else {
		console.log(exec_status);
		res.render('messaging', { title: 'HOOP Resources Administration', tab: query.tab, category: query.cat, action: query.action, initial_params: list_params, status: exec_status });
	}*/
}

//Processing - Storm
function render_processing(req, res){
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	var config = req.app.get('configuration');
	
	res.render('processing', { title: 'HOOP Resources Administration', tab: query.tab, redirect_url: config.storm["storm-ui"]});
}

//Database - Couchbase
function render_database(req, res){
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	var config = req.app.get('configuration');
	
	res.render('database', { title: 'HOOP Resources Administration', tab: query.tab, redirect_url: config.couchbase["couchbase-ui"]});
}

//Nodejs - WebRouter
function get_router_stat(req, callback){
	
	var config = req.app.get('configuration');
	var initial_cmd = ['IPs=`hostname -I | awk \'{print $2}\'` && IDp=`ps aux | awk \'/Web[R]outer/ {print $2}\'` && echo "$IDp" | sed -e "s/$/=pid_$IPs/" && ps aux | grep "Web[R]outer" | wc -l | sed -e "s/$/=numproc_$IPs/" && ps -eo pid,etime | grep "$IDp" | awk \'{print $2}\' | sed -e "s/$/=etime_$IPs/" '];

    var returnObject = [];
    
    webrouter.router_rexec(req, config.webrouter["webrouter-user"], config.webrouter["webrouter-password"], initial_cmd, config.webrouter["webrouter-server"], ["get_router_stat"], function(list_args, status){
		
		if(status[0][1] == 'false')
		{
			callback(['false', 'null', '--:--:--'],status);
		}
		else {
			webrouter.router_stat_output(req,config.webrouter["webrouter-internal"],list_args, function(obj,err){
				
				if(err){
					callback(['false', 'null', '--:--:--'],status);
				} else {
					callback(obj,status);
				}
			});
		}
		
	});
} 
function set_router_state(req, callback){
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	var config = req.app.get('configuration');
	var cmds = [];
	var tasks = [];
    var returnObject = [];
    
    if(query.action=='stop_service') {
    	cmds.push('IDp=`ps aux | awk \'/Web[R]outer/ {print $2}\'` && if [ ! -z "$IDp" ] ; then echo `forever stop ' + config.webrouter["webrouter-base"] + '/' + config.webrouter["webrouter-app-file"] + '` ; else echo "Instance started!" ; fi');
    	//cmds.push('forever stop ' + config.webrouter["webrouter-base"] + '/' + config.webrouter["webrouter-app-file"]);
    	tasks.push('stop_router');
    }
    if (query.action=='start_service') {
    	//cmds.push('IDp=`ps aux | awk \'/Web[R]outer/ {print $2}\'` && if [ -z "$IDp" ] ; then echo "Empty!" ; else echo "$IDp" ; fi');
    	//cmds.push('IDp=`ps aux | awk \'/Web[R]outer/ {print $2}\'` && if [ -z "$IDp" ] ; then echo `forever start ' + config.webrouter["webrouter-base"] + '/' + config.webrouter["webrouter-app-file"] + '` ; fi');
    	cmds.push('IDp=`ps aux | awk \'/Web[R]outer/ {print $2}\'` && if [ ! -z "$IDp" ] ; then echo `forever stop ' + config.webrouter["webrouter-base"] + '/' + config.webrouter["webrouter-app-file"] + '` && echo `forever start ' + config.webrouter["webrouter-base"] + '/' + config.webrouter["webrouter-app-file"] + '` ; else echo `forever start ' + config.webrouter["webrouter-base"] + '/' + config.webrouter["webrouter-app-file"] + '` ; fi');
    	tasks.push('start_router');
    }
    if (query.action=='restart_service') {
    	cmds.push('IDp=`ps aux | awk \'/Web[R]outer/ {print $2}\'` && if [ ! -z "$IDp" ] ; then echo `forever stop ' + config.webrouter["webrouter-base"] + '/' + config.webrouter["webrouter-app-file"] + '` && echo `forever start ' + config.webrouter["webrouter-base"] + '/' + config.webrouter["webrouter-app-file"] + '` ; else echo `forever start ' + config.webrouter["webrouter-base"] + '/' + config.webrouter["webrouter-app-file"] + '` ; fi');
    	//cmds.push('forever restart ' + config.webrouter["webrouter-base"] + '/' + config.webrouter["webrouter-app-file"]);
    	tasks.push('restart_router');
    }
    
    webrouter.router_rexec(req, config.webrouter["webrouter-user"], config.webrouter["webrouter-password"], cmds, config.webrouter["webrouter-server"], tasks, function(list_args, status){
		
		console.log(status);
		callback(status);
		
	});
}
function render_webrouter(req, res, list_params, exec_status){
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	var config = req.app.get('configuration');
  
	list_params.push(config.webrouter["webrouter-server"]);
	
	var cmds = [];
	var tasks = [];
	
	cmds.push('IPs=`hostname -I | awk \'{print $2}\'` && TU=`df -h --total | head -n 2 | tail -n 1` && echo $TU | awk \'{print $2}\' | sed -e "s/$/=size_$IPs/" && echo $TU | awk \'{print $3}\' | sed -e "s/$/=used_$IPs/" && echo $TU | awk \'{print $4}\' | sed -e "s/$/=available_$IPs/" && echo $TU | awk \'{print $5}\' | sed -e "s/$/=percused_$IPs/" && du -sh ' + config.webrouter["webrouter-base"] + ' | awk \'{print $1}\' | sed -e "s/$/=datasize_$IPs/"');
	tasks.push('router_disk_usage');
	
	webrouter.router_rexec(req, config.webrouter["webrouter-user"], config.webrouter["webrouter-password"], cmds, config.webrouter["webrouter-server"], tasks, function(list_args, cstatus){
		webrouter.server_disk_usage_output(req,config.webrouter["webrouter-internal"],list_args, function(obj,err){
			res.render('webrouter', { title: 'HOOP Resources Administration', tab: query.tab, category: query.cat, action: query.action, topics: query.topics, initial_params: list_params, list_arguments: obj, list_tasks: tasks, status: exec_status.concat(cstatus), data_dir: config.webrouter["webrouter-base"]});
		});
	});
}

//============================================================





/*
 * GET home page.
 */
exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};




/*
 * GET admin page.
 */
exports.administration = function(req, res){
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

	switch(query.tab) {
		case 'home':
			render_home(req,res);
			break;
		case 'cluster':
			{
				render_cluster(req,res);
			}
			break;
		case 'messaging':
			{ 
				if(query.action=='stop_service' || query.action=='start_service' || query.action=='restart_service' || query.action=='clean_dir'){
					set_server_state(req, function(status){
						get_router_stat(req, function (list_params,sub_status){
							render_messaging(req,res,list_params,status.concat(sub_status));
					    });
					});
				}
				else {
					get_server_stat(req, function (list_params,status){
						render_messaging(req,res,list_params,status);
				    });
				}
			}
			break;
		case 'processing':
			{
				render_processing(req,res);
			}
			break;
		case 'database':
			{
				render_database(req,res);
			}
			break;
		case 'webrouter':
			{ 
				if(query.action=='stop_service' || query.action=='start_service' || query.action=='restart_service' || query.action=='clean_dir'){
					set_router_state(req, function(status){
						get_router_stat(req, function (list_params,sub_status){
							render_webrouter(req,res,list_params,status.concat(sub_status));
					    });
					});
				}
				else {
					get_router_stat(req, function (list_params,status){
						render_webrouter(req,res,list_params,status);
				    });
				}
			}
			break;
		case 'load_balancer':
			render_home(req,res);
			break;
		default:
			render_home(req,res);
	}
};




