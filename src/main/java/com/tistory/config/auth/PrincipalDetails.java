package com.tistory.config.auth;

import java.util.ArrayList;
import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.tistory.domain.user.User;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@RequiredArgsConstructor
public class PrincipalDetails implements UserDetails {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	
	private final User user;
	
	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {  // 1-7.
		Collection<GrantedAuthority> authorities = new ArrayList<>();
		
		authorities.add(() -> "ROLE_" + user.getRole());
		
		return authorities;
	}

	@Override
	public String getPassword() {  // 1-6.
		return user.getPassword();
	}

	@Override
	public String getUsername() {  // 1-5.
		return user.getUsername();
	}

	@Override
	public boolean isAccountNonExpired() {  // 1-4.
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {  // 1-3.
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {  // 1-2.
		return true;  
	}

	@Override
	public boolean isEnabled() {  // 1-1. 
		
		return true;
	}

}
