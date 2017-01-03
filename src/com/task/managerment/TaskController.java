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
	
	public boolean isInSchedule(int interface_id){
		String sql = "select t2.* from z_interface as t1, z_schedule as t2 "
				+ "where t1.id = t2.interface_id "
				+ "and t2.status = 1 "
				+ "and t1.id = " +  Integer.toString(interface_id);
		List<Schedule> schedules = Schedule.dao.find(sql);
		if(schedules.size() > 0){
			return true;
		}
		return false;
	}
	
	public void updateInterface(){
		
		Interface itf = getModel(Interface.class, "itf");
		
		if(isInSchedule(itf.getInt("id"))){
			itf.put("result", false);
			itf.put("msg", "该接口在调度中，请先停止！");
			renderJson(itf);
			return;
		}

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
		int interface_id = itf.getInt("id");
		List<Schedule> schedules = Schedule.dao.find("select * from z_schedule where interface_id = " + Integer.toString(interface_id));
		
		try {	
			for(int i = 0; i < schedules.size(); i++){
				if(!deleteEventByScheduleId(schedules.get(i).getInt("id")) || !deleteScheduleById(schedules.get(i).getInt("id"))){
					itf.put("result", false);
					itf.put("msg", "删除失败！");
					renderJson(itf);
					return;
				}
			}
			if(itf.deleteById(interface_id)){
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
		int status = schedule.getInt("status");
		int schedule_id = schedule.getInt("id");
		
		try {			
			if(updateEvents(schedule_id, status)){
				if(schedule.update()){
					schedule.put("result", true);
					schedule.put("msg", "启停成功！");
				}
				else{
					schedule.put("result", false);
					schedule.put("msg", "启停失败！");
				}
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
	
	public int saveEvent(){
		Event event = getModel(Event.class);
		event.set("year", "2000");
		event.set("businessDays", "1");
		try{
			if(event.save()){
				return event.getInt("id");
			}
		}
		catch(Exception e){
			return 0;
		}
		return 0;
	}
	
	public boolean updateEvents(int schedule_id, int status){
		Event event = getModel(Event.class);
		Schedule schedule = Schedule.dao.find("select * from z_schedule where id = " + Integer.toString(schedule_id)).get(0);
		Interface itf = Interface.dao.find("select * from z_interface where id = " + Integer.toString(schedule.getInt("interface_id"))).get(0);
		event.set("second", schedule.getStr("SS"));
		event.set("minute", schedule.getStr("MM"));
		event.set("hour", schedule.getStr("HH"));
		event.set("dayofmonth", schedule.getStr("D"));
		event.set("month", schedule.getStr("M"));
		event.set("dayofweek", schedule.getStr("W"));
		if(status == 1){
			event.set("year", "*");
		}
		else{
			event.set("year", "2000");
		}		
		event.set("task", itf.getStr("interface_name"));
		event.set("extrainfo", itf.getStr("interface_param"));
		event.set("businessDays", "1");
		event.set("id", schedule.getInt("event_id"));
		try{
			if(event.update()){
				return true;
			}
		}
		catch(Exception e){
			return false;
		}
		return false;
	}
	
	public void saveSchedule(){
		Schedule schedule = getModel(Schedule.class, "schd");
		int event_id = 0;
		try {			
			event_id = saveEvent();
			if(event_id > 0){
				schedule.set("event_id", event_id);
				if(schedule.save()){					
					schedule.put("result", true);
					schedule.put("msg", "保存成功！");
				}
				else{
					schedule.put("result", false);
					schedule.put("msg", "保存失败！");
				}
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
	
	public boolean deleteEventByScheduleId(int schedule_id){
		Event event = getModel(Event.class);
		Schedule schedule = Schedule.dao.find("select * from z_schedule where id = " + Integer.toString(schedule_id)).get(0);
		try{
			if(event.deleteById(schedule.getInt("event_id"))){
				return true;
			}
		}
		catch(Exception e){
			return false;
		}
		return false;
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
	
	public boolean deleteScheduleById(int schedule_id){
		Schedule schedule = getModel(Schedule.class);
		try{
			if(schedule.deleteById(schedule_id)){
				return true;
			}
		}
		catch(Exception e){
			return false;
		}
		return false;
	}
	
	public void deleteSchedule(){
		Schedule schedule = getModel(Schedule.class, "schd");
		try {
			if(deleteEventByScheduleId(schedule.getInt("id"))){
				if(schedule.deleteById(schedule.getInt("id"))){
					schedule.put("result", true);
					schedule.put("msg", "删除成功！");
				}
				else{
					schedule.put("result", false);
					schedule.put("msg", "删除失败！");
				}
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
		Interface itf;
		for(int i = 0; i < interfaces.size(); i++){
			itf = interfaces.get(i);
			itf.put("name_param", itf.getStr("interface_name") + "（" + itf.getStr("interface_param") + "）");
		}
		renderJson(interfaces); 
	}
	
	public void getSchedules(){
		List<Schedule> schedules = Schedule.dao.find("select * from z_schedule");
		renderJson(schedules); 
	}
	
	public void getEvents(){
		List<Event> events = Event.dao.find("select * from events");
		renderJson(events); 
	}

}
