import { ImageAccess } from "../dataLayer/imageAccess";

const imageAccess = new ImageAccess()

export function getSignedImgUploadUrl(todoId: string): string {
    return imageAccess.getSignedImgUploadUrl(todoId);
}