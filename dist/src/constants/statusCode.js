/**
 * HTTP Status Codes with Descriptions
 */
export var StatusCode;
(function (StatusCode) {
    /** 200 - Success */
    StatusCode[StatusCode["OK"] = 200] = "OK";
    /** 201 - Resource Created */
    StatusCode[StatusCode["CREATED"] = 201] = "CREATED";
    /** 202 - Request Accepted but Processing Later */
    StatusCode[StatusCode["ACCEPTED"] = 202] = "ACCEPTED";
    /** 204 - Success but No Content */
    StatusCode[StatusCode["NO_CONTENT"] = 204] = "NO_CONTENT";
    /** 400 - Bad Request (Missing Fields, Invalid Data) */
    StatusCode[StatusCode["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    /** 401 - Unauthorized (Invalid Credentials / Token) */
    StatusCode[StatusCode["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    /** 402 - Payment Required */
    StatusCode[StatusCode["PAYMENT_REQUIRED"] = 402] = "PAYMENT_REQUIRED";
    /** 403 - Forbidden (Access Denied) */
    StatusCode[StatusCode["FORBIDDEN"] = 403] = "FORBIDDEN";
    /** 404 - Not Found (User / Data Not Found) */
    StatusCode[StatusCode["NOT_FOUND"] = 404] = "NOT_FOUND";
    /** 405 - Method Not Allowed */
    StatusCode[StatusCode["METHOD_NOT_ALLOWED"] = 405] = "METHOD_NOT_ALLOWED";
    /** 409 - Conflict (Duplicate Resource) */
    StatusCode[StatusCode["CONFLICT"] = 409] = "CONFLICT";
    /** 422 - Unprocessable Entity (Validation Failed) */
    StatusCode[StatusCode["UNPROCESSABLE_ENTITY"] = 422] = "UNPROCESSABLE_ENTITY";
    /** 429 - Too Many Requests (Rate Limit) */
    StatusCode[StatusCode["TOO_MANY_REQUESTS"] = 429] = "TOO_MANY_REQUESTS";
    /** 500 - Internal Server Error */
    StatusCode[StatusCode["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
    /** 501 - Not Implemented */
    StatusCode[StatusCode["NOT_IMPLEMENTED"] = 501] = "NOT_IMPLEMENTED";
    /** 502 - Bad Gateway */
    StatusCode[StatusCode["BAD_GATEWAY"] = 502] = "BAD_GATEWAY";
    /** 503 - Service Unavailable */
    StatusCode[StatusCode["SERVICE_UNAVAILABLE"] = 503] = "SERVICE_UNAVAILABLE";
    /** 504 - Gateway Timeout */
    StatusCode[StatusCode["GATEWAY_TIMEOUT"] = 504] = "GATEWAY_TIMEOUT";
})(StatusCode || (StatusCode = {}));
