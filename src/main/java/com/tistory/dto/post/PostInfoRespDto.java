package com.tistory.dto.post;

import com.tistory.domain.post.Post;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@AllArgsConstructor
@NoArgsConstructor
@Getter @Setter
@ToString
public class PostInfoRespDto {

	private Long postId;
	private String title;
	private String content;
	
	private String thumnailImgFileName;
	private String originalImgFileName;
	
	private Long pageOwnerId;
	
	private Long categoryId;
	private String category_title;
	
	// 1-2. 페이지 주인 여부
	private boolean isPageOwner;
	
	// 좋아요 여부
	private boolean isLove;
	
	private Long totalLoveCnt;
	
	public PostInfoRespDto(Post post, boolean isPageOwner, boolean isLove, Long totalLoveCnt) {
		this.postId = post.getId();
		this.title = post.getTitle();
		this.content = post.getContent();
		
		this.thumnailImgFileName = post.getThumnailImgFileName();
		this.originalImgFileName = post.getOriginalImgFileName();
		
		this.pageOwnerId = post.getUser().getId();
		this.categoryId = post.getCategory().getId();
		this.category_title = post.getCategory().getTitle();
		this.isPageOwner = isPageOwner;
		this.isLove = isLove;
		this.totalLoveCnt = totalLoveCnt;
	}
}
