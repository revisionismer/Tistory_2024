package com.tistory.domain.love;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LoveRepository extends JpaRepository<Love, Long> {

	@Query(value = "SELECT * FROM love_tb WHERE pageOwnerId = :pageOwnerId AND userId = :userId AND postId = :postId", nativeQuery = true)
    Optional<Love> mFindByUserIdAndPrincipalIdAndPostId(@Param("pageOwnerId") Long pageOwnerId, @Param("userId") Long userId, @Param("postId") Long postId);
	
	Long countByPostId(Long postId);
}
