package com.tistory.dto.category;

import com.tistory.domain.category.Category;
import com.tistory.domain.user.User;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter @Setter
@ToString
public class CategoryWriteRespDto {

	private Long categoryId;
	private String title;
	private User user;
	
	public CategoryWriteRespDto(Category category) {
		this.categoryId = category.getId();
		this.title = category.getTitle();
		this.user = category.getUser();
	}
	
}
