package com.task.managerment;

import java.util.List;

import com.jfinal.core.Controller;
import com.task.managerment.model.Interface;
import com.task.managerment.model.Datasource;
import com.task.managerment.model.Schedule;
import com.task.managerment.model.Event;

public class TaskController extends Controller {
	public void index(){
		render("/WEB-INF/page/index.html");
	}
	
	public void test(){
		render("/content/test.html");
	}
	
	public void saveInterface(){
		Interface itf = getModel(Interface.class, "itf");
		try {			
			if(itf.save()){
				itf.put("result", true);
				itf.put("msg", "保存成功！");
			}
			else{
				itf.put("result", false);
				itf.put("msg", "保存失败！");
			}
			renderJson(itf);
		}
		catch(Exception e){
			itf.put("result", false);
			itf.put("msg", "保存失败！发生异常：" + e.getMessage());
			renderJson(itf);
		}
	}
	
	public void updateInterface(){
		Interface itf = getModel(Interface.class, "itf");
		try {			
			if(itf.update()){
				itf.put("result", true);
				itf.put("msg", "保存成功！");
			}
			else{
				itf.put("result", false);
				itf.put("msg", "保存失败！");
			}
			renderJson(itf);
		}
		catch(Exception e){
			itf.put("result", false);
			itf.put("msg", "保存失败！发生异常：" + e.getMessage());
			renderJson(itf);
		}
	}
	
	public void deleteInterface(){
		Interface itf = getModel(Interface.class, "itf");
		try {			
			if(itf.deleteById(itf.getInt("id"))){
				itf.put("result", true);
				itf.put("msg", "删除成功！");
			}
			else{
				itf.put("result", false);
				itf.put("msg", "删除失败！");
			}
			renderJson(itf);
		}
		catch(Exception e){
			itf.put("result", false);
			itf.put("msg", "删除失败！发生异常：" + e.getMessage());
			renderJson(itf);
		}
	}
	
	public void switchSchedule(){
		Schedule schedule = getModel(Schedule.class, "schd");
		try {			
			if(schedule.update()){
				schedule.put("result", true);
				schedule.put("msg", "启停成功！");
			}
			else{
				schedule.put("result", false);
				schedule.put("msg", "启停失败！");
			}
			renderJson(schedule);
		}
		catch(Exception e){
			schedule.put("result", false);
			schedule.put("msg", "启停失败！发生异常：" + e.getMessage());
			renderJson(schedule);
		}
	}
	
	public void saveSchedule(){
		Schedule schedule = getModel(Schedule.class, "schd");
		try {			
			if(schedule.save()){
				schedule.put("result", true);
				schedule.put("msg", "保存成功！");
			}
			else{
				schedule.put("result", false);
				schedule.put("msg", "保存失败！");
			}
			renderJson(schedule);
		}
		catch(Exception e){
			schedule.put("result", false);
			schedule.put("msg", "保存失败！发生异常：" + e.getMessage());
			renderJson(schedule);
		}
	}
	
	public void updateSchedule(){
		Schedule schedule = getModel(Schedule.class, "schd");
		try {			
			if(schedule.update()){
				schedule.put("result", true);
				schedule.put("msg", "保存成功！");
			}
			else{
				schedule.put("result", false);
				schedule.put("msg", "保存失败！");
			}
			renderJson(schedule);
		}
		catch(Exception e){
			schedule.put("result", false);
			schedule.put("msg", "保存失败！发生异常：" + e.getMessage());
			renderJson(schedule);
		}
	}
	
	public void deleteSchedule(){
		Schedule schedule = getModel(Schedule.class, "schd");
		try {
			if(schedule.deleteById(schedule.getInt("id"))){
				schedule.put("result", true);
				schedule.put("msg", "删除成功！");
			}
			else{
				schedule.put("result", false);
				schedule.put("msg", "删除失败！");
			}
			renderJson(schedule);
		}
		catch(Exception e){
			schedule.put("result", false);
			schedule.put("msg", "删除失败！发生异常：" + e.getMessage());
			renderJson(schedule);
		}
	}
	
	public void getDatasources(){
		List<Datasource> datasources = Datasource.dao.find("select * from z_datasource");
		renderJson(datasources);
	}
	
	public void getInterfaces(){
		List<Interface> interfaces = Interface.dao.find("select * from z_interface");
		renderJson(interfaces); 
	}
	
	public void getSchedules(){
		List<Schedule> schedule = Schedule.dao.find("select * from z_schedule");
		renderJson(schedule); 
	}
	
	public void getEvents(){
		List<Event> event = Event.dao.find("select * from events");
		renderJson(event); 
	}

}
