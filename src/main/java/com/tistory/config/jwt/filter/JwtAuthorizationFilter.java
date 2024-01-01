package com.tistory.config.jwt.filter;

import java.io.IOException;
import java.security.Key;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;

import com.tistory.config.auth.PrincipalDetails;
import com.tistory.config.jwt.JwtProperties;
import com.tistory.config.jwt.service.JwtService;
import com.tistory.domain.user.User;
import com.tistory.domain.user.UserRepository;
import com.tistory.handler.exception.CustomApiException;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class JwtAuthorizationFilter extends BasicAuthenticationFilter { // 1-1. BasicAuthenticationFilter 상속

	private static String secretKey = JwtProperties.SECRET_KEY;
	
	byte[] secretKeyBytes = secretKey.getBytes();
	
	private UserRepository userRepository;
	
	private JwtService jwtService;
	
	// 1-2. 생성자 
	public JwtAuthorizationFilter(AuthenticationManager authenticationManager, UserRepository userRepository, JwtService jwtService) {
		super(authenticationManager);
		this.userRepository = userRepository;
		this.jwtService = jwtService;
		
	}
	
	// 1-3. doFilter Overriding
	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
			throws IOException, ServletException {
		
		try {
			
			// 1-4. jwt 헤더 스트링 값을 request에서 뽑아본다.
			String jwtHeader = request.getHeader(JwtProperties.HEADER_STRING);
			
			// 1-5. JWT 토큰을 검증해서 header 값이  있는지 확인하고 있다면 Bearer로 시작하는지까지 체킹한다.
			if(jwtHeader == null || !jwtHeader.startsWith(JwtProperties.TOKEN_PREFIX)) {
				// 1-6. 1-4이라면 필터를 계속 타게 한다.
				chain.doFilter(request, response);
				return;
			}
			
			// 1-7. 1-6을 거쳐서 넘어왔으면 jwtHeader에 Bearer + accessToken 값이 넘어 올텐데 거기서 Bearer란 단어를 제외하고 문자를 가져온다.
			String access_token = request.getHeader(JwtProperties.HEADER_STRING).replace(JwtProperties.TOKEN_PREFIX, "");
			
			System.out.println("doFilter access_token : " + access_token);
			
			System.out.println("access_token : " + access_token);
			
			// 1-8. secret key로 accessToken에 담겨있는 username 정보를 파싱해 가져온다.
			String username = Jwts.parserBuilder().setSigningKey(secretKeyBytes).build().parseClaimsJws(access_token).getBody().get("username", String.class);
			
			// 1-9. 서명이 정상적으로 되었다면 username가 null이 아님
			if(username != null) {
				System.out.println("================= 서명 정상적으로 됨 ==================");
				
				// 1-10. username이 null이 아니라면 DB에서 찾아본다.(Optional)
				Optional<User> userOp = userRepository.findByUsername(username);
				
				// 1-11. 해당 유저가 존재한다면
				if(userOp.isPresent()) {
					// 1-12.  get
					User findUser = userOp.get();
					
					// 1-13. 찾아온 User 객체를 PrincipalDetails로 감싼다.
					PrincipalDetails principalDetails = new PrincipalDetails(findUser);
					
					System.out.println("username : " + principalDetails.getUser().getUsername());
					
					// 1-14. 스프링 시큐리티에서 받아서 사용할 수 있게 Collection<GrantedAuthority> 형인 authorities 선언
					Collection<GrantedAuthority> authorities = new ArrayList<>();
					
					// 1-15. authorities에 GrantedAuthority 형태로 권한 이름을 저장한다.
					authorities.add(new GrantedAuthority() {
						
						/**
						 * 
						 */
						private static final long serialVersionUID = 1L;

						@Override
						public String getAuthority() {
							return "ROLE_" + findUser.getRole();	
						}
					});
					
					// 1-16. 저장된 권한 출력해 보기.
					authorities.forEach(role -> {
						System.out.println(role.getAuthority());
					});
					
					// 1-17. 토큰이 null인지 유효한지 한번 검증
					if(access_token != null && jwtService.validationToken(access_token)) {
						// 1-18. JWT 토큰 서명을 통해서 서명이 정상일때 만들어지는 가짜 인증(Authentication) 객체  -> 두번째 인자 값(패스워드)는 null => username값이 null이 아니기 때문에 가능.
						Authentication authentication = new UsernamePasswordAuthenticationToken(principalDetails, null, authorities);
					
						// 1-19. SecurityContextHolder.getContext() -> 세션 공간, 세션 공간에 1-19에서 가져온 가짜 인증 객체를 넣어준다.
						SecurityContextHolder.getContext().setAuthentication(authentication);
					}
					
					// 1-20. 로그인시 생성되어 db 저장된  refresh token 값을 가져온다.
					String db_refresh_token = findUser.getRefreshToken();
					
					// 1-21. 리프레시 토큰이 유효한 토큰인지 검증하는 로직
					if(!jwtService.validationToken(db_refresh_token)) {
						throw new CustomApiException("로그인을 다시해주세요.");
					}
					
					// 1-22. access_token이 만료되었거나 만료되기 1일전이라면 -> (거의 모든 요청마다 access_token은 재발급) 
					if(jwtService.isNeedToUpdateAccessToken(access_token) || !jwtService.validationToken(access_token)) {
						log.info("엑세스 토큰 재발급하기");
						// 1-24. access 토큰 재발급
						System.out.println("엑세스 토큰 재발급 해야된다.");
							
						// 1-25. JWT 토큰 만들기 1 : Header값 생성
						Map<String, Object> headers = new HashMap<>();
						headers.put("typ", "JWT");
						headers.put("alg", "HS256");
							
						// 1-26. JWT 토큰 만들기 2 : claims 부분 설정(토큰 안에 담을 내용)
						Map<String, Object> claims = new HashMap<>();
						claims.put("id", principalDetails.getUser().getId());
						claims.put("username", principalDetails.getUser().getUsername());
						claims.put("role", principalDetails.getUser().getRole());
							
						// 1-27. JWT 토큰 만들기 3 : 만료 시간 설정(Access token) ->  1000 * 60L * 60L * 1 = 1시간, 500 * 60L * 60L * 1 = 30분
						Long expiredTime = 1000 * 60L * 60L * 1;
//						Long expiredTime = 8 * 60L * 60L * 1;

						Date date = new Date();
						date.setTime(date.getTime() + expiredTime);
							
						System.out.println("access_token 만료일자 : " + date);
							
						// 1-28. JWT 토큰 만들기 4 : hmacSha 형식 key 만들기
						Key key = Keys.hmacShaKeyFor(secretKeyBytes);
						
						// 1-29. JWT 토큰 Builder : access_token
						access_token = Jwts.builder()
								.setHeader(headers) 
								.setClaims(claims)
								.setSubject("access_token by jhpark")
								.setExpiration(date)
								.signWith(key, SignatureAlgorithm.HS256)
								.compact();
							
						System.out.println("access_token = " + access_token);
							
						// 1-30. header에 새로운 access_token 장착
						response.addHeader(JwtProperties.HEADER_STRING, JwtProperties.TOKEN_PREFIX + access_token);
						
						// 1-31. 1-29에서 만든 새로운 access_token로 쿠키 생성 하고 편집 못하게 암호화.
						Cookie cookie = new Cookie("access_token", access_token);
						
						// 1-32. 쿠키는 항상 도메인 주소가 루트("/")로 설정되어 있어야 모든 요청에서 사용 가능.
						cookie.setPath("/");
						cookie.setSecure(true);
						
						System.out.println("cookie : " + cookie.getValue());
						
						// 1-33. 응답 객체에 새로 생성된 쿠키 장착.
						response.addCookie(cookie);
						
						System.out.println("새로운 쿠키 셋팅!!!");
					}
					
					// 1-34. 다시 체인을 타게한다.
					chain.doFilter(request, response);
				}
			}
			
		} catch (SignatureException | MalformedJwtException e) {
            log.error("잘못된 Jwt 서명입니다.");
            jwtService.sendErrorResponse(response, "잘못된 jwt 서명입니다.");
          
        } catch (ExpiredJwtException e) {
            log.error("만료된 토큰입니다. 로그인을 다시 해주세요.");
            jwtService.sendErrorResponse(response, "만료된 토큰입니다. 로그인을 다시 해주세요.");

        } catch (UnsupportedJwtException e) {
            log.error("지원하지 않는 토큰입니다.");
            jwtService.sendErrorResponse(response, "지원하지 않는 토큰입니다.");
           
        } catch (IllegalArgumentException e) {
            log.error("잘못된 토큰입니다.");
            jwtService.sendErrorResponse(response, "잘못된 토큰입니다.");
        } 
	}

}
