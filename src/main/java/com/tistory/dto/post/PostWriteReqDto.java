package com.tistory.dto.post;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.tistory.domain.category.Category;
import com.tistory.domain.post.Post;
import com.tistory.domain.user.User;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@AllArgsConstructor
@NoArgsConstructor
@ToString
@Getter @Setter
public class PostWriteReqDto {

	private Long categoryId;
	
	@NotBlank
	private String title;
	
	@NotNull  // 공백만 허용.
	private String content;
	
	@JsonIgnore
	private MultipartFile thumnailFile;
	
	public Post toEntity(String thumnailImgFileName, User principal, Category category) {
        Post post = new Post();
        
        post.setTitle(title);
        post.setContent(content);
        post.setThumnailImgFileName(thumnailImgFileName);
        post.setCreatedAt(LocalDateTime.now());
        post.setUser(principal);
        post.setCategory(category);
        
        return post;
    }
	
}
