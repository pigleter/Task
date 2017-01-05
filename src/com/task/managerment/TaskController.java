package com.task.managerment;

import java.util.Calendar;
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
	
	public void getPlanlist(){
		String M = "*";
		String W = "*";
		String D = "*";
		String HH = "*";
		
		String MM = "*/5";
		String[] vs_MM;
		int from_MM = 0;
		int t_from_MM = 0;
		int to_MM = 0;
		int stepMM = 0;
		
		String SS = "*/2";
		String[] vs_SS;
		int from_SS = 0;
		int t_from_SS = 0;
		int to_SS = 0;
		int stepSS = 0;
		
		Calendar cl = Calendar.getInstance();
		System.out.println(cl.getTime());
		//System.out.println(Calendar.SECOND);
		//cl.set(Calendar.SECOND, 20);
		//System.out.println(Calendar.SECOND);
		if(SS.contains("*")){
			if(SS.contains("/")){
				vs_SS = SS.split("/");
				cl.add(Calendar.SECOND, 1);
				stepSS = Integer.parseInt(vs_SS[1]);
				t_from_SS = 0;
				while(cl.get(Calendar.SECOND) > t_from_SS){
					t_from_SS = t_from_SS + stepSS;
				}
				if(t_from_SS > 59){
					cl.add(Calendar.MINUTE, 1);
					cl.set(Calendar.SECOND, from_SS);
				}
				else{
					cl.set(Calendar.SECOND, t_from_SS);
				}
			}
			else{	
				cl.add(Calendar.SECOND, 1);
			}
		}
		else if(SS.contains("-")){
			if(SS.contains("/")){
				vs_SS = SS.split("/");
				stepSS = Integer.parseInt(vs_SS[1]);
				vs_SS = vs_SS[0].split("-");
				from_SS = Integer.parseInt(vs_SS[0]);
				t_from_SS = from_SS;
				to_SS = Integer.parseInt(vs_SS[1]);
				if(cl.get(Calendar.SECOND) < from_SS){
					cl.set(Calendar.SECOND, from_SS);
				}
				if(cl.get(Calendar.SECOND) >= from_SS && cl.get(Calendar.SECOND) <= to_SS){
					cl.add(Calendar.SECOND, 1);
					t_from_SS = t_from_SS + stepSS;
					while(cl.get(Calendar.SECOND) > t_from_SS){
						t_from_SS = t_from_SS + stepSS;
					}
					if(t_from_SS > to_SS){
						cl.add(Calendar.MINUTE, 1);
						cl.set(Calendar.SECOND, from_SS);
					}
					else{
						cl.set(Calendar.SECOND, t_from_SS);
					}
				}
				if(cl.get(Calendar.SECOND) > to_SS){
					cl.add(Calendar.MINUTE, 1);
					cl.set(Calendar.SECOND, from_SS);
				}
			}
			else{
				vs_SS = SS.split("-");
				from_SS = Integer.parseInt(vs_SS[0]);
				to_SS = Integer.parseInt(vs_SS[1]);
				if(cl.get(Calendar.SECOND) < from_SS){
					cl.set(Calendar.SECOND, from_SS);
				}
				if(cl.get(Calendar.SECOND) >= from_SS && cl.get(Calendar.SECOND) <= to_SS){
					cl.add(Calendar.SECOND, 1);
				}
				if(cl.get(Calendar.SECOND) > to_SS){
					cl.add(Calendar.MINUTE, 1);
					cl.set(Calendar.SECOND, from_SS);
				}
			}
		}
		else{
			vs_SS = SS.split(",");
			cl.add(Calendar.SECOND, 1);
			for(int i = 0; i < vs_SS.length; i++){
				if(cl.get(Calendar.SECOND) < Integer.parseInt(vs_SS[i])){
					cl.set(Calendar.SECOND, Integer.parseInt(vs_SS[i]));
					break;
				}
				if(i == vs_SS.length - 1){
					cl.add(Calendar.MINUTE, 1);
					cl.set(Calendar.SECOND, Integer.parseInt(vs_SS[0]));
				}
			}
		}
		
		if(MM.contains("*")){
			if(MM.contains("/")){
				vs_MM = MM.split("/");
				stepMM = Integer.parseInt(vs_MM[1]);
				t_from_MM = 0;
				while(cl.get(Calendar.MINUTE) > t_from_MM){
					t_from_MM = t_from_MM + stepMM;
				}
				if(t_from_MM > 59){
					cl.add(Calendar.HOUR, 1);
					cl.set(Calendar.MINUTE, from_MM);
				}
				else{
					cl.set(Calendar.MINUTE, t_from_MM);
				}
			}
		}
		else if(MM.contains("-")){
			if(MM.contains("/")){
				vs_MM = MM.split("/");
				stepMM = Integer.parseInt(vs_MM[1]);
				vs_MM = vs_MM[0].split("-");
				from_MM = Integer.parseInt(vs_MM[0]);
				t_from_MM = from_MM;
				to_MM = Integer.parseInt(vs_MM[1]);
				if(cl.get(Calendar.MINUTE) < from_MM){
					cl.set(Calendar.MINUTE, from_MM);
				}
				if(cl.get(Calendar.MINUTE) >= from_MM && cl.get(Calendar.MINUTE) <= to_MM){
					t_from_MM = t_from_MM + stepMM;
					while(cl.get(Calendar.MINUTE) > t_from_MM){
						t_from_MM = t_from_MM + stepMM;
					}
					if(t_from_MM > to_MM){
						cl.add(Calendar.HOUR, 1);
						cl.set(Calendar.MINUTE, from_MM);
					}
					else{
						cl.set(Calendar.MINUTE, t_from_MM);
					}
				}
				if(cl.get(Calendar.SECOND) > to_MM){
					cl.add(Calendar.HOUR, 1);
					cl.set(Calendar.MINUTE, from_MM);
				}
			}
			else{
				vs_MM = MM.split("-");
				from_MM = Integer.parseInt(vs_MM[0]);
				to_MM = Integer.parseInt(vs_MM[1]);
				if(cl.get(Calendar.MINUTE) < from_MM){
					cl.set(Calendar.MINUTE, from_MM);
				}
				if(cl.get(Calendar.MINUTE) >= from_MM && cl.get(Calendar.MINUTE) <= to_MM){
				}
				if(cl.get(Calendar.MINUTE) > to_MM){
					cl.add(Calendar.HOUR, 1);
					cl.set(Calendar.MINUTE, from_MM);
				}
			}
		}
		else{
			vs_MM = MM.split(",");
			for(int i = 0; i < vs_MM.length; i++){
				if(cl.get(Calendar.MINUTE) < Integer.parseInt(vs_MM[i])){
					cl.set(Calendar.MINUTE, Integer.parseInt(vs_MM[i]));
					break;
				}
				if(i == vs_MM.length - 1){
					cl.add(Calendar.HOUR, 1);
					cl.set(Calendar.MINUTE, Integer.parseInt(vs_MM[0]));
				}
			}
		}
		

//		try{
//			Thread.sleep(3000);
//		}
//		catch(Exception e){
//			
//		}
		System.out.println(cl.getTime());
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
		List<Schedule> schedules = Schedule.dao.find("select * from z_schedule");
		renderJson(schedules); 
	}
	
	public void getEvents(){
		List<Event> events = Event.dao.find("select * from events");
		renderJson(events); 
	}

}
