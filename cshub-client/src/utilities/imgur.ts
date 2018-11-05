import axios, {AxiosResponse} from "axios";
import Delta from "quill-delta/dist/Delta";

const imgurBaseUrl = "https://api.imgur.com/3";
const imgurClientId = "5b157adc646460e"; // This client ID is linked to CSHub change if not using for that project

// Documentation: https://apidocs.imgur.com
export class ImgurUpload {

    public static async findAndReplaceImagesWithImgurLinks(delta: Delta): Promise<Delta> {
        for (const currDelta of delta.ops) {
            // Found an image!
            if (currDelta.hasOwnProperty("insert") && typeof (currDelta as any).insert.image !== "undefined") {
                // The base64 of the image
                const originalBase64 = (currDelta as any).insert.image;
                const strippedBase64 = this.stripBase64Preamble(originalBase64); // Strip the preamble (imgur wants this)

                // Upload it to imgur
                await this.uploadBase64ToImgur(strippedBase64).then((response: AxiosResponse) => {
                    if (response.data.success) {
                        // Replace the base64 with the imgur link
                        (currDelta as any).insert.image = response.data.data.link;
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
            "Authorization": `Client-ID ${imgurClientId}`,
            "Content-Type": "application/json"
        }
    });

    private static stripBase64Preamble(base64: string): string {
        return base64.replace(/data:image\/(.+);base64,/, "");
    }

    private static async uploadBase64ToImgur(payload: string): Promise<AxiosResponse> {
        return await this.axiosAPI.post("/image", {
            image: payload
        });
    }
}
