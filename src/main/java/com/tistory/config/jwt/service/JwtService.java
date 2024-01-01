package com.tistory.config.jwt.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Calendar;
import java.util.Date;
import java.util.Optional;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tistory.config.jwt.JwtProperties;
import com.tistory.domain.user.User;
import com.tistory.domain.user.UserRepository;
import com.tistory.dto.ResponseDto;
import com.tistory.handler.exception.CustomApiException;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional
@Data
@Slf4j
public class JwtService {
	
	private final UserRepository userRepository;

	private static String secretKey = JwtProperties.SECRET_KEY;
	
	byte[] secretKeyBytes = secretKey.getBytes();
	
	// 1-1. refresh token setting
	public void setRefreshToken(String username, String refreshToken) {
		
		log.info("refresh token 로그인 유저에 셋팅");
		
		Optional<User> userOp = userRepository.findByUsername(username);
		
		if(userOp.isPresent()) {
			
			User findUser = userOp.get();
			findUser.setRefreshToken(refreshToken);
			findUser.setUpdatedAt(LocalDateTime.now());
			
			userRepository.save(findUser);
			
		} else {
			throw new CustomApiException("Refresh Token update error");
		}
	}
	
	// 1-2. 토큰의 유효성 및 만료일자 확인
	public boolean validationToken(String jwtToken) {
        try {
        	Jwts.parserBuilder().setSigningKey(secretKeyBytes).build().parseClaimsJws(jwtToken);
            return true;
        } catch (SecurityException | MalformedJwtException e) {
            log.error("잘못된 Jwt 서명입니다.");
          
        } catch (ExpiredJwtException e) {
            log.error("만료된 토큰입니다.");

        } catch (UnsupportedJwtException e) {
            log.error("지원하지 않는 토큰입니다.");
           
        } catch (IllegalArgumentException e) {
            log.error("잘못된 토큰입니다.");
          
        }
        return false;
    }
	
	// 1-3.
	public void sendErrorResponse(HttpServletResponse response, String message) throws IOException {

		ObjectMapper objectMapper = new ObjectMapper();
		
		String result = objectMapper.writeValueAsString(new ResponseDto<>(1, message, null));
		
		response.setCharacterEncoding("UTF-8");
		response.setStatus(HttpStatus.UNAUTHORIZED.value());
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		
		response.getWriter().write(result);
	}
	
	public void sendErrorResponseByExpires(HttpServletResponse response, String message) throws IOException {

		ObjectMapper objectMapper = new ObjectMapper();
		
		String result = objectMapper.writeValueAsString(new ResponseDto<>(1, message, null));
		
		response.setCharacterEncoding("UTF-8");
		response.setStatus(HttpStatus.UNAUTHORIZED.value());
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		
		Cookie cookie = new Cookie("access_token", null);
		cookie.setMaxAge(0);
		
		response.addCookie(cookie);
		
		response.getWriter().write(result);
	}
	
	// 1-4.
	public boolean isNeedToUpdateAccessToken(String access_token) {
		try {
			Date expiresAt = Jwts.parserBuilder().setSigningKey(secretKeyBytes).build().parseClaimsJws(access_token).getBody().getExpiration();
			
			Date current_date = new Date(System.currentTimeMillis());
			
			Calendar calendar = Calendar.getInstance();
			calendar.setTime(current_date);
			calendar.add(Calendar.DATE, 2);
			
			Date after1dayFromToday = calendar.getTime();
			
			if(expiresAt.before(after1dayFromToday)) {
				log.info("access_token 만료 예정 일 : " + after1dayFromToday);
				return true;
			}
		} catch (CustomApiException e) {
			return true;
		}
		
		return false;
	}
	
	public void logout(HttpServletRequest request, HttpServletResponse response) {
		// 2-2. HttpServletRequest에서 쿠키 값들 가져온다.
		Cookie[] cookies = request.getCookies();
		
		if(cookies != null) {
			// 2-3. 쿠키를 for문으로 하나하나 돌려서
			for(Cookie cookie : cookies) {
				// 2-4. access_token이라는 쿠키가 있다면
				if(cookie.getName().equals("access_token")) {
					// 2-5. 쿠키에서 access_token 값 String으로 가져온다.
					String access_token = cookie.getValue().toString();
					
					try {
						// 2-6. access_token에 들어있는 username 값을 가져온다.
						String username = (String) Jwts.parserBuilder().setSigningKey(secretKeyBytes).build().parseClaimsJws(access_token).getBody().get("username");
						
						// 2-7. 해당 username으로 DB에서 해당 user를 찾는다. 
						Optional<User> userOp = userRepository.findByUsername(username);
						
						// 2-8. 해당 user가 DB에 존재하면
						if(userOp.isPresent()) {
							// 2-9. 해당 member get
							User findUser = userOp.get();
							
							// 2-10. 찾아온 멤버에 저장된 refresh_token 값을 null로 초기화해주고
							findUser.setRefreshToken(null);
							
							// 2-11. update 시킨다.
							userRepository.save(findUser);
						}
						
						// 2-12. access_token 쿠키 제거
						cookie.setMaxAge(0);
						// 2-13. HttpServletResponse에 maxAge가 0인 access_token 쿠키 장착(쿠키 소멸)
						response.addCookie(cookie);
						
					} catch (ExpiredJwtException e) {
						// 2-14. 로그아웃 진행시 토큰이 만료되어서 ExpiredJwtException이 터져도 쿠키 제거
						cookie.setMaxAge(0);
						response.addCookie(cookie);
					
					} catch (IllegalArgumentException e) {
						// 2-15. 쿠키 값을 수동으로 지워도 쿠키값을 지우고 로그아웃 진행.
						cookie.setMaxAge(0);
						response.addCookie(cookie);
						
					}
				}
			}
		} 
	}
	
}
