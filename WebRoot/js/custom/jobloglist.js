//var gbPageList = [50];
var gbPageSize = 50;
var gbPageNumber = 1;

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
	
	$('#dg_joblog').treegrid({
		fitColumns: true,
		fit: true,
		pagination: true,
		data: {},
	    idField:'ID',
	    treeField:'createtime',
	    toolbar:'#tb_selection',
	    columns:[[
	    	{title:'开始时间',field:'createtime',width:'20%'},
	    	{title:'日志消息',field:'msg',width:'80%'}
	    ]],
	    onLoadSuccess: function(){
	    	$('#dg_joblog').treegrid('unselectAll');
	    },
	    onSelect: function(row){
	    	if(row.state == 'closed'){
	    		$('#dg_joblog').treegrid('expand', row.ID);
	    	}
	    	else{
	    		$('#dg_joblog').treegrid('collapse', row.ID);
	    	}
	    	
	    }
	});
	
	initialPager();
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
			treeDataLv1.createtime = logs[i].CreateTime;
			treeDataLv1.msg = logs[i].InterfaceName + ' - ' + logs[i].InterfaceDesc;
			treeDataLv1.totalRows = logs[i].totalRows;
			if(logs[i].JobEnd == 1){
				treeDataLv1.iconCls = "icon-ok";
			}
			else{
				treeDataLv1.iconCls = "icon-reload";
			}			
			treeDataLv1.children = treeDatasLv2;
			treeDataLv1.state = 'closed';
			
			treeDatasLv1.push(treeDataLv1);
			
			lastUniqueJobID = logs[i].UniqueJobID;
		}
		
		treeDataLv2 = {};
		treeDataLv2.ID = logs[i].UniqueJobID;
		treeDataLv2.createtime = logs[i].CreateTime;
		treeDataLv2.msg = logs[i].MSG;
		if(logs[i].LogLevel == 'ERROR'){
			treeDataLv1.iconCls = "icon-no";
		}
		
		treeDatasLv2.push(treeDataLv2);
		
	}
	showJobLogReport(treeDatasLv1);
}

function getJobLogsData(){
	initialPager();
	$('#dg_joblog').treegrid('loading');
	var jobStatus = $('#cbx_status').combobox('getValue');
	if(gbPageNumber == 0){
		gbPageNumber = 1;
	}
	$.post("getJobLogsByDateTime",{dateFrom:$('#dt_from').datetimebox('getValue'), dateTo:$('#dt_to').datetimebox('getValue'), pageNum:gbPageNumber, pageSize:gbPageSize, jobStatus:jobStatus}, function(result){
		if(result.length > 0){
			setTreeData(result);
		}
		else{
			$('#dg_joblog').treegrid({
				data: {}
			});
			initialPager();
			$('#dg_joblog').treegrid('loaded');
		}
    });
}

function showJobLogReport(treeData){

	
	var totalRows = treeData[0].totalRows;
	
	$('#dg_joblog').treegrid({
		data: treeData
	});
	
	var pager = $('#dg_joblog').treegrid('getPager');
	var pagerOptions = $(pager).pagination('options');
    $(pager).pagination({ 
        pageSize: gbPageSize,
        pageNumber: gbPageNumber,
        //pageList: gbPageList,
        showPageList: false,
        showRefresh: false,
        beforePageText: '第  ',
        afterPageText: ' 页    共   {pages} 页', 
        displayMsg: '当前显示 {from} - {to} 条记录 / 共 {total} 条记录',
        total: totalRows,
        onSelectPage:function(pageNumber, pageSize){
        	$('#dg_joblog').treegrid('loading');
        	gbPageSize = pageSize;
        	gbPageNumber = pageNumber;
        	var jobStatus = $('#cbx_status').combobox('getValue');
        	$.post("getJobLogsByDateTime",{dateFrom:$('#dt_from').datetimebox('getValue'), dateTo:$('#dt_to').datetimebox('getValue'), pageNum:pageNumber, pageSize:pageSize, jobStatus:jobStatus}, function(result){
        		if(result.length > 0){
        			setTreeData(result);
        		}
        		else{
        			$('#dg_joblog').treegrid({
        				data: {}
        			});
        			initialPager();
        			$('#dg_joblog').treegrid('loaded');
        		}
            });
    	}
    });	
}

function initialPager(){
	gbPageSize = 50;
	gbPageNumber = 1;
	var pager = $('#dg_joblog').treegrid('getPager');
    $(pager).pagination({ 
        pageSize: gbPageSize,
        pageNumber: gbPageNumber,
        //pageList: [50],
        showPageList: false,
        showRefresh: false,
        beforePageText: '第  ',
        afterPageText: ' 页    共   {pages} 页', 
        displayMsg: '当前显示 0 条记录 / 共  0 条记录',
        total: 0,
        onSelectPage:function(pageNumber, pageSize){
        	gbPageSize = pageSize;
        	gbPageNumber = pageNumber
        }
    });
}