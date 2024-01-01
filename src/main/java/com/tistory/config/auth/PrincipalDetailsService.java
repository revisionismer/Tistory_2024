package com.tistory.config.auth;

import java.util.Optional;

import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.tistory.domain.user.User;
import com.tistory.domain.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PrincipalDetailsService implements UserDetailsService {
	
	private final UserRepository userRepository;
	
	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		
		Optional<User> userOp = userRepository.findByUsername(username);
		
		if(userOp.isPresent()) {
			User userPS = userOp.get();
			
			return new PrincipalDetails(userPS);
		} else {
			throw new InternalAuthenticationServiceException("아이디 비밀번호를 확인해주세요.");
		} 
		
		/*
		 * 
		  	User userPS = userRepository.findByUsername(username).orElseThrow(() -> {
				throw new InternalAuthenticationServiceException("인증 실패");
			});
		
			return new PrincipalDetails(userPS);
			
			--> 요 방식은 gradlew build때 오류남.
		 */
	}
	

}
