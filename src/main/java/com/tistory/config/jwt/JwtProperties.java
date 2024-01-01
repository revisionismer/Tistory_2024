package com.tistory.config.jwt;

/*
 *  주의 : SECRET_KEY는 외부로 노출시키면 안된다.(이렇게 파일로 노출하는건 비추)
 */
public interface JwtProperties {
	
	public static final String SECRET_KEY = "ca4f77187e7e4f23a7fa2c67c020e4d7";  // 1-1 HS256 : 나중에 변경 
	public static final Long EXPIRATION_TIME = 1000 * 60L * 60L * 1L;  // 1-2. 만료시간
	public static final String TOKEN_PREFIX = "Bearer ";  // 1-3. 토큰 앞에 붙는 문자
	public static final String HEADER_STRING = "Authorization";  // 1-4.
	public static final String HEADER_REFRESH_STRING = "Authorization-refresh";  // 1-5.
	
}
