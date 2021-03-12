import Configuration from "./Configuration";

export class Constants {
    static HTTP_HEADER_CONTENT_TYPE = "Content-Type";
    static HTTP_HEADER_CONTENT_TYPE_JSON = "application/json";
    static HTTP_HEADER_CONTENT_TYPE_TEXT = "text/plain";
    static HTTP_HEADER_CONTENT_TYPE_HTML = "text/html";
    static HTTP_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN = "Access-Control-Allow-Origin";
    static HTTP_HEADER_ACCESS_CONTROL_ALLOW_HEADERS = "Access-Control-Allow-Headers";
    static HTTP_CORS_ORIGIN_STAR = "*";
    static HTTP_CORS_HEADERS_ALLOWED = "Origin, X-Requested-With, Content-Type, Accept";
    static ENCODING_UTF8: "utf8" = "utf8";
}
