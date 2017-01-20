package com.task.quartz;

import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.pentaho.di.core.KettleEnvironment;
import org.pentaho.di.job.JobMeta;
import org.pentaho.di.job.Job;

public class QuartzJob implements org.quartz.Job {
	@Override
	public void execute(JobExecutionContext args) throws JobExecutionException {
		
		try{
			String jobName = args.getJobDetail().getJobDataMap().getString("jobName");	
			if(!jobName.substring(jobName.length() - 3, jobName.length()).toLowerCase().equals(".kjb")){
				jobName = jobName + ".kjb";
			}
			String jobPath = "C:\\Users\\ivan.yu\\Desktop\\" + jobName;
			String params[] = null;
			if(args.getJobDetail().getJobDataMap().getString("param") != null){
				params = args.getJobDetail().getJobDataMap().getString("param").split(",");
			}
			
			KettleEnvironment.init();
			JobMeta jobMeta = new JobMeta(jobPath, null);
			Job job = new Job(null, jobMeta);
			if(args.getJobDetail().getJobDataMap().getString("param") != null){
				for(int i = 0; i < params.length; i++){
					job.getJobMeta().setParameterValue(params[i].split("=")[0], params[i].split("=")[1]);
				}
			}
			job.start();
			job.waitUntilFinished();
            if(job.getErrors() > 0){
                throw new Exception("Kettle作业运行异常！");
            }
		}
		catch(Exception e){		
			e.printStackTrace();
			throw (JobExecutionException)e;
		}
		
		

	}

}
