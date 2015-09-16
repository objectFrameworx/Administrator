var rexec = require('remote-exec'), 
			fs = require('fs'),
			exec = require('child_process').exec,
			lazy = require("lazy"),
			async = require("async");

//------------Support functions-----------------------------
Array.prototype.contains = function(k, callback) {
    var self = this;
    var i=0;
    (function check() {
        if (i >= self.length) {
            return callback([ false, -1 ]);
        }
        
        if (self[i][1] === k[0] && self[i][2] === k[1] && self[i][0].length > 0) {
        	return callback([ true, i ]);
        }

        i++;
        check();
    }());
}
//==========================================================
exports.server_stat_output = function(req, processing_hosts, list_args ,callback) {
	
	var output = [];
	var pids = [];
	var etimes = [];
	var fstatus = [];
	var i=0;
	(function loop() {
		if(i < processing_hosts.length) {
			
			async.parallel([
			                function(callback){
			                	list_args[0].contains(['pid',processing_hosts[i]], function(res){
			        				if(res[0]) {
			        					callback(null,['true',list_args[0][res[1]][0]]);
			        				}
			        				else {
			        					callback(null,['false','null']);
			        				}
			        			});
			                },
			                function(callback){
			                	
			                	list_args[0].contains(['etime',processing_hosts[i]], function(res){
			                		if(res[0]) {
			        					callback(null,list_args[0][res[1]][0]);
			        				}
			        				else {
			        					callback(null,'--:--:--');
			        				}
			        			});
			                }
			],function(err,results){
				
				if(err) {
					
					fstatus.push('false');
					pids.push('null');
					etimes.push('--:--:--');
					
				} else {
					fstatus.push(results[0][0]);
					pids.push(results[0][1]);
					if(results[0][0] == 'false') {
						etimes.push('--:--:--');
					} else {
						etimes.push(results[1]);
					}
					
				}
				
				if(i==(processing_hosts.length-1)) {
					output = [fstatus,pids,etimes];
	        	}
				
				i++;
	            loop();
				
			});
		}
		else {
			callback(output,null);
		}
	}());
	
}

exports.server_disk_usage_output = function(req, processing_hosts, list_args ,callback) {
	
	var output = [];
	var size = [];
	var used = [];
	var avail = [];
	var used_p = [];
	var datasize = [];
	var logsize = [];
	var i=0;
	(function loop() {
		if(i < processing_hosts.length) {
			
			async.parallel([
			                function(callback){
			                	
			                	list_args[0].contains(['size',processing_hosts[i]], function(res){
			                		if(res[0]) {
			        					callback(null,list_args[0][res[1]][0]);
			        				}
			        				else {
			        					callback(null,'N/A');
			        				}
			        			});
			                },
			                function(callback){
			                	
			                	list_args[0].contains(['used',processing_hosts[i]], function(res){
			                		if(res[0]) {
			        					callback(null,list_args[0][res[1]][0]);
			        				}
			        				else {
			        					callback(null,'N/A');
			        				}
			        			});
			                },
			                function(callback){
			                	
			                	list_args[0].contains(['available',processing_hosts[i]], function(res){
			                		if(res[0]) {
			        					callback(null,list_args[0][res[1]][0]);
			        				}
			        				else {
			        					callback(null,'N/A');
			        				}
			        			});
			                },
			                function(callback){
			                	
			                	list_args[0].contains(['percused',processing_hosts[i]], function(res){
			                		if(res[0]) {
			        					callback(null,list_args[0][res[1]][0]);
			        				}
			        				else {
			        					callback(null,'N/A');
			        				}
			        			});
			                },
			                function(callback){
			                	
			                	list_args[0].contains(['datasize',processing_hosts[i]], function(res){
			                		if(res[0]) {
			        					callback(null,list_args[0][res[1]][0]);
			        				}
			        				else {
			        					callback(null,'N/A');
			        				}
			        			});
			                },
			                function(callback){
			                	
			                	list_args[0].contains(['logsize',processing_hosts[i]], function(res){
			                		if(res[0]) {
			        					callback(null,list_args[0][res[1]][0]);
			        				}
			        				else {
			        					callback(null,'N/A');
			        				}
			        			});
			                }
			],function(err,results){
				
				if(err) {
					
					size.push('N/A');
					used.push('N/A');
					avail.push('N/A');
					used_p.push('N/A');
					datasize.push('N/A');
					logsize.push('N/A');
					
				} else {
					size.push(results[0]);
					used.push(results[1]);
					avail.push(results[2]);
					used_p.push(results[3]);
					datasize.push(results[4]);
					logsize.push(results[5]);
				}
				
				if(i==(processing_hosts.length-1)) {
					output = [size,used,avail,used_p,datasize,logsize];
	        	}
				
				i++;
	            loop();
				
			});
		}
		else {
			callback(output,null);
		}
	}());
	
}

exports.messaging_rexec = function(req, server_user, server_user_pass, processing_cmds, processing_hosts, task,callback) {
	
	var  status = [];
	var list_args = [];
	var i=0;

	(function loop() {
		if (i < task.length) {
			//Provide connection and command info
			var messaging_connection_options = {
				    port: 22,
				    username: server_user,
				    password: server_user_pass,
				    stdout: fs.createWriteStream('./stdoutput/out_' + task[i] + '.txt'),
				    stderr: fs.createWriteStream('./stdoutput/err_' + task[i] + '.txt')
			};
			
			//Execute remote command
			rexec(processing_hosts, processing_cmds[i], messaging_connection_options, function(err){
				var local_args = [];
				
				if (err) {
					
			        fs.readFile('./stdoutput/err_' + task[i] + '.txt', function(err, data){
			        	if(err) {
			        		status.push([task[i],'false',err.toString()]);
			        	}
			        	else {
			        		status.push([task[i],'false',data.toString()]);
			        	}
			        	if(i==(task.length-1)) {
			        		callback(list_args,status);
			        	}
			        	else {
			        		i++;
				            loop();
			        	}
			        });
			    } 
				
		    	new lazy(fs.createReadStream('./stdoutput/out_' + task[i] + '.txt'))
			        .lines
			        .forEach(function(line){
			        	if(line) {
			        		console.log(line.toString());
			        		if (task[i] == "get_server_stat"){
			        			local_args.push([line.toString().split('=')[0],line.toString().split('=')[1].split('_')[0],line.toString().split('=')[1].split('_')[1]]);
			        		}
			        		else if (task[i] == "total_disk_usage"){
			        			local_args.push([line.toString().split('=')[0],line.toString().split('=')[1].split('_')[0],line.toString().split('=')[1].split('_')[1]]);
			        		}
			        		else {
			        			local_args.push(line.toString());
			        		}
			        	}
			        	else
			        	{
			        		local_args.push(['','','']);
			        		console.log(local_args.length);
			        	}
			        }
		        ).on('pipe', function() {
		        	list_args.push(local_args);
		        	status.push([task[i],'true',null]);
		        	
		        	if(i==(task.length-1)) {
		        		callback(list_args,status);
		        	}
		        	else {
		        		i++;
			            loop();
		        	}
		        	
		        	
		        });
			    	
			    
			    
			});
		}
		else {
			callback(list_args,null);
		}
	}());

}