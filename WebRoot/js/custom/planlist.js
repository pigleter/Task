var loadTime = 0;

function showPlanlistPage(){
	$.post("/task/getSchedulesAll",function(result){
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
	    //url:"/task/getPlanlist",
	    fitColumns:'true',
	    fit:'true',
	    idField:'id',
	    singleSelect:'true',
	    scrollbarSize:0,
	    striped:true,
	    rowStyler:function(index, row){
	    	return 'height:35px;'
	    },
	    toolbar:'#tb_selection'
	});
}