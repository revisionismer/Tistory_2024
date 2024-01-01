package com.tistory.dto.category;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.tistory.domain.category.Category;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter @Setter
@ToString
public class CategoryListRespDto {

	List<CategoryDto> categories = new ArrayList<>();
	
	public CategoryListRespDto(List<Category> categories) {
		this.categories = categories.stream().map( (category) -> new CategoryDto(category) ).collect(Collectors.toList());
	}
}
