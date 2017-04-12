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

public class MainConfig extends JFinalConfig {

	@Override
	public void configConstant(Constants me) {
		me.setViewType(ViewType.JSP);
		PropKit.use("config.properties");
	}

	@Override
	public void configRoute(Routes me) {
		me.add("/", TaskController.class);
	}

	@Override
	public void configPlugin(Plugins me) {
		C3p0Plugin C3p0Plugin = new C3p0Plugin(PropKit.get("jdbcUrl"), PropKit.get("user"), PropKit.get("password"));
		ActiveRecordPlugin arp = new ActiveRecordPlugin(C3p0Plugin);
		arp.setShowSql(true);
		arp.addMapping("z_interface", Interface.class);
		arp.addMapping("z_datasource", Datasource.class);
		arp.addMapping("z_schedule", Schedule.class);
		me.add(C3p0Plugin);
		me.add(arp);
	}

	@Override
	public void configInterceptor(Interceptors me) {

	}

	@Override
	public void configHandler(Handlers me) {
		
	}
	
	public static void main(String[] args) {
		//JFinal.start("WebRoot", 8080, "/", 5);
	}

}
