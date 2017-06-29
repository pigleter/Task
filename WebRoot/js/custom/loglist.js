var logs;

function showLoglistPage(){
	$.post("getLogs",function(result){
		logs = result;
		setTreeData(result);
    });
	
	$('#tt').treegrid({
	    data:[{"ID":"1", "name":"201706281234", "children":[{"ID":"1","name":"时间1", "MSG":"aaa"},{"ID":"1","name":"时间2", "MSG":"bbb"},{"ID":"1","name":"时间3", "MSG":"ccc"}]}],
	    idField:'ID',
	    treeField:'name',
	    columns:[[
	    	{title:'Name',field:'name',width:180},
	    	{title:'MSG',field:'MSG',width:180}
	    ]]
	});
}

function setTreeData(logs){
	
}