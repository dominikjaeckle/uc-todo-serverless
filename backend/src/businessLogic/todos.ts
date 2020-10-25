import { APIGatewayProxyEvent } from "aws-lambda";
import { TodoAccess } from "../dataLayer/todoAccess";
import { getUserId } from "../lambda/utils";
import { TodoItem } from "../models/TodoItem";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import * as uuid from 'uuid';
import { UpdateTodoRequest } from "../requests/UpdateTodoRequest";

const s3Bucket = process.env.S3_BUCKET;
const todoAccess = new TodoAccess();

export async function getTodos(event: APIGatewayProxyEvent): Promise<TodoItem[]> {
    const userId = getUserId(event);
    return await todoAccess.getTodosForUser(userId);
}

export async function createTodo(newTodo: CreateTodoRequest, event: APIGatewayProxyEvent): Promise<TodoItem> {
    const itemId = uuid.v4();
    const newItem = {
        todoId: itemId,
        userId: getUserId(event),
        createdAt: new Date().toISOString(),
        done: false,
        attachmentUrl: `https://${s3Bucket}.s3.amazonaws.com/${itemId}`,
        ...newTodo
    };
    return await todoAccess.createTodo(newItem);
}

export async function deleteTodo(todoId: string, event: APIGatewayProxyEvent): Promise<void> {
    const userId = getUserId(event);
    return await todoAccess.deleteTodo(todoId, userId);
}

export async function updateTodo(todoId: string, updatedTodo: UpdateTodoRequest, event: APIGatewayProxyEvent): Promise<void> {
    const userId = getUserId(event);
    return await todoAccess.updateTodo(todoId, userId, updatedTodo);
}