package com.tistory.util;

public class Script {

    public static String href(String url) {
        StringBuffer sb = new StringBuffer();
        sb.append("<script>");
        sb.append("location.href='" + url + "';");
        sb.append("</script>");
        return sb.toString();
    }

    public static String href(String url, String msg) {
        StringBuffer sb = new StringBuffer();
        sb.append("<script>");
        sb.append("alert('" + msg + "');");
        sb.append("location.href='" + url + "';");
        sb.append("</script>");
        return sb.toString();
    }

    public static String back(String msg) {
        StringBuffer sb = new StringBuffer();
        sb.append("<script type='text/javascript'>");
        sb.append("alert('" + msg + "');");
        sb.append("location.href='/user/board/list';");
        // 파일 다운로드의 경우 이전 페이지로 돌아가는 방법 고민해봐야함
   
        sb.append("</script>");
        return sb.toString();
    }
}
