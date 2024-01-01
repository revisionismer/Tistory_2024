package com.tistory.handler.aop;

import java.util.HashMap;
import java.util.Map;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;

import com.tistory.handler.exception.CustomValidationException;

@Component  // 1-1. IoC에 등록
@Aspect  // 1-2. Aspect(관점)이란 PointCut과 Advice 두 용어를 포함하고 있는 용어.
public class CustomValidationAspect {

	// 1-3. postMapping 포인트 컷
	@Pointcut("@annotation(org.springframework.web.bind.annotation.PostMapping)")
	public void postMapping() {}
	
	// 1-4. putMapping 포인트 컷
	@Pointcut("@annotation(org.springframework.web.bind.annotation.PutMapping)")
	public void putMapping() {}
	
	// 1-5. advice 만들기(before, after, around 등등) : around는 joinPoint의 전후 제어가 가능. 여기서 joinPoint란 advice를 적용할 대상들
	@Around("postMapping() || putMapping()")  // 1-6. postMapping(), putMapping() 2 곳의 포인트컷에 advice를 하겠다는 의미
	public Object validationAdvice(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
		// 1-7. joinPoint들을 가지고 온다.
		Object[] args = proceedingJoinPoint.getArgs();
		
		for(Object arg : args) {
			if(arg instanceof BindingResult) {
				BindingResult bindingResult = (BindingResult)arg;
				
				// 1-8. 에러가 있을때만 throw를 날려주고
				if(bindingResult.hasErrors()) {
					Map<String, String> errorMap = new HashMap<>();
					
					for(FieldError error : bindingResult.getFieldErrors()) {
						errorMap.put(error.getField(), error.getDefaultMessage());
					}
					
					throw new CustomValidationException("유효성 검사 실패", errorMap);
				}
			}
		}
		// 1-9. 에러가 없다면 그대로 진행
		return proceedingJoinPoint.proceed();
	}
}
