package com.tistory.dto.love;

import com.tistory.dto.post.PostInfoRespDto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@AllArgsConstructor
@NoArgsConstructor
@Getter @Setter
@ToString
public class PostLoveRespDto {

	private Long loveId;
	private PostInfoRespDto post;
	private Integer totalCntLove;
}
