package com.task.managerment;

import com.jfinal.config.Constants;
import com.jfinal.config.Handlers;
import com.jfinal.config.Interceptors;
import com.jfinal.config.JFinalConfig;
import com.jfinal.config.Plugins;
import com.jfinal.config.Routes;
//import com.jfinal.core.JFinal;
import com.jfinal.kit.PropKit;
import com.jfinal.plugin.activerecord.ActiveRecordPlugin;
import com.jfinal.plugin.c3p0.C3p0Plugin;
import com.jfinal.render.ViewType;
import com.task.managerment.model.Datasource;
import com.task.managerment.model.Interface;
import com.task.managerment.model.Schedule;
import com.task.managerment.model.JobLog;

public class MainConfig extends JFinalConfig {

	@Override
	public void configConstant(Constants me) {
		me.setViewType(ViewType.JSP);
		PropKit.use("config.properties.test");
		System.out.print("Constants");
	}

	@Override
	public void configRoute(Routes me) {
		me.add("/", TaskController.class);
		System.out.print("Routes");
	}

	@Override
	public void configPlugin(Plugins me) {
		C3p0Plugin C3p0Plugin = new C3p0Plugin(PropKit.get("jdbcUrl"), PropKit.get("user"), PropKit.get("password"));
		ActiveRecordPlugin arp = new ActiveRecordPlugin(C3p0Plugin);
		arp.setShowSql(true);
		arp.addMapping("z_task_datasource", Datasource.class);
		arp.addMapping("z_task_interface", Interface.class);		
		arp.addMapping("z_task_schedule", Schedule.class);
		arp.addMapping("z_task_joblog", JobLog.class);
		me.add(C3p0Plugin);
		me.add(arp);
		
		System.out.print("Plugins");
		
	}

	@Override
	public void configInterceptor(Interceptors me) {
		System.out.print("Interceptors");
	}

	@Override
	public void configHandler(Handlers me) {
		System.out.print("Handlers");
	}
	
	@Override
	public void afterJFinalStart() {
		// TODO Auto-generated method stub
		super.afterJFinalStart();
		
		try {
			TaskRestart.restartActiveSchedules();
			System.out.print("批量启动调度成功！");
		}
		catch (Exception e) {
			System.out.print("批量启动调度异常！" + e.getMessage());
		}
	}
	
	public static void main(String[] args) {
		//JFinal.start("WebRoot", 8080, "/", 5);
		System.out.print("main");
		
	}

}
