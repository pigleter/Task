package com.task.managerment;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import com.jfinal.core.Controller;
import com.task.managerment.model.Interface;
import com.task.managerment.model.Datasource;
import com.task.managerment.model.Schedule;
import com.task.quartz.QuartzSchedule;
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
	
	public boolean switchQuartzJob(String scheduleID, int status){
		Schedule schedule = Schedule.dao.find("select * from z_schedule where id = " + scheduleID).get(0);
		Interface itf = Interface.dao.find("select * from z_interface where id = " + Integer.toString(schedule.getInt("interface_id"))).get(0);
		String jobName = itf.getStr("interface_name");
		String param = itf.getStr("param");
		String cronTab = schedule.getStr("SS")
				+ " " + schedule.getStr("MM")
				+ " " + schedule.getStr("HH")
				+ " " + schedule.getStr("D")
				+ " " + schedule.getStr("M")
				+ " " + schedule.getStr("W");
		String args[] = {param};
		QuartzSchedule qs = new QuartzSchedule();
		
		if(status == 1){
			try{				
				if(qs.ScheduleStart(scheduleID, jobName, args, cronTab)){
					return true;
				}
				else{
					return true;
				}
			}
			catch(Exception e){
				return false;
			}
			
		}
		else{
			try{
				if(qs.ScheduleEnd(scheduleID)){
					
					return true;
				}
				else{
					return false;
				}
			}
			catch(Exception e){
				return false;
			}
			
		}
	}
	
	public void switchSchedule(){
		Schedule schedule = getModel(Schedule.class, "schd");
		int status = schedule.getInt("status");
		int schedule_id = schedule.getInt("id");
		
		try {			
			if(updateEvents(schedule_id, status) && switchQuartzJob(Integer.toString(schedule_id), status)){
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
		
		String id = getPara("id");
		String times = getPara("times");
		Schedule schd;
		List<Schedule> schedules;
		List<Schedule> result = Schedule.dao.find("select * from z_schedule where 1 = 2");
		Calendar cl = Calendar.getInstance();
		Date dt = (Date)cl.getTime().clone();
		String M = "";
		String W = "";
		String D = "";
		String HH = "";
		String MM = "";
		String SS = "";
		
		if(id.equals("0")){
			schedules = Schedule.dao.find("select * from z_schedule where status = 1 order by id desc");
		}
		else{
			schedules = Schedule.dao.find("select * from z_schedule where status = 1 and id = " + id + "  order by id desc");
		}
		
		for(int i = 0; i < schedules.size(); i++){
			cl.setTime(dt);
			for(int j = 0; j < Integer.parseInt(times); j++){
				M = schedules.get(i).getStr("M");
				W = schedules.get(i).getStr("W");
				D = schedules.get(i).getStr("D");
				HH = schedules.get(i).getStr("HH");
				MM = schedules.get(i).getStr("MM");
				SS = schedules.get(i).getStr("SS");
				
				schd = new Schedule()._setAttrs(schedules.get(i));
				schd.put("order", j + 1);
				schd.put("next_run", getPlanListData(cl, M, W, D, HH, MM, SS));
				
				result.add(j, schd);
				
				cl.add(Calendar.SECOND, 1);
			}
		}
		renderJson(result);
	}
	
	public int getLastDay(Calendar cl){
		Calendar clLast = (Calendar)cl.clone();
		int lastDay = 0;
		clLast.set(Calendar.DATE, 1);
		clLast.add(Calendar.MONTH, 1);
		clLast.add(Calendar.DATE, -1);
		lastDay = clLast.get(Calendar.DATE);
		return lastDay;
	}
	
	public String getPlanListData(Calendar cl, String ctM, String ctW, String ctD, String ctHH, String ctMM, String ctSS){
		
		String result = "";		

		SimpleDateFormat dateFormat = new SimpleDateFormat ("yyyy-MM-dd HH:mm:ss E");

		ArrayList<Integer> M = new ArrayList<Integer>();
		ArrayList<Integer> W = new ArrayList<Integer>();
		ArrayList<Integer> D = new ArrayList<Integer>();
		ArrayList<Integer> HH = new ArrayList<Integer>();
		ArrayList<Integer> MM = new ArrayList<Integer>();
		ArrayList<Integer> SS = new ArrayList<Integer>();
		
		String[] vs_M;
		String[] vs_W;
		String[] vs_D;
		String[] vs_HH;
		String[] vs_MM;
		String[] vs_SS;
		
		int newM = 0;
		int newW = 0;
		int newD = 0;
		int newHH = 0;
		int newMM = 0;
		int newSS = 0;
		
		int oldY = 0;
		int oldM = 0;
		int oldD = 0;
		int oldHH = 0;
		int oldMM = 0;
		
		int repeatCount = 0;
		
		boolean isFoundDay = false;
		boolean isFoundTime = false;
		
		int rangeFrom = 0;
		int rangeTo = 0;
		int rangePoint = 0;
		int step = 0;
		
		oldY = cl.get(Calendar.YEAR);
		oldM = cl.get(Calendar.MONTH);
		oldD = cl.get(Calendar.DATE);
		oldHH = cl.get(Calendar.HOUR_OF_DAY);
		oldMM = cl.get(Calendar.MINUTE);
		
		boolean isLastDay = false;
		
		if(ctM.contains("*")){
			for(int i = 0; i < 12; i++){
				M.add(i + 1);
			}
		}
		else{
			vs_M = ctM.split(",");
			for(int i = 0; i < vs_M.length; i++){
				M.add(Integer.parseInt(vs_M[i]));
			}
		}
		
		if(ctW.contains("*") || ctW.contains("?")){
			for(int i = 0; i < 7; i++){
				W.add(i + 1);
			}
		}
		else{
			vs_W = ctW.split(",");
			for(int i = 0; i < vs_W.length; i++){
				W.add(Integer.parseInt(vs_W[i]));
			}
		}
		
		if(ctD.contains("*") || ctD.contains("?")){
			for(int i = 0; i < 31; i++){
				D.add(i + 1);
			}
		}
		else if(ctD.contains("L")){
			isLastDay = true;
			D.add(28);
			D.add(29);
			D.add(30);
			D.add(31);
		}
		else{
			vs_D = ctD.split(",");
			for(int i = 0; i < vs_D.length; i++){
				D.add(Integer.parseInt(vs_D[i]));
			}
		}
		
		rangeFrom = 0;
		rangeTo = 0;
		rangePoint = 0;
		step = 0;
		if(ctHH.contains("*")){
			ctHH = ctHH.replace("*", "0-23");
		}
		if(ctHH.contains("-")){
			if(ctHH.contains("/")){
				rangeFrom = Integer.parseInt(ctHH.split("/")[0].split("-")[0]);
				rangeTo = Integer.parseInt(ctHH.split("/")[0].split("-")[1]);
				step = Integer.parseInt(ctHH.split("/")[1]);
				rangePoint = rangeFrom;
			}
			else{
				rangeFrom = Integer.parseInt(ctHH.split("-")[0]);
				rangeTo = Integer.parseInt(ctHH.split("-")[1]);
				step = 1;
				rangePoint = rangeFrom;
			}
			while(rangePoint <= rangeTo){
				HH.add(rangePoint);
				rangePoint = rangePoint + step;
			}
		}
		else{
			vs_HH = ctHH.split(",");
			for(int i = 0; i < vs_HH.length; i++){
				HH.add(Integer.parseInt(vs_HH[i]));
			}
		}
		
		rangeFrom = 0;
		rangeTo = 0;
		rangePoint = 0;
		step = 0;
		if(ctMM.contains("*")){
			ctMM = ctMM.replace("*", "0-59");
		}
		if(ctMM.contains("-")){
			if(ctMM.contains("/")){
				rangeFrom = Integer.parseInt(ctMM.split("/")[0].split("-")[0]);
				rangeTo = Integer.parseInt(ctMM.split("/")[0].split("-")[1]);
				step = Integer.parseInt(ctMM.split("/")[1]);
				rangePoint = rangeFrom;
			}
			else{
				rangeFrom = Integer.parseInt(ctMM.split("-")[0]);
				rangeTo = Integer.parseInt(ctMM.split("-")[1]);
				step = 1;
				rangePoint = rangeFrom;
			}
			while(rangePoint <= rangeTo){
				MM.add(rangePoint);
				rangePoint = rangePoint + step;
			}
		}
		else{
			vs_MM = ctMM.split(",");
			for(int i = 0; i < vs_MM.length; i++){
				MM.add(Integer.parseInt(vs_MM[i]));
			}
		}
		
		rangeFrom = 0;
		rangeTo = 0;
		rangePoint = 0;
		step = 0;
		if(ctSS.contains("*")){
			ctSS = ctSS.replace("*", "0-59");
		}
		if(ctSS.contains("-")){
			if(ctSS.contains("/")){
				rangeFrom = Integer.parseInt(ctSS.split("/")[0].split("-")[0]);
				rangeTo = Integer.parseInt(ctSS.split("/")[0].split("-")[1]);
				step = Integer.parseInt(ctSS.split("/")[1]);
				rangePoint = rangeFrom;
			}
			else{
				rangeFrom = Integer.parseInt(ctSS.split("-")[0]);
				rangeTo = Integer.parseInt(ctSS.split("-")[1]);
				step = 1;
				rangePoint = rangeFrom;
			}
			while(rangePoint <= rangeTo){
				SS.add(rangePoint);
				rangePoint = rangePoint + step;
			}
		}
		else{
			vs_SS = ctSS.split(",");
			for(int i = 0; i < vs_SS.length; i++){
				SS.add(Integer.parseInt(vs_SS[i]));
			}
		}		
				
		isFoundDay = false;
		while(!isFoundDay){
			newM = cl.get(Calendar.MONTH) + 1;
			for(int i = 0; i < M.size(); i++){
				if(newM <= M.get(i)){
					cl.set(Calendar.MONTH, M.get(i) - 1);
					if(newM == M.get(i)){
						newD = cl.get(Calendar.DATE);
					}
					else{
						newD = 1;
					}
					cl.set(Calendar.DATE, newD);
					for(int j = 0; j < D.size(); j++){
						if(newD <= D.get(j)){
							if(D.get(j) > getLastDay(cl)){
								break;
							}
							cl.set(Calendar.DATE, D.get(j));
							if(isLastDay){
								if(!checkLastDay(cl)){
									continue;
								}
							}						
							newW = cl.get(Calendar.DAY_OF_WEEK);
							if(newW - 1 == 0){
								newW = 7;
							}
							else{
								newW = newW - 1;
							}
							for(int k = 0; k < W.size(); k++){
								if(newW == W.get(k)){
									isFoundDay = true;
									break;
								}
							}
						}
						if(isFoundDay){
							break;
						}
					}
				}
				if(isFoundDay){
					break;
				}
			}
			if(isFoundDay){
				
				if(oldY == cl.get(Calendar.YEAR) && oldM == cl.get(Calendar.MONTH) && oldD == cl.get(Calendar.DATE)){
					
				}
				else{
					cl.set(Calendar.HOUR_OF_DAY, 0);
					cl.set(Calendar.MINUTE, 0);
					cl.set(Calendar.SECOND, 0);
				}		
				
				newHH = cl.get(Calendar.HOUR_OF_DAY);
				for(int i = 0; i < HH.size(); i++){
					if(newHH <= HH.get(i)){
						cl.set(Calendar.HOUR_OF_DAY, HH.get(i));
						if(cl.get(Calendar.HOUR_OF_DAY) != oldHH){
							cl.set(Calendar.MINUTE, 0);
							cl.set(Calendar.SECOND, 0);
						}
						
						newMM = cl.get(Calendar.MINUTE);
						for(int j = 0; j < MM.size(); j++){
							if(newMM <= MM.get(j)){
								cl.set(Calendar.MINUTE, MM.get(j));
								if(cl.get(Calendar.MINUTE) != oldMM){
									cl.set(Calendar.SECOND, 0);
								}
								
								newSS = cl.get(Calendar.SECOND);
								for(int k = 0; k < SS.size(); k++){
									if(newSS <= SS.get(k)){
										cl.set(Calendar.SECOND, SS.get(k));
										result = dateFormat.format(cl.getTime()).toString();
										isFoundTime = true;
										break;
									}		
								}
								if(isFoundTime){
									break;
								}
							}
						}
						if(isFoundTime){
							break;
						}
					}
				}			
				
			}
			else{
				cl.add(Calendar.YEAR, 1);
				cl.set(Calendar.MONTH, 0);
				cl.set(Calendar.DATE, 1);
				repeatCount = repeatCount + 1;
			}
			
			if(isFoundTime){
				break;
			}
			else{
				isFoundDay = false;
				cl.add(Calendar.DATE, 1);
				cl.set(Calendar.HOUR_OF_DAY, 0);
				cl.set(Calendar.MINUTE, 0);
				cl.set(Calendar.SECOND, 0);
			}
			
			if(repeatCount > 100){
				result = "无符合日期时间！";
				break;
			}
		}	
		return result;
	}
	
	public boolean checkLastDay(Calendar cl){
		Calendar clLastDay = (Calendar)cl.clone();
		int lastDay = getLastDay(clLastDay);
		if(lastDay == clLastDay.get(Calendar.DATE)){
			return true;
		}
		return false;
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
	
	public void getSchedulesAll(){
		List<Schedule> schedules = Schedule.dao.find("select * from z_schedule where status = 1");
		Schedule schedule = getModel(Schedule.class);
		schedule.set("id", "0");
		schedule.set("schedule_desc", "全部作业调度");
		schedules.add(0, schedule);
		renderJson(schedules); 
	}
	
	public void getEvents(){
		List<Event> events = Event.dao.find("select * from events");
		renderJson(events); 
	}

}
