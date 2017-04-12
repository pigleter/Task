var loadTime = 0;

function showPlanlistPage(){
	$.post("getActiveSchedules",function(result){
		$.post("getActiveInterfaces",function(result){
			interfaces = result;
			showPlanlistData();
	    });
		schedules = result;		
    });	
}

function showPlanlistData(){
	$('#cbx_interface').combobox({
		data:interfaces,
		value:0,
		valueField:'id',
		textField:'interface_desc'
	})
	$('#dg_planlist').datagrid({
	    title:"计划列表",
	    url:"getPlanlist",
	    queryParams:{
	    	id: $('#cbx_interface').combobox('getValue'),
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
	        //{field:'id',title:'ID',width:'5%'},
	    	{field:'order',title:'执行顺序',width:'5%'},
	    	{field:'interface_id',title:'接口名称',width:'20%',
	        	formatter:function(value){
	                for(var i=0; i<interfaces.length; i++){
	                    if (interfaces[i].id == value){
	                    	return interfaces[i].interface_desc;
	                    }
	                }
	                return value;
	            }
	        },
	        {field:'schedule_desc',title:'调度名称',width:'20%'},	        
	        {field:'next_run',title:'执行时间',width:'15%'}
	        ]
	    	]
	});
}

function queryPlanlist(){
	$('#dg_planlist').datagrid({
	    queryParams:{
	    	id: $('#cbx_interface').combobox('getValue'),
	    	times: $('#cbx_times').combobox('getValue')
	    	}
	});
	$('#dg_planlist').datagrid('reload');
}