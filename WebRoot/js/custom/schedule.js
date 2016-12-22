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
			$.post("/task/saveSchedule",{"schd.schedule_desc":row.schedule_desc,"schd.interface_id":row.interface_id,"schd.M":row.M,"event_id":0,"schd.status":0},function(data){
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
			$.post("/task/updateSchedule",{"schd.id":row.id,"schd.schedule_desc":row.schedule_desc,"schd.interface_id":row.interface_id,"schd.M":row.M},function(data){
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
		renderButton();
    });
}

function setValueM(obj){
	var cbs = $(obj).combobox('panel').find("[name='c_M']");
	var dls = $(obj).combobox('panel').find("[name='dl_M']")[0];
	var v = "";
	var t = "";
	for(var i=0; i<cbs.length; i++){
		if(cbs[i].checked){
			if(cbs[i].value == "*"){
				v = $(cbs[i]).val() + ",";
				t = $(cbs[i]).next().text() + "，";
				break;
			}
			else{
				v = v + $(cbs[i]).val() + ",";
				t = t + $(cbs[i]).next().text() + "，";
			}
		}
	}
	v = v.substr(0, v.length - 1);
	t = t.substr(0, t.length - 1);
	for(var i=0; i<dls.length; i++){
		if(dls[i].selected){
			v = v + "/" + $(dls[i]).val();
			t = t + "中，每" + $(dls[i]).text() + "个月执行";
			break;
		}
	}
	$(obj).combobox('setValue', v);
	$(obj).combobox('setText', getText(v, "M"));
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

function setPanel(obj, plType, val){
	var pl = $(obj).combobox('panel');
	var cbs;
	var dls;
	var v = val;
	var d;
	var ds;	
	switch(plType)
	{
	case 'M':
		$('#pl_M').removeAttr('style');
		$('#pl_M').appendTo($('#cbx_M').combobox('panel'));
		cbs = $('#cbx_M').combobox('panel').find("[name='c_M']");
		dls = $('#cbx_M').combobox('panel').find("[name='dl_M']")[0];
		d = v.split("/");
		ds = d[0].split(",");
		if(ds[0] == "*"){
			for(var i=0; i<cbs.length; i++){
				cbs[i].checked = true;
			}
		}
		else{
			for(var i=0; i<cbs.length; i++){
				for(var j=0; j<ds.length; j++){
					if(cbs[i].value == ds[j]){
						cbs[i].checked = true;
						break;
					}
					else{
						cbs[i].checked = false;
					}
				}
			}
		}
		for(var i=0; i<dls.length; i++){
			if($(dls[i]).val() == d[1]){
				dls[i].selected = true;
			}
		}
		break;
	case 'W':
		$('#pl_W').removeAttr('style');
		$('#pl_W').appendTo($('#cbx_W').combobox('panel'));
		break;
	}
}

function initPanel(rowIndex, row){
	var v_M;
	var v_W;
	var v_D;
	var t = "";
	var cbs_M = $('#pl_M').find("[name='cb_M']");
	var cbs_W = $('#pl_W').find("[name='cb_W']");
	var cbs_D = $('#pl_D').find("[name='cb_D']");
	var cb_M_All = $('#pl_M').find("[name='cb_M_All']")[0];
	var cb_W_All = $('#pl_W').find("[name='cb_W_All']")[0];
	var cb_D_All = $('#pl_D').find("[name='cb_D_All']")[0];
	var cb_D_Last = $('#pl_D').find("[name='cb_D_Last']")[0];
	if(row.M != null && row.M != ""){
		v_M = row.M.split("");
	}
	if(row.W != null && row.W != ""){
		v_W = row.W.split("");
	}
	if(row.D != null && row.D != ""){
		v_D = row.D.split("");
	}
	if(typeof(v_M) != "undefined"){
		for(var i=0; i<v_M.length; i++){
			
		}
	}
	
}

function moreSchedule(obj){
	var rowIndex = getParentRowIndex(obj);
	var row = $('#dg_schedule').datagrid('getData').rows[rowIndex];
	$('#win_plan').window('center');
	$('#win_plan').window('open');
	$('#scheduleID').html(row.id);
	initPanel(rowIndex, row);
}

function closeWinPlan(){
	$('#win_plan').window('close');
}
