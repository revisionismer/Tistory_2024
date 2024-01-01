package com.tistory.dto.post;

import com.tistory.domain.post.Post;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter @Setter
@ToString
public class PostWriteRespDto {

	private Long id;
	
	private String title;
	
	private String content;
	
	private String thumnailImgFileName;
	
	private Long userId;
	
	private Long categoryId;
	
	public PostWriteRespDto(Post postEntity) {
		this.id = postEntity.getId();
		this.title = postEntity.getTitle();
		this.content = postEntity.getContent();
		this.thumnailImgFileName = postEntity.getThumnailImgFileName();
		this.userId = postEntity.getUser().getId();
		this.categoryId = postEntity.getCategory().getId();
	}
}
