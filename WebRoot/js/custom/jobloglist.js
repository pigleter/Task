function showJobLoglistPage(){	
	var date = new Date();
	var dateSeperator = "-";
    var timeSeperator = ":";
    var strMonth = date.getMonth() + 1;
    var strDate = date.getDate();
    if (strMonth >= 1 && strMonth <= 9) {
    	strMonth = '0' + strMonth;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = '0' + strDate;
    }
    var dateFrom = date.getFullYear() + dateSeperator + strMonth + dateSeperator + strDate + ' ' + '00' + timeSeperator + '00' + timeSeperator + '00';
    var dateTo = date.getFullYear() + dateSeperator + strMonth + dateSeperator + strDate + ' ' + '23' + timeSeperator + '59' + timeSeperator + '59';
    
	$('#dt_from').datetimebox({
	    value: dateFrom
	});	
	$('#dt_to').datetimebox({
	    value: dateTo
	});
	
	$('#tt').treegrid({
		fitColumns: true,
		fit: true,
		toolbar:'#tb_selection',
	    idField:'ID',
	    treeField:'treeField',
	    columns:[[
	    	{title:'接口名称',field:'treeField',width:'30%'},
	    	{title:'日志消息',field:'msg',width:'70%'}
	    ]],
	    onLoadSuccess: function(){
	    	$('#tt').treegrid('collapseAll');
	    },
	    onSelect: function(row){
	    	if(row.state == 'closed'){
	    		$('#tt').treegrid('expand', row.ID);
	    	}
	    	else{
	    		$('#tt').treegrid('collapse', row.ID);
	    	}
	    	
	    }
	});
}

function setTreeData(logs){
	var lastUniqueJobID = '';
	var treeDatasLv1 = new Array();
	var treeDataLv1;
	var treeDatasLv2 = null;
	var treeDataLv2;
	for(var i = 0; i < logs.length; i++){
		
		if(logs[i].UniqueJobID != lastUniqueJobID){
			treeDatasLv2 = new Array();
			treeDataLv1 = {};
			treeDataLv1.ID = logs[i].UniqueJobID;
			treeDataLv1.treeField = logs[i].InterfaceName;
			treeDataLv1.iconCls = "icon-ok";
			treeDataLv1.children = treeDatasLv2;
			
			treeDatasLv1.push(treeDataLv1);
			
			lastUniqueJobID = logs[i].UniqueJobID;
		}
		
		treeDataLv2 = {};
		treeDataLv2.ID = logs[i].UniqueJobID;
		treeDataLv2.treeField = logs[i].CreateTime;
		treeDataLv2.msg = logs[i].MSG;
		if(logs[i].LogLevel == 'ERROR'){
			treeDataLv1.iconCls = "icon-no";
		}
		
		treeDatasLv2.push(treeDataLv2);
		
	}
	showJobLogReport(treeDatasLv1);
}

function getJobLogsData(){
	$.post("getJobLogsByDateTime",{dateFrom:$('#dt_from').datetimebox('getValue'), dateTo:$('#dt_to').datetimebox('getValue')}, function(result){
		setTreeData(result);
    });
}

function showJobLogReport(treeData){
	$('#tt').treegrid({
		data: treeData,
	});
}