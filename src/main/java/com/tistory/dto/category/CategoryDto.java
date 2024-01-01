package com.tistory.dto.category;

import com.tistory.domain.category.Category;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class CategoryDto {

	private Long categoryId;
	private String title;
	
	public CategoryDto(Category category) {
		this.categoryId = category.getId();
		this.title = category.getTitle();
	}
}
