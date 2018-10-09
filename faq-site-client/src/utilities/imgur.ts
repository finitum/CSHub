import axios, {AxiosResponse} from "axios";

const imgurBaseUrl = "https://api.imgur.com/3";
const imgurClientId = "5b157adc646460e"; // This client ID is linked to CSHub change if not using for that project

// Documentation: https://apidocs.imgur.com
export class ImgurUpload {

    public static async findAndReplaceImagesWithImgurLinks(delta: object[]): Promise<object> {
        for (const i in delta) {
            // Found an image!
            if (typeof (delta[i] as any).insert.image !== "undefined") {
                // The base64 of the image
                const originalBase64 = (delta[i] as any).insert.image;
                const strippedBase64 = this.stripBase64Preamble(originalBase64); // Strip the preamble (imgur wants this)

                // Upload it to imgur
                await this.uploadBase64ToImgur(strippedBase64).then((response: AxiosResponse) => {
                    if (response.data.success) {
                        // Replace the base64 with the imgur link
                        (delta[i] as any).insert.image = response.data.data.link;
                    } else {
                        // TODO: Error handling, Maybe retry otherwise fail silently(?)
                    }
                });
            }
        }

        // Return passed object with images replaced
        return delta;
    }

    private static axiosAPI = axios.create({
        baseURL: imgurBaseUrl,
        headers: {
            Authorization: `Client-ID ${imgurClientId}`
        }
    });

    private static stripBase64Preamble(base64: string): string {
        return base64.replace("data:image/png;base64,", "");
    }

    private static async uploadBase64ToImgur(payload: string): Promise<AxiosResponse> {
        return await this.axiosAPI.post("/image", {
            image: payload
        });
    }
}

/* Example usage:
const testDelta = [{"insert":"asdddddddd"},{"insert":{"image":"data:image/png;base64,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"}}, {"insert": "\n"}];

ImgurUpload.findAndReplaceImagesWithImgurLinks(testDelta).then((response: object) => {
    console.log(response);
    testDelta = response;
});
 */
