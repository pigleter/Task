package com.task.managerment;

import java.util.List;

import com.task.managerment.model.Interface;
import com.task.managerment.model.Schedule;
import com.task.quartz.QuartzSchedule;

public class TaskRestart {
	public static void restartActiveSchedules() throws Exception {
		List<Schedule> schedules = Schedule.dao.find("select * from z_task_schedule where status = 1");
		
		for(int i = 0; i < schedules.size(); i++) {
			String scheduleID = schedules.get(i).getStr("id");
			Schedule schedule = schedules.get(i);
			Interface itf = Interface.dao.find("select * from z_task_interface where id = " + Integer.toString(schedule.getInt("interface_id"))).get(0);
			String jobDesc = itf.getStr("interface_desc");
			String jobName = itf.getStr("interface_name");
			String jobPath = itf.getStr("interface_path");
			String param = itf.getStr("interface_param");
			String M = schedule.getStr("M");
			String D = schedule.getStr("D");		
			String W = schedule.getStr("W");
			String HH = schedule.getStr("HH");
			String MM = schedule.getStr("MM");
			String SS = schedule.getStr("SS");
			if(W.equals("*")){
				W = "?";
			}
			else{
				W = Integer.toString(Integer.parseInt(W) + 1);
				if(W.equals("8")){
					W = "1";
				}
				D = "?";
			}
			String cronTab = SS
					+ " " + MM
					+ " " + HH
					+ " " + D
					+ " " + M
					+ " " + W;
			QuartzSchedule qs = new QuartzSchedule();
			
			try{
				qs.ScheduleStart(scheduleID, jobDesc, jobName, jobPath, param, cronTab);				
			}
			catch(Exception e){
				throw e;
			}
		}
	}
}
