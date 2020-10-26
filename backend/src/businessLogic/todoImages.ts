import { ImageAccess } from "../dataLayer/imageAccess";
import { createLogger } from '../utils/logger'

const logger = createLogger('createTodo')

const imageAccess = new ImageAccess();

export function getSignedImgUploadUrl(todoId: string): string {
    logger.info('businessLogic: get signed url for', todoId);
    return imageAccess.getSignedImgUploadUrl(todoId);
}