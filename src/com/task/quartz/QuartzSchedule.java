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
	
	public boolean ScheduleStart(String scheduleID, String jobName, String[] args, String cronTab){
		
		try{
			JobDetail job = JobBuilder.newJob(QuartzJob.class).withIdentity(scheduleID, "jobgroup").build();

			job.getJobDataMap().put("jobName", jobName);
			
			if(args.length > 0){
				for(int i = 0; i < args.length; i++)
				{
					job.getJobDataMap().put("args_" + String.valueOf(i), args[i]);
				}	
			}					

			Trigger trigger = TriggerBuilder.newTrigger().withIdentity(scheduleID, "triggerGroup")  
              .withSchedule(CronScheduleBuilder.cronSchedule(cronTab))  
              .startNow().build();

			scheduler.scheduleJob(job, trigger);
			
			scheduler.start();
			
			return true;
			
		}
		catch(Exception e){
			return false;
		}
	}
	
	public boolean ScheduleEnd(String scheduleID){
		
		try{
			scheduler.deleteJob(JobKey.jobKey(scheduleID, "jobgroup"));
		}
		catch(Exception e){
			
		}
		return true;
	}
}
