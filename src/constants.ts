export class Constants {
    static HTTP_HEADER_CONTENT_TYPE = "Content-Type";
    static HTTP_HEADER_CONTENT_TYPE_JSON = "application/json";
    static HTTP_HEADER_CONTENT_TYPE_TEXT = "text/plain";
    static HTTP_HEADER_CONTENT_TYPE_HTML = "text/html";
    static HTTP_HEADER_ACCESS_CONTROL_ALLOW_ORIGIN = "Access-Control-Allow-Origin";
    static HTTP_HEADER_ACCESS_CONTROL_ALLOW_HEADERS = "Access-Control-Allow-Headers";
    static HTTP_HEADER_ACCESS_CONTROL_ALLOW_METHODS = "Access-Control-Allow-Methods"
    static HTTP_CORS_ORIGIN_STAR = "*";
    static HTTP_CORS_HEADERS_ALLOWED = "Origin, X-Requested-With, Content-Type, Accept";
    static HTTP_CORS_METHODS_ALLOWED = "GET, POST, PUT, DELETE"
    static ENCODING_UTF8: "utf8" = "utf8";

    static URL_SS_SONGS: string         = `https://api.streamersonglist.com/v1/streamers/{streamerId}/songs`;
    static URL_SS_SONGS_UPDATE: string  = `https://api.streamersonglist.com/v1/streamers/{streamerId}/songs/{songId}`
    static URL_SS_QUEUE: string         = `https://api.streamersonglist.com/v1/streamers/{streamerId}/queue`;
    static URL_SS_QUEUE_REQUEST: string = `https://api.streamersonglist.com/v1/streamers/{streamerId}/queue/{songId}/request`;
    static URL_SS_QUEUE_PLAYED: string  = `https://api.streamersonglist.com/v1/streamers/{streamerId}/queue/{queueId}/played`
    static URL_SS_QUEUE_REMOVE: string  = `https://api.streamersonglist.com/v1/streamers/{streamerId}/queue/{queueId}`;
    static URL_SS_PLAY_HISTORY: string   = `https://api.streamersonglist.com/v1/streamers/{streamerId}/playHistory`;
}
