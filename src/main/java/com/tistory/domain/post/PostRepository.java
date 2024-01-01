package com.tistory.domain.post;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {

	@Query(value = "SELECT * FROM post_tb WHERE userId = :userId ORDER BY id DESC", nativeQuery = true)
    Page<Post> findByUserId(@Param("userId") Long userId, Pageable pageable);
	
	@Query(value = "SELECT * FROM post_tb WHERE userId = :userId AND categoryId = :categoryId ORDER BY id DESC", nativeQuery = true)
    Page<Post> findByUserIdAndCategoryId(@Param("userId") Long userId, @Param("categoryId") Long categoryId, Pageable pageable);

	@Query(value = "SELECT * FROM post_tb ORDER BY id DESC", nativeQuery = true)
	Page<Post> findAllPost(Pageable pageable);
	
	@Query(value = "SELECT * FROM post_tb WHERE categoryId = :categoryId ORDER BY id DESC", nativeQuery = true)
	Page<Post> findAllByCategoryId(@Param("categoryId") Long categoryId, Pageable pageable);
}
