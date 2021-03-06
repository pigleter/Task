package com.task.quartz;

import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import com.jfinal.kit.PropKit;

import java.text.SimpleDateFormat;
import java.util.Date;

import org.apache.log4j.Logger;
import org.apache.log4j.MDC;
import org.apache.log4j.PropertyConfigurator;
import org.pentaho.di.core.KettleEnvironment;
import org.pentaho.di.core.database.DatabaseMeta;
import org.pentaho.di.core.logging.KettleLogStore;
import org.pentaho.di.core.logging.LoggingBuffer;
import org.pentaho.di.job.JobMeta;
import org.pentaho.di.repository.Repository;
import org.pentaho.di.repository.RepositoryDirectoryInterface;
import org.pentaho.di.repository.kdr.KettleDatabaseRepository;
import org.pentaho.di.repository.kdr.KettleDatabaseRepositoryMeta;
import org.pentaho.di.job.Job;
import com.task.util.URLUtil;

public class QuartzJob implements org.quartz.Job {
	
	private static Logger logger = Logger.getLogger(QuartzSchedule.class);
	//private static DatabaseMeta dataMeta;
	private DatabaseMeta dataMeta;
	private KettleDatabaseRepositoryMeta kettleDatabaseMeta;
	private KettleDatabaseRepository repository;
	
	static{
		String path = URLUtil.getClassPath(QuartzJob.class) + "/log4j.properties.test";  
		PropertyConfigurator.configure(path);
	}
	
	@Override
	public void execute(JobExecutionContext args) throws JobExecutionException {
		
		try{
			
			String jobDesc = args.getJobDetail().getJobDataMap().getString("jobDesc");
			String jobName = args.getJobDetail().getJobDataMap().getString("jobName");
			String jobPath = args.getJobDetail().getJobDataMap().getString("jobPath");
			
			Date currentTime = new Date();
			SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
			String dateString = formatter.format(currentTime);
			String uniqueJobID = dateString + String.valueOf((long)((Math.random()*9+1)*100000));
			MDC.put("interfaceDesc", jobDesc);
			MDC.put("interfaceName", jobName);
			MDC.put("uniqueJobID", uniqueJobID);
			MDC.put("subType", "S");
			
			logger.info("Kettle作业初始化!");
			System.out.println("Kettle作业初始化!");
			
			MDC.put("subType", "P");
			
			String params[] = null;
			if(args.getJobDetail().getJobDataMap().getString("param") != null){
				params = args.getJobDetail().getJobDataMap().getString("param").split(",");
			}
			
			KettleEnvironment.init();
			dataMeta = new DatabaseMeta(PropKit.get("repositoryName"), PropKit.get("repositoryDatabaseType"), "Native", PropKit.get("ip"), PropKit.get("repositoryDatabase"), PropKit.get("repositoryDatabasePort"), PropKit.get("kettleUser"), PropKit.get("kettlePwd"));
			kettleDatabaseMeta = new KettleDatabaseRepositoryMeta(PropKit.get("repositoryName"), PropKit.get("repositoryName"), PropKit.get("repositoryName"), dataMeta);
			repository = new KettleDatabaseRepository();	
			repository.init(kettleDatabaseMeta);
			repository.connect(PropKit.get("repositoryUser"), PropKit.get("repositoryPwd"));
			RepositoryDirectoryInterface directory = repository.findDirectory(jobPath);
			JobMeta jobMeta = ((Repository)repository).loadJob(jobName, directory, null, null );
			Job job = new Job(repository, jobMeta);
			if(args.getJobDetail().getJobDataMap().getString("param") != null){
				for(int i = 0; i < params.length; i++){
					job.getJobMeta().setParameterValue(params[i].split("=")[0], params[i].split("=")[1]);
				}
			}
			job.start();			
			
			logger.info("Kettle作业开始执行!");
			System.out.println("Kettle作业开始执行!");
			
			job.waitUntilFinished();		
        	
            if(job.getErrors() > 0){
            	
            	LoggingBuffer appender = KettleLogStore.getAppender();
                appender.removeGeneralMessages();
                String logText = appender.getBuffer(job.getLogChannelId(), false).toString();
                logText = logText.replaceAll("\'", "\\\\\'");
                String lineSeparator = System.getProperty("line.separator");
                String[] logs = logText.split(lineSeparator);
                MDC.put("subType", "K");
            	for(int i = 0; i < logs.length; i++){
            		logger.info(logs[i]);
            		System.out.println(logs[i]);
            	}
            	
            	MDC.put("subType", "E");
            	logger.error("Kettle作业执行异常!"); 
            	System.out.println("Kettle作业执行异常!");
            	
            }
            else{
            	MDC.put("subType", "E");
            	logger.info("Kettle作业执行成功!");
            	System.out.println("Kettle作业执行成功!");
            }            
            
		}
		catch(Exception e){	
			MDC.put("subType", "E");
			logger.error("Kettle作业启动异常！");
			logger.error(e.getMessage());
			System.out.println("Kettle作业启动异常！");
			System.out.println(e.getMessage());
			throw (JobExecutionException)e;
		}
		finally{
			if(repository.isConnected()){
				repository.disconnect();
				dataMeta.getConnectionProperties().clear();
			}
		}
		
		

	}

}
