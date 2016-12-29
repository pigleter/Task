function showInterfacePage(){
	$.post("/task/getDatasources",function(result){
		datasources = result;
		showInterfaceData();
    });
}

function showInterfaceData(){
	$('#dg_interface').datagrid({
	    title:"接口列表",
	    url:"/task/getInterfaces",
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
				addInterface();
				}
		},
		{
			iconCls:'icon-help',
			text:'帮助',
			handler:function(){
				}
		}],
	    columns:[[
	        {field:'id',title:'ID',width:'5%'},
	        {field:'interface_name',title:'接口名称',width:'20%',
	        	editor:{
	        		type:'validatebox',
	        		options:{
	        			required:true
	        		}
	        	}
	        },
	        {field:'interface_param',title:'接口参数',width:'10%',
	        	editor:{
	        		type:'validatebox',
	        		options:{
	        			required:true
	        		}
	        	}
	        },
	        {field:'interface_desc',title:'接口描述',width:'20%',
	        	editor:{
	        		type:'validatebox',
	        		options:{
	        			required:true
	        		}
	        	}
	        },
	        {field:'source_from',title:'数据来源',width:'8%',
	        	formatter:function(value){
	                for(var i=0; i<datasources.length; i++){
	                    if (datasources[i].source_id == value) return datasources[i].source_name;
	                }
	                return value;
	            },
	        	editor:{
                	type:'combobox',
                	options:{
                		valueField:'source_id',
                		textField:'source_name',
                		data:datasources,
                		editable:false, 
                		required:true
                	}
                }
	        },
	        {field:'source_to',title:'数据目标',width:'8%',
	        	formatter:function(value){
	                for(var i=0; i<datasources.length; i++){
	                    if (datasources[i].source_id == value) return datasources[i].source_name;
	                }
	                return value;
	            },
	        	editor:{
                	type:'combobox',
                	options:{
                		valueField:'source_id',
                		textField:'source_name',
                		data:datasources,
                		editable:false, 
                		required:true
                	}
                }
	        },
	        {field:'remark',title:'备注',width:'15%',editor:'text'},
	        {field:'opt',title:'操作',width:'14%',
	        	formatter:function(value,row,index){
	        		var btn='<a class="easyui-linkbutton_edit" onclick="editInterface(this);">编辑</a>  '
					+'<a class="easyui-linkbutton_save" onclick="saveInterface(this);" style="display:none">保存</a>  '
					+'<a class="easyui-linkbutton_undo" onclick="undoInterface(this);" style="display:none">撤销</a>  '
					+'<a class="easyui-linkbutton_dele" onclick="deleInterface(this);">删除</a>';
				return btn;
				}
	        }
	    ]],
	    onLoadSuccess:function(){
	    	renderButton();
	    },
	    onSelect:function(index){
	    	$('#dg_interface').datagrid('clearSelections');
	    }
	});
}

function addInterface(){
	$('#dg_interface').datagrid('appendRow',{
		id:"0",
	});
	var rowIndex = $('#dg_interface').datagrid('getRows').length-1;
	var btn = $($($($('#dg_interface').parents())[0]).find('.easyui-linkbutton_edit'))[rowIndex];
	$('#dg_interface').datagrid('beginEdit', rowIndex);
	showButton(btn,'add');
	renderButton();
}


function saveInterface(obj){
	var rowIndex = getParentRowIndex(obj)
	var row = $('#dg_interface').datagrid('getData').rows[rowIndex];
	var oldRow_interface_name = row.interface_name;
	var oldRow_interface_param = row.interface_param;
	var oldRow_interface_desc = row.interface_desc;
	var oldRow_source_from = row.source_from;
	var oldRow_source_to = row.source_to;
	var oldRow_remark = row.remark;
	$('#dg_interface').datagrid('endEdit', rowIndex);
	var btn = $($($($('#dg_interface').parents())[0]).find('.easyui-linkbutton_dele'))[rowIndex];
	row = $('#dg_interface').datagrid('getData').rows[rowIndex];
	if ($('#dg_interface').datagrid('validateRow', rowIndex)){
		if(row.id==0){
			$.post("/task/saveInterface",{"itf.interface_name":row.interface_name,"itf.interface_desc":row.interface_desc,"itf.source_from":row.source_from,"itf.source_to":row.source_to,"itf.remark":row.remark},function(data){
				if(data.result){
					$('#dg_interface').datagrid('updateRow',{
						index: rowIndex,
						row: {
							id: data.id
						}
					});
					showMsg(data.msg);
				}
				else{
					showMsg(data.msg);
					editInterface(obj);
				}
				showButton(obj,'save');
				renderButton();
		    });
		}
		else{
			$('#dg_interface').datagrid('updateRow',rowIndex);
			$.post("/task/updateInterface",{"itf.id":row.id,"itf.interface_name":row.interface_name,"itf.interface_param":row.interface_param,"itf.interface_desc":row.interface_desc,"itf.source_from":row.source_from,"itf.source_to":row.source_to,"itf.remark":row.remark},function(data){
				if(data.result){
					showMsg(data.msg);
					showButton(btn,'save');
					renderButton();
				}
				else{
					showMsg(data.msg);
					editInterface(btn);
					row.interface_name = oldRow_interface_name;
					row.interface_param = oldRow_interface_param;
					row.interface_desc = oldRow_interface_desc;
					row.source_from = oldRow_source_from;
					row.source_to = oldRow_source_to;
					row.remark = oldRow_remark;					
				}				
		    });
		}
	}		
}

function editInterface(obj){
	var rowIndex = getParentRowIndex(obj)
	$('#dg_interface').datagrid('beginEdit', rowIndex);
	showButton(obj, 'edit');
	renderButton();
}

function undoInterface(obj){
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
					$('#dg_interface').datagrid('cancelEdit', rowIndex);
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

function deleInterface(obj){
	$('#dd').dialog({
	    width:250,
	    height:150,
	    modal:true,
	    title:'删除确认',
	    content:'删除接口会同时删除该接口下所有作业调度，确定删除？',
	    buttons:[
	    	{
	    		text:'确定',
				iconCls:'icon-ok',
				handler:function(){
					var rowIndex = getParentRowIndex(obj)
					var row = $('#dg_interface').datagrid('getData').rows[rowIndex];
					$('#dd').dialog('close');
					if(row.id != 0){
						$.post("/task/deleteInterface",{"itf.id":row.id},function(data){
							if(data.result){
								showMsg(data.msg);
								$('#dg_interface').datagrid('deleteRow', rowIndex);
							}
							else{
								showMsg(data.msg);
							}
							});
				    }
					else{
						$('#dg_interface').datagrid('deleteRow', rowIndex);
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