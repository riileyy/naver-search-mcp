import axios from "axios";
export class NaverApiCoreClient {
    constructor() {
        this.searchBaseUrl = "https://openapi.naver.com/v1/search";
        this.datalabBaseUrl = "https://openapi.naver.com/v1/datalab";
        this.config = null;
    }
    initialize(config) {
        this.config = config;
    }
    getHeaders(contentType = "application/json") {
        if (!this.config)
            throw new Error("NaverApiCoreClient is not initialized.");
        return {
            headers: {
                "X-Naver-Client-Id": this.config.clientId,
                "X-Naver-Client-Secret": this.config.clientSecret,
                "Content-Type": contentType,
            },
        };
    }
    async get(url, params) {
        const response = await axios.get(url, { params, ...this.getHeaders() });
        return response.data;
    }
    async post(url, data) {
        const response = await axios.post(url, data, this.getHeaders());
        return response.data;
    }
}
