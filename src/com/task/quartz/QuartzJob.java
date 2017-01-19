package com.task.quartz;

import java.util.Date;

import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

public class QuartzJob implements Job {

	@Override
	public void execute(JobExecutionContext arg0) throws JobExecutionException {
		
		String jobName = arg0.getJobDetail().getJobDataMap().getString("jobName");
		
		System.out.println(jobName + new Date());

	}

}
