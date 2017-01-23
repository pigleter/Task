package com.task.quartz;

import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import com.jfinal.kit.PropKit;

import org.pentaho.di.core.KettleEnvironment;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.job.JobMeta;
import org.pentaho.di.repository.Repository;
import org.pentaho.di.repository.RepositoryDirectoryInterface;
import org.pentaho.di.repository.kdr.KettleDatabaseRepository;
import org.pentaho.di.repository.kdr.KettleDatabaseRepositoryMeta;
import org.pentaho.di.job.Job;

public class QuartzJob implements org.quartz.Job {
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
			KettleDatabaseRepository repository = new KettleDatabaseRepository();
			DatabaseMeta dataMeta = new DatabaseMeta("kettle_dev_for_api", "Oracle", "Native", PropKit.get("ip"), "wmprd", "1521", PropKit.get("kettleUser"), PropKit.get("kettlePwd"));
			KettleDatabaseRepositoryMeta kettleDatabaseMeta = new KettleDatabaseRepositoryMeta("kettle_dev_for_api", "kettle_dev_for_api", "kettle_dev_for_api", dataMeta);
			repository.init(kettleDatabaseMeta);
			repository.connect(PropKit.get("repositoryUser"), PropKit.get("repositoryPwd"));
			RepositoryDirectoryInterface directory = repository.findDirectory("/");
			JobMeta jobMeta = ((Repository)repository).loadJob(jobName, directory, null, null );
			Job job = new Job(repository, jobMeta);
//			JobMeta jobMeta = new JobMeta(jobPath, null);
//			Job job = new Job(null, jobMeta);
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
