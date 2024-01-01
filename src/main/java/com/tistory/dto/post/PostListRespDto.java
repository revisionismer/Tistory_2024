package com.tistory.dto.post;

import java.util.List;

import org.springframework.data.domain.Page;

import com.tistory.domain.category.Category;
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
public class PostListRespDto {

	private Page<Post> posts;
    private List<Category> categories;
    
    private Long userId;
    private Integer prev;
    private Integer next;
    private List<Integer> pageNumbers;
    private Long totalCount;
    
    private Boolean isPrev;
    private Boolean isNext;
    
    private Boolean isFirst;
}
