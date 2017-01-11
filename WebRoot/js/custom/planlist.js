var loadTime = 0;

function showPlanlistPage(){
	$.post("/task/getSchedulesAll",function(result){
		$.post("/task/getInterfaces",function(result){
			interfaces = result;
	    });
		schedules = result;
		showPlanlistData();
    });	
}

function showPlanlistData(){
	$('#cbx_schedule').combobox({
		data:schedules,
		value:0,
		valueField:'id',
		textField:'schedule_desc'
	})
	$('#dg_planlist').datagrid({
	    title:"计划列表",
	    url:"/task/getPlanlist",
	    queryParams:{
	    	id: $('#cbx_schedule').combobox('getValue'),
	    	times: $('#cbx_times').combobox('getValue')
	    	},
	    fitColumns:'true',
	    fit:'true',
	    idField:'id',
	    singleSelect:'true',
	    scrollbarSize:0,
	    striped:true,
	    rowStyler:function(index, row){
	    	return 'height:35px;'
	    },
	    toolbar:'#tb_selection',
	    columns:[
	    	[
	        {field:'id',title:'ID',width:'5%'},
	        {field:'schedule_desc',title:'调度描述',width:'20%'},
	        {field:'interface_id',title:'接口描述',width:'20%',
	        	formatter:function(value){
	                for(var i=0; i<interfaces.length; i++){
	                    if (interfaces[i].id == value){
	                    	return interfaces[i].interface_desc;
	                    }
	                }
	                return value;
	            }
	        },
	        {field:'order',title:'顺序',width:'5%'},
	        {field:'next_run',title:'执行时间',width:'15%'}
	        ]
	    	]
	});
}

function queryPlanlist(){
	$('#dg_planlist').datagrid({
	    queryParams:{
	    	id: $('#cbx_schedule').combobox('getValue'),
	    	times: $('#cbx_times').combobox('getValue')
	    	}
	});
	$('#dg_planlist').datagrid('reload');
}