package com.task.quartz;
 
import org.quartz.CronScheduleBuilder;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.JobExecutionContext;
import org.quartz.JobKey;
import org.quartz.Scheduler;
import org.quartz.SchedulerFactory;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.quartz.TriggerKey;
import org.quartz.impl.StdSchedulerFactory;

import java.util.Date;
import java.util.List;

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
	
	public boolean ScheduleStart(String scheduleID, String jobDesc, String jobName, String jobPath, String param, String cronTab) throws Exception {
		
		try{
			JobDetail job = JobBuilder.newJob(QuartzJob.class).withIdentity(scheduleID, "jobgroup").build();

			job.getJobDataMap().put("jobDesc", jobDesc);
			job.getJobDataMap().put("jobName", jobName);
			job.getJobDataMap().put("jobPath", jobPath);
			job.getJobDataMap().put("param", param);
			job.getJobDataMap().put("scheduleID", scheduleID);

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
	
	public boolean IsRunning(String scheduleID)throws Exception{
		try{
			List<JobExecutionContext> jexc = scheduler.getCurrentlyExecutingJobs();			
			for(int i = 0; i < jexc.size(); i++){
				System.out.println(jexc.get(i).getFireTime());
				System.out.print(scheduler.getTrigger(TriggerKey.triggerKey(scheduleID, "triggerGroup")).getPreviousFireTime());
			}
		}
		catch(Exception e){
			
		}
		return false;
	}
	
	public Date GetNextRunTime(Date nowTime, String scheduleID){
		Date nextTime = null;
		try{
			nextTime = scheduler.getTrigger(TriggerKey.triggerKey(scheduleID, "triggerGroup")).getFireTimeAfter(nowTime);
		}
		catch(Exception e){
			
		}		
		return nextTime;
	}
}
