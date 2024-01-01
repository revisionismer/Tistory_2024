package com.tistory.util;

import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.tistory.dto.ResponseDto;
import com.fasterxml.jackson.databind.ObjectMapper;

public class CustomResponseUtil {  // 2023-06-01 : 여기까지
	
	private static final Logger log = LoggerFactory.getLogger(CustomResponseUtil.class);

	public static void unAuthentication(HttpServletResponse response, String message) {
		ObjectMapper om = new ObjectMapper();  // 1-1. json 형태로 만들기 위해 ObjectMapper 생성
		
		ResponseDto<?> responseDto = new ResponseDto<>(-1, message, null);  // 1-2. 응답 dto로 틀 만든다.
		
		try {
			String responseBody = om.writeValueAsString(responseDto);  // 1-3. 응답 Dto를 jsonString으로 변환
		
			response.setContentType("application/json; charset=utf-8");  // 1-4. response 타입을 json으로 
			response.setStatus(401);  // 1-5. httpstatus code 401 등록
			response.getWriter().print(responseBody);  // 1-6. 1-3을 response 객체에 장착
		}catch (Exception e) {
			log.error("서버 파싱 에러");
		}
	}
	
	public static void unAuthorization(HttpServletResponse response, String message) {
		ObjectMapper om = new ObjectMapper();  
		
		ResponseDto<?> responseDto = new ResponseDto<>(-1, message, null);
		
		try {
			String responseBody = om.writeValueAsString(responseDto); 
		
			response.setContentType("application/json; charset=utf-8"); 
			response.setStatus(403);  
			response.getWriter().print(responseBody);  
		}catch (Exception e) {
			log.error("서버 파싱 에러");
		}
	}
}
