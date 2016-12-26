function showSchedulePage(){
	$.post("/task/getInterfaces",function(result){
		interfaces = result;
		showScheduleData()
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
	    		{field:'status',title:'启停',width:'10%',
		        	formatter:function(value){
		        		var check;
		        		if(value == 1){
		        			check = true;
		        		}
		        		else{
		        			check = false;
		        		}
		        		var btn='<input class="easyui-switchbutton" data-options="checked:'+check+'"> <a class="easyui-linkbutton_more" onclick="moreSchedule(this);">执行计划</a>  ';
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
		        {field:'interface_id',title:'接口名称',width:'20%',
		        	formatter:function(value){
		                for(var i=0; i<interfaces.length; i++){
		                    if (interfaces[i].id == value){
		                    	return interfaces[i].interface_name;
		                    }
		                }
		                return value;
		            },
		        	editor:{
		        		type:'combobox',
		        		options:{
	                		valueField:'id',
	                		textField:'interface_name',
	                		data:interfaces,
	                		editable:false, 
	                		required:true
	                	}
		        	}
		        },
		        {field:'opt',title:'操作',width:'10%',
		        	formatter:function(value,row,index){
		        		var btn='<a class="easyui-linkbutton_edit" onclick="editSchedule(this);">编辑</a>  '
						+'<a class="easyui-linkbutton_save" onclick="saveSchedule(this);" style="display:none">保存</a>  '
						+'<a class="easyui-linkbutton_undo" onclick="undoSchedule(this);" style="display:none">撤销</a>  '
						+'<a class="easyui-linkbutton_dele" onclick="deleSchedule(this);">删除</a>';
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
	    onBeforeEdit:function(index){
	    	//disableButton(index, true);
	    },
	    onBeginEdit:function(index){
	    	//initPanel(index, "M");
	    	//initPanel(index, "D");
	    },
	    onEndEdit:function(index){
	    	disableButton(index, false);
	    }
	});
}

function disableButton(rowIndex, disable){
	var btnSwitch = $($($($('#dg_schedule').parents())[0]).find('.easyui-switchbutton'))[rowIndex];
	var btnMore = $($($($('#dg_schedule').parents())[0]).find('.easyui-linkbutton_more'))[rowIndex];
	if(disable){
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
					showButton(obj,'undo');
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
	var status;
	if(row.status == -1){
		showMsg("请先设置调度计划！");
		setTimeout(function(){
			$(obj).switchbutton({checked:false});
			showButton(obj,'switch');
			renderButton();
			},
			500);	
		return;
	}
	if(checked){
		status = 1;
	}
	else{
		status = 0;
	}
	$.post("/task/switchSchedule",{"schd.id":row.id,"schd.status":status},function(data){
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
	var cbs_M = $('#pl_M').find("[name='cb_M']");
	var cb_M_All = $('#pl_M').find("[name='cb_M_All']")[0];
	var cbs_W = $('#pl_W').find("[name='cb_W']");
	var cb_W_All = $('#pl_W').find("[name='cb_W_All']")[0];
	var cbs_D = $('#pl_D').find("[name='cb_D']");
	var cb_D_All = $('#pl_D').find("[name='cb_D_All']")[0];
	var cb_D_Last = $('#pl_D').find("[name='cb_D_Last']")[0];
	var cbx_HH_spec = $('#cbx_HH_spec');
	var cbx_HH_range_from = $('#cbx_HH_range_from');
	var cbx_HH_range_to = $('#cbx_HH_range_to');
	var cbx_HH_freq = $('#cbx_HH_freq');
	var cb_HH_freq = $('#pl_HH').find("[name='cb_HH_freq']")[0];
	var cbx_MM_spec = $('#cbx_MM_spec');
	var cbx_MM_range_from = $('#cbx_MM_range_from');
	var cbx_MM_range_to = $('#cbx_MM_range_to');
	var cbx_MM_freq = $('#cbx_MM_freq');
	var cb_MM_freq = $('#pl_MM').find("[name='cb_MM_freq']")[0];
	var cbx_SS_spec = $('#cbx_SS_spec');
	var cbx_SS_range_from = $('#cbx_SS_range_from');
	var cbx_SS_range_to = $('#cbx_SS_range_to');
	var cbx_SS_freq = $('#cbx_SS_freq');
	var cb_SS_freq = $('#pl_SS').find("[name='cb_SS_freq']")[0];
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
			cb_HH_freq.disabled = true;
		}
		else if(checkBtn.value == "range"){
			cbx_HH_spec.combobox('disable');
			cbx_HH_range_from.combobox('enable');
			cbx_HH_range_to.combobox('enable');
			cbx_HH_freq.combobox('enable');
			cb_HH_freq.disabled = false;
		}
		else if(checkBtn.value == "all"){
			cbx_HH_spec.combobox('disable');
			cbx_HH_range_from.combobox('disable');
			cbx_HH_range_to.combobox('disable');
			cbx_HH_freq.combobox('enable');
			cb_HH_freq.disabled = false;
		}
		break;
	case 'MM':
		if(checkBtn.value == "spec"){
			cbx_MM_spec.combobox('enable');
			cbx_MM_range_from.combobox('disable');
			cbx_MM_range_to.combobox('disable');
			cbx_MM_freq.combobox('disable');
			cb_MM_freq.disabled = true;
		}
		else if(checkBtn.value == "range"){
			cbx_MM_spec.combobox('disable');
			cbx_MM_range_from.combobox('enable');
			cbx_MM_range_to.combobox('enable');
			cbx_MM_freq.combobox('enable');
			cb_MM_freq.disabled = false;
		}
		else if(checkBtn.value == "all"){
			cbx_MM_spec.combobox('disable');
			cbx_MM_range_from.combobox('disable');
			cbx_MM_range_to.combobox('disable');
			cbx_MM_freq.combobox('enable');
			cb_MM_freq.disabled = false;
		}
		break;
	case 'SS':
		if(checkBtn.value == "spec"){
			cbx_SS_spec.combobox('enable');
			cbx_SS_range_from.combobox('disable');
			cbx_SS_range_to.combobox('disable');
			cbx_SS_freq.combobox('disable');
			cb_SS_freq.disabled = true;
		}
		else if(checkBtn.value == "range"){
			cbx_SS_spec.combobox('disable');
			cbx_SS_range_from.combobox('enable');
			cbx_SS_range_to.combobox('enable');
			cbx_SS_freq.combobox('enable');
			cb_SS_freq.disabled = false;
		}
		else if(checkBtn.value == "all"){
			cbx_SS_spec.combobox('disable');
			cbx_SS_range_from.combobox('disable');
			cbx_SS_range_to.combobox('disable');
			cbx_SS_freq.combobox('enable');
			cb_SS_freq.disabled = false;
		}
		break;
	}
}

function getText(value, valType){
	if(typeof(value) == "undefined"){
		return "";
	}
	var tx = "";
	var d;
	var ds;
	switch(valType)
	{
	case 'M':
		d = value.split("/");
		if(d[0] == "*"){
			tx = "全部月份中，每";
		}
		else{
			ds = d[0].split(",");
			for(var i=0; i<ds.length; i++){
				switch(ds[i])
				{
				case '1':
					tx = tx + "一月，";
					break;
				case '2':
					tx = tx + "二月，";
					break;
				case '3':
					tx = tx + "三月，";
					break;
				case '4':
					tx = tx + "四月，";
					break;
				case '5':
					tx = tx + "五月，";
					break;
				case '6':
					tx = tx + "六月，";
					break;
				case '7':
					tx = tx + "七月，";
					break;
				case '8':
					tx = tx + "八月，";
					break;
				case '9':
					tx = tx + "九月，";
					break;
				case '10':
					tx = tx + "十月，";
					break;
				case '11':
					tx = tx + "十一月，";
					break;
				case '12':
					tx = tx + "十二月，";
					break;
				}
			}
			tx = tx.substr(0, tx.length - 1) + "中，每";
		}
		if(typeof(d[1]) == "undefined"){
			tx = tx + "1个月执行";
		}
		else{
			tx = tx + d[1] + "个月执行";
		}
		break;
	}
	return tx;
}

function initPanel(){
	var cbs = $('#win_plan').find("[type='checkbox']");
	var rbs = $('#win_plan').find("[type='radio']");
	var cbxs = $('#win_plan').find('.easyui-combobox');
	
	var cbx_HH_spec = $('#cbx_HH_spec');
	var cbx_HH_range_from = $('#cbx_HH_range_from');
	var cbx_HH_range_to = $('#cbx_HH_range_to');
	var cbx_HH_freq = $('#cbx_HH_freq');
	
	var cbx_MM_spec = $('#cbx_MM_spec');
	var cbx_MM_range_from = $('#cbx_MM_range_from');
	var cbx_MM_range_to = $('#cbx_MM_range_to');
	var cbx_MM_freq = $('#cbx_MM_freq');
	
	var cbx_SS_spec = $('#cbx_SS_spec');
	var cbx_SS_range_from = $('#cbx_SS_range_from');
	var cbx_SS_range_to = $('#cbx_SS_range_to');
	var cbx_SS_freq = $('#cbx_SS_freq');
	
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
	for(var i=0; i<cbxs.length; i++){
		$(cbxs[i]).combobox({disabled:false});
	}
	$(cbx_HH_spec).combobox({value:0});
	$(cbx_HH_range_from).combobox({value:0});
	$(cbx_HH_range_to).combobox({value:23});
	$(cbx_HH_freq).combobox({value:1});

	$(cbx_MM_spec).combobox({value:0});
	$(cbx_MM_range_from).combobox({value:0});
	$(cbx_MM_range_to).combobox({value:59});
	$(cbx_MM_freq).combobox({value:1});
	
	$(cbx_SS_spec).combobox({value:0});
	$(cbx_SS_range_from).combobox({value:0});
	$(cbx_SS_range_to).combobox({value:59});
	$(cbx_SS_freq).combobox({value:1});
	
}

function setPanel(rowIndex, row){
	
	var btnSwitch = $($($($('#dg_schedule').parents())[0]).find('.easyui-switchbutton'))[rowIndex];
	var cbs = $('#win_plan').find("[type='checkbox']");
	var rbs = $('#win_plan').find("[type='radio']");
	var cbxs = $('#win_plan').find('.easyui-combobox');	
	
	var cbs_M = $('#pl_M').find("[name='cb_M']");
	var cb_M_All = $('#pl_M').find("[name='cb_M_All']")[0];
	var cbs_W = $('#pl_W').find("[name='cb_W']");
	var cb_W_All = $('#pl_W').find("[name='cb_W_All']")[0];
	var cbs_D = $('#pl_D').find("[name='cb_D']");
	var cb_D_All = $('#pl_D').find("[name='cb_D_All']")[0];
	var cb_D_Last = $('#pl_D').find("[name='cb_D_Last']")[0];
	
	var cbx_HH_spec = $('#cbx_HH_spec');
	var cbx_HH_range_from = $('#cbx_HH_range_from');
	var cbx_HH_range_to = $('#cbx_HH_range_to');
	var cbx_HH_freq = $('#cbx_HH_freq');
	var rb_HH = $('#pl_HH').find("[name='rb_HH']");
	var cb_HH_freq = $('#pl_HH').find("[name='cb_HH_freq']")[0];
	
	var cbx_MM_spec = $('#cbx_MM_spec');
	var cbx_MM_range_from = $('#cbx_MM_range_from');
	var cbx_MM_range_to = $('#cbx_MM_range_to');
	var cbx_MM_freq = $('#cbx_MM_freq');
	var rb_MM = $('#pl_MM').find("[name='rb_MM']");
	var cb_MM_freq = $('#pl_MM').find("[name='cb_MM_freq']")[0];
	
	var cbx_SS_spec = $('#cbx_SS_spec');
	var cbx_SS_range_from = $('#cbx_SS_range_from');
	var cbx_SS_range_to = $('#cbx_SS_range_to');
	var cbx_SS_freq = $('#cbx_SS_freq');
	var rb_SS = $('#pl_SS').find("[name='rb_SS']");
	var cb_SS_freq = $('#pl_SS').find("[name='cb_SS_freq']")[0];
	
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
			vs_HH = (row.HH.split(","));
			$(cbx_HH_spec).combobox({value:vs_HH});
			cbx_HH_spec.combobox('enable');
			cbx_HH_range_from.combobox('disable');
			cbx_HH_range_to.combobox('disable');
			cbx_HH_freq.combobox('disable');
			cb_HH_freq.disabled = true;
		}
		if(v_HH_type == "range"){
			v_HH = (row.HH.split("/"))[0];
			v_HH_range_from = (v_HH.split("-"))[0];
			v_HH_range_to = (v_HH.split("-"))[1];
			$(cbx_HH_range_from).combobox({value:v_HH_range_from});
			$(cbx_HH_range_to).combobox({value:v_HH_range_to});
			cbx_HH_spec.combobox('disable');
			cbx_HH_range_from.combobox('enable');
			cbx_HH_range_to.combobox('enable');
			cbx_HH_freq.combobox('enable');
			cb_HH_freq.disabled = false;
			if(v_HH_is_freq){
				v_HH_freq = (row.HH.split("/"))[1];
				$(cbx_HH_freq).combobox({value:v_HH_freq});
				cb_HH_freq.checked = true;
			}
		}
		if(v_HH_type == "all"){
			cbx_HH_spec.combobox('disable');
			cbx_HH_range_from.combobox('disable');
			cbx_HH_range_to.combobox('disable');
			cbx_HH_freq.combobox('enable');
			cb_HH_freq.disabled = false;
			if(v_HH_is_freq){
				v_HH_freq = (row.HH.split("/"))[1];
				$(cbx_HH_freq).combobox({value:v_HH_freq});
				cb_HH_freq.checked = true;
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
			vs_MM = (row.MM.split(","));
			$(cbx_MM_spec).combobox({value:vs_MM});
			cbx_MM_spec.combobox('enable');
			cbx_MM_range_from.combobox('disable');
			cbx_MM_range_to.combobox('disable');
			cbx_MM_freq.combobox('disable');
			cb_MM_freq.disabled = true;
		}
		if(v_MM_type == "range"){
			v_MM = (row.MM.split("/"))[0];
			v_MM_range_from = (v_MM.split("-"))[0];
			v_MM_range_to = (v_MM.split("-"))[1];
			$(cbx_MM_range_from).combobox({value:v_MM_range_from});
			$(cbx_MM_range_to).combobox({value:v_MM_range_to});
			cbx_MM_spec.combobox('disable');
			cbx_MM_range_from.combobox('enable');
			cbx_MM_range_to.combobox('enable');
			cbx_MM_freq.combobox('enable');
			cb_MM_freq.disabled = false;
			if(v_MM_is_freq){
				v_MM_freq = (row.MM.split("/"))[1];
				$(cbx_MM_freq).combobox({value:v_MM_freq});
				cb_MM_freq.checked = true;
			}
		}
		if(v_MM_type == "all"){
			cbx_MM_spec.combobox('disable');
			cbx_MM_range_from.combobox('disable');
			cbx_MM_range_to.combobox('disable');
			cbx_MM_freq.combobox('enable');
			cb_MM_freq.disabled = false;
			if(v_MM_is_freq){
				v_MM_freq = (row.MM.split("/"))[1];
				$(cbx_MM_freq).combobox({value:v_MM_freq});
				cb_MM_freq.checked = true;
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
			vs_SS = (row.SS.split(","));
			$(cbx_SS_spec).combobox({value:vs_SS});
			cbx_SS_spec.combobox('enable');
			cbx_SS_range_from.combobox('disable');
			cbx_SS_range_to.combobox('disable');
			cbx_SS_freq.combobox('disable');
			cb_SS_freq.disabled = true;
		}
		if(v_SS_type == "range"){
			v_SS = (row.SS.split("/"))[0];
			v_SS_range_from = (v_SS.split("-"))[0];
			v_SS_range_to = (v_SS.split("-"))[1];
			$(cbx_SS_range_from).combobox({value:v_SS_range_from});
			$(cbx_SS_range_to).combobox({value:v_SS_range_to});
			cbx_SS_spec.combobox('disable');
			cbx_SS_range_from.combobox('enable');
			cbx_SS_range_to.combobox('enable');
			cbx_SS_freq.combobox('enable');
			cb_SS_freq.disabled = false;
			if(v_SS_is_freq){
				v_SS_freq = (row.SS.split("/"))[1];
				$(cbx_SS_freq).combobox({value:v_SS_freq});
				cb_SS_freq.checked = true;
			}
		}
		if(v_SS_type == "all"){
			cbx_SS_spec.combobox('disable');
			cbx_SS_range_from.combobox('disable');
			cbx_SS_range_to.combobox('disable');
			cbx_SS_freq.combobox('enable');
			cb_SS_freq.disabled = false;
			if(v_SS_is_freq){
				v_SS_freq = (row.SS.split("/"))[1];
				$(cbx_SS_freq).combobox({value:v_SS_freq});
				cb_SS_freq.checked = true;
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
			$(cbxs[i]).combobox({disabled:true});
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

function saveSchedulePlan(){
	var rowIndex = $('#scheduleIndex').html();
	var row = $('#dg_schedule').datagrid('getData').rows[rowIndex];
	
	var cbs_M = $('#pl_M').find("[name='cb_M']");
	var cb_M_All = $('#pl_M').find("[name='cb_M_All']")[0];
	var cbs_W = $('#pl_W').find("[name='cb_W']");
	var cb_W_All = $('#pl_W').find("[name='cb_W_All']")[0];
	var cbs_D = $('#pl_D').find("[name='cb_D']");
	var cb_D_All = $('#pl_D').find("[name='cb_D_All']")[0];
	var cb_D_Last = $('#pl_D').find("[name='cb_D_Last']")[0];
	
	var cbx_HH_spec = $('#cbx_HH_spec');
	var cbx_HH_range_from = $('#cbx_HH_range_from');
	var cbx_HH_range_to = $('#cbx_HH_range_to');
	var cbx_HH_freq = $('#cbx_HH_freq');
	var rb_HH = $('#pl_HH').find("[name='rb_HH']");
	var cb_HH_freq = $('#pl_HH').find("[name='cb_HH_freq']")[0];
	
	var cbx_MM_spec = $('#cbx_MM_spec');
	var cbx_MM_range_from = $('#cbx_MM_range_from');
	var cbx_MM_range_to = $('#cbx_MM_range_to');
	var cbx_MM_freq = $('#cbx_MM_freq');
	var rb_MM = $('#pl_MM').find("[name='rb_MM']");
	var cb_MM_freq = $('#pl_MM').find("[name='cb_MM_freq']")[0];
	
	var cbx_SS_spec = $('#cbx_SS_spec');
	var cbx_SS_range_from = $('#cbx_SS_range_from');
	var cbx_SS_range_to = $('#cbx_SS_range_to');
	var cbx_SS_freq = $('#cbx_SS_freq');
	var rb_SS = $('#pl_SS').find("[name='rb_SS']");
	var cb_SS_freq = $('#pl_SS').find("[name='cb_SS_freq']")[0];
	
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
	if(cb_HH_freq.checked){
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
	if(cb_MM_freq.checked){
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
	if(cb_SS_freq.checked){
		row.SS = row.SS + "/" + $(cbx_SS_freq).combobox('getValue');
	}
	row.status = 0;
	
	$.post("/task/updateSchedule",{"schd.id":row.id,"schd.M":row.M,"schd.W":row.W,"schd.D":row.D,"schd.HH":row.HH,"schd.MM":row.MM,"schd.SS":row.SS,"schd.status":row.status},function(data){
		if(data.result){
			showMsg(data.msg);
		}
		else{
			showMsg(data.msg);
			editSchedule(obj);
		}
		//showButton(obj,'save');
		renderButton();
    });
	
	
	$('#win_plan').window('close');
}

function getPanel(row){
	
	
}
