package com.tistory.domain.user;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

	// 1-1. JPA Query Method
	Optional<User> findByUsername(String username);
	
	User findUserById(Long userId);
		
}
