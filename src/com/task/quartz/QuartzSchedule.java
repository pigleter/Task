package com.task.quartz;

import org.quartz.CronScheduleBuilder;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.JobKey;
import org.quartz.Scheduler;
import org.quartz.SchedulerFactory;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.quartz.impl.StdSchedulerFactory;

public class QuartzSchedule {
	
	private static Scheduler scheduler = getScheduler();
	
	private static Scheduler getScheduler(){
		SchedulerFactory sf = new StdSchedulerFactory();  
        Scheduler scheduler=null;  
        try {
        	scheduler = sf.getScheduler();  
        }
        catch(Exception e){
        	
        }  
        return scheduler;
    }  
	
	public boolean ScheduleStart(String scheduleID, String jobName, String param, String cronTab) throws Exception {
		
		try{
			JobDetail job = JobBuilder.newJob(QuartzJob.class).withIdentity(scheduleID, "jobgroup").build();

			job.getJobDataMap().put("jobName", jobName);
			job.getJobDataMap().put("param", param);

			Trigger trigger = TriggerBuilder.newTrigger().withIdentity(scheduleID, "triggerGroup")  
              .withSchedule(CronScheduleBuilder.cronSchedule(cronTab))  
              .startNow().build();

			scheduler.scheduleJob(job, trigger);
			
			scheduler.start();	
			
		}
		catch(Exception e){
			throw e;
		}
		return true;
	}
	
	public boolean ScheduleEnd(String scheduleID) throws Exception{
		
		try{
			scheduler.deleteJob(JobKey.jobKey(scheduleID, "jobgroup"));
		}
		catch(Exception e){
			throw e;
		}
		return true;
	}
}
