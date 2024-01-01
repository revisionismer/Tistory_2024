package com.tistory.dto.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import com.tistory.domain.category.Category;
import com.tistory.domain.user.User;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@AllArgsConstructor
@NoArgsConstructor
@Getter @Setter
@ToString
public class CategoryWriteReqDto {

	@Size(min = 1, max = 60)
    @NotBlank
    private String title;

    public Category toEntity(User principal) {
        Category category = new Category();
        category.setTitle(title);
        category.setUser(principal);
        
        return category;
    }
}
