var cbs;
var rbs;
var cbxs;	

var cbs_M;
var cb_M_All;
var cbs_W;
var cb_W_All;
var cbs_D;
var cb_D_All;
var cb_D_Last;

var cbx_HH_spec;
var cbx_HH_range_from;
var cbx_HH_range_to;
var cbx_HH_freq;
var rb_HH;

var cbx_MM_spec;
var cbx_MM_range_from;
var cbx_MM_range_to;
var cbx_MM_freq;
var rb_MM;

var cbx_SS_spec;
var cbx_SS_range_from;
var cbx_SS_range_to;
var cbx_SS_freq;
var rb_SS;

var msg;


function showSchedulePage(){
	$.post("/task/getInterfaces",function(result){
		interfaces = result;
		showScheduleData();
    	initController();
    });
}

function showScheduleData(){
	$('#dg_schedule').datagrid({
		title:"调度列表",
	    url:"/task/getSchedules",
	    fitColumns:'true',
	    fit:'true',
	    idField:'id',
	    singleSelect:'true',
	    scrollbarSize:0,
	    striped:true,
	    rowStyler:function(index, row){
	    	return 'height:35px;'
	    },
        toolbar:[{
			iconCls:'icon-add',
			text:'新增',
			handler:function(){
				addSchedule();
				}
		},
		{
			iconCls:'icon-help',
			text:'帮助',
			handler:function(){
				}
		}],
	    columns:[
	    	[
	    		{field:'status',title:'启停',width:'8%',
		        	formatter:function(value){
		        		var check;
		        		if(value == 1){
		        			check = true;
		        		}
		        		else{
		        			check = false;
		        		}
		        		var btn='<input class="easyui-switchbutton" data-options="checked:'+check+'">';
					return btn;
					}
		        },
		        {field:'id',title:'ID',width:'5%'},
		        {field:'schedule_desc',title:'调度描述',width:'20%',
		        	editor:{
		        		type:'validatebox',
		        		options:{
		        			required:true
		        		}
		        	}
		        },
		        {field:'interface_id',title:'接口描述',width:'20%',
		        	formatter:function(value){
		                for(var i=0; i<interfaces.length; i++){
		                    if (interfaces[i].id == value){
		                    	return interfaces[i].interface_desc;
		                    }
		                }
		                return value;
		            },
		        	editor:{
		        		type:'combobox',
		        		options:{
	                		valueField:'id',
	                		textField:'interface_desc',
	                		data:interfaces,
	                		editable:false, 
	                		required:true
	                	}
		        	}
		        },
		        {field:'M',title:'月',width:'5%'},
		        {field:'W',title:'周',width:'5%'},
		        {field:'D',title:'日',width:'5%'},
		        {field:'HH',title:'时',width:'5%'},
		        {field:'MM',title:'分',width:'5%'},
		        {field:'SS',title:'秒',width:'5%'},
		        {field:'opt',title:'操作',
		        	formatter:function(value,row,index){
		        		var btn='<a class="easyui-linkbutton_edit" onclick="editSchedule(this);">编辑</a>  '
						+'<a class="easyui-linkbutton_save" onclick="saveSchedule(this);" style="display:none">保存</a>  '
						+'<a class="easyui-linkbutton_undo" onclick="undoSchedule(this);" style="display:none">撤销</a>  '
						+'<a class="easyui-linkbutton_dele" onclick="deleSchedule(this);">删除</a>  '
						+'<a class="easyui-linkbutton_more" onclick="moreSchedule(this);">执行计划</a>'
					return btn;
					}
		        }
	        ]
	    	],
	    onLoadSuccess:function(){
	    	renderButton();
	    },
	    onSelect:function(index){
	    	$('#dg_schedule').datagrid('clearSelections');
	    },
	    onEndEdit:function(index){
	    	disableButton(index, false);
	    }
	});
}

function disableButton(rowIndex, isDisable){
	var btnSwitch = $($($($('#dg_schedule').parents())[0]).find('.easyui-switchbutton'))[rowIndex];
	var btnMore = $($($($('#dg_schedule').parents())[0]).find('.easyui-linkbutton_more'))[rowIndex];
	if(isDisable){
		$(btnSwitch).switchbutton('disable');
		$(btnMore).linkbutton('disable');
	}
	else{
		$(btnSwitch).switchbutton('enable');
		$(btnMore).linkbutton('enable');
	}
	
}

function editSchedule(obj){
	var rowIndex = getParentRowIndex(obj);
	var btn = $($($($('#dg_schedule').parents())[0]).find('.easyui-switchbutton'))[rowIndex];
	if ($(btn).switchbutton('options').checked){
		showMsg("请先停止调度！");
		return;
	}
	$('#dg_schedule').datagrid('beginEdit', rowIndex);
	showButton(obj,'edit');
	renderButton();
	disableButton(rowIndex, true);
}

function undoSchedule(obj){
	$('#dd').dialog({
	    width:250,
	    height:150,
	    modal:true,
	    title:'撤销确认',
	    content:'确定放弃更改？',
	    buttons:[
	    	{
	    		text:'确定',
				iconCls:'icon-ok',
				handler:function(){
					var rowIndex = getParentRowIndex(obj)
					$('#dg_schedule').datagrid('cancelEdit', rowIndex);
					var btn = $($($($('#dg_schedule').parents())[0]).find('.easyui-switchbutton'))[rowIndex];
					showButton(btn,'undo');
					renderButton();
					$('#dd').dialog('close');
				}
	    	},
	    	{
				text:'取消',
				iconCls:'icon-cancel',
				handler:function(){
					$('#dd').dialog('close');
				}
	    	}]
	});
}

function deleSchedule(obj){
	var rowIndex = getParentRowIndex(obj);
	var btn = $($($($('#dg_schedule').parents())[0]).find('.easyui-switchbutton'))[rowIndex];
	if ($(btn).switchbutton('options').checked){
		showMsg("请先停止调度！");
		return;
	}
	$('#dd').dialog({
	    width:250,
	    height:150,
	    modal:true,
	    title:'删除确认',
	    content:'确定删除？',
	    buttons:[
	    	{
	    		text:'确定',
				iconCls:'icon-ok',
				handler:function(){
					var rowIndex = getParentRowIndex(obj)
					var row = $('#dg_schedule').datagrid('getData').rows[rowIndex];
					$('#dd').dialog('close');
					if(row.id != 0){
						$.post("/task/deleteSchedule",{"schd.id":row.id},function(data){
							if(data.result){
								showMsg(data.msg);
								$('#dg_schedule').datagrid('deleteRow', rowIndex);
							}
							else{
								showMsg(data.msg);
							}
							});
				    }
					else{
						$('#dg_schedule').datagrid('deleteRow', rowIndex);
					}
				}
	    	},
	    	{
				text:'取消',
				iconCls:'icon-cancel',
				handler:function(){
					$('#dd').dialog('close');
				}
	    	}]
	});
}


function addSchedule(obj){
	$('#dg_schedule').datagrid('appendRow',{
		id:"0",
		status:"-1"
	});
	var rowIndex = $('#dg_schedule').datagrid('getRows').length-1;
	var btn = $($($($('#dg_schedule').parents())[0]).find('.easyui-linkbutton_edit'))[rowIndex];
	$('#dg_schedule').datagrid('beginEdit', rowIndex);
	showButton(btn,'add');
	renderButton();
	disableButton(rowIndex, true);
}

function saveSchedule(obj){
	var rowIndex = getParentRowIndex(obj)
	$('#dg_schedule').datagrid('endEdit', rowIndex);
	var row = $('#dg_schedule').datagrid('getData').rows[rowIndex];
	if ($('#dg_schedule').datagrid('validateRow', rowIndex)){
		if(row.id==0){
			$.post("/task/saveSchedule",{"schd.schedule_desc":row.schedule_desc,"schd.interface_id":row.interface_id,"event_id":0,"schd.status":-1},function(data){
				if(data.result){
					$('#dg_schedule').datagrid('updateRow',{
						index: rowIndex,
						row: {
							id: data.id
						}
					});
					showMsg(data.msg);
				}
				else{
					showMsg(data.msg);
					editSchedule(obj);
				}
				showButton(obj,'save');
				renderButton();
		    });
		}
		else{
			$('#dg_schedule').datagrid('updateRow',rowIndex);
			$.post("/task/updateSchedule",{"schd.id":row.id,"schd.schedule_desc":row.schedule_desc,"schd.interface_id":row.interface_id},function(data){
				if(data.result){
					showMsg(data.msg);
				}
				else{
					showMsg(data.msg);
					editSchedule(obj);
				}
				showButton(obj,'save');
				renderButton();
		    });
		}
	}	
}

function switchSchedule(obj, checked){
	var rowIndex = getParentRowIndex(obj);
	var row = $('#dg_schedule').datagrid('getData').rows[rowIndex];
	if(row.status == -1){
		$.messager.alert({
			title:"系统提示",
			msg:"请先设置调度计划！",
			width:250,
		    height:150,
		    fn:function(){
		    	$(obj).switchbutton({checked:false});
				showButton(obj,'switch');
				renderButton();
				}
		});
		return;
	}
	if(checked){
		row.status = 1;
	}
	else{
		row.status = 0;
	}
	$.post("/task/switchSchedule",{"schd.id":row.id,"schd.status":row.status},function(data){
		if(data.result){
			showMsg(data.msg);
		}
		else{
			showMsg(data.msg);
			setTimeout(function(){
				$(obj).switchbutton({checked:!checked});
				showButton(obj,'switch');
				renderButton();
				},
				500);			
		}
		showButton(obj,'switch');
//		renderButton();
    });
}

function checkAction(obj, objType){
	var checkBtn = $(obj)[0];
	
	switch(objType)
	{
	case 'M':
		if(checkBtn.value == "*"){
			for(var i=0; i<cbs_M.length; i++){
				cbs_M[i].checked = cb_M_All.checked;
			}
		}
		else{
			if(checkBtn.checked){
				for(var i=0; i<cbs_M.length; i++){
					if(!cbs_M[i].checked){
						break;
					}
					if(i == 11){
						cb_M_All.checked = true;
					}
				}
			}
			else{
				cb_M_All.checked = false;
			}
		}
		break;
	case 'W':
		if(checkBtn.value == "*"){
			for(var i=0; i<cbs_W.length; i++){
				cbs_W[i].checked = cb_W_All.checked;
			}
		}
		else{
			if(checkBtn.checked){
				for(var i=0; i<cbs_W.length; i++){
					if(!cbs_W[i].checked){
						break;
					}
					if(i == 6){
						cb_W_All.checked = true;
					}
				}
			}
			else{
				cb_W_All.checked = false;
			}
		}
		break;
	case 'D':
		if(checkBtn.value == "*"){
			for(var i=0; i<cbs_D.length; i++){
				cbs_D[i].checked = cb_D_All.checked;
			}
			cb_D_Last.checked = false;
		}
		else if(checkBtn.value == "l"){
			if(checkBtn.checked){
				for(var i=0; i<cbs_D.length; i++){
					cbs_D[i].checked = false;
				}
				cb_D_All.checked = false;
			}
		}
		else{
			if(checkBtn.checked){
				for(var i=0; i<cbs_D.length; i++){
					if(!cbs_D[i].checked){
						break;
					}
					if(i == 30){
						cb_D_All.checked = true;
					}
				}
				cb_D_Last.checked = false;
			}
			else{
				cb_D_All.checked = false;
			}
		}
		break;
	case 'HH':
		if(checkBtn.value == "spec"){
			cbx_HH_spec.combobox('enable');
			cbx_HH_range_from.combobox('disable');
			cbx_HH_range_to.combobox('disable');
			cbx_HH_freq.combobox('disable');
		}
		else if(checkBtn.value == "range"){
			cbx_HH_spec.combobox('disable');
			cbx_HH_range_from.combobox('enable');
			cbx_HH_range_to.combobox('enable');
			cbx_HH_freq.combobox('enable');
		}
		else if(checkBtn.value == "all"){
			cbx_HH_spec.combobox('disable');
			cbx_HH_range_from.combobox('disable');
			cbx_HH_range_to.combobox('disable');
			cbx_HH_freq.combobox('enable');
		}
		break;
	case 'MM':
		if(checkBtn.value == "spec"){
			cbx_MM_spec.combobox('enable');
			cbx_MM_range_from.combobox('disable');
			cbx_MM_range_to.combobox('disable');
			cbx_MM_freq.combobox('disable');
		}
		else if(checkBtn.value == "range"){
			cbx_MM_spec.combobox('disable');
			cbx_MM_range_from.combobox('enable');
			cbx_MM_range_to.combobox('enable');
			cbx_MM_freq.combobox('enable');
		}
		else if(checkBtn.value == "all"){
			cbx_MM_spec.combobox('disable');
			cbx_MM_range_from.combobox('disable');
			cbx_MM_range_to.combobox('disable');
			cbx_MM_freq.combobox('enable');
		}
		break;
	case 'SS':
		if(checkBtn.value == "spec"){
			cbx_SS_spec.combobox('enable');
			cbx_SS_range_from.combobox('disable');
			cbx_SS_range_to.combobox('disable');
			cbx_SS_freq.combobox('disable');
		}
		else if(checkBtn.value == "range"){
			cbx_SS_spec.combobox('disable');
			cbx_SS_range_from.combobox('enable');
			cbx_SS_range_to.combobox('enable');
			cbx_SS_freq.combobox('enable');
		}
		else if(checkBtn.value == "all"){
			cbx_SS_spec.combobox('disable');
			cbx_SS_range_from.combobox('disable');
			cbx_SS_range_to.combobox('disable');
			cbx_SS_freq.combobox('enable');
		}
		break;
	}
}

function initPanel(){
	
	for(var i=0; i<cbs.length; i++){
		cbs[i].disabled = false;
		cbs[i].checked = false;
	}
	for(var i=0; i<rbs.length; i++){
		rbs[i].disabled = false;
		rbs[i].checked = false;
		if(rbs[i].value == "spec"){
			rbs[i].checked = true;
		}
	}

	$(cbx_HH_spec).combobox('setValue',0);
	$(cbx_HH_spec).combobox('enable');	
	$(cbx_HH_range_from).combobox('setValue',0);
	$(cbx_HH_range_from).combobox('disable');	
	$(cbx_HH_range_to).combobox('setValue',23);
	$(cbx_HH_range_to).combobox('disable');
	$(cbx_HH_freq).combobox('setValue',1);
	$(cbx_HH_freq).combobox('disable');	

	$(cbx_MM_spec).combobox('setValue',0);
	$(cbx_MM_spec).combobox('enable');	
	$(cbx_MM_range_from).combobox('setValue',0);
	$(cbx_MM_range_from).combobox('disable');	
	$(cbx_MM_range_to).combobox('setValue',59);
	$(cbx_MM_range_to).combobox('disable');
	$(cbx_MM_freq).combobox('setValue',1);
	$(cbx_MM_freq).combobox('disable');	
	
	$(cbx_SS_spec).combobox('setValue',0);
	$(cbx_SS_spec).combobox('enable');	
	$(cbx_SS_range_from).combobox('setValue',0);
	$(cbx_SS_range_from).combobox('disable');	
	$(cbx_SS_range_to).combobox('setValue',59);
	$(cbx_SS_range_to).combobox('disable');
	$(cbx_SS_freq).combobox('setValue',1);
	$(cbx_SS_freq).combobox('disable');	
	
}

function setPanel(rowIndex, row){
	
	var btnSwitch = $($($($('#dg_schedule').parents())[0]).find('.easyui-switchbutton'))[rowIndex];
	
	var v_M;
	var vs_M;
	var v_W;
	var vs_W;
	var v_D;
	var vs_D;
	
	var v_HH;
	var v_HH_freq;
	var v_HH_range_from;
	var v_HH_range_to;
	var v_HH_type = "spec";
	var v_HH_is_freq = false;
	var vs_HH;
	
	var v_MM;
	var v_MM_freq;
	var v_MM_range_from;
	var v_MM_range_to;
	var v_MM_type = "spec";
	var v_MM_is_freq = false;
	var vs_MM;
	
	var v_SS;
	var v_SS_freq;
	var v_SS_range_from;
	var v_SS_range_to;
	var v_SS_type = "spec";
	var v_SS_is_freq = false;
	var vs_SS;
	
	if(row.M != null){
		v_M = (row.M.split("/"))[0];		
		if(v_M == "*"){
			for(var i=0; i<cbs_M.length; i++){
				cbs_M[i].checked = true;
			}
			cb_M_All.checked = true;
		}
		else{
			vs_M = v_M.split(",");
			for(var i=0; i<cbs_M.length; i++){
				for(var j=0; j<vs_M.length; j++){
					if(cbs_M[i].value == vs_M[j]){
						cbs_M[i].checked = true;
						break;
					}
				}
			}
		}
	}
	if(row.W != null){
		v_W = (row.W.split("/"))[0];		
		if(v_W == "*"){
			for(var i=0; i<cbs_W.length; i++){
				cbs_W[i].checked = true;
			}
			cb_W_All.checked = true;
		}
		else{
			vs_W = v_W.split(",");
			for(var i=0; i<cbs_W.length; i++){
				for(var j=0; j<vs_W.length; j++){
					if(cbs_W[i].value == vs_W[j]){
						cbs_W[i].checked = true;
						break;
					}
				}
			}
		}
	}
	if(row.D != null){
		v_D = (row.D.split("/"))[0];
		if(v_D == "*"){
			for(var i=0; i<cbs_D.length; i++){
				cbs_D[i].checked = true;
			}
			cb_D_All.checked = true;
		}
		else if(v_D == "l"){
			cb_D_Last.checked = true;
		}
		else{
			vs_D = v_D.split(",");
			for(var i=0; i<cbs_D.length; i++){
				for(var j=0; j<vs_D.length; j++){
					if(cbs_D[i].value == vs_D[j]){
						cbs_D[i].checked = true;
						break;
					}
				}
			}
		}
	}
	if(row.HH != null){
		v_HH_type = "spec";
		v_HH_is_freq = false;
		if(row.HH.indexOf("*") >= 0){
			v_HH_type = "all";
		}
		if(row.HH.indexOf("-") >= 0){
			v_HH_type = "range";
		}
		if(row.HH.indexOf("/") >= 0){
			v_HH_is_freq = true;
		}
		for(var i=0; i<rb_HH.length; i++){
			if(rb_HH[i].value == v_HH_type){
				rb_HH[i].checked = true;
			}
			else{
				rb_HH[i].checked = false;
			}
		}
		if(v_HH_type == "spec"){
			v_HH = row.HH;
			vs_HH = (v_HH.split(","));
			$(cbx_HH_spec).combobox('enable');
			$(cbx_HH_spec).combobox('setValues',vs_HH);
			$(cbx_HH_range_from).combobox('disable');
			$(cbx_HH_range_to).combobox('disable');
			$(cbx_HH_freq).combobox('disable');
		}
		if(v_HH_type == "range"){
			v_HH = (row.HH.split("/"))[0];
			v_HH_range_from = (v_HH.split("-"))[0];
			v_HH_range_to = (v_HH.split("-"))[1];
			$(cbx_HH_spec).combobox('disable');
			$(cbx_HH_range_from).combobox('setValue',v_HH_range_from);
			$(cbx_HH_range_from).combobox('enable');
			$(cbx_HH_range_to).combobox('setValue',v_HH_range_to);			
			$(cbx_HH_range_to).combobox('enable');
			$(cbx_HH_freq).combobox('enable');
			if(v_HH_is_freq){
				v_HH_freq = (row.HH.split("/"))[1];
				$(cbx_HH_freq).combobox('setValue',v_HH_freq);
			}
		}
		if(v_HH_type == "all"){
			$(cbx_HH_spec).combobox('disable');
			$(cbx_HH_range_from).combobox('disable');
			$(cbx_HH_range_to).combobox('disable');
			$(cbx_HH_freq).combobox('enable');
			if(v_HH_is_freq){
				v_HH_freq = (row.HH.split("/"))[1];
				$(cbx_HH_freq).combobox('setValue',v_HH_freq);
			}
		}
	}
	if(row.MM != null){
		v_MM_type = "spec";
		v_MM_is_freq = false;
		if(row.MM.indexOf("*") >= 0){
			v_MM_type = "all";
		}
		if(row.MM.indexOf("-") >= 0){
			v_MM_type = "range";
		}
		if(row.MM.indexOf("/") >= 0){
			v_MM_is_freq = true;
		}
		for(var i=0; i<rb_MM.length; i++){
			if(rb_MM[i].value == v_MM_type){
				rb_MM[i].checked = true;
			}
			else{
				rb_MM[i].checked = false;
			}
		}
		if(v_MM_type == "spec"){
			v_MM = row.MM;
			vs_MM = (v_MM.split(","));
			$(cbx_MM_spec).combobox('enable');
			$(cbx_MM_spec).combobox('setValues',vs_MM);
			$(cbx_MM_range_from).combobox('disable');
			$(cbx_MM_range_to).combobox('disable');
			$(cbx_MM_freq).combobox('disable');
		}
		if(v_MM_type == "range"){
			v_MM = (row.MM.split("/"))[0];
			v_MM_range_from = (v_MM.split("-"))[0];
			v_MM_range_to = (v_MM.split("-"))[1];
			$(cbx_MM_spec).combobox('disable');
			$(cbx_MM_range_from).combobox('setValue',v_MM_range_from);
			$(cbx_MM_range_from).combobox('enable');
			$(cbx_MM_range_to).combobox('setValue',v_MM_range_to);			
			$(cbx_MM_range_to).combobox('enable');
			$(cbx_MM_freq).combobox('enable');
			if(v_MM_is_freq){
				v_MM_freq = (row.MM.split("/"))[1];
				$(cbx_MM_freq).combobox('setValue',v_MM_freq);
			}
		}
		if(v_MM_type == "all"){
			$(cbx_MM_spec).combobox('disable');
			$(cbx_MM_range_from).combobox('disable');
			$(cbx_MM_range_to).combobox('disable');
			$(cbx_MM_freq).combobox('enable');
			if(v_MM_is_freq){
				v_MM_freq = (row.MM.split("/"))[1];
				$(cbx_MM_freq).combobox('setValue',v_MM_freq);
			}
		}
	}
	if(row.SS != null){
		v_SS_type = "spec";
		v_SS_is_freq = false;
		if(row.SS.indexOf("*") >= 0){
			v_SS_type = "all";
		}
		if(row.SS.indexOf("-") >= 0){
			v_SS_type = "range";
		}
		if(row.SS.indexOf("/") >= 0){
			v_SS_is_freq = true;
		}
		for(var i=0; i<rb_SS.length; i++){
			if(rb_SS[i].value == v_SS_type){
				rb_SS[i].checked = true;
			}
			else{
				rb_SS[i].checked = false;
			}
		}
		if(v_SS_type == "spec"){
			v_SS = row.SS;
			vs_SS = (v_SS.split(","));
			$(cbx_SS_spec).combobox('enable');
			$(cbx_SS_spec).combobox('setValues',vs_SS);
			$(cbx_SS_range_from).combobox('disable');
			$(cbx_SS_range_to).combobox('disable');
			$(cbx_SS_freq).combobox('disable');
		}
		if(v_SS_type == "range"){
			v_SS = (row.SS.split("/"))[0];
			v_SS_range_from = (v_SS.split("-"))[0];
			v_SS_range_to = (v_SS.split("-"))[1];
			$(cbx_SS_spec).combobox('disable');
			$(cbx_SS_range_from).combobox('setValue',v_SS_range_from);
			$(cbx_SS_range_from).combobox('enable');
			$(cbx_SS_range_to).combobox('setValue',v_SS_range_to);			
			$(cbx_SS_range_to).combobox('enable');
			$(cbx_SS_freq).combobox('enable');
			if(v_SS_is_freq){
				v_SS_freq = (row.SS.split("/"))[1];
				$(cbx_SS_freq).combobox('setValue',v_SS_freq);
			}
		}
		if(v_SS_type == "all"){
			$(cbx_SS_spec).combobox('disable');
			$(cbx_SS_range_from).combobox('disable');
			$(cbx_SS_range_to).combobox('disable');
			$(cbx_SS_freq).combobox('enable');
			if(v_SS_is_freq){
				v_SS_freq = (row.SS.split("/"))[1];
				$(cbx_SS_freq).combobox('setValue',v_SS_freq);
			}
		}
	}
	
	if($(btnSwitch).prop('checked')){
		for(var i=0; i<cbs.length; i++){
			cbs[i].disabled = true;
		}
		for(var i=0; i<rbs.length; i++){
			rbs[i].disabled = true;
		}
		for(var i=0; i<cbxs.length; i++){
			$(cbxs[i]).combobox('disable');
		}
		$('#btn_save_plan').linkbutton({disabled:true});
	}
	else{
		$('#btn_save_plan').linkbutton({disabled:false});
	}

}

function moreSchedule(obj){
	var rowIndex = getParentRowIndex(obj);
	var row = $('#dg_schedule').datagrid('getData').rows[rowIndex];
	$('#win_plan').window('center');
	$('#win_plan').window('open');
	$('#scheduleIndex').html(rowIndex);
	initPanel();
	setPanel(rowIndex, row);
}

function closeWinPlan(){
	$('#win_plan').window('close');
}

function checkInput(){
	var isCheck_M = false;
	var isCheck_W = false;
	var isCheck_D = false;
	var isCheck_D_count = false;
	var isCheck_HH = false;
	var isCheck_MM = false;
	var isCheck_SS = false;
	var isCheck = false;
	var dCount;
	for(var i=0; i<cbs_M.length; i++){
		if(cbs_M[i].checked){
			isCheck_M = true;
			break;
		}
	}
	for(var i=0; i<cbs_W.length; i++){
		if(cbs_W[i].checked){
			isCheck_W = true;
			break;
		}
	}
	dCount = 0;
	for(var i=0; i<cbs_D.length; i++){
		if(cbs_D[i].checked){
			isCheck_D = true;
			dCount = dCount + 1;
		}
	}
	if(dCount <= 20){
		isCheck_D_count = true;
	}
	else if(cb_D_All.checked){
		isCheck_D_count = true;
	}
	if(cb_D_Last.checked){
		isCheck_D = true;
	}
	for(var i=0; i<rb_HH.length; i++){
		if(rb_HH[i].checked){
			if(rb_HH[i].value == "spec"){
				if($(cbx_HH_spec).combobox('getText') != ""){
					isCheck_HH = true;
					break;
				}
			}
			else{
				isCheck_HH = true;
				break;
			}
		}
	}
	for(var i=0; i<rb_MM.length; i++){
		if(rb_MM[i].checked){
			if(rb_MM[i].value == "spec"){
				if($(cbx_MM_spec).combobox('getText') != ""){
					isCheck_MM = true;
					break;
				}
			}
			else{
				isCheck_MM = true;
				break;
			}
		}
	}
	for(var i=0; i<rb_SS.length; i++){
		if(rb_SS[i].checked){
			if(rb_SS[i].value == "spec"){
				if($(cbx_SS_spec).combobox('getText') != ""){
					isCheck_SS = true;
					break;
				}
			}
			else{
				isCheck_SS = true;
				break;
			}
		}
	}
	if(isCheck_M && isCheck_W && isCheck_D && isCheck_D_count && isCheck_HH && isCheck_MM && isCheck_SS){
		isCheck = true;
	}
	else{
		msg = "";
		if(!isCheck_M){
			msg = msg + "请设置月份<br>";
		}
		if(!isCheck_W){
			msg = msg + "请设置周天<br>";
		}
		if(!isCheck_D){
			msg = msg + "请设置月天<br>";
		}
		if(!isCheck_D_count){
			msg = msg + "月天必须小于20天<br>";
		}
		if(!isCheck_HH){
			msg = msg + "请设置小时<br>";
		}
		if(!isCheck_MM){
			msg = msg + "请设置分钟<br>";
		}
		if(!isCheck_SS){
			msg = msg + "请设置秒钟<br>";
		}
	}
	return isCheck;
}

function saveSchedulePlan(){
	if(!checkInput()){
		$.messager.alert({
			title:"系统提示",
			msg:msg,
			width:250,
		    height:160
		});
		return;
	}
	
	var rowIndex = $('#scheduleIndex').html();
	var row = $('#dg_schedule').datagrid('getData').rows[rowIndex];
	var oldM = row.M;
	var oldW = row.W;
	var oldD = row.D;
	var oldHH = row.HH;
	var oldMM = row.MM;
	var oldSS = row.SS;
	
	row.M = "";
	if(cb_M_All.checked){		
		row.M = "*";		
	}
	else{
		for(var i=0; i<cbs_M.length; i++){
			if(cbs_M[i].checked){
				row.M = row.M + cbs_M[i].value + ",";
			}
		}
		row.M = row.M.substr(0,row.M.length - 1);
	}
	row.W = "";
	if(cb_W_All.checked){		
		row.W = "*";	
	}
	else{
		for(var i=0; i<cbs_W.length; i++){
			if(cbs_W[i].checked){
				row.W = row.W + cbs_W[i].value + ",";
			}
		}
		row.W = row.W.substr(0,row.W.length - 1);
	}
	row.D = "";
	if(cb_D_All.checked){		
		row.D = "*";		
	}
	else if(cb_D_Last.checked){
		row.D = "l";	
	}
	else{
		for(var i=0; i<cbs_D.length; i++){
			if(cbs_D[i].checked){
				row.D = row.D + cbs_D[i].value + ",";
			}
		}
		row.D = row.D.substr(0,row.D.length - 1);
	}
	row.HH = "";
	for(var i=0; i<rb_HH.length; i++){
		if(rb_HH[i].checked){
			if(rb_HH[i].value == "all"){
				row.HH = "*";
			}
			if(rb_HH[i].value == "spec"){
				row.HH = $(cbx_HH_spec).combobox('getText');
			}
			if(rb_HH[i].value == "range"){
				row.HH = $(cbx_HH_range_from).combobox('getValue') + "-" + $(cbx_HH_range_to).combobox('getValue');
			}
		}		
	}
	if(!$(cbx_HH_freq).combobox('options').disabled && $(cbx_HH_freq).combobox('getValue') != "1"){
		row.HH = row.HH + "/" + $(cbx_HH_freq).combobox('getValue');
	}
	row.MM = "";
	for(var i=0; i<rb_MM.length; i++){
		if(rb_MM[i].checked){
			if(rb_MM[i].value == "all"){
				row.MM = "*";
			}
			if(rb_MM[i].value == "spec"){
				row.MM = $(cbx_MM_spec).combobox('getText');
			}
			if(rb_MM[i].value == "range"){
				row.MM = $(cbx_MM_range_from).combobox('getValue') + "-" + $(cbx_MM_range_to).combobox('getValue');
			}
		}		
	}
	if(!$(cbx_MM_freq).combobox('options').disabled && $(cbx_MM_freq).combobox('getValue') != "1"){
		row.MM = row.MM + "/" + $(cbx_MM_freq).combobox('getValue');
	}
	row.SS = "";
	for(var i=0; i<rb_SS.length; i++){
		if(rb_SS[i].checked){
			if(rb_SS[i].value == "all"){
				row.SS = "*";
			}
			if(rb_SS[i].value == "spec"){
				row.SS = $(cbx_SS_spec).combobox('getText');
			}
			if(rb_SS[i].value == "range"){
				row.SS = $(cbx_SS_range_from).combobox('getValue') + "-" + $(cbx_SS_range_to).combobox('getValue');
			}
		}		
	}
	if(!$(cbx_SS_freq).combobox('options').disabled && $(cbx_SS_freq).combobox('getValue') != "1"){
		row.SS = row.SS + "/" + $(cbx_SS_freq).combobox('getValue');
	}
	row.status = 0;
	
	$.post("/task/updateSchedule",{"schd.id":row.id,"schd.M":row.M,"schd.W":row.W,"schd.D":row.D,"schd.HH":row.HH,"schd.MM":row.MM,"schd.SS":row.SS,"schd.status":row.status},function(data){
		if(data.result){
			showMsg(data.msg);
			$('#dg_schedule').datagrid('refreshRow',rowIndex);
		}
		else{
			showMsg(data.msg);
			row.M = oldM;
			row.W = oldW;
			row.D = oldD;
			row.HH = oldHH;
			row.MM = oldMM;
			row.SS = oldSS;
		}
		renderButton();
    });
	
	
	$('#win_plan').window('close');
}

function initController(){
	cbs = $('#win_plan').find("[type='checkbox']");
	rbs = $('#win_plan').find("[type='radio']");
	cbxs = $('#win_plan').find('.easyui-combobox');	

	cbs_M = $('#pl_M').find("[name='cb_M']");
	cb_M_All = $('#pl_M').find("[name='cb_M_All']")[0];
	cbs_W = $('#pl_W').find("[name='cb_W']");
	cb_W_All = $('#pl_W').find("[name='cb_W_All']")[0];
	cbs_D = $('#pl_D').find("[name='cb_D']");
	cb_D_All = $('#pl_D').find("[name='cb_D_All']")[0];
	cb_D_Last = $('#pl_D').find("[name='cb_D_Last']")[0];

	cbx_HH_spec = $('#cbx_HH_spec');
	cbx_HH_range_from = $('#cbx_HH_range_from');
	cbx_HH_range_to = $('#cbx_HH_range_to');
	cbx_HH_freq = $('#cbx_HH_freq');
	rb_HH = $('#pl_HH').find("[name='rb_HH']");

	cbx_MM_spec = $('#cbx_MM_spec');
	cbx_MM_range_from = $('#cbx_MM_range_from');
	cbx_MM_range_to = $('#cbx_MM_range_to');
	cbx_MM_freq = $('#cbx_MM_freq');
	rb_MM = $('#pl_MM').find("[name='rb_MM']");

	cbx_SS_spec = $('#cbx_SS_spec');
	cbx_SS_range_from = $('#cbx_SS_range_from');
	cbx_SS_range_to = $('#cbx_SS_range_to');
	cbx_SS_freq = $('#cbx_SS_freq');
	rb_SS = $('#pl_SS').find("[name='rb_SS']");
}

function sortSelection(obj,rec){
	var vs = $(obj).combobox('getValues');
	var min = 0;
	var max = 60;
	for(var i=0; i<vs.length; i++){
		if(rec.value > vs[i]){
			min = i;
		}
		else{
			max = i;
			break;
		}
	}
	vs.splice(min+1,0,rec.value);
	$(obj).combobox('setValues',vs);
}