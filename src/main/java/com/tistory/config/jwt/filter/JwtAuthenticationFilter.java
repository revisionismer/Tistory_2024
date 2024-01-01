package com.tistory.config.jwt.filter;

import java.io.IOException;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tistory.config.auth.PrincipalDetails;
import com.tistory.config.jwt.JwtProperties;
import com.tistory.config.jwt.dto.SignInDto;
import com.tistory.config.jwt.service.JwtService;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

// 1-1. 스프링 시큐리티에 있는 UsernamePasswordAuthenticationFilter를 상속받는다. 이 필터는 Post방식으로 /login이라는 요청이 왔을때 동작한다.
@Slf4j
public class JwtAuthenticationFilter extends UsernamePasswordAuthenticationFilter {
	
	private static String secretKey = JwtProperties.SECRET_KEY;
	
	byte[] secretKeyBytes = secretKey.getBytes();	
	
	// 1-2. 
	private AuthenticationManager authenticationManager;
	
	private JwtService jwtService;
	
	public JwtAuthenticationFilter(AuthenticationManager authenticationManager, JwtService jwtService) {
		this.authenticationManager = authenticationManager;
		this.jwtService = jwtService;
	}
	
	// 1-3. 기본적으로 /login 요청이 post로 왔을때 실행되는 함수. 
	@Override
	public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
			throws AuthenticationException {
		
		System.out.println("JwtAuthenticationFilter : 로그인 시도중");
		
		// 1-4. username, password를 전달 받아 수행
		try {
			log.info("JwtAuthenticationFilter : 인증 처리 중");
			// 1-6. ObjectMapper 이용 -> JSON 데이터 파싱해주는 객체
			ObjectMapper om = new ObjectMapper();
						
			// 1-7. 먼저 username과 password 값을 받을 SignInDto를 생성해서 inputStream에서 SignInDto.class 형태로 받는다.
			SignInDto dto = om.readValue(request.getInputStream(), SignInDto.class);
			
			System.out.println(dto.getUsername() + ", " + dto.getPassword());	
			
			// 1-8. 토큰 만들기(강제 로그인)
			UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(dto.getUsername(), dto.getPassword());
						
			// 1-9. 로그인 시도를 하면 authenticationManager를 통해 1-8에서 만든 토큰으로 authenticate(인증)을 수행하며 완료된 후  PrincipalDetailsService.loadUserByUsername 메소드가 호출이된다.
			Authentication authentication = authenticationManager.authenticate(authenticationToken);
			
			// 1-10. 1-9가 정상적으로 수행되면 PrincipalDetails 객체가 생성되고 authentication에서 꺼낸다.
			PrincipalDetails principalDetails = (PrincipalDetails)authentication.getPrincipal();
						
			// 1-11. 출력이 되면 로그인이 되었다는 뜻
			System.out.println("로그인 완료됨 : "  + principalDetails.getUsername());
					
			System.out.println("==================================================");
						
			// 1-12. 권한 관리를 위해 세션이 담긴 authentication 객체 return(인증 완료)
			return authentication;
						
		} catch (Exception e) {
			throw new InternalAuthenticationServiceException(e.getMessage());  // 1-5. SecurityConfig에 설정해놓은 authenticationEntryPoint에 걸린다.
		}
	}
	
	// 1-14. 인증이 정상적으로 완료되었으면 successfulAuthentication 메소드가 실행된다.
	@Override
	protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain,
			Authentication authResult) throws IOException, ServletException {
		// 1-15. 인증이 완료되면 JWT 토큰을 만들어서 request를 요청한 사용자에게 JWT토큰을 return해주면 된다.
		System.out.println("인증 성공");
		
		// 1-16. 인증이 완료된 Authentication형 authResult에서 PrincipalDetails 객체를 가져온다.
		PrincipalDetails principalDetails = (PrincipalDetails)authResult.getPrincipal();
		
		// 1-17. JWT 토큰 만들기 1 : Header값 생성
		Map<String, Object> headers = new HashMap<>();
		headers.put("typ", "JWT");
		headers.put("alg", "HS256");
		
		// 1-18. JWT 토큰 만들기 2 : claims 부분 설정(토큰 안에 담을 내용)
		Map<String, Object> claims = new HashMap<>();;
		claims.put("id", principalDetails.getUser().getId());
		claims.put("username", principalDetails.getUser().getUsername());
		claims.put("role", principalDetails.getUser().getRole());
		
		// 1-19. JWT 토큰 만들기 3 : 만료 시간 설정(Access token) ->  1000 * 60L * 60L * 1 = 1시간, 500 * 60L * 60L * 1 = 30분
		Long expiredTime = 1000 * 60L * 60L * 1;
//		Long expiredTime = 8 * 60L * 60L * 1;
		
		Date date = new Date();
		date.setTime(date.getTime() + expiredTime);
		
		System.out.println("access_token 만료일자 : " + date);
		
		// 1-20. JWT 토큰 만들기 4 : hmacSha 형식 key 만들기 
		Key key = Keys.hmacShaKeyFor(secretKeyBytes);
	
		// 1-21. JWT 토큰 Builder : access_token
		String access_token = Jwts.builder()
				.setHeader(headers) 
				.setClaims(claims)
				.setSubject("access_token by jhpark")
				.setExpiration(date)
				.signWith(key, SignatureAlgorithm.HS256)
				.compact();
		
		System.out.println("access_token = " + access_token);	
		
		// 1-22. JWT 토큰 Builder : refresh token -> expiredTime을 24시간보다 약간 크게 설정함.
		expiredTime *= 23;
		expiredTime += 100000;
		date.setTime(System.currentTimeMillis() + expiredTime);
		
		String refresh_token = Jwts.builder()
				.setHeader(headers) 
				.setSubject("refresh_token by jhpark")
				.setExpiration(date)
				.signWith(key, SignatureAlgorithm.HS256)
				.compact();
		
		System.out.println("refresh_token = " + refresh_token);
		
		// 1-23. refresh token 저장.
		jwtService.setRefreshToken(principalDetails.getUser().getUsername(), refresh_token);		
		
		// 1-24. JWT 토큰 response header에 담음(주의 : Bearer 다음에 한칸 띄우고 저장해야함)
		response.addHeader(JwtProperties.HEADER_STRING, JwtProperties.TOKEN_PREFIX + access_token);
		
		// 1-25. access_token 쿠키에 저장.
		Cookie cookie = new Cookie("access_token", access_token);
		
		// 1-26. 쿠키는 항상 도메인 주소가 루트("/")로 설정되어 있어야 모든 요청에서 사용 가능.
		cookie.setPath("/");
		cookie.setSecure(true);
	
		response.addCookie(cookie);
		
		// 1-27. 로그인 성공시 응답 객체 만들어 주기 1 : response객체 기본 세팅
		response.setContentType("application/json");
		response.setCharacterEncoding("utf-8");
		
		// 1-28. 응답해줄 Map형태의 객체
		Map<String, Object> responseData = new HashMap<>();
		
		// 1-29. 응답 데이터 셋팅
		responseData.put("code", 1);
		responseData.put("message", "jwt 인증 성공");
		responseData.put("username", principalDetails.getUser().getUsername());
		responseData.put("role", principalDetails.getUser().getRole());
		
		// 1-30. ObjectMapper를 이용해 json형태의 String으로 변환
		String result = new ObjectMapper().writeValueAsString(responseData);
		
		// 1-31. response에 write
		response.getWriter().write(result);
		
		log.info("successfulAuthentication 종료");
	}
	
	// 2-1. 로그인 실패시 처리(Custom)
	@Override
	protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response,
			AuthenticationException failed) throws IOException, ServletException {

		response.setContentType("application/json");
		response.setCharacterEncoding("utf-8");
		response.setStatus(HttpStatus.UNAUTHORIZED.value());
		
		// 2-2. 응답해줄 Map형태의 객체
		Map<String, Object> responseData = new HashMap<>();
		
		// 2-3. 응답 데이터 셋팅 -> 2023-10-05 : Custom 로그인 실패처리 message 내용 변경 ex) 인증 실패 -> 아이디와 비밀번호를 확인해주세요.
		responseData.put("code", -1);
		responseData.put("message", "아이디와 비밀번호를 확인해주세요.");
		
		// 2-4. ObjectMapper를 이용해 json형태의 String으로 변환
		String result = new ObjectMapper().writeValueAsString(responseData);
		
		// 2-5. response에 write
		response.getWriter().write(result);
	}
}
