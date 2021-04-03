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

    static URL_SS_GET_QUEUE: string = `https://api.streamersonglist.com/v1/streamers/{streamerId}/queue`;
    static URL_SS_GET_LIST: string = `https://api.streamersonglist.com/v1/streamers/{streamerId}/songs`;
    static URL_SS_QUEUE_ADD: string = `https://api.streamersonglist.com/v1/streamers/{streamerId}/queue/{songId}/request`;
    static URL_SS_QUEUE_MARK: string = `https://api.streamersonglist.com/v1/streamers/{streamerId}/queue/{queueId}/played`
    static URL_SS_QUEUE_REMOVE: string = `https://api.streamersonglist.com/v1/streamers/{streamerId}/queue/{queueId}`;
}
