package com.tistory.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {  // 1-1. 

	@Value("${file.path}")
	private String uploadFolder;
	
	@Value("${thumnail.path}")
	private String thumnailFolder;
	
	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		registry.addResourceHandler("/upload/**")  // 1-2. /upload/** 패턴으로 정적 리소스 파일 요청이 오면
				.addResourceLocations("file:///" + uploadFolder)  // 1-3. 내 pc경로를 찾기 위해 file:///를 붙여주고 application.properties에 등록된 file.path 경로로 바꿔서 더해준다.
				.setCachePeriod(60*10*6)  // 1-4. 캐싱 기간 설정 : 60초 * 10 = 600초 = 10분, * 6을 하면 60분 = 1시간
				.resourceChain(true)  // 1-5. resourceChain 발동
				.addResolver(new PathResourceResolver()); // 1-6. PathResourceResolver를 등록
		
		registry
				.addResourceHandler("/thumnail/**")  // 1-7. /thumnail/** 패턴으로 요청이 오면
				.addResourceLocations("file:///" + thumnailFolder)  // 1-8. 1-7 경로로 오면 application.properties에 등록된 thumnail.path 경로로 바꿔준다.
				.setCachePeriod(60*10*6)   // 1-9. 60초 * 10 = 600초 = 10분, * 6을 하면 60분 = 1시간 
				.resourceChain(true)  // 1-10. true = 발동
				.addResolver(new PathResourceResolver()); // 1-11. 등록
	}
}
