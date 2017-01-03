var datasources;
var interfaces;

function loadDatasources(){
	$.post("/task/getDatasources",function(result){
		datasources = result;
    });
}

function loadInterfaces(){
	$.post("/task/getInterfaces",function(result){
		interfaces = result;
    });
}

function renderButton(){
	$('.easyui-linkbutton_edit').linkbutton({text:"",iconCls:'icon-edit'});
	$('.easyui-linkbutton_save').linkbutton({text:"",iconCls:'icon-save'});
	$('.easyui-linkbutton_undo').linkbutton({text:"",iconCls:'icon-undo'});
	$('.easyui-linkbutton_dele').linkbutton({text:"",iconCls:'icon-cancel'});
	$('.easyui-linkbutton_more').linkbutton({text:"",iconCls:'icon-more'});
	$('.easyui-switchbutton').switchbutton({onText:"",offText:"",height:'20',width:'40',handleWidth:'20',handleText:"",onChange: function(checked){
		switchSchedule(this, checked);
    }});

	var btn_swit = $('.easyui-switchbutton');
	for (var i = 0; i < btn_swit.length; i++){
		var btn_edit = $($($($(btn_swit[i]).parents('.datagrid-row'))[0]).find('.easyui-linkbutton_edit'))[0];
		var btn_save = $($($($(btn_swit[i]).parents('.datagrid-row'))[0]).find('.easyui-linkbutton_save'))[0];
		var btn_undo = $($($($(btn_swit[i]).parents('.datagrid-row'))[0]).find('.easyui-linkbutton_undo'))[0];
		var btn_dele = $($($($(btn_swit[i]).parents('.datagrid-row'))[0]).find('.easyui-linkbutton_dele'))[0];
		$(btn_edit).linkbutton({disabled:$(btn_swit[i]).prop('checked')});
		$(btn_save).linkbutton({disabled:$(btn_swit[i]).prop('checked')});
		$(btn_undo).linkbutton({disabled:$(btn_swit[i]).prop('checked')});
		$(btn_dele).linkbutton({disabled:$(btn_swit[i]).prop('checked')});
	}
	$('#dg_interface').datagrid('autoSizeColumn','opt');
	$('#dg_schedule').datagrid('autoSizeColumn','opt');
	$('#dg_schedule').datagrid('autoSizeColumn','status');
}

function getParentRowIndex(obj){
	var rowIndex = parseInt($(obj).parents('.datagrid-row').attr('datagrid-row-index'));
	return rowIndex;
}

function showButton(obj, showType){
	var btn_edit = $($($($(obj).parents('.datagrid-row'))[0]).find('.easyui-linkbutton_edit'))[0];
	var btn_save = $($($($(obj).parents('.datagrid-row'))[0]).find('.easyui-linkbutton_save'))[0];
	var btn_undo = $($($($(obj).parents('.datagrid-row'))[0]).find('.easyui-linkbutton_undo'))[0];
	var btn_dele = $($($($(obj).parents('.datagrid-row'))[0]).find('.easyui-linkbutton_dele'))[0];
	var btn_swit = $($($($(obj).parents('.datagrid-row'))[0]).find('.easyui-switchbutton'))[0];
	switch(showType)
	{
	case 'add':
		$(btn_edit).hide();
		$(btn_save).show();
		$(btn_undo).hide();
		$(btn_dele).show();
		break;
	case 'edit':
		$(btn_edit).hide();
		$(btn_save).show();
		$(btn_undo).show();
		$(btn_dele).show();
		break;
	case 'save':
		$(btn_edit).show();
		$(btn_save).hide();
		$(btn_undo).hide();
		$(btn_dele).show();
		break;
	case 'undo':
		$(btn_edit).show();
		$(btn_save).hide();
		$(btn_undo).hide();
		$(btn_dele).show();
		break;
	case 'switch':
		if($(btn_swit).prop('checked')){
			$(btn_edit).linkbutton('disable');
			$(btn_save).linkbutton('disable');
			$(btn_undo).linkbutton('disable');
			$(btn_dele).linkbutton('disable');
		}
		else{
			$(btn_edit).linkbutton('enable');
			$(btn_save).linkbutton('enable');
			$(btn_undo).linkbutton('enable');
			$(btn_dele).linkbutton('enable');
		}
		break;
	};
	$('#dg_interface').datagrid('autoSizeColumn','opt');
	$('#dg_schedule').datagrid('autoSizeColumn','opt');
	$('#dg_schedule').datagrid('autoSizeColumn','status');
}

function showMsg(msg){
	$.messager.show({
		title:'系统消息',
		msg:msg,
		timeout:2000,
		showType:'slide'
	});
}


function test(){
	$('#A').combo({
        required:true,
        editable:false,
        multiple:true,
        width:200,
        panelWidth: 600
    });
    $('#p').removeAttr('style');//width(0);
    var aa = $('#A');
	$('#p').appendTo($('#A').combo('panel'));
	//$('#p').panel('maximize');
}

function checkAll_M(obj){
	var cbs = $($($(obj).parent())[0]).find("[name='c_M']");
	if(obj.checked){
		for(var i=0; i<cbs.length; i++){
			cbs[i].checked = true;
		}
	}
	else{
		for(var i=0; i<cbs.length; i++){
			cbs[i].checked = false;
		}
	}
}