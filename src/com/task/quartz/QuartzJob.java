package com.task.quartz;

import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import com.jfinal.kit.PropKit;

import org.apache.log4j.Logger;
import org.pentaho.di.core.KettleEnvironment;
import org.pentaho.di.job.JobMeta;
import org.pentaho.di.repository.Repository;
import org.pentaho.di.repository.RepositoryDirectoryInterface;
import org.pentaho.di.repository.filerep.KettleFileRepository;
import org.pentaho.di.repository.filerep.KettleFileRepositoryMeta;
import org.pentaho.di.job.Job;

public class QuartzJob implements org.quartz.Job {
	
	private static Logger logger = Logger.getLogger(QuartzSchedule.class);
	@Override
	public void execute(JobExecutionContext args) throws JobExecutionException {
		
		try{
			PropKit.use("config.properties");
			String jobName = args.getJobDetail().getJobDataMap().getString("jobName");	
//			if(!jobName.substring(jobName.length() - 3, jobName.length()).toLowerCase().equals(".kjb")){
//				jobName = jobName + ".kjb";
//			}
//			String jobPath = "C:\\Users\\ivan.yu\\Desktop\\" + jobName;
			String params[] = null;
			if(args.getJobDetail().getJobDataMap().getString("param") != null){
				params = args.getJobDetail().getJobDataMap().getString("param").split(",");
			}
			
			KettleEnvironment.init();
			KettleFileRepositoryMeta repinfo = new KettleFileRepositoryMeta("KettleFileRepository","KettleFileRepository","KettleFileRepository","file:///C:/Users/ivan.yu/KettleFileRepository");
			KettleFileRepository rep = new KettleFileRepository();
			rep.init(repinfo);
//			KettleDatabaseRepository repository = new KettleDatabaseRepository();
//			DatabaseMeta dataMeta = new DatabaseMeta("kettle_dev_for_api", "Oracle", "Native", PropKit.get("ip"), "wmprd", "1521", PropKit.get("kettleUser"), PropKit.get("kettlePwd"));
//			KettleDatabaseRepositoryMeta kettleDatabaseMeta = new KettleDatabaseRepositoryMeta("kettle_dev_for_api", "kettle_dev_for_api", "kettle_dev_for_api", dataMeta);
//			repository.init(kettleDatabaseMeta);
//			repository.connect(PropKit.get("repositoryUser"), PropKit.get("repositoryPwd"));
			RepositoryDirectoryInterface directory = rep.findDirectory("/");
//			JobMeta jobMeta = ((Repository)repository).loadJob(jobName, directory, null, null );
			JobMeta jobMeta = ((Repository)rep).loadJob(jobName, directory, null, null);
			Job job = new Job(rep, jobMeta);
//			JobMeta jobMeta = new JobMeta(jobPath, null);
//			Job job = new Job(null, jobMeta);
			if(args.getJobDetail().getJobDataMap().getString("param") != null){
				for(int i = 0; i < params.length; i++){
					job.getJobMeta().setParameterValue(params[i].split("=")[0], params[i].split("=")[1]);
				}
			}
			job.start();
			logger.info("Kettle作业开始执行!");
			job.waitUntilFinished();
			logger.info("Kettle作业执行完成!");
            if(job.getErrors() > 0){
            	logger.error("Kettle作业执行异常!");
                throw new Exception("Kettle作业执行异常！");
            }
		}
		catch(Exception e){		
			e.printStackTrace();
			logger.error("Kettle作业执行异常！" + e.getMessage());
			throw (JobExecutionException)e;
		}
		
		

	}

}
